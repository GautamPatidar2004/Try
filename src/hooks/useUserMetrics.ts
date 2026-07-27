import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, subMonths } from "date-fns";

export const useUserMetrics = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['user-metrics', startDate, endDate],
    queryFn: async () => {
      const end = endDate || new Date();
      const start = startDate || startOfDay(subDays(end, 30));

      // Total users (using count only, no data fetching)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // New signups in period
      const { count: newSignups } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Active users (logged in within period)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('last_login_at', start.toISOString())
        .lte('last_login_at', end.toISOString());

      // Users by type (only fetch user_type column)
      const { data: usersByType } = await supabase
        .from('profiles')
        .select('user_type');

      const byType = usersByType?.reduce((acc, u) => {
        const type = u.user_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Previous period for growth
      const previousStart = startOfDay(subDays(start, 30));
      const { count: previousUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', start.toISOString());

      const growth = previousUsers && previousUsers > 0
        ? (((totalUsers || 0) - previousUsers) / previousUsers) * 100
        : 0;

      // Activation rate (completed onboarding)
      const { count: completedOnboarding } = await supabase
        .from('onboarding_progress')
        .select('id', { count: 'exact', head: true })
        .eq('completion_percentage', 100)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const activationRate = newSignups && newSignups > 0
        ? ((completedOnboarding || 0) / newSignups) * 100
        : 0;

      return {
        total: totalUsers || 0,
        active: activeUsers || 0,
        newSignups: newSignups || 0,
        growth,
        byType,
        activationRate,
      };
    },
  });
};
