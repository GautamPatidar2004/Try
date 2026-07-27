import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create client with user's token to verify they're an admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { action, userId, data } = await req.json();
    if (!action || !userId) {
      throw new Error("action and userId are required");
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let result: any = { success: true };

    switch (action) {
      case "unban": {
        // Unban user
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_banned: false,
            banned_at: null,
            banned_by: null,
            ban_reason: null,
          })
          .eq("id", userId);

        if (error) throw error;

        // Log the action
        await supabaseAdmin.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "unban_user",
          target_type: "user",
          target_id: userId,
          details: { reason: data?.reason || "Admin unbanned user" },
        });

        result.message = "User unbanned successfully";
        break;
      }

      case "reset_password": {
        // Send password reset email
        const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!targetUser?.user?.email) {
          throw new Error("User email not found");
        }

        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
          targetUser.user.email,
          { redirectTo: `${Deno.env.get("APP_DOMAIN") || "https://hostfluencer.com"}/reset-password` }
        );

        if (error) throw error;

        // Log the action
        await supabaseAdmin.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "reset_password",
          target_type: "user",
          target_id: userId,
          details: { email: targetUser.user.email },
        });

        result.message = "Password reset email sent";
        break;
      }

      case "update_subscription": {
        const { planId, status } = data;
        
        // Get current subscription
        const { data: currentSub } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("influencer_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (currentSub) {
          // Update existing subscription
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_id: planId || currentSub.plan_id,
              status: status || currentSub.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSub.id);

          if (error) throw error;
        } else {
          // Create new subscription
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .insert({
              influencer_id: userId,
              plan_id: planId,
              status: status || "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });

          if (error) throw error;
        }

        // Log the action
        await supabaseAdmin.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "update_subscription",
          target_type: "user",
          target_id: userId,
          details: { planId, status },
        });

        result.message = "Subscription updated successfully";
        break;
      }

      case "cancel_subscription": {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("influencer_id", userId)
          .eq("status", "active");

        if (error) throw error;

        // Log the action
        await supabaseAdmin.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "cancel_subscription",
          target_type: "user",
          target_id: userId,
          details: { reason: data?.reason || "Cancelled by admin" },
        });

        result.message = "Subscription cancelled";
        break;
      }

      case "verify_user": {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ is_verified: true })
          .eq("id", userId);

        if (error) throw error;

        await supabaseAdmin.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "verify_user",
          target_type: "user",
          target_id: userId,
        });

        result.message = "User verified";
        break;
      }

      case "unverify_user": {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ is_verified: false })
          .eq("id", userId);

        if (error) throw error;

        await supabaseAdmin.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "unverify_user",
          target_type: "user",
          target_id: userId,
        });

        result.message = "User unverified";
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in admin-manage-user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 400,
      }
    );
  }
});
