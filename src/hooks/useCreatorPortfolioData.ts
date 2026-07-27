import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  InstagramMetrics,
  TikTokMetrics,
  AudienceData,
  ContentItem,
} from "@/data/mockPortfolioData";

interface AudienceDemographics {
  gender: { male: number; female: number; other: number };
  age: Record<string, number>;
  topCities: Array<{ name: string; percentage: number }>;
  topCountries: Array<{ name: string; percentage: number }>;
}

interface AnalyticsMetrics {
  engagement_rate?: number;
  impressions?: number;
  reach?: number;
  total_interactions?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_reels_views?: number;
  avg_engagement_per_post?: number;
  story_views?: number;
  posts_count?: number;
  total_posts?: number;
  recent_posts_count?: number;
  audience_demographics?: AudienceDemographics;
  recent_media?: Array<{
    id?: string;
    // Support both naming conventions
    media_type?: string;
    type?: string;
    thumbnail_url?: string;
    media_url?: string;
    url?: string;
    caption?: string;
    timestamp?: string;
    reach?: number;
    impressions?: number;
    like_count?: number;
    comments_count?: number;
    likes?: number;
    comments?: number;
    saved?: number;
    shares?: number;
    permalink?: string;
  }>;
}

interface CreatorPortfolioData {
  instagramMetrics: InstagramMetrics | null;
  tiktokMetrics: TikTokMetrics | null;
  audienceData: AudienceData | null;
  contentGallery: ContentItem[];
  hasRealData: boolean;
  hasInstagramData: boolean;
  hasTikTokData: boolean;
  loading: boolean;
}

export const useCreatorPortfolioData = (
  creatorId: string,
): CreatorPortfolioData => {
  // Fetch social accounts for this creator
  const { data: socialAccounts, isLoading: loadingSocial } = useQuery({
    queryKey: ["creator-social-accounts", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("influencer_id", creatorId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!creatorId,
  });

  // Fetch latest external analytics per platform
  const { data: analyticsByPlatform, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["creator-analytics-by-platform", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_analytics")
        .select("*")
        .eq("influencer_id", creatorId)
        .order("metric_date", { ascending: false });

      if (error) throw error;
      const list = data || [];
      const findBestRecord = (platform: string) => {
        const platformRecords = list.filter((r) => r.platform === platform);
        return (
          platformRecords.find((r) => {
            const m =
              typeof r.metrics === "string" ? JSON.parse(r.metrics) : r.metrics;
            return (
              m?.recent_media?.length > 0 ||
              m?.total_posts > 0 ||
              m?.engagement_rate > 0
            );
          }) ||
          platformRecords[0] ||
          null
        );
      };
      return {
        instagram: findBestRecord("instagram"),
        tiktok: findBestRecord("tiktok"),
      };
    },
    enabled: !!creatorId,
  });

  const loading = loadingSocial || loadingAnalytics;

  // Find connected accounts
  const instagramAccount = socialAccounts?.find(
    (acc) => acc.platform === "instagram",
  );
  const tiktokAccount = socialAccounts?.find(
    (acc) => acc.platform === "tiktok",
  );

  const igAnalytics = analyticsByPlatform?.instagram || null;
  const tkAnalytics = analyticsByPlatform?.tiktok || null;

  const hasInstagramData = !!(instagramAccount || igAnalytics);
  const hasTikTokData = !!(tiktokAccount || tkAnalytics);
  const hasRealData = hasInstagramData || hasTikTokData;

  // Parse Instagram metrics blob
  // const metrics = igAnalytics?.metrics as AnalyticsMetrics | null;
  const metrics = igAnalytics?.metrics
    ? ((typeof igAnalytics.metrics === "string"
        ? JSON.parse(igAnalytics.metrics)
        : igAnalytics.metrics) as AnalyticsMetrics)
    : null;
  // console.log(tkAnalytics)
  // const tkMetricsBlob = (tkAnalytics?.metrics as Record<string, any> | null) || null;
  const tkMetricsBlob = tkAnalytics?.metrics
    ? ((typeof tkAnalytics.metrics === "string"
        ? JSON.parse(tkAnalytics.metrics)
        : tkAnalytics.metrics) as Record<string, any>)
    : null;
  // Client-side calculations from recent_media (will be defined below but used here via closure)
  const recentMediaForCalc = metrics?.recent_media || [];
  const calcAvgComments =
    recentMediaForCalc.length > 0
      ? Math.round(
          recentMediaForCalc.reduce(
            (sum: number, m: any) =>
              sum + (m.comments || m.comments_count || 0),
            0,
          ) / recentMediaForCalc.length,
        )
      : 0;
  const calcTotalEngagements = recentMediaForCalc.reduce(
    (sum: number, m: any) =>
      sum +
      (m.likes || m.like_count || 0) +
      (m.comments || m.comments_count || 0),
    0,
  );

  // Build Instagram metrics from real data only (no mock fallback)
  const instagramMetrics: InstagramMetrics | null = hasInstagramData
    ? {
        followers: instagramAccount?.follower_count || 0,
        engagementRate: metrics?.engagement_rate || 0,
        impressions: metrics?.impressions || 0,
        reach: metrics?.reach || 0,
        totalEngagements: metrics?.total_interactions || calcTotalEngagements,
        avgLikes: metrics?.avg_likes || metrics?.avg_engagement_per_post || 0,
        avgComments: metrics?.avg_comments || calcAvgComments,
        avgReelsViews: metrics?.avg_reels_views || 0,
        avgStoryViews: metrics?.story_views || 0,
        watchTimeHours: 0,
        postCount: {
          lifetime: metrics?.total_posts || metrics?.posts_count || 0,
          last30Days: metrics?.recent_posts_count || 0,
        },
        lastSynced:
          igAnalytics?.updated_at ||
          instagramAccount?.last_sync_at ||
          instagramAccount?.created_at ||
          new Date().toISOString(),
        verified: instagramAccount?.is_verified || false,
      }
    : null;

  // Build TikTok metrics from real data only
  const tkRecentVideos: any[] = Array.isArray(tkMetricsBlob?.recent_videos)
    ? tkMetricsBlob!.recent_videos
    : [];
  const tiktokMetrics: TikTokMetrics | null = hasTikTokData
    ? {
        followers:
          tiktokAccount?.follower_count || tkMetricsBlob?.follower_count || 0,
        engagementRate: tkMetricsBlob?.engagement_rate || 0,
        views: tkMetricsBlob?.total_views || 0,
        impressions: 0,
        totalEngagements: tkMetricsBlob?.total_engagements || 0,
        avgViews: tkMetricsBlob?.avg_views || 0,
        avgLikes: tkMetricsBlob?.avg_likes || 0,
        avgComments: tkMetricsBlob?.avg_comments || 0,
        avgShares: tkMetricsBlob?.avg_shares || 0,
        videoCount: {
          lifetime: tkMetricsBlob?.video_count || 0,
          last30Days:
            tkMetricsBlob?.recent_video_count || tkRecentVideos.length || 0,
        },
        lastSynced:
          tkAnalytics?.updated_at ||
          tiktokAccount?.last_sync_at ||
          tiktokAccount?.created_at ||
          new Date().toISOString(),
        verified: tiktokAccount?.is_verified || false,
      }
    : null;

  // Build content gallery from recent_media in analytics
  const recentMedia = metrics?.recent_media || [];

  // Helper to get best available thumbnail - returns empty string if none available
  const getThumbnail = (media: any): string => {
    // Priority: thumbnail_url > media_url (only if valid URL, not permalink)
    if (
      media.thumbnail_url &&
      media.thumbnail_url.startsWith("http") &&
      !media.thumbnail_url.includes("instagram.com/p/")
    ) {
      return media.thumbnail_url;
    }
    if (
      media.media_url &&
      media.media_url.startsWith("http") &&
      !media.media_url.includes("instagram.com/p/")
    ) {
      return media.media_url;
    }
    // Return empty string - component will show placeholder
    return "";
  };

  // Client-side calculations for metrics that might not be stored
  const calculatedAvgComments =
    recentMedia.length > 0
      ? Math.round(
          recentMedia.reduce(
            (sum, m) => sum + (m.comments || m.comments_count || 0),
            0,
          ) / recentMedia.length,
        )
      : 0;

  const calculatedAvgLikes =
    recentMedia.length > 0
      ? Math.round(
          recentMedia.reduce(
            (sum, m) => sum + (m.likes || m.like_count || 0),
            0,
          ) / recentMedia.length,
        )
      : 0;

  const calculatedTotalEngagements = recentMedia.reduce(
    (sum, m) =>
      sum +
      (m.likes || m.like_count || 0) +
      (m.comments || m.comments_count || 0),
    0,
  );

  const igContent: ContentItem[] = recentMedia.map((media, index: number) => ({
    id: media.id || `ig-${index}`,
    platform: "instagram" as const,
    type:
      (media.media_type || media.type) === "VIDEO"
        ? ("reel" as const)
        : ("post" as const),
    thumbnail: getThumbnail(media),
    caption: media.caption || "",
    date: media.timestamp || new Date().toISOString(),
    reach: media.reach || 0,
    impressions: media.impressions || 0,
    likes: media.like_count || media.likes || 0,
    comments: media.comments_count || media.comments || 0,
    saves: media.saved || 0,
    shares: media.shares || 0,
    featured: index < 3,
    permalink: media.permalink || media.url || "",
  }));

  const tkContent: ContentItem[] = tkRecentVideos.map(
    (v: any, index: number) => ({
      id: v.id?.toString() || `tk-${index}`,
      platform: "tiktok" as const,
      type: "video" as const,
      thumbnail: v.cover_image_url || "",
      caption: v.title || v.video_description || "",
      date: v.create_time
        ? new Date(v.create_time * 1000).toISOString()
        : new Date().toISOString(),
      views: v.view_count || 0,
      likes: v.like_count || 0,
      comments: v.comment_count || 0,
      shares: v.share_count || 0,
      featured: index < 3,
      permalink: v.share_url || "",
    }),
  );

  const contentGallery: ContentItem[] = [...igContent, ...tkContent];

  // Real audience demographics only (Instagram only — TikTok API does not expose them)
  const audienceData: AudienceData | null = metrics?.audience_demographics
    ? {
        gender: metrics.audience_demographics.gender,
        age: metrics.audience_demographics.age,
        topCities: metrics.audience_demographics.topCities,
        topCountries: metrics.audience_demographics.topCountries,
      }
    : null;

  return {
    instagramMetrics,
    tiktokMetrics,
    audienceData,
    contentGallery,
    hasRealData,
    hasInstagramData,
    hasTikTokData,
    loading,
  };
};
