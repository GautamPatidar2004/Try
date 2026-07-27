import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface TransactionFilters {
  dateRange?: { start: Date; end: Date };
  type?: string;
  status?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
}

export const useTransactions = (filters?: TransactionFilters) => {
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

  const transactionsQuery = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('id, amount, status, type, created_at, recipient_id, platform_fee, net_amount, currency')
        .order('created_at', { ascending: false });

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.amountMin) {
        query = query.gte('amount', filters.amountMin * 100);
      }

      if (filters?.amountMax) {
        query = query.lte('amount', filters.amountMax * 100);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!adminId) throw new Error('Admin ID not available');
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'refunded' })
        .eq('id', transactionId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        action: 'refund_transaction',
        target_type: 'transaction',
        target_id: transactionId,
        details: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Transaction Refunded",
        description: "The transaction has been refunded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refund transaction.",
        variant: "destructive",
      });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    refundTransaction: refundMutation.mutate,
    isRefunding: refundMutation.isPending,
  };
};
