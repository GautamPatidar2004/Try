import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";
import { useMemo } from "react";
import { subDays, format, startOfDay, parseISO } from "date-fns";

export type SourceChannel = 'instagram' | 'tiktok' | 'email' | 'twitter' | 'youtube' | 'direct' | 'other';
export type DeviceType = 'mobile' | 'desktop' | 'tablet';
export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface ChannelStats {
  channel: SourceChannel;
  clicks: number;
  conversions: number;
  conversionRate: number;
  color: string;
}

export interface DeviceStats {
  device: DeviceType;
  count: number;
  percentage: number;
}

export interface TimelineDataPoint {
  date: string;
  clicks: number;
  conversions: number;
}

export interface EarningsDataPoint {
  date: string;
  amount: number;
  segment: string;
}

export interface InsightCard {
  id: string;
  type: 'success' | 'warning' | 'tip' | 'info';
  icon: string;
  title: string;
  description: string;
  priority: number;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  clicksByChannel: ChannelStats[];
  deviceBreakdown: DeviceStats[];
  clicksOverTime: TimelineDataPoint[];
  earningsOverTime: EarningsDataPoint[];
  insights: InsightCard[];
  totalEarnings: number;
  avgEarningsPerReferral: number;
}

// Platform brand colors
const CHANNEL_COLORS: Record<SourceChannel, string> = {
  instagram: 'hsl(326, 78%, 55%)',
  tiktok: 'hsl(0, 0%, 10%)',
  email: 'hsl(217, 91%, 60%)',
  twitter: 'hsl(203, 89%, 53%)',
  youtube: 'hsl(0, 100%, 50%)',
  direct: 'hsl(142, 76%, 36%)',
  other: 'hsl(220, 14%, 46%)',
};

export const useAmbassadorAnalytics = (dateRange: DateRange = '30d') => {
  const { ambassador } = useAmbassador();

  const dateFilter = useMemo(() => {
    if (dateRange === 'all') return null;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return subDays(new Date(), days).toISOString();
  }, [dateRange]);

  // Fetch clicks data
  const { data: clicksData, isLoading: clicksLoading } = useQuery({
    queryKey: ["ambassador-analytics-clicks", ambassador?.id, dateRange],
    enabled: !!ambassador,
    queryFn: async () => {
      let query = supabase
        .from("ambassador_referral_clicks")
        .select("*")
        .eq("ambassador_id", ambassador!.id);

      if (dateFilter) {
        query = query.gte("clicked_at", dateFilter);
      }

      const { data, error } = await query.order("clicked_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch referrals/conversions data
  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ["ambassador-analytics-referrals", ambassador?.id, dateRange],
    enabled: !!ambassador,
    queryFn: async () => {
      let query = supabase
        .from("ambassador_referrals")
        .select("*")
        .eq("ambassador_id", ambassador!.id);

      if (dateFilter) {
        query = query.gte("signup_date", dateFilter);
      }

      const { data, error } = await query.order("signup_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch earnings data
  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ["ambassador-analytics-earnings", ambassador?.id, dateRange],
    enabled: !!ambassador,
    queryFn: async () => {
      let query = supabase
        .from("ambassador_earnings")
        .select("*")
        .eq("ambassador_id", ambassador!.id);

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Calculate analytics summary
  const analytics: AnalyticsSummary = useMemo(() => {
    const clicks = clicksData || [];
    const referrals = referralsData || [];
    const earnings = earningsData || [];

    // Total stats
    const totalClicks = clicks.length;
    const totalConversions = referrals.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Clicks by channel
    const channelCounts: Record<string, { clicks: number; conversions: number }> = {};
    clicks.forEach(click => {
      const channel = (click.source_channel || 'direct') as SourceChannel;
      if (!channelCounts[channel]) {
        channelCounts[channel] = { clicks: 0, conversions: 0 };
      }
      channelCounts[channel].clicks++;
      if (click.converted) {
        channelCounts[channel].conversions++;
      }
    });

    // Also count conversions from referrals source_channel
    referrals.forEach(ref => {
      const channel = (ref.source_channel || 'direct') as SourceChannel;
      if (!channelCounts[channel]) {
        channelCounts[channel] = { clicks: 0, conversions: 0 };
      }
    });

    const clicksByChannel: ChannelStats[] = Object.entries(channelCounts)
      .map(([channel, stats]) => ({
        channel: channel as SourceChannel,
        clicks: stats.clicks,
        conversions: stats.conversions,
        conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0,
        color: CHANNEL_COLORS[channel as SourceChannel] || CHANNEL_COLORS.other,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    clicks.forEach(click => {
      const device = (click.device_type || 'mobile') as DeviceType;
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const deviceBreakdown: DeviceStats[] = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device: device as DeviceType,
        count,
        percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Clicks over time
    const clicksByDate: Record<string, { clicks: number; conversions: number }> = {};
    clicks.forEach(click => {
      const date = format(startOfDay(parseISO(click.clicked_at || click.created_at!)), 'yyyy-MM-dd');
      if (!clicksByDate[date]) {
        clicksByDate[date] = { clicks: 0, conversions: 0 };
      }
      clicksByDate[date].clicks++;
      if (click.converted) {
        clicksByDate[date].conversions++;
      }
    });

    const clicksOverTime: TimelineDataPoint[] = Object.entries(clicksByDate)
      .map(([date, stats]) => ({
        date,
        clicks: stats.clicks,
        conversions: stats.conversions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Earnings over time
    const earningsByDate: Record<string, number> = {};
    let totalEarnings = 0;
    earnings.forEach(earning => {
      const date = format(startOfDay(parseISO(earning.created_at!)), 'yyyy-MM-dd');
      const amount = Number(earning.amount) || 0;
      earningsByDate[date] = (earningsByDate[date] || 0) + amount;
      totalEarnings += amount;
    });

    const earningsOverTime: EarningsDataPoint[] = Object.entries(earningsByDate)
      .map(([date, amount]) => ({
        date,
        amount,
        segment: 'total',
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const avgEarningsPerReferral = totalConversions > 0 ? totalEarnings / totalConversions : 0;

    // Generate insights
    const insights = generateInsights(clicksByChannel, deviceBreakdown, totalClicks, totalConversions, clicksOverTime);

    return {
      totalClicks,
      totalConversions,
      conversionRate,
      clicksByChannel,
      deviceBreakdown,
      clicksOverTime,
      earningsOverTime,
      insights,
      totalEarnings,
      avgEarningsPerReferral,
    };
  }, [clicksData, referralsData, earningsData]);

  return {
    analytics,
    isLoading: clicksLoading || referralsLoading || earningsLoading,
  };
};

function generateInsights(
  channelStats: ChannelStats[],
  deviceStats: DeviceStats[],
  totalClicks: number,
  totalConversions: number,
  clicksOverTime: TimelineDataPoint[]
): InsightCard[] {
  const insights: InsightCard[] = [];

  // Best performing channel
  if (channelStats.length > 0 && totalConversions > 0) {
    const bestChannel = channelStats.reduce((best, current) => 
      current.conversions > best.conversions ? current : best
    );
    
    if (bestChannel.conversions > 0) {
      const percentage = Math.round((bestChannel.conversions / totalConversions) * 100);
      if (percentage >= 40) {
        insights.push({
          id: 'best-channel',
          type: 'success',
          icon: '🎯',
          title: `${bestChannel.channel.charAt(0).toUpperCase() + bestChannel.channel.slice(1)} is your superpower!`,
          description: `${percentage}% of your conversions come from ${bestChannel.channel}. Keep posting there!`,
          priority: 1,
        });
      }
    }
  }

  // Low activity warning
  if (clicksOverTime.length > 0) {
    const lastWeekClicks = clicksOverTime.slice(-7);
    const recentClicks = lastWeekClicks.reduce((sum, day) => sum + day.clicks, 0);
    
    if (recentClicks === 0) {
      insights.push({
        id: 'no-activity',
        type: 'warning',
        icon: '⚠️',
        title: 'No clicks in the last week',
        description: 'Share your referral link to start generating conversions!',
        priority: 2,
      });
    } else if (recentClicks < 5) {
      insights.push({
        id: 'low-activity',
        type: 'warning',
        icon: '📉',
        title: 'Activity is slowing down',
        description: `Only ${recentClicks} clicks in the last 7 days. Try posting more frequently.`,
        priority: 2,
      });
    }
  }

  // Device insight
  if (deviceStats.length > 0) {
    const mobileStats = deviceStats.find(d => d.device === 'mobile');
    const desktopStats = deviceStats.find(d => d.device === 'desktop');
    
    if (mobileStats && mobileStats.percentage >= 70) {
      insights.push({
        id: 'mobile-heavy',
        type: 'tip',
        icon: '📱',
        title: 'Your audience is mobile-first',
        description: `${Math.round(mobileStats.percentage)}% of clicks are from mobile. Focus on Stories and Reels!`,
        priority: 3,
      });
    } else if (desktopStats && desktopStats.percentage >= 50) {
      insights.push({
        id: 'desktop-heavy',
        type: 'tip',
        icon: '💻',
        title: 'Desktop audience detected',
        description: 'Consider email campaigns and YouTube descriptions for better reach.',
        priority: 3,
      });
    }
  }

  // Conversion rate insight
  if (totalClicks >= 10) {
    const conversionRate = (totalConversions / totalClicks) * 100;
    if (conversionRate >= 10) {
      insights.push({
        id: 'high-conversion',
        type: 'success',
        icon: '🚀',
        title: 'Excellent conversion rate!',
        description: `${conversionRate.toFixed(1)}% of your clicks convert. You're doing great!`,
        priority: 1,
      });
    } else if (conversionRate < 2) {
      insights.push({
        id: 'low-conversion',
        type: 'info',
        icon: '💡',
        title: 'Room for improvement',
        description: 'Try adding context when sharing your link to improve conversions.',
        priority: 4,
      });
    }
  }

  // New user encouragement
  if (totalClicks === 0) {
    insights.push({
      id: 'get-started',
      type: 'info',
      icon: '🌟',
      title: 'Ready to start earning?',
      description: 'Share your referral link on social media to get your first clicks!',
      priority: 1,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}
