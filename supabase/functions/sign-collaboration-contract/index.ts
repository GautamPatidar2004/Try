import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignContractRequest {
  agreement_id: string;
  signature_data: string;
  legal_name: string;
  party_type: "host" | "influencer"| "brand" | "creator";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Create a client with the user's token to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { agreement_id, signature_data, legal_name, party_type }: SignContractRequest = await req.json();

    console.log(`[SIGN-CONTRACT] User ${user.id} signing as ${party_type} for agreement ${agreement_id}`);

    // Get the client's IP address for audit trail
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";


                     const isBrandFlow = party_type === "brand" || party_type === "creator";

                     // ─── BRAND CAMPAIGN FLOW ────────────────────────────────────────────────────
                     if (isBrandFlow) {
                       const { data: agreement, error: fetchError } = await supabase
                         .from("brand_collaboration_agreements")
                         .select(`
                           *,
                           campaign:brand_campaigns(
                             id,
                             campaign_title,
                             brand_name,
                             timeline_end,
                             deliverables,
                             content_requirements,
                             creator_payout,
                             currency
                           ),
                           application:brand_campaign_applications(
                             id,
                             influencer_id
                           )
                         `)
                         .eq("id", agreement_id)
                         .single();
                 
                       if (fetchError || !agreement) {
                         console.error("[SIGN-CONTRACT] Brand agreement not found:", fetchError);
                         throw new Error("Agreement not found");
                       }
                 
                       // Auth checks
                       const isBrand    = agreement.brand_id === user.id;
                       const isCreator  = agreement.influencer_id === user.id;
                 
                       if (!isBrand && !isCreator) throw new Error("You are not authorized to sign this agreement");
                       if (party_type === "brand"   && !isBrand)   throw new Error("You are not the brand on this agreement");
                       if (party_type === "creator" && !isCreator)  throw new Error("You are not the creator on this agreement");
                 
                       // Status checks
                       if (party_type === "brand"   && agreement.status !== "pending_brand")   throw new Error(`Agreement not ready for brand signature. Status: ${agreement.status}`);
                       if (party_type === "creator" && agreement.status !== "pending_creator") throw new Error(`Agreement not ready for creator signature. Status: ${agreement.status}`);
                 
                       const signatureMetadata = {
                         signed_at: new Date().toISOString(),
                         ip_address: clientIp,
                         user_agent: req.headers.get("user-agent") || "unknown",
                         legal_name,
                       };
                 
                       const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
                       let newStatus: string;
                 
                       if (party_type === "brand") {
                        updateData.brand_signature_data = {
                          ...signatureMetadata,
                          signature_image: signature_data,
                        };
                      
                        updateData.brand_legal_name = legal_name;
                        updateData.brand_ip_address = clientIp;
                        updateData.brand_signed_at = new Date().toISOString();
                      
                      
                        if (agreement.creator_signed_at) {
                          newStatus = "active";
                          updateData.agreed_at = new Date().toISOString();
                        } else {
                          newStatus = "pending_creator";
                        }
                      
                      
                      } else {
                      
                        updateData.creator_signature_data = {
                          ...signatureMetadata,
                          signature_image: signature_data,
                        };
                      
                        updateData.creator_legal_name = legal_name;
                        updateData.creator_ip_address = clientIp;
                        updateData.creator_signed_at = new Date().toISOString();
                      
                      
                        if (agreement.brand_signed_at) {
                          newStatus = "active";
                          updateData.agreed_at = new Date().toISOString();
                        } else {
                          newStatus = "pending_brand";
                        }
                      
                      }
                      
                      
                      updateData.status = newStatus;
                      
                 
                       const { error: updateError } = await supabase
                         .from("brand_collaboration_agreements")
                         .update(updateData)
                         .eq("id", agreement_id);
                 
                       if (updateError) {
                         console.error("[SIGN-CONTRACT] Brand agreement update error:", updateError);
                         throw new Error("Failed to update agreement");
                       }
                 
                       console.log(`[SIGN-CONTRACT] Brand agreement updated to: ${newStatus}`);
                 
                       // ── Emails ────────────────────────────────────────────────────────────────
                       if (resendApiKey) {
                         const resend = new Resend(resendApiKey);
                         const appDomain = Deno.env.get("APP_DOMAIN") || "https://hostfluencer.com";
                 
                         const campaignTitle = agreement.campaign?.campaign_title || "Campaign";
                         const brandName     = agreement.campaign?.brand_name     || "Brand";
                 
                         const brandEmail = agreement.brand_id ?
                           (await supabase.auth.admin.getUserById(agreement.brand_id)).data?.user?.email : null;
                         const creatorEmail = agreement.influencer_id ?
                           (await supabase.auth.admin.getUserById(agreement.influencer_id)).data?.user?.email : null;
                 
                         // Get creator first name from profiles
                         const { data: creatorProfile } = await supabase
                           .from("profiles")
                           .select("first_name")
                           .eq("id", agreement.influencer_id)
                           .single();
                         const creatorFirstName = creatorProfile?.first_name || "Creator";
                 
                         if (party_type === "brand") {
                           // Brand signed — confirm to brand, notify creator to countersign
                           if (brandEmail) {
                             await resend.emails.send({
                               from: "HostFluencer <noreply@hostfluencer.com>",
                               to: [brandEmail],
                               subject: `Contract Signed: Awaiting ${creatorFirstName}'s Signature`,
                               html: `
                                 <h1>You've Signed the Contract!</h1>
                                 <p>Hi ${brandName},</p>
                                 <p>You've signed the collaboration contract for <strong>${campaignTitle}</strong>.</p>
                                 <p>We've notified ${creatorFirstName} to review and countersign. You'll receive confirmation once fully executed.</p>
                                 <p><a href="${appDomain}/profile?tab=campaigns" style="background-color:#22c55e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">View Contract Status</a></p>
                                 <p>Best,<br>The HostFluencer Team</p>
                               `,
                             });
                           }
                 
                           if (creatorEmail) {
                             await resend.emails.send({
                               from: "HostFluencer <noreply@hostfluencer.com>",
                               to: [creatorEmail],
                               subject: `Action Required: Sign Your Contract for ${campaignTitle}`,
                               html: `
                                 <h1>Your Brand Contract is Ready to Sign</h1>
                                 <p>Hi ${creatorFirstName},</p>
                                 <p><strong>${brandName}</strong> has reviewed and signed the collaboration contract for <strong>${campaignTitle}</strong>.</p>
                                 <p>Please log in to review and countersign to activate the collaboration.</p>
                                 <p><a href="${appDomain}/profile?tab=campaigns" style="background-color:#22c55e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Sign Contract</a></p>
                                 <p>Best,<br>The HostFluencer Team</p>
                               `,
                             });
                           }
                         } else {
                           // Creator signed — both parties fully executed
                           if (brandEmail) {
                             await resend.emails.send({
                               from: "HostFluencer <noreply@hostfluencer.com>",
                               to: [brandEmail],
                               subject: `Collaboration Active: ${creatorFirstName} for ${campaignTitle}`,
                               html: `
                                 <h1>Your Collaboration is Now Active!</h1>
                                 <p>Hi ${brandName},</p>
                                 <p>${creatorFirstName} has signed the contract for <strong>${campaignTitle}</strong>. The collaboration is now officially active.</p>
                                 <p><a href="${appDomain}/profile?tab=campaigns" style="background-color:#22c55e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">View Collaboration</a></p>
                                 <p>Best,<br>The HostFluencer Team</p>
                               `,
                             });
                           }
                 
                           if (creatorEmail) {
                             await resend.emails.send({
                               from: "HostFluencer <noreply@hostfluencer.com>",
                               to: [creatorEmail],
                               subject: `Contract Confirmed: ${campaignTitle}`,
                               html: `
                                 <h1>Your Collaboration is Confirmed!</h1>
                                 <p>Hi ${creatorFirstName},</p>
                                 <p>Both parties have signed the contract for <strong>${campaignTitle}</strong> with <strong>${brandName}</strong>. Your collaboration is now active.</p>
                                 <p><a href="${appDomain}/profile?tab=campaigns" style="background-color:#22c55e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">View Details</a></p>
                                 <p>Best,<br>The HostFluencer Team</p>
                               `,
                             });
                           }
                         }
                       }
                 
                       return new Response(
                         JSON.stringify({
                           success: true,
                           new_status: newStatus,
                           message: party_type === "brand"
                             ? "Contract signed. Waiting for creator countersignature."
                             : "Contract fully signed. Collaboration is now active!",
                         }),
                         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
                       );
                     }
                 



// ── EXISTING HOST/INFLUENCER (STAY) FLOW — unchanged below ─ 


    // Fetch the agreement with all related data
    const { data: agreement, error: fetchError } = await supabase
      .from("collaboration_agreements")
      .select(`
        *,
        application:applications(
          id,
          proposed_dates_start,
          proposed_dates_end,
          content_deliverables,
          content_deadline,
          influencer:influencers(
            id,
            profiles:profiles(id, first_name, last_name)
          ),
          property:properties(
            id,
            title,
            location,
            host:hosts(
              id,
              profiles:profiles(id, first_name, last_name)
            )
          )
        )
      `)
      .eq("id", agreement_id)
      .single();

    if (fetchError || !agreement) {
      console.error("[SIGN-CONTRACT] Agreement not found:", fetchError);
      throw new Error("Agreement not found");
    }

    // Verify the user is authorized to sign this agreement
    const isHost = agreement.host_id === user.id;
    const isInfluencer = agreement.influencer_id === user.id;

    if (!isHost && !isInfluencer) {
      throw new Error("You are not authorized to sign this agreement");
    }

    if (party_type === "host" && !isHost) {
      throw new Error("You are not the host of this agreement");
    }

    if (party_type === "influencer" && !isInfluencer) {
      throw new Error("You are not the influencer of this agreement");
    }

    // Verify the agreement is in the correct status for signing
    const validStatusForHost = ["pending", "pending_host"];
    const validStatusForInfluencer = ["pending_influencer"];

    if (party_type === "host" && !validStatusForHost.includes(agreement.status)) {
      throw new Error(`Agreement is not ready for host signature. Current status: ${agreement.status}`);
    }

    if (party_type === "influencer" && !validStatusForInfluencer.includes(agreement.status)) {
      throw new Error(`Agreement is not ready for influencer signature. Current status: ${agreement.status}`);
    }

    // Prepare signature metadata
    const signatureMetadata = {
      signed_at: new Date().toISOString(),
      ip_address: clientIp,
      user_agent: req.headers.get("user-agent") || "unknown",
      legal_name: legal_name,
    };

    // Build update object based on party type
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    let newStatus: string;

    if (party_type === "host") {

      updateData.host_signature_data = {
        ...signatureMetadata,
        signature_image: signature_data,
      };
    
      updateData.host_legal_name = legal_name;
      updateData.host_ip_address = clientIp;
      updateData.host_signed_at = new Date().toISOString();
    
    
      if (agreement.influencer_signed_at) {
        newStatus = "active";
        updateData.agreed_at = new Date().toISOString();
      } else {
        newStatus = "pending_influencer";
      }
    
    
    } else {
    
      updateData.influencer_signature_data = {
        ...signatureMetadata,
        signature_image: signature_data,
      };
    
      updateData.influencer_legal_name = legal_name;
      updateData.influencer_ip_address = clientIp;
      updateData.influencer_signed_at = new Date().toISOString();
      if (agreement.host_signed_at) {
        newStatus = "active";
        updateData.agreed_at = new Date().toISOString();
      } else {
        newStatus = "pending_host";
      }
    
    }

    updateData.status = newStatus;

    // Update the agreement
    const { error: updateError } = await supabase
      .from("collaboration_agreements")
      .update(updateData)
      .eq("id", agreement_id);

    if (updateError) {
      console.error("[SIGN-CONTRACT] Update error:", updateError);
      throw new Error("Failed to update agreement");
    }

     console.log(`[SIGN-CONTRACT] Agreement updated to status: ${newStatus}`);
 
     // Generate affiliate code when collaboration becomes active
     let affiliateCode: string | null = null;
     if (newStatus === "active") {
       const creatorProfile = agreement.application?.influencer?.profiles;
       const creatorName = creatorProfile?.first_name || "Creator";
       const propertyName = agreement.application?.property?.title || "Property";
       
       // Get commission rate from agreement
       const commissionRate = agreement.affiliate_commission_rate || 0.10;
       
       console.log(`[SIGN-CONTRACT] Generating affiliate code for ${creatorName} with ${commissionRate * 100}% commission`);
       
       // Generate unique code using the database function
       const { data: codeData, error: codeError } = await supabase
         .rpc("generate_affiliate_code", {
           p_creator_name: creatorName,
           p_property_name: propertyName
         });
       
       if (codeError) {
         console.error("[SIGN-CONTRACT] Error generating affiliate code:", codeError);
       } else if (codeData) {
         affiliateCode = codeData;
         
         // Create affiliate code record
         const { error: insertError } = await supabase
           .from("creator_affiliate_codes")
           .insert({
             collaboration_id: agreement_id,
             creator_id: agreement.influencer_id,
             host_id: agreement.host_id,
             property_id: agreement.application?.property?.id,
             code: codeData,
             commission_rate: commissionRate,
             commission_type: "percentage",
             is_active: true,
             valid_from: new Date().toISOString(),
           });
         
         if (insertError) {
           console.error("[SIGN-CONTRACT] Error inserting affiliate code:", insertError);
         } else {
           console.log(`[SIGN-CONTRACT] Affiliate code ${codeData} created with ${commissionRate * 100}% commission`);
         }
       }
     }
 
     // Send email notifications
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const appDomain = Deno.env.get("APP_DOMAIN") || "https://hostfluencer.com";

      const hostName = agreement.application?.property?.host?.profiles?.first_name || "Host";
      const influencerName = agreement.application?.influencer?.profiles?.first_name || "Creator";
      const propertyTitle = agreement.application?.property?.title || "Property";

      // Get email addresses from auth.users
      const hostEmail = agreement.host_id ? 
        (await supabase.auth.admin.getUserById(agreement.host_id)).data?.user?.email : null;
      const influencerEmail = agreement.influencer_id ? 
        (await supabase.auth.admin.getUserById(agreement.influencer_id)).data?.user?.email : null;

      if (party_type === "host") {
        // Host signed - send confirmation to host
        if (hostEmail) {
          await resend.emails.send({
            from: "HostFluencer <noreply@hostfluencer.com>",
            to: [hostEmail],
            subject: `Contract Signed: Awaiting ${influencerName}'s Signature`,
            html: `
              <h1>You've Signed the Contract!</h1>
              <p>Hi ${hostName},</p>
              <p>You've signed the collaboration contract for <strong>${propertyTitle}</strong>.</p>
              <p>We've notified ${influencerName} to review and sign. You'll receive a confirmation once the contract is fully executed.</p>
              <p><a href="${appDomain}/profile?tab=collaborations" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Contract Status</a></p>
              <p>Best,<br>The HostFluencer Team</p>
            `,
          });
          console.log("[SIGN-CONTRACT] Confirmation sent to host");
        }

        // Host signed - notify influencer to sign
        if (influencerEmail) {
          await resend.emails.send({
            from: "HostFluencer <noreply@hostfluencer.com>",
            to: [influencerEmail],
            subject: `Action Required: Sign Your Collaboration Contract for ${propertyTitle}`,
            html: `
              <h1>Your Collaboration Contract is Ready</h1>
              <p>Hi ${influencerName},</p>
              <p>${hostName} has reviewed and signed the collaboration contract for <strong>${propertyTitle}</strong>.</p>
              <p>Please log in to your HostFluencer dashboard to review and sign the contract to finalize your collaboration.</p>
              <p><a href="${appDomain}/profile?tab=collaborations" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Sign Contract</a></p>
              <p>Best,<br>The HostFluencer Team</p>
            `,
          });
          console.log("[SIGN-CONTRACT] Notification sent to influencer");
        }
      } else if (party_type === "influencer") {
        // Influencer signed - notify both parties
        if (hostEmail) {
           const commissionRate = agreement.affiliate_commission_rate || 0.10;
          await resend.emails.send({
            from: "HostFluencer <noreply@hostfluencer.com>",
            to: [hostEmail],
            subject: `Collaboration Confirmed: ${influencerName} for ${propertyTitle}`,
            html: `
              <h1>Your Collaboration is Now Active!</h1>
              <p>Hi ${hostName},</p>
              <p>Great news! ${influencerName} has signed the collaboration contract for <strong>${propertyTitle}</strong>.</p>
              <p>The collaboration is now officially active. You can view the details in your dashboard.</p>
               <p><strong>Affiliate Program:</strong> ${influencerName} now has an affiliate code to promote your property. They will earn ${(commissionRate * 100).toFixed(0)}% commission on bookings made using their code.</p>
              <p><a href="${appDomain}/profile?tab=collaborations" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Collaboration</a></p>
              <p>Best,<br>The HostFluencer Team</p>
            `,
          });
        }

        if (influencerEmail) {
           const commissionRate = agreement.affiliate_commission_rate || 0.10;
          await resend.emails.send({
            from: "HostFluencer <noreply@hostfluencer.com>",
            to: [influencerEmail],
            subject: `Contract Signed: ${propertyTitle} Collaboration Confirmed!`,
            html: `
              <h1>Your Collaboration is Confirmed!</h1>
              <p>Hi ${influencerName},</p>
              <p>Your collaboration contract for <strong>${propertyTitle}</strong> has been finalized!</p>
              <p>Both you and ${hostName} have signed the agreement. Your collaboration is now officially active.</p>
               ${affiliateCode ? `
               <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 16px 0;">
                 <p style="margin: 0 0 8px 0;"><strong>🎉 Your Affiliate Code:</strong></p>
                 <p style="font-size: 24px; font-weight: bold; color: #22c55e; margin: 0;">${affiliateCode}</p>
                 <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Share this code with your followers! You'll earn ${(commissionRate * 100).toFixed(0)}% commission on every booking made using your code.</p>
               </div>
               ` : '<p>Get ready for an amazing stay!</p>'}
              <p><a href="${appDomain}/profile?tab=collaborations" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a></p>
              <p>Best,<br>The HostFluencer Team</p>
            `,
          });
        }
        console.log("[SIGN-CONTRACT] Confirmation emails sent to both parties");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        new_status: newStatus,
        message: party_type === "host" 
          ? "Contract signed. Waiting for creator signature."
          : "Contract fully signed. Collaboration is now active!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[SIGN-CONTRACT] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
