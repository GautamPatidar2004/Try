import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  name: string;
  tempPassword: string;
  userType?: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin authorization check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, name, tempPassword, userType, isResend }: InvitationEmailRequest = await req.json();

    console.log(`${isResend ? 'Resending' : 'Sending'} invitation email to:`, email);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const loginUrl = 'https://hostfluencer.com/auth';

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${isResend ? 'Invitation Reminder' : 'Welcome to Hostfluencer'}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              ${isResend ? 'Invitation Reminder' : 'Welcome to Hostfluencer!'}
            </h1>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${isResend 
                ? 'This is a reminder that your Hostfluencer account is ready and waiting for you!'
                : `Your account has been created and you're invited to join our platform${userType ? ` as a <strong>${userType}</strong>` : ''}.`
              }
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #495057;">🔑 Your Login Details:</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Temporary Password:</strong> 
                <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 14px;">${tempPassword}</code>
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🚀 Login to Hostfluencer
              </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security.
              </p>
            </div>

            <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
              If you have any questions or need help getting started, please don't hesitate to contact our support team.
            </p>

            <hr style="border: none; height: 1px; background: #e9ecef; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
              Best regards,<br>
              <strong>The Hostfluencer Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>© 2024 Hostfluencer. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Hostfluencer <noreply@hostfluencer.com>",
      to: [email],
      subject: isResend ? "Invitation Reminder - Join Hostfluencer" : "Welcome to Hostfluencer - Your Account is Ready!",
      html: emailTemplate,
    });

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Invitation email ${isResend ? 'resent' : 'sent'} successfully`,
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);