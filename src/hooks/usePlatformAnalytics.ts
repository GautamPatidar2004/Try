import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface PlatformAnalyticsData {
  revenue: {
    mrr: number;
    arr: number;
    periodRevenue: number;
    previousPeriodRevenue: number;
    lifetimeRevenue: number;
    platformFees: number;
    lifetimePlatformFees: number;
    growth: number;
    bySource: Record<string, number>;
    lifetimeBySource: Record<string, number>;
    monthly: Array<{ month: string; mrr: number; revenue: number }>;
    transactionsInPeriod: number;
  };
  subscriptions: {
    total: number;
    paidActive: number;
    freeActive: number;
    trialing: number;
    canceled: number;
    pastDue: number;
    incomplete: number;
    byStatus: Record<string, number>;
  };
  collaborations: {
    total: number;
    active: number;
    pending: number;
    completed: number;
    cancelled: number;
    past: number;
  };
  opportunities: {
    total: number;
    active: number;
    pending: number;
    past: number;
    stays: { total: number; active: number; inactive: number };
    brandDeals: {
      total: number;
      open: number;
      pending: number;
      closed: number;
      draft: number;
      paused: number;
    };
  };
  users: {
    total: number;
    active: number;
    newSignups: number;
    previousSignups: number;
    growth: number;
    byType: Record<string, number>;
  };
  retention: {
    day1: number;
    day7: number;
    day30: number;
    churnRate: number;
  };
  conversion: {
    signupToApplication: number;
    applicationToCollaboration: number;
    freeToPaid: number;
  };
  kpis: {
    avgTimeToCollaborationDays: number;
    applicationSuccessRate: number;
    contentDeliveryRate: number;
    avgRating: number;
    reviewsCount: number;
  };
  health: {
    applicationSuccessRate: number;
    contentDeliveryRate: number;
    averageResponseTime: number;
  };
  meta: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
    generatedAt: string;
  };
}

export const usePlatformAnalytics = (
  dateRange: DateRange = '30d',
  customStartDate?: Date,
  customEndDate?: Date
) => {
  const getDateRange = () => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (dateRange) {
      case '7d':
        start = startOfDay(subDays(end, 7));
        break;
      case '30d':
        start = startOfDay(subDays(end, 30));
        break;
      case '90d':
        start = startOfDay(subDays(end, 90));
        break;
      case '1y':
        start = startOfDay(subDays(end, 365));
        break;
      case 'custom':
        start = customStartDate || startOfDay(subDays(end, 30));
        break;
      default:
        start = startOfDay(subDays(end, 30));
    }

    return { start, end };
  };

  return useQuery({
    queryKey: ['platform-analytics', dateRange, customStartDate, customEndDate],
    queryFn: async () => {
      const { start, end } = getDateRange();

      const { data, error } = await supabase.functions.invoke('calculate-platform-metrics', {
        body: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      if (error) throw error;
      return data as PlatformAnalyticsData;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
};

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
