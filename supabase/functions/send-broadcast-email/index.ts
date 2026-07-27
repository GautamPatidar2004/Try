import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const BATCH_SIZE = 100; // Resend batch API supports up to 100 emails per call
const DELAY_BETWEEN_BATCHES_MS = 600; // Stay safely under 2 RPS limit
const RATE_LIMIT_RETRY_DELAY_MS = 2000; // Wait 2s on rate limit error
const MAX_RETRIES = 3;

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface TargetSegment {
  userType?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isBanned?: boolean;
  accountTier?: string;
  location?: string;
  engagementLevel?: string;
  lastLoginDays?: string;
  registeredAfter?: string;
  registeredBefore?: string;
}

interface BroadcastEmailRequest {
  campaignId: string;
  subject: string;
  content: string;
  targetSegment: TargetSegment;
  testEmail?: string;
}

interface UserWithEmail {
  id: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  email: string;
  last_sign_in_at: string | null;
}

// Build personalized email HTML
const buildEmailHtml = (personalizedContent: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${personalizedContent}
      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666; text-align: center;">
        You're receiving this email because you're a member of HostFluencer.
        <br><a href="#" style="color: #666;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;
};

// Personalize content for a user
const personalizeContent = (content: string, user: UserWithEmail): string => {
  return content
    .replace(/\{firstName\}/g, user.first_name || "there")
    .replace(/\{lastName\}/g, user.last_name || "")
    .replace(/\{email\}/g, user.email)
    .replace(/\{userType\}/g, user.user_type || "Member");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    console.log("[SEND-BROADCAST-EMAIL] Function started");
    console.log("[SEND-BROADCAST-EMAIL] RESEND_API_KEY configured:", !!resendApiKey);

    if (!resendApiKey) {
      console.error("[SEND-BROADCAST-EMAIL] RESEND_API_KEY is not configured");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Admin authorization check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { campaignId, subject, content, targetSegment, testEmail }: BroadcastEmailRequest = await req.json();

    console.log("[SEND-BROADCAST-EMAIL] Processing campaign:", campaignId);
    console.log("[SEND-BROADCAST-EMAIL] Target segment:", JSON.stringify(targetSegment));
    console.log("[SEND-BROADCAST-EMAIL] Test email mode:", !!testEmail);

    // TEST EMAIL MODE - send only to the test email address
    if (testEmail) {
      console.log("[SEND-BROADCAST-EMAIL] Sending test email to:", testEmail);
      
      const personalizedContent = content
        .replace(/\{firstName\}/g, "John")
        .replace(/\{lastName\}/g, "Doe")
        .replace(/\{email\}/g, testEmail)
        .replace(/\{userType\}/g, "Creator");

      try {
        const emailResult = await resend.emails.send({
          from: "HostFluencer <noreply@hostfluencer.com>",
          to: [testEmail],
          subject: subject,
          html: buildEmailHtml(personalizedContent),
        });

        console.log("[SEND-BROADCAST-EMAIL] Test email sent:", JSON.stringify(emailResult));

        return new Response(
          JSON.stringify({
            success: true,
            message: `Test email sent to ${testEmail}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (error) {
        console.error("[SEND-BROADCAST-EMAIL] Test email failed:", error);
        throw error;
      }
    }

    // PRODUCTION MODE - send to all matching users
    // Paginate through ALL auth users (listUsers defaults to 50/page)
    const allAuthUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data: pageData, error: pageErr } = await supabase.auth.admin.listUsers({ page, perPage });
      if (pageErr) {
        console.error("[SEND-BROADCAST-EMAIL] Error listing auth users page", page, pageErr);
        throw pageErr;
      }
      const users = pageData?.users || [];
      allAuthUsers.push(...users);
      console.log(`[SEND-BROADCAST-EMAIL] Fetched auth users page ${page}: ${users.length} (running total: ${allAuthUsers.length})`);
      if (users.length < perPage) break;
      page++;
      if (page > 100) {
        console.warn("[SEND-BROADCAST-EMAIL] Safety break at page 100 — investigate if you have >100k users");
        break;
      }
    }

    const authData = { users: allAuthUsers };
    console.log("[SEND-BROADCAST-EMAIL] Total auth users fetched (paginated):", authData.users.length);

    // Build a lookup map for O(1) join with profiles
    const authUserMap = new Map<string, any>();
    for (const u of authData.users) authUserMap.set(u.id, u);

    // Build profile query with all filters
    let query = supabase
      .from("profiles")
      .select("id, first_name, last_name, user_type, verified, is_active, is_banned, account_tier, location, created_at");

    if (targetSegment.userType && targetSegment.userType !== "all") {
      console.log("[SEND-BROADCAST-EMAIL] Filtering by user_type:", targetSegment.userType);
      query = query.eq("user_type", targetSegment.userType);
    }

    if (targetSegment.isActive !== undefined) {
      console.log("[SEND-BROADCAST-EMAIL] Filtering by is_active:", targetSegment.isActive);
      query = query.eq("is_active", targetSegment.isActive);
    }

    if (targetSegment.isVerified !== undefined) {
      console.log("[SEND-BROADCAST-EMAIL] Filtering by verified:", targetSegment.isVerified);
      query = query.eq("verified", targetSegment.isVerified);
    }

    if (targetSegment.isBanned !== undefined) {
      console.log("[SEND-BROADCAST-EMAIL] Filtering by is_banned:", targetSegment.isBanned);
      query = query.eq("is_banned", targetSegment.isBanned);
    }

    if (targetSegment.accountTier && targetSegment.accountTier !== "all") {
      console.log("[SEND-BROADCAST-EMAIL] Filtering by account_tier:", targetSegment.accountTier);
      query = query.eq("account_tier", targetSegment.accountTier);
    }

    if (targetSegment.location && targetSegment.location.trim() !== "") {
      console.log("[SEND-BROADCAST-EMAIL] Filtering by location:", targetSegment.location);
      query = query.ilike("location", `%${targetSegment.location}%`);
    }

    if (targetSegment.registeredAfter) {
      console.log("[SEND-BROADCAST-EMAIL] Filtering registered after:", targetSegment.registeredAfter);
      query = query.gte("created_at", targetSegment.registeredAfter);
    }

    if (targetSegment.registeredBefore) {
      console.log("[SEND-BROADCAST-EMAIL] Filtering registered before:", targetSegment.registeredBefore);
      query = query.lte("created_at", targetSegment.registeredBefore);
    }

    // Paginate through profiles (Supabase caps at 1000 rows per request)
    const profiles: any[] = [];
    const profilePageSize = 1000;
    let profileFrom = 0;
    while (true) {
      const { data: pageRows, error: profilesError } = await query.range(profileFrom, profileFrom + profilePageSize - 1);
      if (profilesError) {
        console.error("[SEND-BROADCAST-EMAIL] Error fetching profiles:", profilesError);
        throw profilesError;
      }
      const rows = pageRows || [];
      profiles.push(...rows);
      console.log(`[SEND-BROADCAST-EMAIL] Fetched profiles range ${profileFrom}-${profileFrom + rows.length - 1} (running total: ${profiles.length})`);
      if (rows.length < profilePageSize) break;
      profileFrom += profilePageSize;
      if (profileFrom > 200000) {
        console.warn("[SEND-BROADCAST-EMAIL] Safety break — investigate if you have >200k profiles");
        break;
      }
    }

    console.log("[SEND-BROADCAST-EMAIL] Total profiles found:", profiles.length);

    // Match profiles with auth users and apply last login filter
    const totalProfiles = profiles?.length || 0;
    let skippedNoEmail = 0;
    let usersWithEmails: UserWithEmail[] = (profiles || []).map((profile) => {
      const authUser = authUserMap.get(profile.id);
      return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        user_type: profile.user_type,
        email: authUser?.email || "",
        last_sign_in_at: authUser?.last_sign_in_at || null,
      };
    }).filter((u) => {
      if (!u.email || u.email.length === 0) {
        skippedNoEmail++;
        return false;
      }
      return true;
    });

    console.log(`[SEND-BROADCAST-EMAIL] Reconciliation — profiles matched: ${totalProfiles}, auth users fetched: ${authData.users.length}, emailable after merge: ${usersWithEmails.length}, skipped (no auth email): ${skippedNoEmail}`);

    // Apply last login filter
    if (targetSegment.lastLoginDays && usersWithEmails.length > 0) {
      const now = new Date();
      console.log("[SEND-BROADCAST-EMAIL] Filtering by last login days:", targetSegment.lastLoginDays);
      
     usersWithEmails = usersWithEmails.filter((user) => {
        const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
        
        switch (targetSegment.lastLoginDays) {
          case "7":
            return lastSignIn && (now.getTime() - lastSignIn.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          case "30":
            return lastSignIn && (now.getTime() - lastSignIn.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          case "90":
            return lastSignIn && (now.getTime() - lastSignIn.getTime()) <= 90 * 24 * 60 * 60 * 1000;
          case "never":
            return !lastSignIn;
          case "inactive":
          case "inactive90":
            return lastSignIn && (now.getTime() - lastSignIn.getTime()) > 90 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    }

    console.log("[SEND-BROADCAST-EMAIL] Users with valid emails after all filters:", usersWithEmails.length);

    if (usersWithEmails.length === 0) {
      console.log("[SEND-BROADCAST-EMAIL] No users to send to");
      
      if (campaignId !== "test-preview") {
        await supabase
          .from("communication_campaigns")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            total_recipients: 0,
            successful_deliveries: 0,
            failed_deliveries: 0,
          })
          .eq("id", campaignId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          totalRecipients: 0,
          message: "No users matched the target segment",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Update campaign status to sending
    if (campaignId !== "test-preview") {
      await supabase
        .from("communication_campaigns")
        .update({
          status: "sending",
          total_recipients: usersWithEmails.length,
        })
        .eq("id", campaignId);
    }

    // Chunk users into batches
    const userChunks: UserWithEmail[][] = [];
    for (let i = 0; i < usersWithEmails.length; i += BATCH_SIZE) {
      userChunks.push(usersWithEmails.slice(i, i + BATCH_SIZE));
    }

    console.log(`[SEND-BROADCAST-EMAIL] Split ${usersWithEmails.length} users into ${userChunks.length} batches of up to ${BATCH_SIZE}`);

    let successful = 0;
    let failed = 0;

    // Send emails in background using batch API
    const sendEmails = async () => {
      console.log("[SEND-BROADCAST-EMAIL] Starting batch email sending...");

      for (let batchIndex = 0; batchIndex < userChunks.length; batchIndex++) {
        const chunk = userChunks[batchIndex];
        console.log(`[SEND-BROADCAST-EMAIL] Processing batch ${batchIndex + 1}/${userChunks.length} (${chunk.length} emails)`);

        // Build batch email array for Resend batch API
        const emailBatch = chunk.map(user => ({
          from: "HostFluencer <noreply@hostfluencer.com>",
          to: [user.email],
          subject: subject,
          html: buildEmailHtml(personalizeContent(content, user)),
        }));

        let retries = 0;
        let batchSuccess = false;

        while (retries < MAX_RETRIES && !batchSuccess) {
          try {
            // Use Resend batch API - sends up to 100 emails in a single API call
            const batchResult = await resend.batch.send(emailBatch);

            console.log(`[SEND-BROADCAST-EMAIL] Batch ${batchIndex + 1} result:`, JSON.stringify(batchResult));

            // Check for rate limit error in response
            if (batchResult.error) {
              const errorName = (batchResult.error as any)?.name || '';
              if (errorName === 'rate_limit_exceeded' || errorName.includes('rate')) {
                console.log(`[SEND-BROADCAST-EMAIL] Rate limited on batch ${batchIndex + 1}, retrying in ${RATE_LIMIT_RETRY_DELAY_MS}ms...`);
                await delay(RATE_LIMIT_RETRY_DELAY_MS);
                retries++;
                continue;
              }
              // Other error - log and mark batch as failed
              console.error(`[SEND-BROADCAST-EMAIL] Batch ${batchIndex + 1} error:`, batchResult.error);
              failed += chunk.length;
              batchSuccess = true; // Exit retry loop
              continue;
            }

            // Process individual results from batch
            const batchData = (batchResult.data as any)?.data || batchResult.data || [];
            
            for (let i = 0; i < chunk.length; i++) {
              const user = chunk[i];
              const emailResult = batchData[i];

              if (emailResult?.id) {
                successful++;
                
                if (campaignId !== "test-preview") {
                  await supabase.from("campaign_recipients").insert({
                    campaign_id: campaignId,
                    user_id: user.id,
                    email: user.email,
                    status: "sent",
                    sent_at: new Date().toISOString(),
                    delivered_at: new Date().toISOString(),
                  });
                }
              } else {
                failed++;
                console.log(`[SEND-BROADCAST-EMAIL] Failed to send to ${user.email}:`, emailResult);
                
                if (campaignId !== "test-preview") {
                  await supabase.from("campaign_recipients").insert({
                    campaign_id: campaignId,
                    user_id: user.id,
                    email: user.email,
                    status: "failed",
                    error_message: "Email send failed",
                  });
                }
              }
            }

            batchSuccess = true;
          } catch (error) {
            console.error(`[SEND-BROADCAST-EMAIL] Batch ${batchIndex + 1} exception:`, error);
            
            // Check if it's a rate limit error
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.toLowerCase().includes('rate') || errorMessage.includes('429')) {
              console.log(`[SEND-BROADCAST-EMAIL] Rate limit detected, waiting ${RATE_LIMIT_RETRY_DELAY_MS}ms before retry...`);
              await delay(RATE_LIMIT_RETRY_DELAY_MS);
              retries++;
            } else {
              // Non-rate-limit error, mark batch as failed
              failed += chunk.length;
              
              for (const user of chunk) {
                if (campaignId !== "test-preview") {
                  await supabase.from("campaign_recipients").insert({
                    campaign_id: campaignId,
                    user_id: user.id,
                    email: user.email,
                    status: "failed",
                    error_message: errorMessage,
                  });
                }
              }
              
              batchSuccess = true; // Exit retry loop
            }
          }
        }

        // If we exhausted retries, mark remaining as failed
        if (!batchSuccess) {
          console.error(`[SEND-BROADCAST-EMAIL] Batch ${batchIndex + 1} failed after ${MAX_RETRIES} retries`);
          failed += chunk.length;
          
          for (const user of chunk) {
            if (campaignId !== "test-preview") {
              await supabase.from("campaign_recipients").insert({
                campaign_id: campaignId,
                user_id: user.id,
                email: user.email,
                status: "failed",
                error_message: "Rate limit exceeded after retries",
              });
            }
          }
        }

        // Update progress every 5 batches (or every batch if fewer than 5 total)
        if (batchIndex % 5 === 0 || batchIndex === userChunks.length - 1) {
          console.log(`[SEND-BROADCAST-EMAIL] Progress: ${successful} sent, ${failed} failed out of ${usersWithEmails.length}`);
          
          if (campaignId !== "test-preview") {
            await supabase
              .from("communication_campaigns")
              .update({
                successful_deliveries: successful,
                failed_deliveries: failed,
              })
              .eq("id", campaignId);
          }
        }

        // Add delay before next batch (except for last batch)
        if (batchIndex < userChunks.length - 1) {
          console.log(`[SEND-BROADCAST-EMAIL] Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
          await delay(DELAY_BETWEEN_BATCHES_MS);
        }
      }

      // Update campaign with final stats
      console.log(`[SEND-BROADCAST-EMAIL] Campaign complete: ${successful} sent, ${failed} failed out of ${usersWithEmails.length}`);
      
      if (campaignId !== "test-preview") {
        await supabase
          .from("communication_campaigns")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            total_recipients: usersWithEmails.length,
            successful_deliveries: successful,
            failed_deliveries: failed,
          })
          .eq("id", campaignId);
      }
    };

    // Start background task
    EdgeRuntime.waitUntil(sendEmails());

    return new Response(
      JSON.stringify({
        success: true,
        totalRecipients: usersWithEmails.length,
        totalBatches: userChunks.length,
        message: `Email campaign started - sending in ${userChunks.length} batches`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[SEND-BROADCAST-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
