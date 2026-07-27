import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const tiktokClientKey = Deno.env.get("TIKTOK_CLIENT_KEY") ?? "";
    const tiktokClientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    console.log(`[TikTok Sync] Starting sync for user: ${userId}`);

    // Get the TikTok social account
    const { data: account, error: accountError } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("influencer_id", userId)
      .eq("platform", "tiktok")
      .single();

    if (accountError || !account) {
      throw new Error("No TikTok account found for this user");
    }

    if (!account.access_token) {
      throw new Error("TikTok account is not connected (no access token)");
    }

    let accessToken = account.access_token;

    // Check if token needs refresh
    const tokenExpiry = account.token_expires_at
      ? new Date(account.token_expires_at)
      : null;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (
      tokenExpiry &&
      tokenExpiry <= sevenDaysFromNow &&
      account.refresh_token
    ) {
      // if (tokenExpiry && tokenExpiry <= now && account.refresh_token) {
      console.log("[TikTok Sync] Token expired, refreshing...");

      const refreshResponse = await fetch(
        "https://open.tiktokapis.com/v2/oauth/token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_key: tiktokClientKey,
            client_secret: tiktokClientSecret,
            grant_type: "refresh_token",
            refresh_token: account.refresh_token,
          }),
        },
      );

      const refreshData = await refreshResponse.json();

      if (refreshData.access_token) {
        accessToken = refreshData.access_token;

        const newExpiry = new Date();
        newExpiry.setSeconds(
          newExpiry.getSeconds() + (refreshData.expires_in || 86400),
        );

        await supabaseClient
          .from("social_accounts")
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token || account.refresh_token,
            token_expires_at: newExpiry.toISOString(),
          })
          .eq("id", account.id);

        console.log("[TikTok Sync] Token refreshed successfully");
      } else {
        console.error("[TikTok Sync] Token refresh failed:", refreshData);
        throw new Error("Failed to refresh TikTok access token");
      }
    }

    // Fetch user stats
    const userInfoResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const userInfoData = await userInfoResponse.json();
    const userInfo = userInfoData.data?.user;

    if (!userInfo) {
      console.error("[TikTok Sync] Failed to fetch user info:", userInfoData);
      throw new Error("Failed to fetch TikTok user info");
    }

    console.log("[TikTok Sync] Got TikTok stats:", {
      followers: userInfo.follower_count,
      likes: userInfo.likes_count,
      videos: userInfo.video_count,
    });

    // Fetch recent videos for video-level metrics
    let recentVideos: any[] = [];
    let videoAggregates = {
      avg_views: 0,
      avg_likes: 0,
      avg_comments: 0,
      avg_shares: 0,
      total_views: 0,
      total_engagements: 0,
      engagement_rate: 0,
    };

    try {
      const videoListResponse = await fetch(
        "https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ max_count: 20 }),
        },
      );

      const videoListData = await videoListResponse.json();
      const videos = videoListData?.data?.videos || [];

      if (videos.length > 0) {
        recentVideos = videos;
        const totalViews = videos.reduce(
          (s: number, v: any) => s + (v.view_count || 0),
          0,
        );
        const totalLikes = videos.reduce(
          (s: number, v: any) => s + (v.like_count || 0),
          0,
        );
        const totalComments = videos.reduce(
          (s: number, v: any) => s + (v.comment_count || 0),
          0,
        );
        const totalShares = videos.reduce(
          (s: number, v: any) => s + (v.share_count || 0),
          0,
        );
        const totalEngagements = totalLikes + totalComments + totalShares;
        const followerCount = userInfo.follower_count || 0;
        videoAggregates = {
          avg_views: Math.round(totalViews / videos.length),
          avg_likes: Math.round(totalLikes / videos.length),
          avg_comments: Math.round(totalComments / videos.length),
          avg_shares: Math.round(totalShares / videos.length),
          total_views: totalViews,
          total_engagements: totalEngagements,
          engagement_rate:
            followerCount > 0
              ? parseFloat(
                  Math.min(
                    (totalEngagements / videos.length / followerCount) * 100,
                    20,
                  ).toFixed(2),
                )
              : 0,
        };
        console.log("[TikTok Sync] Video aggregates:", videoAggregates);
      } else {
        console.log(
          "[TikTok Sync] video/list returned no videos:",
          videoListData,
        );
      }
    } catch (videoErr) {
      console.warn(
        "[TikTok Sync] Failed to fetch video list (likely missing video.list scope):",
        videoErr,
      );
    }

    // Update social_accounts with latest data
    await supabaseClient
      .from("social_accounts")
      .update({
        follower_count: userInfo.follower_count || 0,
        username:
          userInfo.username || userInfo.display_name || account.username,
        analytics_data: {
          ...(typeof account.analytics_data === "object"
            ? account.analytics_data
            : {}),

          following_count: userInfo.following_count || 0,
          likes_count: userInfo.likes_count || 0,
          video_count: userInfo.video_count || 0,
          ...videoAggregates,
        },
        last_sync_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      })
      .eq("id", account.id);

    // Store in external_analytics for historical tracking
    const today = new Date().toISOString().split("T")[0];

    await supabaseClient.from("external_analytics").upsert(
      {
        influencer_id: userId,
        platform: "tiktok",
        metric_date: today,
        account_id: account.username,
        metrics: {
          follower_count: userInfo.follower_count || 0,
          following_count: userInfo.following_count || 0,
          likes_count: userInfo.likes_count || 0,
          video_count: userInfo.video_count || 0,
          recent_video_count: recentVideos.length,
          ...videoAggregates,
          recent_videos: recentVideos,
        },
      },
      {
        onConflict: "influencer_id,platform,account_id,metric_date",
      },
    );

    console.log("[TikTok Sync] Sync completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          follower_count: userInfo.follower_count,
          following_count: userInfo.following_count,
          likes_count: userInfo.likes_count,
          video_count: userInfo.video_count,
          ...videoAggregates,
          recent_videos_fetched: recentVideos.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[TikTok Sync] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
