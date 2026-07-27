import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const useFinancialData = () => {
  return useQuery({
    queryKey: ['financial-overview'],
    refetchInterval: 60000,
    staleTime: 30000,
    queryFn: async () => {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const { data: analytics, error } = await supabase.functions.invoke('calculate-platform-metrics', {
        body: {
          startDate: thisMonthStart.toISOString(),
          endDate: thisMonthEnd.toISOString(),
        },
      });

      if (error) throw error;

      // Pending payouts and outstanding invoices are still pulled directly so the
      // financial dashboard can surface operational items even though they are
      // not part of the canonical revenue model.
      const [{ data: pendingPayouts }, { data: outstandingInvoices }] = await Promise.all([
        supabase.from('payouts').select('amount').eq('status', 'pending'),
        supabase.from('invoices').select('amount_due, amount_paid').in('status', ['open', 'draft']),
      ]);

      const pendingPayoutsTotal = (pendingPayouts ?? []).reduce(
        (sum, p: any) => sum + (p.amount || 0),
        0,
      );
      const outstandingTotal = (outstandingInvoices ?? []).reduce(
        (sum, i: any) => sum + ((i.amount_due || 0) - (i.amount_paid || 0)),
        0,
      );

      const revenue = analytics?.revenue ?? {};
      const subs = analytics?.subscriptions ?? {};

      return {
        totalRevenue: revenue.periodRevenue ?? 0,
        lifetimeRevenue: revenue.lifetimeRevenue ?? 0,
        revenueChange: revenue.growth ?? 0,
        platformFees: revenue.platformFees ?? 0,
        lifetimePlatformFees: revenue.lifetimePlatformFees ?? 0,
        pendingPayouts: pendingPayoutsTotal / 100,
        outstandingInvoices: outstandingTotal / 100,
        transactionVolume: revenue.transactionsInPeriod ?? 0,
        revenueByType: revenue.bySource ?? {},
        lifetimeRevenueByType: revenue.lifetimeBySource ?? {},
        monthlyMrr: (revenue.monthly ?? []).map((m: any) => ({ month: m.month, mrr: m.revenue })),
        activeSubscriptions: subs.paidActive ?? 0,
        trialingSubscriptions: subs.trialing ?? 0,
        canceledSubscriptions: subs.canceled ?? 0,
        freeSubscriptions: subs.freeActive ?? 0,
        mrr: revenue.mrr ?? 0,
        arr: revenue.arr ?? 0,
        lastMonthRange: { start: lastMonthStart, end: lastMonthEnd },
      };
    },
  });
};
