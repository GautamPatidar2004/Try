import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export interface AffiliateConversion {
  id: string;
  affiliate_code_id: string;
  creator_id: string;
  host_id: string;
  conversion_type: "booking" | "product_sale" | "restaurant_reservation" | "experience" | "other";
  order_amount: number;
  commission_amount: number;
  currency: string;
  status: "pending" | "confirmed" | "paid" | "cancelled";
  external_reference: string | null;
  customer_email_hash: string | null;
  converted_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined data
  affiliate_code?: {
    code: string;
    property?: {
      title: string;
    };
  };
}

interface UseAffiliateConversionsOptions {
  role: "creator" | "host";
  status?: string;
  codeId?: string;
  limit?: number;
}

export const useAffiliateConversions = (options: UseAffiliateConversionsOptions) => {
  const { role, status, codeId, limit = 50 } = options;
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

  // Fetch conversions based on role
  const {
    data: conversions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["affiliate-conversions", userId, role, status, codeId],
    enabled: !!userId,
    queryFn: async (): Promise<AffiliateConversion[]> => {
      let query = supabase
        .from("affiliate_conversions")
        .select(`
          *,
          affiliate_code:creator_affiliate_codes(
            code,
            property:properties(title)
          )
        `)
        .order("converted_at", { ascending: false })
        .limit(limit);

      // Filter by role
      if (role === "creator") {
        query = query.eq("creator_id", userId!);
      } else {
        query = query.eq("host_id", userId!);
      }

      // Filter by status if provided
      if (status) {
        query = query.eq("status", status);
      }

      // Filter by code if provided
      if (codeId) {
        query = query.eq("affiliate_code_id", codeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as AffiliateConversion[];
    },
  });

  // Set up real-time subscription for new conversions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("affiliate-conversions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "affiliate_conversions",
          filter: role === "creator" 
            ? `creator_id=eq.${userId}` 
            : `host_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast({
              title: "New Conversion!",
              description: `A new ${(payload.new as AffiliateConversion).conversion_type.replace("_", " ")} has been recorded.`,
            });
          }
          queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
          queryClient.invalidateQueries({ queryKey: ["affiliate-earnings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, queryClient, toast]);

  // Confirm a conversion (host only)
  const confirmConversionMutation = useMutation({
    mutationFn: async (conversionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("affiliate_conversions")
        .update({ 
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", conversionId)
        .eq("host_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-earnings"] });
      toast({
        title: "Conversion Confirmed",
        description: "The conversion has been confirmed and commission is now available.",
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

  // Cancel a conversion (host only)
  const cancelConversionMutation = useMutation({
    mutationFn: async (conversionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("affiliate_conversions")
        .update({ status: "cancelled" })
        .eq("id", conversionId)
        .eq("host_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-earnings"] });
      toast({
        title: "Conversion Cancelled",
        description: "The conversion has been cancelled.",
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

  // Calculate summary stats
  const stats = {
    total: conversions?.length || 0,
    pending: conversions?.filter((c) => c.status === "pending").length || 0,
    confirmed: conversions?.filter((c) => c.status === "confirmed").length || 0,
    paid: conversions?.filter((c) => c.status === "paid").length || 0,
    cancelled: conversions?.filter((c) => c.status === "cancelled").length || 0,
    totalOrderAmount: conversions?.reduce((sum, c) => sum + c.order_amount, 0) || 0,
    totalCommission: conversions?.reduce((sum, c) => 
      c.status !== "cancelled" ? sum + c.commission_amount : sum, 0
    ) || 0,
  };

  return {
    conversions: conversions || [],
    stats,
    isLoading,
    error,
    refetch,
    confirmConversion: confirmConversionMutation.mutate,
    cancelConversion: cancelConversionMutation.mutate,
    isConfirming: confirmConversionMutation.isPending,
    isCancelling: cancelConversionMutation.isPending,
  };
};
