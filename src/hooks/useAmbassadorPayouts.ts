import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAmbassador } from "./useAmbassador";

export interface AmbassadorPayout {
  id: string;
  ambassador_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  stripe_transfer_id: string | null;
  stripe_payout_id: string | null;
  failure_reason: string | null;
  earnings_ids: string[] | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
}

export const useAmbassadorPayouts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { ambassador } = useAmbassador();
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  // Fetch payouts
  const { data: payouts, isLoading } = useQuery({
    queryKey: ["ambassador-payouts", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_payouts")
        .select("*")
        .eq("ambassador_id", ambassador!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AmbassadorPayout[];
    },
  });

  // Request payout mutation
  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("process-ambassador-payout");
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Payout Requested!",
        description: `$${data.amount.toFixed(2)} is being transferred to your bank account.`,
      });
      queryClient.invalidateQueries({ queryKey: ["ambassador-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-earnings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Real-time subscription for payout updates
  useEffect(() => {
    if (!ambassador?.id) return;

    const channel = supabase
      .channel(`ambassador-payouts-${ambassador.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ambassador_payouts",
          filter: `ambassador_id=eq.${ambassador.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const payout = payload.new as AmbassadorPayout;
            
            if (payout.status === "completed") {
              toast({
                title: "Payout Completed! 🎉",
                description: `$${Number(payout.amount).toFixed(2)} has been sent to your bank.`,
              });
            } else if (payout.status === "failed") {
              toast({
                title: "Payout Failed",
                description: payout.failure_reason || "Please try again or contact support.",
                variant: "destructive",
              });
            }
          }

          queryClient.invalidateQueries({ queryKey: ["ambassador-payouts"] });
        }
      )
      .subscribe((status) => {
        setIsRealTimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ambassador?.id, queryClient, toast]);

  // Calculate pending amount
  const pendingAmount = payouts
    ?.filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const totalPaidOut = payouts
    ?.filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return {
    payouts: payouts || [],
    isLoading,
    isRealTimeConnected,
    pendingAmount,
    totalPaidOut,
    requestPayout: requestPayoutMutation.mutate,
    isRequestingPayout: requestPayoutMutation.isPending,
  };
};
