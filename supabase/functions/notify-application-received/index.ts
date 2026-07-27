import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const appDomain = Deno.env.get("APP_DOMAIN") || "https://hostfluencer-influencer.lovable.app";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    let totalEmailsSent = 0;
    let totalNotificationsCreated = 0;
    const errors: string[] = [];

    // ========================================
    // PROCESS PROPERTY APPLICATIONS
    // ========================================
    console.log("Fetching pending property applications...");
    
    // Fixed: Use correct FK chain - applications -> influencers -> profiles
    const { data: propertyApps, error: propertyError } = await supabase
      .from("applications")
      .select(`
        id,
        influencer_id,
        property_id,
        proposal_message,
        proposed_dates_start,
        proposed_dates_end,
        created_at,
        notification_email_sent,
        creator_confirmation_sent,
        property:properties!inner(id, title, host_id, location),
        applicant:influencers!inner(id, profile:profiles!inner(id, first_name, last_name))
      `)
      .or("notification_email_sent.eq.false,creator_confirmation_sent.eq.false")
      .limit(50);

    if (propertyError) {
      console.error("Error fetching property applications:", propertyError);
      errors.push(`Property apps fetch error: ${propertyError.message}`);
    } else if (propertyApps && propertyApps.length > 0) {
      console.log(`Found ${propertyApps.length} property applications to process`);

      // Get unique host IDs to fetch their emails
      const hostIds = [...new Set(propertyApps.map((app: any) => app.property?.host_id).filter(Boolean))];
      const creatorIds = [...new Set(propertyApps.map((app: any) => app.influencer_id).filter(Boolean))];
      
      // Fetch host emails using admin API
      const hostEmails: Record<string, string> = {};
      for (const hostId of hostIds) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(hostId as string);
        if (userData?.user?.email) {
          hostEmails[hostId as string] = userData.user.email;
        } else if (userError) {
          console.error(`Error fetching host email for ${hostId}:`, userError);
        }
      }

      // Fetch creator emails using admin API
      const creatorEmails: Record<string, string> = {};
      for (const creatorId of creatorIds) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(creatorId as string);
        if (userData?.user?.email) {
          creatorEmails[creatorId as string] = userData.user.email;
        } else if (userError) {
          console.error(`Error fetching creator email for ${creatorId}:`, userError);
        }
      }

      // Fetch host profiles for names
      const { data: hostProfiles } = await supabase
        .from("profiles")
        .select("id, first_name")
        .in("id", hostIds);

      const hostNames: Record<string, string> = {};
      hostProfiles?.forEach((p: any) => {
        hostNames[p.id] = p.first_name || "there";
      });

      // Process each application
      for (const app of propertyApps as any[]) {
        const hostId = app.property?.host_id;
        const hostEmail = hostEmails[hostId];
        const hostFirstName = hostNames[hostId] || "there";
        const propertyTitle = app.property?.title || "your property";
        const propertyLocation = app.property?.location || "";
        const creatorId = app.influencer_id;
        const creatorEmail = creatorEmails[creatorId];
        
        // Fixed: Access nested profile data correctly
        const creatorFirstName = app.applicant?.profile?.first_name || "";
        const creatorLastName = app.applicant?.profile?.last_name || "";
        const applicantName = [creatorFirstName, creatorLastName].filter(Boolean).join(" ") || "A creator";
        
        const appliedDate = new Date(app.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        // Build proposed dates string
        let proposedDatesStr = "";
        if (app.proposed_dates_start && app.proposed_dates_end) {
          const startDate = new Date(app.proposed_dates_start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const endDate = new Date(app.proposed_dates_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          proposedDatesStr = `${startDate} - ${endDate}`;
        }

        // ========================================
        // SEND HOST NOTIFICATION EMAIL
        // ========================================
        if (!app.notification_email_sent && hostEmail) {
          try {
            await resend.emails.send({
              from: "HostFluencer <noreply@hostfluencer.com>",
              to: [hostEmail],
              subject: `New application for ${propertyTitle} 🎉`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #333; font-size: 24px;">Hi ${hostFirstName}!</h1>
                  
                  <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Great news! A creator has applied to stay at <strong>"${propertyTitle}"</strong>.
                  </p>
                  
                  <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Applicant Details</h3>
                    <p style="color: #555; margin: 8px 0;"><strong>Name:</strong> ${applicantName}</p>
                    <p style="color: #555; margin: 8px 0;"><strong>Applied:</strong> ${appliedDate}</p>
                    ${proposedDatesStr ? `<p style="color: #555; margin: 8px 0;"><strong>Proposed Dates:</strong> ${proposedDatesStr}</p>` : ""}
                  </div>
                  
                  <a href="${appDomain}/host-dashboard" 
                     style="display: inline-block; background: #E91E63; color: white; padding: 14px 28px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                    View Application
                  </a>
                  
                  <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    Don't keep them waiting too long - respond within 48 hours for the best experience!
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #aaa; font-size: 12px;">
                    You're receiving this because someone applied to your property on HostFluencer.
                  </p>
                </div>
              `,
            });
            totalEmailsSent++;
            console.log(`Host email sent to ${hostId} for application ${app.id}`);
          } catch (emailError: any) {
            console.error(`Failed to send host email for application ${app.id}:`, emailError);
            errors.push(`Host email failed for app ${app.id}: ${emailError.message}`);
          }
        } else if (!app.notification_email_sent) {
          console.warn(`No email found for host ${hostId}`);
        }

        // ========================================
        // SEND CREATOR CONFIRMATION EMAIL
        // ========================================
        if (!app.creator_confirmation_sent && creatorEmail) {
          try {
            await resend.emails.send({
              from: "HostFluencer <noreply@hostfluencer.com>",
              to: [creatorEmail],
              subject: `Your application for "${propertyTitle}" has been submitted! ✨`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #333; font-size: 24px;">Hi ${creatorFirstName || "there"}!</h1>
                  
                  <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Great news! Your application for <strong>"${propertyTitle}"</strong> has been successfully submitted.
                  </p>
                  
                  <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
                    <ul style="color: #555; padding-left: 20px; line-height: 1.8;">
                      <li>The host will review your proposal</li>
                      <li>You'll receive a notification when they respond</li>
                      <li>Average response time is 24-48 hours</li>
                    </ul>
                  </div>
                  
                  <div style="background: #fff3e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Application Details</h3>
                    <p style="color: #555; margin: 8px 0;"><strong>Property:</strong> ${propertyTitle}</p>
                    ${propertyLocation ? `<p style="color: #555; margin: 8px 0;"><strong>Location:</strong> ${propertyLocation}</p>` : ""}
                    ${proposedDatesStr ? `<p style="color: #555; margin: 8px 0;"><strong>Proposed Dates:</strong> ${proposedDatesStr}</p>` : ""}
                    <p style="color: #555; margin: 8px 0;"><strong>Submitted:</strong> ${appliedDate}</p>
                  </div>
                  
                  <a href="${appDomain}/creator-dashboard" 
                     style="display: inline-block; background: #E91E63; color: white; padding: 14px 28px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                    View My Applications
                  </a>
                  
                  <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    Good luck! We hope this collaboration works out perfectly for you.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #aaa; font-size: 12px;">
                    You're receiving this because you applied to a property on HostFluencer.
                  </p>
                </div>
              `,
            });
            totalEmailsSent++;
            console.log(`Creator confirmation email sent to ${creatorId} for application ${app.id}`);
          } catch (emailError: any) {
            console.error(`Failed to send creator confirmation for application ${app.id}:`, emailError);
            errors.push(`Creator email failed for app ${app.id}: ${emailError.message}`);
          }
        } else if (!app.creator_confirmation_sent) {
          console.warn(`No email found for creator ${creatorId}`);
        }

        // Create in-app notification for host (only if not already sent)
        if (!app.notification_email_sent) {
          try {
            await supabase.from("notifications").insert({
              user_id: hostId,
              type: "application_received",
              title: "New Application Received!",
              message: `${applicantName} has applied to "${propertyTitle}"`,
              related_id: app.id,
            });
            totalNotificationsCreated++;
          } catch (notifError: any) {
            console.error(`Failed to create notification for ${app.id}:`, notifError);
          }
        }

        // Mark as notified (update both flags)
        await supabase
          .from("applications")
          .update({
            notification_email_sent: true,
            notification_email_sent_at: app.notification_email_sent ? undefined : new Date().toISOString(),
            creator_confirmation_sent: true,
            creator_confirmation_sent_at: app.creator_confirmation_sent ? undefined : new Date().toISOString(),
          })
          .eq("id", app.id);
      }
    } else {
      console.log("No pending property applications found");
    }

    // ========================================
    // PROCESS BRAND CAMPAIGN APPLICATIONS
    // ========================================
    console.log("Fetching pending brand campaign applications...");
    
    // Fixed: Use correct FK chain - brand_campaign_applications -> influencers -> profiles
    const { data: brandApps, error: brandError } = await supabase
      .from("brand_campaign_applications")
      .select(`
        id,
        influencer_id,
        campaign_id,
        cover_letter,
        created_at,
        notification_email_sent,
        creator_confirmation_sent,
        campaign:brand_campaigns!inner(id, campaign_title, created_by),
        applicant:influencers!inner(id, profile:profiles!inner(id, first_name, last_name))
      `)
      .or("notification_email_sent.eq.false,creator_confirmation_sent.eq.false")
      .limit(50);

    if (brandError) {
      console.error("Error fetching brand applications:", brandError);
      errors.push(`Brand apps fetch error: ${brandError.message}`);
    } else if (brandApps && brandApps.length > 0) {
      console.log(`Found ${brandApps.length} brand applications to process`);

      // Get unique owner IDs and creator IDs
      const ownerIds = [...new Set(brandApps.map((app: any) => app.campaign?.created_by).filter(Boolean))];
      const creatorIds = [...new Set(brandApps.map((app: any) => app.influencer_id).filter(Boolean))];
      
      // Fetch owner emails
      const ownerEmails: Record<string, string> = {};
      for (const ownerId of ownerIds) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(ownerId as string);
        if (userData?.user?.email) {
          ownerEmails[ownerId as string] = userData.user.email;
        } else if (userError) {
          console.error(`Error fetching owner email for ${ownerId}:`, userError);
        }
      }

      // Fetch creator emails
      const creatorEmails: Record<string, string> = {};
      for (const creatorId of creatorIds) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(creatorId as string);
        if (userData?.user?.email) {
          creatorEmails[creatorId as string] = userData.user.email;
        } else if (userError) {
          console.error(`Error fetching creator email for ${creatorId}:`, userError);
        }
      }

      // Fetch owner profiles for names
      const { data: ownerProfiles } = await supabase
        .from("profiles")
        .select("id, first_name")
        .in("id", ownerIds);

      const ownerNames: Record<string, string> = {};
      ownerProfiles?.forEach((p: any) => {
        ownerNames[p.id] = p.first_name || "there";
      });

      // Process each application
      for (const app of brandApps as any[]) {
        const ownerId = app.campaign?.created_by;
        const ownerEmail = ownerEmails[ownerId];
        const ownerFirstName = ownerNames[ownerId] || "there";
        const campaignTitle = app.campaign?.campaign_title || "your campaign";
        const creatorId = app.influencer_id;
        const creatorEmail = creatorEmails[creatorId];
        
        // Fixed: Access nested profile data correctly
        const creatorFirstName = app.applicant?.profile?.first_name || "";
        const creatorLastName = app.applicant?.profile?.last_name || "";
        const applicantName = [creatorFirstName, creatorLastName].filter(Boolean).join(" ") || "A creator";
        
        const appliedDate = new Date(app.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        // ========================================
        // SEND BRAND OWNER NOTIFICATION EMAIL
        // ========================================
        if (!app.notification_email_sent && ownerEmail) {
          try {
            await resend.emails.send({
              from: "HostFluencer <noreply@hostfluencer.com>",
              to: [ownerEmail],
              subject: `New application for "${campaignTitle}" 🎉`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #333; font-size: 24px;">Hi ${ownerFirstName}!</h1>
                  
                  <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Great news! A creator has applied to your campaign <strong>"${campaignTitle}"</strong>.
                  </p>
                  
                  <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Applicant Details</h3>
                    <p style="color: #555; margin: 8px 0;"><strong>Name:</strong> ${applicantName}</p>
                    <p style="color: #555; margin: 8px 0;"><strong>Applied:</strong> ${appliedDate}</p>
                  </div>
                  
                  <a href="${appDomain}/brand-dashboard" 
                     style="display: inline-block; background: #E91E63; color: white; padding: 14px 28px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                    View Application
                  </a>
                  
                  <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    Don't keep them waiting too long - respond within 48 hours for the best experience!
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #aaa; font-size: 12px;">
                    You're receiving this because someone applied to your brand campaign on HostFluencer.
                  </p>
                </div>
              `,
            });
            totalEmailsSent++;
            console.log(`Brand owner email sent to ${ownerId} for brand application ${app.id}`);
          } catch (emailError: any) {
            console.error(`Failed to send email for brand application ${app.id}:`, emailError);
            errors.push(`Email failed for brand app ${app.id}: ${emailError.message}`);
          }
        } else if (!app.notification_email_sent) {
          console.warn(`No email found for campaign owner ${ownerId}`);
        }

        // ========================================
        // SEND CREATOR CONFIRMATION EMAIL (Brand Campaign)
        // ========================================
        if (!app.creator_confirmation_sent && creatorEmail) {
          try {
            await resend.emails.send({
              from: "HostFluencer <noreply@hostfluencer.com>",
              to: [creatorEmail],
              subject: `Your application for "${campaignTitle}" has been submitted! ✨`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #333; font-size: 24px;">Hi ${creatorFirstName || "there"}!</h1>
                  
                  <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Great news! Your application for <strong>"${campaignTitle}"</strong> has been successfully submitted.
                  </p>
                  
                  <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
                    <ul style="color: #555; padding-left: 20px; line-height: 1.8;">
                      <li>The brand will review your application</li>
                      <li>You'll receive a notification when they respond</li>
                      <li>Average response time is 24-48 hours</li>
                    </ul>
                  </div>
                  
                  <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Application Details</h3>
                    <p style="color: #555; margin: 8px 0;"><strong>Campaign:</strong> ${campaignTitle}</p>
                    <p style="color: #555; margin: 8px 0;"><strong>Submitted:</strong> ${appliedDate}</p>
                  </div>
                  
                  <a href="${appDomain}/creator-dashboard" 
                     style="display: inline-block; background: #E91E63; color: white; padding: 14px 28px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                    View My Applications
                  </a>
                  
                  <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    Good luck! We hope this collaboration works out perfectly for you.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #aaa; font-size: 12px;">
                    You're receiving this because you applied to a brand campaign on HostFluencer.
                  </p>
                </div>
              `,
            });
            totalEmailsSent++;
            console.log(`Creator confirmation email sent to ${creatorId} for brand application ${app.id}`);
          } catch (emailError: any) {
            console.error(`Failed to send creator confirmation for brand application ${app.id}:`, emailError);
            errors.push(`Creator email failed for brand app ${app.id}: ${emailError.message}`);
          }
        } else if (!app.creator_confirmation_sent) {
          console.warn(`No email found for creator ${creatorId}`);
        }

        // Create in-app notification for brand owner (only if not already sent)
        if (!app.notification_email_sent) {
          try {
            await supabase.from("notifications").insert({
              user_id: ownerId,
              type: "brand_application_received",
              title: "New Campaign Application!",
              message: `${applicantName} has applied to "${campaignTitle}"`,
              related_id: app.id,
            });
            totalNotificationsCreated++;
          } catch (notifError: any) {
            console.error(`Failed to create notification for brand app ${app.id}:`, notifError);
          }
        }

        // Mark as notified (update both flags)
        await supabase
          .from("brand_campaign_applications")
          .update({
            notification_email_sent: true,
            notification_email_sent_at: app.notification_email_sent ? undefined : new Date().toISOString(),
            creator_confirmation_sent: true,
            creator_confirmation_sent_at: app.creator_confirmation_sent ? undefined : new Date().toISOString(),
          })
          .eq("id", app.id);
      }
    } else {
      console.log("No pending brand campaign applications found");
    }

    const summary = {
      success: true,
      emailsSent: totalEmailsSent,
      notificationsCreated: totalNotificationsCreated,
      errors: errors.length > 0 ? errors : undefined,
      processedAt: new Date().toISOString(),
    };

    console.log("Processing complete:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-application-received:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
