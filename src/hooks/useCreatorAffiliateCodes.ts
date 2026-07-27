import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export interface CreatorAffiliateCode {
  id: string;
  collaboration_id: string | null;
  creator_id: string;
  host_id: string;
  property_id: string | null;
  code: string;
  commission_rate: number;
  commission_type: "percentage" | "flat_fee";
  flat_fee_amount: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
  // Joined data
  property?: {
    title: string;
    location: string;
  };
  collaboration?: {
    status: string;
  };
}

export const useCreatorAffiliateCodes = () => {
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

  // Fetch all affiliate codes for the current creator
  const {
    data: affiliateCodes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["creator-affiliate-codes", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CreatorAffiliateCode[]> => {
      const { data, error } = await supabase
        .from("creator_affiliate_codes")
        .select(`
          *,
          property:properties(title, location),
          collaboration:collaboration_agreements(status)
        `)
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CreatorAffiliateCode[];
    },
  });

  // Toggle code active status
  const toggleCodeStatusMutation = useMutation({
    mutationFn: async ({ codeId, isActive }: { codeId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("creator_affiliate_codes")
        .update({ is_active: isActive })
        .eq("id", codeId);

      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["creator-affiliate-codes"] });
      toast({
        title: isActive ? "Code Activated" : "Code Deactivated",
        description: isActive
          ? "Your affiliate code is now active and can be used."
          : "Your affiliate code has been deactivated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get active codes only
  const activeCodes = affiliateCodes?.filter((code) => code.is_active) || [];

  // Get total earnings from all codes
  const totalUses = affiliateCodes?.reduce((sum, code) => sum + code.current_uses, 0) || 0;

  return {
    affiliateCodes: affiliateCodes || [],
    activeCodes,
    totalUses,
    isLoading,
    error,
    refetch,
    toggleCodeStatus: toggleCodeStatusMutation.mutate,
    isTogglingStatus: toggleCodeStatusMutation.isPending,
  };
};
