import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractSignRequest {
  ambassador_member_id: string;
  signature_data: string;
  legal_name: string;
  agreed_terms: boolean;
  user_agent: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      ambassador_member_id,
      signature_data,
      legal_name,
      agreed_terms,
      user_agent,
    }: ContractSignRequest = await req.json();

    // Get client IP address
    const ip_address = req.headers.get("x-forwarded-for") || 
                       req.headers.get("x-real-ip") || 
                       "unknown";

    console.log("Processing contract signature for ambassador:", ambassador_member_id);

    // Verify ambassador member exists and is pending
    const { data: ambassador, error: ambassadorError } = await supabase
      .from("ambassador_members")
      .select("*, profiles!inner(first_name, last_name, email)")
      .eq("id", ambassador_member_id)
      .single();

    if (ambassadorError || !ambassador) {
      throw new Error("Ambassador member not found");
    }

    if (ambassador.status !== "pending") {
      throw new Error("Ambassador is not in pending status");
    }

    // Convert base64 signature to blob and upload to storage
    const base64Data = signature_data.split(",")[1];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    
    const timestamp = new Date().getTime();
    const fileName = `${ambassador.user_id}/contract_v1.0_signed_${timestamp}.png`;

    const { error: uploadError } = await supabase.storage
      .from("ambassador-contracts")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to store signature");
    }

    // Get the public URL for the signature
    const { data: { publicUrl } } = supabase.storage
      .from("ambassador-contracts")
      .getPublicUrl(fileName);

    console.log("Signature uploaded:", fileName);

    // Create contract record
    const { data: contract, error: contractError } = await supabase
      .from("ambassador_contracts")
      .insert({
        ambassador_member_id,
        contract_pdf_url: "/contracts/HOSTFLUENCER_AMBASSADOR_AGREEMENT_v1.0.pdf",
        signature_data: {
          signature_url: publicUrl,
          timestamp: new Date().toISOString(),
        },
        legal_name,
        signed_at: new Date().toISOString(),
        ip_address,
        user_agent,
        contract_version: "v1.0",
        metadata: {
          agreed_terms,
        },
      })
      .select()
      .single();

    if (contractError) {
      console.error("Contract creation error:", contractError);
      throw new Error("Failed to create contract record");
    }

    console.log("Contract record created:", contract.id);

    // Update ambassador member status to active
    const { error: updateError } = await supabase
      .from("ambassador_members")
      .update({
        status: "active",
        contract_signed_at: new Date().toISOString(),
        contract_signature_data: {
          signature_url: publicUrl,
          signed_at: new Date().toISOString(),
        },
        contract_version: "v1.0",
        contract_ip_address: ip_address,
        agreed_to_terms: true,
      })
      .eq("id", ambassador_member_id);

    if (updateError) {
      console.error("Ambassador update error:", updateError);
      throw new Error("Failed to update ambassador status");
    }

    console.log("Ambassador status updated to active");

    // Send confirmation email if Resend is configured
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const profile = ambassador.profiles;
        
        await resend.emails.send({
          from: "Hostfluencer <noreply@hostfluencer.com>",
          to: [profile.email],
          subject: "Welcome to the Hostfluencer Ambassador Program! 🎉",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Welcome, ${profile.first_name}!</h1>
              
              <p>Congratulations on becoming a Hostfluencer Ambassador! Your contract has been successfully signed and your account is now active.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Your Ambassador Details</h2>
                <p><strong>Referral Code:</strong> ${ambassador.referral_code}</p>
                <p><strong>Signed On:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Contract Version:</strong> v1.0</p>
              </div>
              
              <h3>Next Steps:</h3>
              <ol>
                <li>Complete your referral link setup in the dashboard</li>
                <li>Add your payment method for commission payouts</li>
                <li>Start sharing your unique referral code</li>
                <li>Meet monthly content requirements (4 stories + 1 feed post)</li>
              </ol>
              
              <h3>Commission Structure:</h3>
              <ul>
                <li>$500 per successful property stay referral</li>
                <li>$150 per restaurant collaboration</li>
                <li>20% recurring commission on creator referrals</li>
              </ul>
              
              <p>A copy of your signed contract is stored securely in your account and can be accessed anytime from your dashboard.</p>
              
              <p style="margin-top: 30px;">If you have any questions, please don't hesitate to reach out to our support team.</p>
              
              <p>Best regards,<br>The Hostfluencer Team</p>
            </div>
          `,
        });

        console.log("Confirmation email sent to:", profile.email);
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        contract_id: contract.id,
        message: "Contract signed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in sign-ambassador-contract:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while processing the contract",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
