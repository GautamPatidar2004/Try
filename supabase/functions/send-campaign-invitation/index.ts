import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { influencerId, campaignId } = await req.json();
    if (!influencerId || !campaignId) {
      return new Response(JSON.stringify({ error: "Missing influencerId or campaignId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending campaign invitation: creator=${influencerId}, campaign=${campaignId}`);

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await adminClient
      .from("brand_campaigns")
      .select("campaign_title, brand_name, campaign_description, compensation_type, budget_min, budget_max, application_deadline, currency")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      throw new Error("Campaign not found");
    }

    // Fetch creator profile (user_id = influencer_id in this schema)
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", influencerId)
      .single();

    if (profileError) {
      console.error("Profile not found:", profileError);
    }

    const creatorName = profile?.first_name || "Creator";

    // Fetch creator email from auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(influencerId);
    if (authError) {
      console.error("Auth user not found:", authError);
    }
    const creatorEmail = authUser?.user?.email;

    // Insert in-app notification
    const { error: notifError } = await adminClient.from("notifications").insert({
      user_id: influencerId,
      type: "campaign_invitation",
      title: "You've been invited to a campaign!",
      message: `${campaign.brand_name} has invited you to their campaign "${campaign.campaign_title}". Check it out!`,
      related_id: campaignId,
    });

    if (notifError) {
      console.error("Failed to insert notification:", notifError);
    } else {
      console.log("In-app notification created successfully");
    }

    // Send email via Resend
    if (creatorEmail) {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      const appDomain = Deno.env.get("APP_DOMAIN") || "https://hostfluencer.com";

      // Build compensation string
      let compensationText = campaign.compensation_type || "Compensation available";
      if (campaign.budget_min && campaign.budget_max) {
        const currency = campaign.currency || "USD";
        compensationText = `${currency} ${campaign.budget_min.toLocaleString()} – ${campaign.budget_max.toLocaleString()} (${campaign.compensation_type})`;
      } else if (campaign.budget_max) {
        const currency = campaign.currency || "USD";
        compensationText = `Up to ${currency} ${campaign.budget_max.toLocaleString()} (${campaign.compensation_type})`;
      }

      const deadlineText = campaign.application_deadline
        ? new Date(campaign.application_deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You've Been Invited! 🎉</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${creatorName}! 👋</h2>
            <p style="font-size: 16px;"><strong>${campaign.brand_name}</strong> has invited you to join their campaign:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">${campaign.campaign_title}</h3>
              ${campaign.campaign_description ? `<p style="color: #555; font-size: 14px; margin-bottom: 10px;">${campaign.campaign_description.substring(0, 200)}${campaign.campaign_description.length > 200 ? '...' : ''}</p>` : ''}
              <p style="margin: 8px 0; font-size: 14px;"><strong>💰 Compensation:</strong> ${compensationText}</p>
              ${deadlineText ? `<p style="margin: 8px 0; font-size: 14px;"><strong>📅 Deadline:</strong> ${deadlineText}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appDomain}/marketplace" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                View Campaign Details →
              </a>
            </div>

            <p style="color: #6c757d; font-size: 14px;">Don't miss out — review the campaign and accept the invitation before spots fill up!</p>
            <hr style="border: none; height: 1px; background: #e9ecef; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">Best regards,<br><strong>The Hostfluencer Team</strong></p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Hostfluencer. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      const { error: emailError } = await resend.emails.send({
        from: "HostFluencer <noreply@hostfluencer.com>",
        to: [creatorEmail],
        subject: `You're invited to "${campaign.campaign_title}" by ${campaign.brand_name}!`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Failed to send email:", emailError);
      } else {
        console.log("Invitation email sent to:", creatorEmail);
      }
    } else {
      console.warn("No email found for creator, skipping email send");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-campaign-invitation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
