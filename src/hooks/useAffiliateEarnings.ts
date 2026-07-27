import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export interface CreatorPayout {
  id: string;
  creator_id: string;
  amount: number;
  currency: string;
  conversion_ids: string[];
  status: "pending" | "processing" | "completed" | "failed";
  stripe_transfer_id: string | null;
  requested_at: string;
  processed_at: string | null;
  failure_reason: string | null;
  created_at: string;
}

export interface EarningsSummary {
  pendingEarnings: number;
  confirmedEarnings: number;
  paidEarnings: number;
  availableForPayout: number;
  totalLifetimeEarnings: number;
}

const MINIMUM_PAYOUT_AMOUNT = 5000; // $50 in cents

export const useAffiliateEarnings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch earnings summary from conversions
  const {
    data: earningsSummary,
    isLoading: isLoadingEarnings,
    refetch: refetchEarnings,
  } = useQuery({
    queryKey: ["affiliate-earnings", userId],
    enabled: !!userId,
    queryFn: async (): Promise<EarningsSummary> => {
      const { data, error } = await supabase
        .from("affiliate_conversions")
        .select("status, commission_amount")
        .eq("creator_id", userId!);

      if (error) throw error;

      const conversions = data || [];

      const pendingEarnings = conversions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.commission_amount, 0);

      const confirmedEarnings = conversions
        .filter((c) => c.status === "confirmed")
        .reduce((sum, c) => sum + c.commission_amount, 0);

      const paidEarnings = conversions
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.commission_amount, 0);

      return {
        pendingEarnings,
        confirmedEarnings,
        paidEarnings,
        availableForPayout: confirmedEarnings,
        totalLifetimeEarnings: pendingEarnings + confirmedEarnings + paidEarnings,
      };
    },
  });

  // Fetch payout history
  const {
    data: payouts,
    isLoading: isLoadingPayouts,
    refetch: refetchPayouts,
  } = useQuery({
    queryKey: ["creator-payouts", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CreatorPayout[]> => {
      const { data, error } = await supabase
        .from("creator_payouts")
        .select("*")
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as CreatorPayout[];
    },
  });

  // Request a payout
  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!earningsSummary) throw new Error("Unable to fetch earnings");
      
      if (earningsSummary.availableForPayout < MINIMUM_PAYOUT_AMOUNT) {
        throw new Error(
          `Minimum payout amount is $${(MINIMUM_PAYOUT_AMOUNT / 100).toFixed(2)}. ` +
          `Current balance: $${(earningsSummary.availableForPayout / 100).toFixed(2)}`
        );
      }

      // Get confirmed conversion IDs
      const { data: confirmedConversions, error: fetchError } = await supabase
        .from("affiliate_conversions")
        .select("id")
        .eq("creator_id", user.id)
        .eq("status", "confirmed");

      if (fetchError) throw fetchError;

      const conversionIds = confirmedConversions?.map((c) => c.id) || [];

      // Create payout request
      const { data, error } = await supabase
        .from("creator_payouts")
        .insert({
          creator_id: user.id,
          amount: earningsSummary.availableForPayout,
          currency: "usd",
          conversion_ids: conversionIds,
          status: "pending",
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["creator-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted and is being processed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payout Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canRequestPayout = 
    (earningsSummary?.availableForPayout || 0) >= MINIMUM_PAYOUT_AMOUNT;

  const hasPendingPayout = payouts?.some(
    (p) => p.status === "pending" || p.status === "processing"
  );

  return {
    earnings: earningsSummary || {
      pendingEarnings: 0,
      confirmedEarnings: 0,
      paidEarnings: 0,
      availableForPayout: 0,
      totalLifetimeEarnings: 0,
    },
    payouts: payouts || [],
    isLoading: isLoadingEarnings || isLoadingPayouts,
    canRequestPayout: canRequestPayout && !hasPendingPayout,
    hasPendingPayout,
    minimumPayoutAmount: MINIMUM_PAYOUT_AMOUNT,
    requestPayout: requestPayoutMutation.mutate,
    isRequestingPayout: requestPayoutMutation.isPending,
    refetch: () => {
      refetchEarnings();
      refetchPayouts();
    },
  };
};
