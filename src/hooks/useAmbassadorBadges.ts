import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassadorEarnings } from "./useAmbassadorEarnings";
import { useAmbassadorStreaks } from "./useAmbassadorStreaks";

export interface AmbassadorBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  criteria: {
    type: string;
    target: number;
    referral_type?: string;
    streak_type?: string;
  };
  points_reward: number;
  earned: boolean;
  progress: number;
  progressPercentage: number;
}

export const useAmbassadorBadges = (userId?: string) => {
  const { referrals, calculation } = useAmbassadorEarnings();
  const { streaks } = useAmbassadorStreaks();

  const { data: badgeDefinitions, isLoading: loadingDefinitions } = useQuery({
    queryKey: ["ambassador-badge-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge_definitions")
        .select("*")
        .eq("category", "ambassador")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  const { data: earnedBadges, isLoading: loadingEarned } = useQuery({
    queryKey: ["user-ambassador-badges", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId!);

      if (error) throw error;
      return data.map(b => b.badge_id);
    },
  });

  const calculateProgress = (criteria: AmbassadorBadge["criteria"]): { progress: number; target: number } => {
    let progress = 0;
    const target = criteria.target;

    switch (criteria.type) {
      case "referral_count":
        if (criteria.referral_type === "creator") {
          progress = referrals.filter(r => r.subscription_tier !== null).length;
        } else if (criteria.referral_type === "property_owner") {
          // This would need additional data for property owner referrals
          progress = referrals.filter(r => r.status === "active").length;
        } else {
          progress = referrals.length;
        }
        break;
      
      case "premium_signups":
        progress = referrals.filter(r => 
          r.subscription_tier === "pro" || r.subscription_tier === "premium"
        ).length;
        break;
      
      case "streak":
        const streak = streaks.find(s => s.streak_type === criteria.streak_type);
        progress = streak?.current_streak || 0;
        break;
      
      case "earnings":
        progress = calculation.lifetimeTotal;
        break;
      
      default:
        progress = 0;
    }

    return { progress, target };
  };

  const badges: AmbassadorBadge[] = (badgeDefinitions || []).map(badge => {
    const criteria = badge.criteria as AmbassadorBadge["criteria"];
    const { progress, target } = calculateProgress(criteria);
    const progressPercentage = Math.min(Math.round((progress / target) * 100), 100);
    const earned = earnedBadges?.includes(badge.id) || false;

    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category || "ambassador",
      tier: badge.tier || "bronze",
      criteria,
      points_reward: badge.points_reward || 0,
      earned,
      progress,
      progressPercentage,
    };
  });

  const sortedBadges = badges.sort((a, b) => {
    // Earned badges first, then by progress
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return b.progressPercentage - a.progressPercentage;
  });

  return {
    badges: sortedBadges,
    earnedBadges: sortedBadges.filter(b => b.earned),
    availableBadges: sortedBadges.filter(b => !b.earned),
    isLoading: loadingDefinitions || loadingEarned,
    completionPercentage: badges.length > 0 
      ? Math.round((sortedBadges.filter(b => b.earned).length / badges.length) * 100)
      : 0,
  };
};
