import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface PayoutFilters {
  status?: string;
  search?: string;
  payoutMethod?: string;
}

export const usePayouts = (filters?: PayoutFilters) => {
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

  const payoutsQuery = useQuery({
    queryKey: ['payouts', filters],
    queryFn: async () => {
      let query = supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.payoutMethod && filters.payoutMethod !== 'all') {
        query = query.eq('payout_method', filters.payoutMethod);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const approvePayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      if (!adminId) throw new Error('Admin ID not available');
      
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'processing' })
        .eq('id', payoutId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        action: 'approve_payout',
        target_type: 'payout',
        target_id: payoutId,
        details: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({
        title: "Payout Approved",
        description: "The payout has been approved and is now processing.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve payout.",
        variant: "destructive",
      });
    },
  });

  return {
    payouts: payoutsQuery.data || [],
    isLoading: payoutsQuery.isLoading,
    error: payoutsQuery.error,
    refetch: payoutsQuery.refetch,
    approvePayout: approvePayoutMutation.mutate,
    isApproving: approvePayoutMutation.isPending,
  };
};
