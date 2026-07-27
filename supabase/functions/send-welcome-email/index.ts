import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_DOMAIN = "https://hostfluencer.com";

// Rate limiting configuration
const BATCH_SIZE = 100; // Resend batch API supports up to 100 emails per call
const DELAY_BETWEEN_BATCHES_MS = 600; // Stay safely under 2 RPS limit
const RATE_LIMIT_RETRY_DELAY_MS = 2000; // Wait 2s on rate limit error
const MAX_RETRIES = 3;
const BATCH_LIMIT = 50; // Max users to process per cron invocation

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Profile {
  id: string;
  first_name: string | null;
  user_type: string;
}

interface ProfileWithEmail extends Profile {
  email: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

function getEmailTemplate(firstName: string, userType: string): EmailTemplate {
  const name = firstName || "there";

  switch (userType) {
    case "brand":
      return {
        subject: "Welcome to Hostfluencer – Let's Launch Your First Creator Campaign",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981; margin: 0;">Hostfluencer</h1>
  </div>
  
  <p>Hi ${name},</p>
  
  <p><strong>Welcome to Hostfluencer.</strong></p>
  
  <p>You're now part of a platform built to connect brands with high-intent creators who produce authentic content that drives real customer action.</p>
  
  <p><strong>Here's how to get started:</strong></p>
  <ul style="padding-left: 20px;">
    <li>Complete your Brand Profile so creators understand your story</li>
    <li>Submit your first Campaign Intake so we can build your Creator Brief</li>
    <li>Review matched creators and approve who you'd like to work with</li>
  </ul>
  
  <p>Our team uses your campaign details to source creators from our network and beyond, ensuring alignment with your audience, tone, and objectives.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_DOMAIN}/brand-dashboard" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
  </div>
  
  <p>Once submitted, we begin matching within 24–48 hours.</p>
  
  <p>Looking forward to launching your first collaboration.</p>
  
  <p>Best regards,<br><strong>The Hostfluencer Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Hostfluencer. All rights reserved.
  </p>
</body>
</html>
        `,
      };

    case "host":
      return {
        subject: "Welcome to Hostfluencer – Turn Your Property into a Content Engine",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981; margin: 0;">Hostfluencer</h1>
  </div>
  
  <p>Hi ${name},</p>
  
  <p><strong>Welcome to Hostfluencer.</strong></p>
  
  <p>You've just unlocked a new way to market your property through creator partnerships that generate professional content, social reach, and direct bookings.</p>
  
  <p><strong>Next steps:</strong></p>
  <ul style="padding-left: 20px;">
    <li>Add your property listing with photos and amenities</li>
    <li>Set your collaboration preferences</li>
    <li>Review creator requests and approve stays</li>
  </ul>
  
  <p>Creators will apply to stay at your property in exchange for content that you can reuse across Airbnb, social media, and direct marketing.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_DOMAIN}/add-property" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">List Your Property</a>
  </div>
  
  <p>Your first creator request typically arrives within days of going live.</p>
  
  <p>Best regards,<br><strong>The Hostfluencer Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Hostfluencer. All rights reserved.
  </p>
</body>
</html>
        `,
      };

    case "influencer":
      return {
        subject: "Welcome to Hostfluencer – Free Stays, Brand Deals, and Content Opportunities",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981; margin: 0;">Hostfluencer</h1>
  </div>
  
  <p>Hi ${name},</p>
  
  <p><strong>Welcome to Hostfluencer.</strong></p>
  
  <p>You now have access to properties, brands, and restaurants actively looking for creators to collaborate with.</p>
  
  <p><strong>To start receiving opportunities:</strong></p>
  <ul style="padding-left: 20px;">
    <li>Complete your creator profile</li>
    <li>Connect your social accounts</li>
    <li>Browse open collaborations or wait for direct invites</li>
  </ul>
  
  <p>Hosts and brands use your profile to determine fit, so detail matters.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_DOMAIN}/profile" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
  </div>
  
  <p>Opportunities start appearing as soon as your profile is approved.</p>
  
  <p>Best regards,<br><strong>The Hostfluencer Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Hostfluencer. All rights reserved.
  </p>
</body>
</html>
        `,
      };

    case "restaurant_owner":
      return {
        subject: "Welcome to Hostfluencer – Connect with Creators for Your Restaurant",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981; margin: 0;">Hostfluencer</h1>
  </div>
  
  <p>Hi ${name},</p>
  
  <p><strong>Welcome to Hostfluencer.</strong></p>
  
  <p>You've just joined a platform designed to connect restaurants with creators who can showcase your dining experience to their engaged audiences.</p>
  
  <p><strong>Here's how to get started:</strong></p>
  <ul style="padding-left: 20px;">
    <li>Complete your restaurant profile with photos and menu highlights</li>
    <li>Set your collaboration preferences and availability</li>
    <li>Review creator applications and approve partnerships</li>
  </ul>
  
  <p>Creators will apply to visit your restaurant in exchange for authentic content that drives foot traffic and social visibility.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_DOMAIN}/restaurant-dashboard" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
  </div>
  
  <p>Your first creator request typically arrives within days of going live.</p>
  
  <p>Best regards,<br><strong>The Hostfluencer Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Hostfluencer. All rights reserved.
  </p>
</body>
</html>
        `,
      };

    default:
      return {
        subject: "Welcome to Hostfluencer",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981; margin: 0;">Hostfluencer</h1>
  </div>
  
  <p>Hi ${name},</p>
  
  <p><strong>Welcome to Hostfluencer!</strong></p>
  
  <p>We're excited to have you join our platform connecting creators with amazing collaboration opportunities.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_DOMAIN}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started</a>
  </div>
  
  <p>Best regards,<br><strong>The Hostfluencer Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    © ${new Date().getFullYear()} Hostfluencer. All rights reserved.
  </p>
</body>
</html>
        `,
      };
  }
}

// Send welcome email to a single user (for event-driven mode)
async function sendWelcomeEmailToSingleUser(
  supabaseAdmin: ReturnType<typeof createClient>,
  profile: Profile
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      profile.id
    );

    if (userError || !userData?.user?.email) {
      console.error(`Could not get email for user ${profile.id}:`, userError);
      return { success: false, error: `No email found for user ${profile.id}` };
    }

    const email = userData.user.email;
    const template = getEmailTemplate(profile.first_name || "", profile.user_type);

    console.log(`Sending welcome email to ${email} (${profile.user_type})`);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Hostfluencer <noreply@hostfluencer.com>",
      to: [email],
      subject: template.subject,
      html: template.html,
    });

    if (emailResponse.error) {
      console.error(`Failed to send email to ${email}:`, emailResponse.error);
      return { success: false, error: emailResponse.error.message };
    }

    console.log(`Successfully sent welcome email to ${email}`);

    // Mark as sent
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error(`Failed to update profile ${profile.id}:`, updateError);
      return { success: false, error: `Failed to update status for ${profile.id}` };
    }

    return { success: true };
  } catch (err) {
    console.error(`Error processing profile ${profile.id}:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Send batch emails using Resend batch API (profiles already claimed - no DB updates needed)
async function sendBatchWelcomeEmails(
  profilesWithEmails: ProfileWithEmail[]
): Promise<{ successful: number; failed: number; errors: string[] }> {
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  // Chunk profiles into batches of BATCH_SIZE
  const batches: ProfileWithEmail[][] = [];
  for (let i = 0; i < profilesWithEmails.length; i += BATCH_SIZE) {
    batches.push(profilesWithEmails.slice(i, i + BATCH_SIZE));
  }

  console.log(`[WELCOME-EMAIL] Split ${profilesWithEmails.length} users into ${batches.length} batches of up to ${BATCH_SIZE}`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`[WELCOME-EMAIL] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)`);

    // Build batch email array for Resend batch API
    const emailBatch = batch.map(profile => {
      const template = getEmailTemplate(profile.first_name || "", profile.user_type);
      return {
        from: "Hostfluencer <noreply@hostfluencer.com>",
        to: [profile.email],
        subject: template.subject,
        html: template.html,
      };
    });

    let retries = 0;
    let batchSuccess = false;

    while (retries < MAX_RETRIES && !batchSuccess) {
      try {
        // Use Resend batch API - sends up to 100 emails in a single API call
        const batchResult = await resend.batch.send(emailBatch);

        console.log(`[WELCOME-EMAIL] Batch ${batchIndex + 1} result:`, JSON.stringify(batchResult));

        // Check for rate limit error in response
        if (batchResult.error) {
          const errorName = (batchResult.error as any)?.name || '';
          if (errorName === 'rate_limit_exceeded' || errorName.includes('rate')) {
            console.log(`[WELCOME-EMAIL] Rate limited on batch ${batchIndex + 1}, retrying in ${RATE_LIMIT_RETRY_DELAY_MS}ms...`);
            await delay(RATE_LIMIT_RETRY_DELAY_MS);
            retries++;
            continue;
          }
          // Other error - log and mark batch as failed
          console.error(`[WELCOME-EMAIL] Batch ${batchIndex + 1} error:`, batchResult.error);
          failed += batch.length;
          errors.push(`Batch ${batchIndex + 1}: ${(batchResult.error as any)?.message || 'Unknown error'}`);
          batchSuccess = true;
          continue;
        }

        // Process individual results from batch
        const batchData = batchResult.data || [];

        for (let i = 0; i < batch.length; i++) {
          const profile = batch[i];
          const emailResult = batchData[i];

          if (emailResult?.id) {
            successful++;
            console.log(`[WELCOME-EMAIL] Successfully sent to ${profile.email}`);
          } else {
            failed++;
            console.error(`[WELCOME-EMAIL] Failed to send to ${profile.email} (user ${profile.id}):`, emailResult);
            errors.push(`User ${profile.id} (${profile.email}): Email send failed`);
          }
        }

        batchSuccess = true;
      } catch (error) {
        console.error(`[WELCOME-EMAIL] Batch ${batchIndex + 1} exception:`, error);

        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.toLowerCase().includes('rate') || errorMessage.includes('429')) {
          console.log(`[WELCOME-EMAIL] Rate limit detected, waiting ${RATE_LIMIT_RETRY_DELAY_MS}ms before retry...`);
          await delay(RATE_LIMIT_RETRY_DELAY_MS);
          retries++;
        } else {
          // Non-rate-limit error, mark batch as failed
          failed += batch.length;
          errors.push(`Batch ${batchIndex + 1}: ${errorMessage}`);
          batchSuccess = true;
        }
      }
    }

    // If we exhausted retries, mark remaining as failed
    if (!batchSuccess) {
      console.error(`[WELCOME-EMAIL] Batch ${batchIndex + 1} failed after ${MAX_RETRIES} retries`);
      failed += batch.length;
      errors.push(`Batch ${batchIndex + 1}: Rate limit exceeded after retries`);
    }

    // Add delay before next batch (except for last batch)
    if (batchIndex < batches.length - 1) {
      console.log(`[WELCOME-EMAIL] Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
      await delay(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return { successful, failed, errors };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Restrict to internal/cron callers (must pass the service role key as Bearer token).
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token || token !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse request body to check for single-user mode
    let userId: string | null = null;
    try {
      const body = await req.json();
      userId = body.user_id || null;
    } catch {
      // No body or invalid JSON - proceed with batch mode
    }

    // EVENT-DRIVEN MODE: Send to single user
    if (userId) {
      console.log(`[WELCOME-EMAIL] Event-driven mode: Sending to user ${userId}`);

      // Fetch the specific user's profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, user_type")
        .eq("id", userId)
        .not("user_type", "is", null)
        .single();

      if (profileError) {
        console.error(`[WELCOME-EMAIL] Error fetching profile for user ${userId}:`, profileError);
        return new Response(
          JSON.stringify({
            success: false,
            mode: "single",
            error: `Profile not found or user_type not set: ${profileError.message}`,
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already sent
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("welcome_email_sent")
        .eq("id", userId)
        .single();

      if (existingProfile?.welcome_email_sent) {
        console.log(`[WELCOME-EMAIL] Already sent to user ${userId}`);
        return new Response(
          JSON.stringify({
            success: true,
            mode: "single",
            message: "Welcome email already sent",
            sent: 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await sendWelcomeEmailToSingleUser(supabaseAdmin, profile as Profile);

      return new Response(
        JSON.stringify({
          success: result.success,
          mode: "single",
          sent: result.success ? 1 : 0,
          error: result.error,
        }),
        { 
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // ==========================================================================
    // BATCH MODE: Atomic claim-before-send to prevent duplicate emails
    // ==========================================================================
    console.log("[WELCOME-EMAIL] Batch mode: Claiming and processing pending welcome emails...");

    // STEP 1: ATOMICALLY CLAIM profiles by setting flag BEFORE sending
    // This prevents race conditions - no other cron run can grab these users
    // The UPDATE with RETURNING ensures atomic claiming in a single query
    const { data: claimedProfiles, error: claimError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString()
      })
      .eq("welcome_email_sent", false)
      .not("user_type", "is", null)
      .select("id, first_name, user_type")
      .limit(BATCH_LIMIT);

    if (claimError) {
      console.error("[WELCOME-EMAIL] Error claiming profiles:", claimError);
      throw new Error(`Failed to claim profiles: ${claimError.message}`);
    }

    if (!claimedProfiles || claimedProfiles.length === 0) {
      console.log("[WELCOME-EMAIL] No profiles pending welcome emails");
      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: "batch", 
          message: "No pending welcome emails", 
          claimed: 0,
          processed: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WELCOME-EMAIL] Claimed ${claimedProfiles.length} profiles for processing (already marked as sent)`);

    // STEP 2: Fetch emails for claimed profiles from auth.users
    // Even if this fails, profiles are already marked - no duplicates possible
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("[WELCOME-EMAIL] Error fetching auth users:", authError);
      // Profiles are already marked as sent, so no duplicates will occur
      // Log which users we couldn't send to
      console.error(`[WELCOME-EMAIL] Could not fetch emails for ${claimedProfiles.length} claimed profiles:`, 
        claimedProfiles.map(p => p.id));
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    // Match profiles with emails
    const profilesWithEmails: ProfileWithEmail[] = claimedProfiles
      .map(profile => {
        const authUser = authData.users.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || "",
        } as ProfileWithEmail;
      })
      .filter(p => p.email && p.email.length > 0);

    const profilesWithoutEmails = claimedProfiles.length - profilesWithEmails.length;
    if (profilesWithoutEmails > 0) {
      console.warn(`[WELCOME-EMAIL] ${profilesWithoutEmails} claimed profiles have no email in auth.users`);
    }

    console.log(`[WELCOME-EMAIL] ${profilesWithEmails.length} profiles have valid emails`);

    if (profilesWithEmails.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: "batch", 
          message: "No profiles with valid emails", 
          claimed: claimedProfiles.length,
          processed: 0,
          sent: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STEP 3: Send emails to claimed users
    // Profiles are already marked as sent - if email fails, user won't get duplicates
    // This is intentional: better to miss one email than send 26 duplicates
    const result = await sendBatchWelcomeEmails(profilesWithEmails);

    console.log(`[WELCOME-EMAIL] Batch mode completed: ${result.successful} sent, ${result.failed} failed out of ${claimedProfiles.length} claimed`);

    // Log any failures for manual follow-up
    if (result.failed > 0) {
      console.warn(`[WELCOME-EMAIL] ${result.failed} emails failed to send. These users are marked as sent to prevent duplicates. Manual intervention may be needed.`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: "batch",
        claimed: claimedProfiles.length,
        processed: profilesWithEmails.length,
        sent: result.successful,
        failed: result.failed,
        errors: result.errors.length > 0 ? result.errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WELCOME-EMAIL] Job failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
