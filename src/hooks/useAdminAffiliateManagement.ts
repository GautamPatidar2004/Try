import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AffiliateCode {
  id: string;
  code: string;
  creator_id: string;
  host_id: string;
  property_id: string | null;
  collaboration_id: string | null;
  commission_rate: number;
  commission_type: string;
  flat_fee_amount: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      profile_photo_url: string | null;
    } | null;
  } | null;
  property: {
    id: string;
    title: string;
    location: string | null;
  } | null;
}

export interface AffiliateConversion {
  id: string;
  affiliate_code_id: string;
  creator_id: string;
  host_id: string;
  conversion_type: string;
  order_amount: number;
  commission_amount: number;
  currency: string;
  status: string;
  converted_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  external_reference: string | null;
  metadata: Record<string, unknown> | null;
  affiliate_code: {
    code: string;
    property: {
      title: string;
    } | null;
  } | null;
  creator: {
    id: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export interface AffiliatePayout {
  id: string;
  creator_id: string;
  amount: number;
  currency: string;
  status: string;
  conversion_ids: string[];
  stripe_transfer_id: string | null;
  failure_reason: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  creator: {
    id: string;
    stripe_connect_id: string | null;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export interface TopAffiliate {
  creator_id: string;
  creator_name: string;
  avatar_url: string | null;
  total_conversions: number;
  total_earnings: number;
  active_codes: number;
}

export interface AffiliateStats {
  totalCodes: number;
  activeCodes: number;
  totalConversions: number;
  pendingConversions: number;
  totalCommissionGenerated: number;
  totalCommissionPaid: number;
  pendingPayoutsAmount: number;
  pendingPayoutsCount: number;
}

export const useAdminAffiliateManagement = () => {
  const queryClient = useQueryClient();

  // Fetch all affiliate codes
  const {
    data: codes = [],
    isLoading: codesLoading,
    error: codesError,
  } = useQuery({
    queryKey: ["admin-affiliate-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_affiliate_codes")
        .select(`
          *,
          creator:influencers!creator_affiliate_codes_creator_id_fkey(
            id,
            profiles(first_name, last_name, profile_photo_url)
          ),
          property:properties!creator_affiliate_codes_property_id_fkey(
            id,
            title,
            location
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AffiliateCode[];
    },
  });

  // Fetch all conversions
  const {
    data: conversions = [],
    isLoading: conversionsLoading,
    error: conversionsError,
  } = useQuery({
    queryKey: ["admin-affiliate-conversions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_conversions")
        .select(`
          *,
          affiliate_code:creator_affiliate_codes!affiliate_conversions_affiliate_code_id_fkey(
            code,
            property:properties!creator_affiliate_codes_property_id_fkey(title)
          ),
          creator:influencers!affiliate_conversions_creator_id_fkey(
            id,
            profiles(first_name, last_name)
          )
        `)
        .order("converted_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AffiliateConversion[];
    },
  });

  // Fetch all payouts
  const {
    data: payouts = [],
    isLoading: payoutsLoading,
    error: payoutsError,
  } = useQuery({
    queryKey: ["admin-affiliate-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_payouts")
        .select(`
          *,
          creator:influencers!creator_payouts_creator_id_fkey(
            id,
            stripe_connect_id,
            profiles(first_name, last_name)
          )
        `)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AffiliatePayout[];
    },
  });

  // Calculate stats
  const stats: AffiliateStats = {
    totalCodes: codes.length,
    activeCodes: codes.filter((c) => c.is_active).length,
    totalConversions: conversions.length,
    pendingConversions: conversions.filter((c) => c.status === "pending").length,
    totalCommissionGenerated: conversions.reduce((sum, c) => sum + c.commission_amount, 0),
    totalCommissionPaid: conversions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.commission_amount, 0),
    pendingPayoutsAmount: payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayoutsCount: payouts.filter((p) => p.status === "pending").length,
  };

  // Calculate top affiliates
  const topAffiliates: TopAffiliate[] = (() => {
    const creatorMap = new Map<string, TopAffiliate>();

    conversions.forEach((conv) => {
      if (!conv.creator) return;
      const creatorId = conv.creator.id;
      const existing = creatorMap.get(creatorId);

      if (existing) {
        existing.total_conversions += 1;
        existing.total_earnings += conv.commission_amount;
      } else {
        creatorMap.set(creatorId, {
          creator_id: creatorId,
          creator_name: `${conv.creator.profiles?.first_name || ""} ${conv.creator.profiles?.last_name || ""}`.trim() || "Unknown",
          avatar_url: null,
          total_conversions: 1,
          total_earnings: conv.commission_amount,
          active_codes: 0,
        });
      }
    });

    codes.forEach((code) => {
      if (!code.is_active || !code.creator) return;
      const existing = creatorMap.get(code.creator.id);
      if (existing) {
        existing.active_codes += 1;
        if (code.creator.profiles?.profile_photo_url) {
          existing.avatar_url = code.creator.profiles.profile_photo_url;
        }
      }
    });

    return Array.from(creatorMap.values())
      .sort((a, b) => b.total_earnings - a.total_earnings)
      .slice(0, 10);
  })();

  // Toggle code status
  const toggleCodeStatus = useMutation({
    mutationFn: async ({ codeId, isActive }: { codeId: string; isActive: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("creator_affiliate_codes")
        .update({ is_active: isActive })
        .eq("id", codeId);

      if (error) throw error;

      // Log activity
      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: isActive ? "activate_affiliate_code" : "deactivate_affiliate_code",
        target_type: "affiliate_code",
        target_id: codeId,
        details: { is_active: isActive },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-codes"] });
      toast.success("Code status updated");
    },
    onError: (error) => {
      toast.error("Failed to update code status");
      console.error(error);
    },
  });

  // Update conversion status
  const updateConversionStatus = useMutation({
    mutationFn: async ({
      conversionId,
      status,
      notes,
    }: {
      conversionId: string;
      status: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = { status };
      if (status === "confirmed") {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === "paid") {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("affiliate_conversions")
        .update(updateData)
        .eq("id", conversionId);

      if (error) throw error;

      // Log activity
      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "update_affiliate_conversion",
        target_type: "affiliate_conversion",
        target_id: conversionId,
        details: { status, notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-conversions"] });
      toast.success("Conversion status updated");
    },
    onError: (error) => {
      toast.error("Failed to update conversion");
      console.error(error);
    },
  });

  // Process payout manually
  const processPayoutManually = useMutation({
    mutationFn: async ({ payoutId, stripeTransferId }: { payoutId: string; stripeTransferId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("creator_payouts")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          stripe_transfer_id: stripeTransferId || null,
        })
        .eq("id", payoutId);

      if (error) throw error;

      // Log activity
      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "process_affiliate_payout",
        target_type: "affiliate_payout",
        target_id: payoutId,
        details: { stripe_transfer_id: stripeTransferId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-payouts"] });
      toast.success("Payout marked as completed");
    },
    onError: (error) => {
      toast.error("Failed to process payout");
      console.error(error);
    },
  });

  // Reject payout
  const rejectPayout = useMutation({
    mutationFn: async ({ payoutId, reason }: { payoutId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("creator_payouts")
        .update({
          status: "failed",
          failure_reason: reason,
          processed_at: new Date().toISOString(),
        })
        .eq("id", payoutId);

      if (error) throw error;

      // Log activity
      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "reject_affiliate_payout",
        target_type: "affiliate_payout",
        target_id: payoutId,
        details: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-payouts"] });
      toast.success("Payout rejected");
    },
    onError: (error) => {
      toast.error("Failed to reject payout");
      console.error(error);
    },
  });

  return {
    codes,
    conversions,
    payouts,
    stats,
    topAffiliates,
    isLoading: codesLoading || conversionsLoading || payoutsLoading,
    error: codesError || conversionsError || payoutsError,
    toggleCodeStatus,
    updateConversionStatus,
    processPayoutManually,
    rejectPayout,
  };
};
