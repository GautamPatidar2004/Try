import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAmbassador } from "./useAmbassador";
import { useState, useMemo } from "react";

export type ReferralType = 'creator' | 'property_owner' | 'brand' | 'restaurant';
export type ConversionStage = 'clicked' | 'signup' | 'listing' | 'active' | 'subscription';

export interface ReferralFilters {
  referralType?: ReferralType;
  dateRange?: { from: Date; to: Date };
  conversionStage?: ConversionStage | 'all';
  search?: string;
}

export interface ReferralWithDetails {
  id: string;
  ambassador_id: string;
  referred_user_id: string;
  referral_type: ReferralType;
  conversion_stage: ConversionStage;
  signup_date: string;
  subscription_tier: string | null;
  commission_rate: number;
  total_earned: number;
  lifetime_value: number;
  click_count: number;
  first_click_at: string | null;
  status: string;
  // Joined profile data
  profile?: {
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  } | null;
}

export interface SegmentStats {
  total: number;
  clicked: number;
  signups: number;
  listings: number;
  active: number;
  subscribed: number;
  totalEarnings: number;
  conversionRate: number;
}

// Commission rates by segment and tier
export const COMMISSION_RATES = {
  creator: {
    base: 0.20, // 20% recurring
    description: '20% recurring commission',
    type: 'recurring'
  },
  property_owner: {
    base: 500, // $500 flat fee
    description: '$500 per successful listing',
    type: 'flat'
  },
  brand: {
    base: 0.15, // 15% of campaign fees
    description: '15% on brand campaign fees',
    type: 'percentage'
  },
  restaurant: {
    base: 100, // $100 flat fee
    description: '$100 per verified restaurant',
    type: 'flat'
  }
} as const;

export const useAmbassadorReferrals = (initialFilters?: ReferralFilters) => {
  const { ambassador } = useAmbassador();
  const [filters, setFilters] = useState<ReferralFilters>(initialFilters || {});

  const { data: referrals, isLoading, refetch } = useQuery({
    queryKey: ["ambassador-referrals-segmented", ambassador?.id, filters],
    enabled: !!ambassador,
    queryFn: async () => {
      let query = supabase
        .from("ambassador_referrals")
        .select(`
          *,
          profile:referred_user_id (
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq("ambassador_id", ambassador!.id);

      // Apply filters
      if (filters.referralType) {
        query = query.eq("referral_type", filters.referralType);
      }

      if (filters.conversionStage && filters.conversionStage !== 'all') {
        query = query.eq("conversion_stage", filters.conversionStage);
      }

      if (filters.dateRange?.from) {
        query = query.gte("signup_date", filters.dateRange.from.toISOString());
      }

      if (filters.dateRange?.to) {
        query = query.lte("signup_date", filters.dateRange.to.toISOString());
      }

      const { data, error } = await query.order("signup_date", { ascending: false });

      if (error) throw error;
      return data as ReferralWithDetails[];
    },
  });

  const { data: clickStats } = useQuery({
    queryKey: ["ambassador-click-stats", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_referral_clicks")
        .select("referral_type, converted")
        .eq("ambassador_id", ambassador!.id);

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats by segment
  const statsBySegment = useMemo(() => {
    const segments: Record<ReferralType, SegmentStats> = {
      creator: { total: 0, clicked: 0, signups: 0, listings: 0, active: 0, subscribed: 0, totalEarnings: 0, conversionRate: 0 },
      property_owner: { total: 0, clicked: 0, signups: 0, listings: 0, active: 0, subscribed: 0, totalEarnings: 0, conversionRate: 0 },
      brand: { total: 0, clicked: 0, signups: 0, listings: 0, active: 0, subscribed: 0, totalEarnings: 0, conversionRate: 0 },
      restaurant: { total: 0, clicked: 0, signups: 0, listings: 0, active: 0, subscribed: 0, totalEarnings: 0, conversionRate: 0 },
    };

    // Count clicks by segment
    clickStats?.forEach(click => {
      const type = click.referral_type as ReferralType;
      if (segments[type]) {
        segments[type].clicked++;
      }
    });

    // Count referrals by stage
    referrals?.forEach(ref => {
      const type = (ref.referral_type || 'creator') as ReferralType;
      if (!segments[type]) return;

      segments[type].total++;
      
      switch (ref.conversion_stage) {
        case 'signup':
          segments[type].signups++;
          break;
        case 'listing':
          segments[type].listings++;
          break;
        case 'active':
          segments[type].active++;
          break;
        case 'subscription':
          segments[type].subscribed++;
          break;
      }

      segments[type].totalEarnings += Number(ref.total_earned) || 0;
    });

    // Calculate conversion rates
    Object.keys(segments).forEach(key => {
      const seg = segments[key as ReferralType];
      if (seg.clicked > 0) {
        seg.conversionRate = (seg.total / seg.clicked) * 100;
      }
    });

    return segments;
  }, [referrals, clickStats]);

  // Filter referrals by search
  const filteredReferrals = useMemo(() => {
    if (!referrals) return [];
    if (!filters.search) return referrals;

    const search = filters.search.toLowerCase();
    return referrals.filter(ref => {
      const name = `${ref.profile?.first_name || ''} ${ref.profile?.last_name || ''}`.toLowerCase();
      return name.includes(search);
    });
  }, [referrals, filters.search]);

  return {
    referrals: filteredReferrals,
    allReferrals: referrals || [],
    isLoading,
    filters,
    setFilters,
    statsBySegment,
    refetch,
  };
};
