import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";
import { useAmbassadorEarnings } from "./useAmbassadorEarnings";

export interface AmbassadorTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  min_referrals: number;
  min_earnings: number;
  commission_bonus: number;
  display_order: number;
  benefits: string[];
}

export interface TierProgress {
  currentTier: AmbassadorTier;
  nextTier: AmbassadorTier | null;
  progressPercentage: number;
  referralsToNext: number;
  earningsToNext: number;
  totalReferrals: number;
  totalEarnings: number;
}

export const useAmbassadorTiers = () => {
  const { ambassador } = useAmbassador();
  const { referrals, calculation } = useAmbassadorEarnings();

  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ["ambassador-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_tiers")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      return data.map(tier => ({
        ...tier,
        benefits: Array.isArray(tier.benefits) ? tier.benefits : JSON.parse(tier.benefits as string || '[]')
      })) as AmbassadorTier[];
    },
  });

  const calculateTierProgress = (): TierProgress | null => {
    if (!tiers || tiers.length === 0) return null;

    const totalReferrals = referrals.length;
    const totalEarnings = calculation.lifetimeTotal;

    // Find current tier (highest tier where user meets requirements)
    let currentTierIndex = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (totalReferrals >= tiers[i].min_referrals && totalEarnings >= tiers[i].min_earnings) {
        currentTierIndex = i;
        break;
      }
    }

    const currentTier = tiers[currentTierIndex];
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

    // Calculate progress to next tier
    let progressPercentage = 100;
    let referralsToNext = 0;
    let earningsToNext = 0;

    if (nextTier) {
      const referralProgress = Math.min(
        (totalReferrals / nextTier.min_referrals) * 100,
        100
      );
      const earningsProgress = Math.min(
        (totalEarnings / nextTier.min_earnings) * 100,
        100
      );
      
      // Progress is the average of both metrics
      progressPercentage = Math.round((referralProgress + earningsProgress) / 2);
      referralsToNext = Math.max(0, nextTier.min_referrals - totalReferrals);
      earningsToNext = Math.max(0, nextTier.min_earnings - totalEarnings);
    }

    return {
      currentTier,
      nextTier,
      progressPercentage,
      referralsToNext,
      earningsToNext,
      totalReferrals,
      totalEarnings,
    };
  };

  return {
    tiers: tiers || [],
    tierProgress: calculateTierProgress(),
    isLoading: tiersLoading,
  };
};
