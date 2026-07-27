import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExternalAnalytics = (userId: string, platform?: string, days: number = 30) => {
  return useQuery({
    queryKey: ['external-analytics', userId, platform, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('external_analytics')
        .select('*')
        .eq('influencer_id', userId)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Aggregate metrics by platform
      const byPlatform: Record<string, any> = {};
      
      data?.forEach(record => {
        if (!byPlatform[record.platform]) {
          byPlatform[record.platform] = {
            platform: record.platform,
            metrics: [],
            latest: null,
          };
        }
        
        const metricsData = typeof record.metrics === 'object' && record.metrics !== null 
          ? record.metrics 
          : {};
        
        byPlatform[record.platform].metrics.push({
          date: record.metric_date,
          ...(metricsData as Record<string, any>),
        });

        if (!byPlatform[record.platform].latest || 
            record.metric_date > byPlatform[record.platform].latest.date) {
          byPlatform[record.platform].latest = {
            date: record.metric_date,
            ...(metricsData as Record<string, any>),
          };
        }
      });

      return {
        rawData: data,
        byPlatform: Object.values(byPlatform),
      };
    },
    enabled: !!userId,
  });
};
