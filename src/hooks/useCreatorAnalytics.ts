import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStat {
  platform: string;
  followerCount: number;
  postCount: number;
  avgEngagement: number;
  growth: number;
  isVerified: boolean;
}

export interface ContentMetric {
  id: string;
  date: string;
  likes: number;
  views: number;
  comments: number;
  engagement: number;
}

export interface PostMetric {
  id: string;
  mediaUrl: string;
  caption: string;
  platform: string;
  likes: number;
  views: number;
  engagement: number;
  createdAt: string;
  propertyTitle?: string;
  mediaType: "image" | "video";
}

export interface CollaborationMetric {
  totalCollaborations: number;
  avgEngagement: number;
  successRate: number;
}

export interface AnalyticsData {
  overview: {
    totalReach: number;
    avgEngagementRate: number;
    totalPosts: number;
    collaborationSuccessRate: number;
    reachGrowth: number;
    engagementGrowth: number;
    postsGrowth: number;
    successRateGrowth: number;
  };
  platformStats: PlatformStat[];
  contentPerformance: ContentMetric[];
  topPosts: PostMetric[];
  collaborationImpact: CollaborationMetric;
  loading: boolean;
}

export const useCreatorAnalytics = (userId: string, dateRange: number = 30) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalReach: 0,
      avgEngagementRate: 0,
      totalPosts: 0,
      collaborationSuccessRate: 0,
      reachGrowth: 0,
      engagementGrowth: 0,
      postsGrowth: 0,
      successRateGrowth: 0,
    },
    platformStats: [],
    contentPerformance: [],
    topPosts: [],
    collaborationImpact: {
      totalCollaborations: 0,
      avgEngagement: 0,
      successRate: 0,
    },
    loading: true,
  });
  const getEngagementRate = (post: any, account: any): number => {
    const likes = post.likes_count || 0;
    const comments = post.comments_count || 0;
    const shares = post.shares_count || 0;
    const saves = post.saved_count || 0;
    const views = post.views_count || 0;
    const followers = account?.follower_count || 0;

    const platform = post.social_platform?.toLowerCase();

    if (platform === "instagram") {
      // Instagram:
      const engagements = likes + comments + saves;
      const denominator = views > 0 ? views : followers > 0 ? followers : 1;
      return Math.min((engagements / denominator) * 100, 20);
    } else if (platform === "tiktok") {
      // TikTok:
      const engagements = likes + comments + shares;
      const denominator = views > 0 ? views : followers > 0 ? followers : 1;
      return Math.min((engagements / denominator) * 100, 20);
    } else {
      // YouTube/Twitter fallback
      const engagements = likes + comments + shares;
      const denominator = views > 0 ? views : followers > 0 ? followers : 1;
      return Math.min((engagements / denominator) * 100, 20);
    }
  };
  const fetchAnalytics = async () => {
    try {
      setAnalytics((prev) => ({ ...prev, loading: true }));

      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - dateRange);
      const prevDateThreshold = new Date();
      prevDateThreshold.setDate(prevDateThreshold.getDate() - dateRange * 2);

      // Parallelize all queries for better performance
      const [
        { data: socialAccounts },
        { data: contentPosts },
        { data: applications },
        { data: collaborations },
        { data: prevContentPosts },
        { data: prevAnalyticsData },
        { data: prevApplications },
      ] = await Promise.all([
        supabase
          .from("social_accounts")
          .select("*")
          .eq("influencer_id", userId),

        supabase
          .from("content_posts")
          .select("*, properties(title)")
          .eq("influencer_id", userId)
          .gte("created_at", dateThreshold.toISOString())
          .order("created_at", { ascending: false }),

        supabase
          .from("applications")
          .select("status")
          .eq("influencer_id", userId),

        supabase
          .from("collaboration_agreements")
          .select("*")
          .eq("influencer_id", userId),

        supabase
          .from("content_posts")
          .select(
            "likes_count, views_count, comments_count, shares_count, social_platform",
          )
          .eq("influencer_id", userId)
          .gte("created_at", prevDateThreshold.toISOString())
          .lt("created_at", dateThreshold.toISOString()),

        supabase
          .from("external_analytics")
          .select("metrics, metric_date")
          .eq("influencer_id", userId)
          .lt("metric_date", dateThreshold.toISOString().split("T")[0])
          .order("metric_date", { ascending: false })
          .limit(1),

        supabase
          .from("applications")
          .select("status, created_at")
          .eq("influencer_id", userId)
          .gte("created_at", prevDateThreshold.toISOString())
          .lt("created_at", dateThreshold.toISOString()),
      ]);

      const prevAnalytics = prevAnalyticsData?.[0] || null;

      // Calculate overview stats
      const totalReach =
        socialAccounts?.reduce(
          (sum, acc) => sum + (acc.follower_count || 0),
          0,
        ) || 0;

      const platformEngagements =
        socialAccounts
          ?.map((account) => {
            const platformPosts =
              contentPosts?.filter(
                (p) =>
                  p.social_platform?.toLowerCase() ===
                  account.platform.toLowerCase(),
              ) || [];
            if (platformPosts.length === 0) return null;
            return (
              platformPosts.reduce((sum, post) => {
                return sum + getEngagementRate(post, account);
              }, 0) / platformPosts.length
            );
          })
          .filter((v): v is number => v !== null) ?? [];

      const avgEngagementRate = platformEngagements.length
        ? platformEngagements.reduce((sum, eng) => sum + eng, 0) /
          platformEngagements.length
        : 0;

      const collaborationSuccessRate = applications?.length
        ? (applications.filter((app) => app.status === "approved").length /
            applications.length) *
          100
        : 0;

      // ─── Growth calculations ───
      const currentPosts = contentPosts?.length || 0;
      const previousPosts = prevContentPosts?.length || 0;
      const postsGrowth =
        previousPosts > 0
          ? ((currentPosts - previousPosts) / previousPosts) * 100
          : 0;

      const prevFollowerCount =
        (prevAnalytics?.metrics as { follower_count?: number })
          ?.follower_count || 0;
      const reachGrowth =
        prevFollowerCount > 0
          ? ((totalReach - prevFollowerCount) / prevFollowerCount) * 100
          : 0;

      const prevSuccessRate = prevApplications?.length
        ? (prevApplications.filter((app) => app.status === "approved").length /
            prevApplications.length) *
          100
        : 0;

      const successRateGrowth =
        prevSuccessRate > 0
          ? ((collaborationSuccessRate - prevSuccessRate) / prevSuccessRate) *
            100
          : 0;
      const prevEngagementRate = prevContentPosts?.length
        ? prevContentPosts.reduce((sum, post) => {
            const eng =
              (post.likes_count || 0) +
              (post.comments_count || 0) +
              (post.shares_count || 0);

            return sum + eng;
          }, 0) / prevContentPosts.length
        : 0;

      const engagementGrowth =
        prevEngagementRate > 0
          ? ((avgEngagementRate - prevEngagementRate) / prevEngagementRate) *
            100
          : 0;

      // Calculate platform stats
      const platformStats: PlatformStat[] =
        socialAccounts?.map((account) => {
          const platformPosts =
            contentPosts?.filter(
              (post) =>
                post.social_platform?.toLowerCase() ===
                account.platform.toLowerCase(), // ✅ fix
            ) || [];

          const avgEngagement = platformPosts.length
            ? platformPosts.reduce((sum, post) => {
                return sum + getEngagementRate(post, account);
              }, 0) / platformPosts.length
            : 0;
          const prevPlatformPosts =
            prevContentPosts?.filter(
              (p) =>
                p.social_platform?.toLowerCase() ===
                account.platform.toLowerCase(),
            ) || [];

          const prevAvgEng = prevPlatformPosts.length
            ? prevPlatformPosts.reduce((sum, p) => {
                return sum + getEngagementRate(p, account);
              }, 0) / prevPlatformPosts.length
            : 0;

          return {
            platform: account.platform,
            followerCount: account.follower_count || 0,
            postCount: platformPosts.length,
            avgEngagement,
            growth:
              prevAvgEng > 0
                ? ((avgEngagement - prevAvgEng) / prevAvgEng) * 100
                : 0,
            isVerified: account.is_verified || false,
          };
        }) || [];

      // Content performance timeline
      const contentPerformance: ContentMetric[] =
        contentPosts?.map((post) => ({
          id: post.id,
          date: new Date(post.created_at).toISOString().split("T")[0],
          likes: post.likes_count || 0,
          views: post.views_count || 0,
          comments: post.comments_count || 0,
          engagement: getEngagementRate(
            post,
            socialAccounts?.find((a) => a.platform === post.social_platform),
          ),
        })) || [];

      // Top performing posts
      const topPosts: PostMetric[] =
        contentPosts
          ?.sort((a, b) => {
            const engA =
              (a.likes_count || 0) +
              (a.comments_count || 0) +
              (a.shares_count || 0);
            const engB =
              (b.likes_count || 0) +
              (b.comments_count || 0) +
              (b.shares_count || 0);
            return engB - engA;
          })
          .slice(0, 6)
          .map((post) => ({
            id: post.id,
            mediaUrl: post.media_url,
            caption: post.caption || "",
            platform: post.social_platform || "unknown",
            likes: post.likes_count || 0,
            views: post.views_count || 0,
            engagement: getEngagementRate(
              post,
              socialAccounts?.find((a) => a.platform === post.social_platform),
            ),
            createdAt: post.created_at,
            propertyTitle: post.properties?.title,
            mediaType: post.media_url?.match(/\.(mp4|mov|avi|webm)$/i)
              ? "video"
              : "image",
          })) || [];

      // Collaboration impact
      const collaborationImpact: CollaborationMetric = {
        totalCollaborations: collaborations?.length || 0,
        avgEngagement: contentPosts?.filter((p) => p.collaboration_id).length
          ? contentPosts
              .filter((p) => p.collaboration_id)
              .reduce((sum, post) => {
                return (
                  sum +
                  ((post.likes_count || 0) /
                    Math.max(post.views_count || 1, 1)) *
                    100
                );
              }, 0) / contentPosts.filter((p) => p.collaboration_id).length
          : 0,
        successRate: collaborationSuccessRate,
      };
      console.log(
        totalReach,
        avgEngagementRate,
        contentPosts?.length,
        collaborationSuccessRate,
        reachGrowth,
        engagementGrowth,
        postsGrowth,
        successRateGrowth,
      );
      setAnalytics({
        overview: {
          totalReach,
          avgEngagementRate,
          totalPosts: contentPosts?.length || 0,
          collaborationSuccessRate,
          reachGrowth,
          engagementGrowth,
          postsGrowth,
          successRateGrowth,
        },
        platformStats,
        contentPerformance,
        topPosts,
        collaborationImpact,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId, dateRange]);

  return { ...analytics, refetch: fetchAnalytics };
};
