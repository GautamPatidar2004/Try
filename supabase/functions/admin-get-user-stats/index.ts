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

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get active users (is_active = true)
    const { count: activeUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get inactive users
    const { count: inactiveUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", false);

    // Get banned users
    const { count: bannedUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_banned", true);

    // Get verified users
    const { count: verifiedUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true);

    // Get premium users (active subscriptions)
    const { count: premiumUsers } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get users with premium override
    const { count: premiumOverrideUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("premium_override", true);

    // Get users by type
    const { data: usersByType } = await supabaseAdmin
      .from("profiles")
      .select("user_type")
      .not("user_type", "is", null);

    const userTypeCounts: Record<string, number> = {};
    usersByType?.forEach((u) => {
      userTypeCounts[u.user_type] = (userTypeCounts[u.user_type] || 0) + 1;
    });

    // Get new users in last 30 days
    const { count: newUsersLast30Days } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get new users in previous 30 days (for trend calculation)
    const { count: newUsersPrevious30Days } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString());

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const newUsersTrend = calculateTrend(newUsersLast30Days || 0, newUsersPrevious30Days || 0);

    // Get average engagement (from influencers table)
    const { data: engagementData } = await supabaseAdmin
      .from("influencers")
      .select("engagement_rate")
      .not("engagement_rate", "is", null);

    const avgEngagement = engagementData && engagementData.length > 0
      ? engagementData.reduce((sum, i) => sum + (i.engagement_rate || 0), 0) / engagementData.length
      : 0;

    return new Response(
      JSON.stringify({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        inactiveUsers: inactiveUsers || 0,
        bannedUsers: bannedUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        premiumUsers: (premiumUsers || 0) + (premiumOverrideUsers || 0),
        usersByType: userTypeCounts,
        newUsersLast30Days: newUsersLast30Days || 0,
        newUsersTrend,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in admin-get-user-stats:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 400,
      }
    );
  }
});
