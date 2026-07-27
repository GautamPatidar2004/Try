import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface InvoiceFilters {
  status?: string;
  search?: string;
}

export const useInvoices = (filters?: InvoiceFilters) => {
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

  const invoicesQuery = useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const voidInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, reason }: { invoiceId: string; reason: string }) => {
      if (!adminId) throw new Error('Admin ID not available');
      
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'void' })
        .eq('id', invoiceId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        action: 'void_invoice',
        target_type: 'invoice',
        target_id: invoiceId,
        details: { reason, timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Voided",
        description: "The invoice has been voided successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to void invoice.",
        variant: "destructive",
      });
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    refetch: invoicesQuery.refetch,
    voidInvoice: voidInvoiceMutation.mutate,
    isVoiding: voidInvoiceMutation.isPending,
  };
};
