import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, startOfDay, subDays } from "date-fns";

export const useRevenueMetrics = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['revenue-metrics', startDate, endDate],
    queryFn: async () => {
      const end = endDate || new Date();
      const start = startDate || startOfDay(subDays(end, 30));

      // Fetch subscriptions with their plan prices
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans:plan_id (
            price_monthly,
            price_yearly
          )
        `)
        .eq('status', 'active');

      // Calculate MRR from plan prices
      const mrr = subscriptions?.reduce((sum, sub) => {
        const plan = (sub as any).subscription_plans;
        if (!plan) return sum;
        
        // Convert yearly to monthly if needed, prices are in cents
        const amount = sub.billing_interval === 'yearly' 
          ? (plan.price_yearly || 0) / 12
          : (plan.price_monthly || 0);
        return sum + amount;
      }, 0) || 0;
      
      // Calculate ARR (Annual Recurring Revenue)
      const arr = mrr * 12;

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, created_at, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('status', 'completed');

      // Revenue by source
      const revenueBySource = transactions?.reduce((acc, t) => {
        const source = t.type || 'other';
        acc[source] = (acc[source] || 0) + (t.amount || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      // Total revenue for period
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Previous period for growth calculation
      const previousStart = startOfDay(subDays(start, 30));
      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', previousStart.toISOString())
        .lt('created_at', start.toISOString())
        .eq('status', 'completed');

      const previousRevenue = previousTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const growth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      // Calculate ARPU (Average Revenue Per User)
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const arpu = userCount && userCount > 0 ? totalRevenue / userCount : 0;

      return {
        mrr: mrr / 100,
        arr: arr / 100,
        totalRevenue: totalRevenue / 100,
        growth,
        revenueBySource: Object.entries(revenueBySource).reduce((acc, [key, value]) => {
          acc[key] = value / 100;
          return acc;
        }, {} as Record<string, number>),
        arpu: arpu / 100,
      };
    },
  });
};
