import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAmbassador } from "./useAmbassador";

export interface RealTimeEarning {
  id: string;
  ambassador_id: string;
  amount: number;
  earning_type: string;
  status: string;
  created_at: string;
}

export const useRealTimeEarnings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { ambassador } = useAmbassador();
  const [isConnected, setIsConnected] = useState(false);
  const [latestEarning, setLatestEarning] = useState<RealTimeEarning | null>(null);

  useEffect(() => {
    if (!ambassador?.id) return;

    const channel = supabase
      .channel(`ambassador-earnings-${ambassador.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ambassador_earnings",
          filter: `ambassador_id=eq.${ambassador.id}`,
        },
        (payload) => {
          const newEarning = payload.new as RealTimeEarning;
          setLatestEarning(newEarning);

          // Show toast notification
          toast({
            title: "New Earning! 🎉",
            description: `+$${Number(newEarning.amount).toFixed(2)} from ${formatEarningType(newEarning.earning_type)}`,
          });

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["ambassador-earnings"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ambassador_earnings",
          filter: `ambassador_id=eq.${ambassador.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["ambassador-earnings"] });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ambassador?.id, queryClient, toast]);

  return {
    isConnected,
    latestEarning,
  };
};

function formatEarningType(type: string): string {
  const types: Record<string, string> = {
    referral_commission: "Referral Commission",
    collaboration_fee: "Collaboration Fee",
    bonus: "Bonus",
    tier_bonus: "Tier Bonus",
    requirement_bonus: "Requirement Bonus",
  };
  return types[type] || type.replace(/_/g, " ");
}
