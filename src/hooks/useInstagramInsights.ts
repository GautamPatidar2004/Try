import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format, eachDayOfInterval, parseISO } from "date-fns";

interface InstagramMetrics {
  total_interactions: number;
  accounts_engaged: number;
  reach: number;
  profile_views: number;
  website_clicks: number;
  follower_count: number;
  avg_engagement_per_post: number;
  engagement_rate: number;
  total_posts: number;
}

interface DailyMetric extends InstagramMetrics {
  date: string;
  impressions?: number;
}

interface InstagramInsightsData {
  latest: InstagramMetrics | null;
  daily: DailyMetric[];
  aggregated: {
    totalInteractions: number;
    totalAccountsEngaged: number;
    totalReach: number;
    totalProfileViews: number;
    totalWebsiteClicks: number;
    avgEngagementRate: number;
    followerGrowth: number;
    followerGrowthPercent: number;
  };
  comparison: {
    totalInteractions: { value: number; change: number };
    reach: { value: number; change: number };
    profileViews: { value: number; change: number };
    engagementRate: { value: number; change: number };
  };
}

// Fill missing days with interpolated or zero values
const fillMissingDays = (data: DailyMetric[], startDate: Date, endDate: Date): DailyMetric[] => {
  if (data.length === 0) return [];

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const dataByDate = new Map(data.map(d => [d.date, d]));
  
  const filledData: DailyMetric[] = [];
  let lastKnownFollowerCount = 0;
  
  // Find the first known follower count
  for (const day of data) {
    if (day.follower_count > 0) {
      lastKnownFollowerCount = day.follower_count;
      break;
    }
  }

  for (const day of allDays) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = dataByDate.get(dateStr);

    if (existing) {
      // Update last known follower count if we have a value
      if (existing.follower_count > 0) {
        lastKnownFollowerCount = existing.follower_count;
      }
      filledData.push({
        ...existing,
        // Use last known follower count if current is 0
        follower_count: existing.follower_count || lastKnownFollowerCount,
      });
    } else {
      // Fill with placeholder data using last known follower count
      filledData.push({
        date: dateStr,
        total_interactions: 0,
        accounts_engaged: 0,
        reach: 0,
        profile_views: 0,
        website_clicks: 0,
        follower_count: lastKnownFollowerCount,
        avg_engagement_per_post: 0,
        engagement_rate: 0,
        total_posts: 0,
        impressions: 0,
      });
    }
  }

  return filledData;
};

export const useInstagramInsights = (userId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['instagram-insights', userId, days],
    queryFn: async (): Promise<InstagramInsightsData> => {
      const endDate = startOfDay(new Date());
      const startDate = subDays(endDate, days);
      const previousPeriodStart = subDays(startDate, days);

      // Fetch current period data
      const { data: currentData, error: currentError } = await supabase
        .from('external_analytics')
        .select('*')
        .eq('influencer_id', userId)
        .eq('platform', 'instagram')
        .gte('metric_date', format(startDate, 'yyyy-MM-dd'))
        .lte('metric_date', format(endDate, 'yyyy-MM-dd'))
        .order('metric_date', { ascending: true });

      if (currentError) throw currentError;

      // Fetch previous period data for comparison
      const { data: previousData, error: previousError } = await supabase
        .from('external_analytics')
        .select('*')
        .eq('influencer_id', userId)
        .eq('platform', 'instagram')
        .gte('metric_date', format(previousPeriodStart, 'yyyy-MM-dd'))
        .lt('metric_date', format(startDate, 'yyyy-MM-dd'))
        .order('metric_date', { ascending: true });

      if (previousError) throw previousError;

      // Process daily metrics from raw data
      const rawDaily: DailyMetric[] = (currentData || []).map(record => {
        const metrics = typeof record.metrics === 'object' && record.metrics !== null 
          ? record.metrics as any 
          : {};
        
        return {
          date: record.metric_date,
          total_interactions: metrics.total_interactions || 0,
          accounts_engaged: metrics.accounts_engaged || 0,
          reach: metrics.reach || 0,
          impressions: metrics.impressions || metrics.reach || 0, // Fallback to reach if no impressions
          profile_views: metrics.profile_views || 0,
          website_clicks: metrics.website_clicks || 0,
          follower_count: metrics.follower_count || 0,
          avg_engagement_per_post: metrics.avg_engagement_per_post || 0,
          engagement_rate: metrics.engagement_rate || 0,
          total_posts: metrics.total_posts || 0,
        };
      });

      // Fill in missing days with interpolated data
      const daily = fillMissingDays(rawDaily, startDate, endDate);

      // Get latest metrics (last non-zero entry if possible)
      const latest = daily.length > 0 ? daily[daily.length - 1] : null;

      // Calculate aggregated metrics for current period (only count actual data)
      const aggregated = rawDaily.reduce(
        (acc, day) => ({
          totalInteractions: acc.totalInteractions + day.total_interactions,
          totalAccountsEngaged: acc.totalAccountsEngaged + day.accounts_engaged,
          totalReach: acc.totalReach + day.reach,
          totalProfileViews: acc.totalProfileViews + day.profile_views,
          totalWebsiteClicks: acc.totalWebsiteClicks + day.website_clicks,
          avgEngagementRate: acc.avgEngagementRate + day.engagement_rate,
          followerGrowth: 0,
          followerGrowthPercent: 0,
        }),
        {
          totalInteractions: 0,
          totalAccountsEngaged: 0,
          totalReach: 0,
          totalProfileViews: 0,
          totalWebsiteClicks: 0,
          avgEngagementRate: 0,
          followerGrowth: 0,
          followerGrowthPercent: 0,
        }
      );

      // Calculate average engagement rate from actual data
      const daysWithEngagement = rawDaily.filter(d => d.engagement_rate > 0).length;
      aggregated.avgEngagementRate = daysWithEngagement > 0 
        ? aggregated.avgEngagementRate / daysWithEngagement 
        : 0;

      // Calculate follower growth from filled data
      if (daily.length > 0) {
        const firstFollowerCount = daily[0].follower_count;
        const lastFollowerCount = daily[daily.length - 1].follower_count;
        aggregated.followerGrowth = lastFollowerCount - firstFollowerCount;
        aggregated.followerGrowthPercent = firstFollowerCount > 0
          ? ((lastFollowerCount - firstFollowerCount) / firstFollowerCount) * 100
          : 0;
      }

      // Calculate previous period metrics for comparison
      const previousAggregated = (previousData || []).reduce(
        (acc, record) => {
          const metrics = typeof record.metrics === 'object' && record.metrics !== null 
            ? record.metrics as any 
            : {};
          
          return {
            totalInteractions: acc.totalInteractions + (metrics.total_interactions || 0),
            reach: acc.reach + (metrics.reach || 0),
            profileViews: acc.profileViews + (metrics.profile_views || 0),
            engagementRate: acc.engagementRate + (metrics.engagement_rate || 0),
            count: acc.count + 1,
          };
        },
        { totalInteractions: 0, reach: 0, profileViews: 0, engagementRate: 0, count: 0 }
      );

      const avgPreviousEngagementRate = previousAggregated.count > 0
        ? previousAggregated.engagementRate / previousAggregated.count
        : 0;

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const comparison = {
        totalInteractions: {
          value: aggregated.totalInteractions,
          change: calculateChange(aggregated.totalInteractions, previousAggregated.totalInteractions),
        },
        reach: {
          value: aggregated.totalReach,
          change: calculateChange(aggregated.totalReach, previousAggregated.reach),
        },
        profileViews: {
          value: aggregated.totalProfileViews,
          change: calculateChange(aggregated.totalProfileViews, previousAggregated.profileViews),
        },
        engagementRate: {
          value: aggregated.avgEngagementRate,
          change: calculateChange(aggregated.avgEngagementRate, avgPreviousEngagementRate),
        },
      };

      return {
        latest,
        daily,
        aggregated,
        comparison,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
