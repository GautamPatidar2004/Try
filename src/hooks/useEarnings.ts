import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface EarningsFilters {
  status?: string;
  sourceType?: string;
  search?: string;
  dateRange?: { start: Date; end: Date };
}

export const useEarnings = (filters?: EarningsFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAdminId(user?.id || null);
    };
    getUser();
  }, []);

  const earningsQuery = useQuery({
    queryKey: ['earnings', filters],
    queryFn: async () => {
      let query = supabase
        .from('earnings')
        .select('id, influencer_id, gross_amount, net_amount, platform_fee, status, earned_at, available_at, source_type, source_id, currency')
        .order('earned_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.sourceType && filters.sourceType !== 'all') {
        query = query.eq('source_type', filters.sourceType);
      }

      if (filters?.dateRange) {
        query = query
          .gte('earned_at', filters.dateRange.start.toISOString())
          .lte('earned_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const approveForPayoutMutation = useMutation({
    mutationFn: async (earningIds: string[]) => {
      if (!adminId) throw new Error('Admin ID not available');
      
      const { error } = await supabase
        .from('earnings')
        .update({ status: 'pending_payout' })
        .in('id', earningIds);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_activity_log').insert(
        earningIds.map(id => ({
          admin_id: adminId,
          action: 'approve_earning_for_payout',
          target_type: 'earning',
          target_id: id,
          details: { timestamp: new Date().toISOString() }
        }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      toast({
        title: "Earnings Approved",
        description: "Selected earnings have been approved for payout.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve earnings.",
        variant: "destructive",
      });
    },
  });

  return {
    earnings: earningsQuery.data || [],
    isLoading: earningsQuery.isLoading,
    error: earningsQuery.error,
    refetch: earningsQuery.refetch,
    approveForPayout: approveForPayoutMutation.mutate,
    isApproving: approveForPayoutMutation.isPending,
  };
};
