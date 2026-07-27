import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Platform Detection ───────────────────────────────────────
const detectPlatform = (url: string) => {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  return "unknown";
};

const extractPostId = (url: string, platform: string) => {
  switch (platform) {
    case "tiktok":
      return url.match(/video\/(\d+)/)?.[1] || null;
    case "instagram":
      return url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/)?.[2] || null;
    case "youtube":
      return (
        url.match(/v=([A-Za-z0-9_-]+)/)?.[1] ||
        url.match(/youtu\.be\/([A-Za-z0-9_-]+)/)?.[1] ||
        null
      );
    case "twitter":
      return url.match(/status\/(\d+)/)?.[1] || null;
    default:
      return null;
  }
};

// ─── Get Access Token from DB ─────────────────────────────────
const getAccountToken = async (
  supabaseClient: any,
  userId: string,
  platform: string,
) => {
  const { data: account, error } = await supabaseClient
    .from("social_accounts")
    .select("*")
    .eq("influencer_id", userId)
    .eq("platform", platform)
    .single();

  if (error || !account) throw new Error(`No ${platform} account connected`);

  // ✅ Token expire check
  const tokenExpiry = account.token_expires_at
    ? new Date(account.token_expires_at)
    : null;
  const now = new Date();

  if (tokenExpiry && tokenExpiry <= now && account.refresh_token) {
    console.log(`[${platform}] Token expired, refreshing...`);

    const refreshResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: Deno.env.get("TIKTOK_CLIENT_KEY") ?? "",
          client_secret: Deno.env.get("TIKTOK_CLIENT_SECRET") ?? "",
          grant_type: "refresh_token",
          refresh_token: account.refresh_token,
        }),
      },
    );

    const refreshData = await refreshResponse.json();

    if (refreshData.access_token) {
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

      console.log(`[${platform}] Token refreshed successfully`);
      return refreshData.access_token;
    } else {
      throw new Error(`Failed to refresh ${platform} token — please reconnect`);
    }
  }

  return account.access_token;
};
//fetch metrixcs
const fetchTikTokMetrics = async (
  videoId: string,
  userId: string,
  supabaseClient: any,
) => {
  const access_token = await getAccountToken(supabaseClient, userId, "tiktok");

  const userCheck = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,video_count",
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  const userData = await userCheck.json();
  console.log("[TikTok] Token belongs to user:", userData?.data?.user);
  console.log("[TikTok] Token check status:", userData?.error);

  const res = await fetch(
    "https://open.tiktokapis.com/v2/video/list/?fields=id,view_count,like_count,comment_count,share_count",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 20 }),
    },
  );

  const data = await res.json();
  const videos = data?.data?.videos || [];

  console.log(
    "[TikTok] All videos:",
    videos.map((v: any) => v.id),
  );

  const video = videos.find((v: any) => v.id === videoId);

  if (!video) {
    console.warn("[TikTok] Video not found in list:", videoId);
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }

  return {
    views: video.view_count || 0,
    likes: video.like_count || 0,
    comments: video.comment_count || 0,
    shares: video.share_count || 0,
  };
};

const fetchInstagramMetrics = async (
  shortcode: string,
  userId: string,
  supabaseClient: any,
) => {
  const access_token = await getAccountToken(
    supabaseClient,
    userId,
    "instagram",
  );

  const { data: account } = await supabaseClient
    .from("social_accounts")
    .select("platform_user_id")
    .eq("influencer_id", userId)
    .eq("platform", "instagram")
    .single();

  const igAccountId = account?.platform_user_id;
  console.log("[Instagram] IG Account ID:", igAccountId);

  const mediaListRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media?fields=id,shortcode,like_count,comments_count,media_type&access_token=${access_token}`,
  );
  const mediaListData = await mediaListRes.json();
  console.log("[Instagram] Media list:", mediaListData);

  const matchedMedia = mediaListData?.data?.find(
    (m: any) => m.shortcode === shortcode,
  );

  if (!matchedMedia) {
    console.warn("[Instagram] Shortcode not found in recent media:", shortcode);
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }

  console.log("[Instagram] Matched media:", matchedMedia);

  const insightsMetric =
    matchedMedia.media_type === "VIDEO"
      ? "views,reach,saved"
      : "impressions,reach,saved";

  const insightsRes = await fetch(
    `https://graph.facebook.com/v21.0/${matchedMedia.id}/insights?metric=${insightsMetric}&access_token=${access_token}`,
  );
  const insightsData = await insightsRes.json();
  console.log("[Instagram] Insights:", insightsData);

  const views =
    insightsData?.data?.find((m: any) => m.name === "views")?.values?.[0]
      ?.value ||
    insightsData?.data?.find((m: any) => m.name === "impressions")?.values?.[0]
      ?.value ||
    0;
  return {
    views,
    likes: matchedMedia.like_count || 0,
    comments: matchedMedia.comments_count || 0,
    shares: 0,
  };
};
const fetchYouTubeMetrics = async (
  videoId: string,
  userId: string,
  supabaseClient: any,
) => {
  const access_token = await getAccountToken(supabaseClient, userId, "youtube");

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&access_token=${access_token}`,
  );
  const data = await res.json();
  const stats = data?.items?.[0]?.statistics;
  return {
    views: parseInt(stats?.viewCount || "0"),
    likes: parseInt(stats?.likeCount || "0"),
    comments: parseInt(stats?.commentCount || "0"),
    shares: 0,
  };
};

const fetchTwitterMetrics = async (
  tweetId: string,
  userId: string,
  supabaseClient: any,
) => {
  const access_token = await getAccountToken(supabaseClient, userId, "twitter");

  const res = await fetch(
    `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  const data = await res.json();
  const m = data?.data?.public_metrics;
  return {
    views: m?.impression_count || 0,
    likes: m?.like_count || 0,
    comments: m?.reply_count || 0,
    shares: m?.retweet_count || 0,
  };
};

// ─── Main Server ──────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { postId, userId, postUrl } = await req.json();

    if (!postId || !userId || !postUrl) {
      throw new Error("postId, userId, and postUrl are required");
    }

    const platform = detectPlatform(postUrl);
    if (platform === "unknown") throw new Error("Unsupported platform URL");

    const externalId = extractPostId(postUrl, platform);
    if (!externalId) throw new Error("Could not extract post ID from URL");

    console.log(`[Sync] Platform: ${platform}, Post ID: ${externalId}`);

    let metrics;
    switch (platform) {
      case "tiktok":
        metrics = await fetchTikTokMetrics(externalId, userId, supabaseClient);
        break;
      case "instagram":
        metrics = await fetchInstagramMetrics(
          externalId,
          userId,
          supabaseClient,
        );
        break;
      case "youtube":
        metrics = await fetchYouTubeMetrics(externalId, userId, supabaseClient);
        break;
      case "twitter":
        metrics = await fetchTwitterMetrics(externalId, userId, supabaseClient);
        break;
    }

    console.log(`[Sync] Metrics fetched:`, metrics);

    await supabaseClient
      .from("content_posts")
      .update({
        likes_count: metrics.likes,
        views_count: metrics.views,
        comments_count: metrics.comments,
        shares_count: metrics.shares,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", postId);

    return new Response(JSON.stringify({ success: true, platform, metrics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Sync] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
