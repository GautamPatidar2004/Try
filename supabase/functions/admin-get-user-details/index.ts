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

    const { userId } = await req.json();
    if (!userId) {
      throw new Error("userId is required");
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) {
      console.error("Error fetching auth user:", authError);
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq("influencer_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
    }

    // Get subscription usage
    const { data: usage, error: usageError } = await supabaseAdmin
      .from("subscription_usage")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (usageError) {
      console.error("Error fetching usage:", usageError);
    }

    // Get user activity timeline
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from("user_activity_timeline")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
    }

    // Get login history from analytics_events
    const { data: loginHistory, error: loginError } = await supabaseAdmin
      .from("analytics_events")
      .select("*")
      .eq("user_id", userId)
      .eq("event_type", "auth")
      .order("created_at", { ascending: false })
      .limit(20);

    if (loginError) {
      console.error("Error fetching login history:", loginError);
    }

    // Get admin actions on this user
    const { data: adminActions, error: adminError } = await supabaseAdmin
      .from("admin_activity_log")
      .select(`
        *,
        admin:profiles!admin_activity_log_admin_id_profiles_fkey (first_name, last_name)
      `)
      .eq("target_id", userId)
      .eq("target_type", "user")
      .order("created_at", { ascending: false })
      .limit(20);

    if (adminError) {
      console.error("Error fetching admin actions:", adminError);
    }

    return new Response(
      JSON.stringify({
        email: authUser?.user?.email || null,
        emailConfirmedAt: authUser?.user?.email_confirmed_at || null,
        lastSignInAt: authUser?.user?.last_sign_in_at || null,
        createdAt: authUser?.user?.created_at || null,
        subscription,
        usage,
        activities: activities || [],
        loginHistory: loginHistory || [],
        adminActions: adminActions || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in admin-get-user-details:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 400,
      }
    );
  }
});
