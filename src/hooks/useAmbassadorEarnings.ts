import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";
import { useRealTimeEarnings } from "./useRealTimeEarnings";

export interface EarningsCalculation {
  monthlyRecurring: number;
  pendingPayouts: number;
  lifetimeTotal: number;
  projectedMonthly: number;
  availableBalance: number;
}

export const useAmbassadorEarnings = () => {
  const { ambassador } = useAmbassador();

  const { data: referrals } = useQuery({
    queryKey: ["ambassador-referrals", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_referrals")
        .select("*")
        .eq("ambassador_id", ambassador!.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: collaborations } = useQuery({
    queryKey: ["ambassador-collaborations", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_collaborations")
        .select("*")
        .eq("ambassador_id", ambassador!.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: earnings } = useQuery({
    queryKey: ["ambassador-earnings", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_earnings")
        .select("*")
        .eq("ambassador_id", ambassador!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add real-time subscription
  const { isConnected: isRealTimeConnected } = useRealTimeEarnings();

  const calculateEarnings = (): EarningsCalculation => {
    // Calculate monthly recurring from referrals (20% of subscription)
    const monthlyRecurring = (referrals || [])
      .filter(r => r.status === 'active')
      .reduce((sum, r) => {
        const subscriptionAmount = r.subscription_tier === 'pro' ? 25 : r.subscription_tier === 'basic' ? 10 : 0;
        return sum + (subscriptionAmount * 0.20);
      }, 0);

    // Calculate available balance from pending earnings
    const availableBalance = (earnings || [])
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount), 0);

    // Calculate pending payouts from collaborations
    const pendingPayouts = availableBalance + (collaborations || [])
      .filter(c => c.status === 'completed' || c.status === 'pending')
      .reduce((sum, c) => sum + (typeof c.flat_fee_amount === 'string' ? parseFloat(c.flat_fee_amount) : c.flat_fee_amount), 0);

    // Calculate lifetime total
    const lifetimeTotal = (earnings || [])
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount), 0);

    const projectedMonthly = monthlyRecurring + pendingPayouts;

    return {
      monthlyRecurring,
      pendingPayouts,
      lifetimeTotal,
      projectedMonthly,
      availableBalance,
    };
  };

  return {
    referrals: referrals || [],
    collaborations: collaborations || [],
    earnings: earnings || [],
    calculation: calculateEarnings(),
    isRealTimeConnected,
  };
};
