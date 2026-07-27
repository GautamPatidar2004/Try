import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function invokeImpact<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("impact-affiliate", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export interface ImpactLink {
  campaignId: string;
  campaignName: string;
  advertiserName: string;
  trackingUrl: string | null;
  contractStatus: string;
}

export interface ImpactAction {
  id: string;
  campaignName: string;
  actionDate: string;
  payout: number;
  amount: number;
  state: string;
  currency: string;
  customerArea?: string;
  referringDomain?: string;
}

export interface ImpactPayouts {
  invoices: Array<{ id: string; amount: number; currency: string; status: string; date: string; dueDate?: string }>;
  payments: Array<{ id: string; amount: number; currency: string; status: string; paidAt: string; method?: string }>;
}

export interface ImpactSummary {
  pendingEarnings: number;
  approvedEarnings: number;
  reversedEarnings: number;
  totalSales: number;
  actionCount: number;
  windowDays: number;
}

export const useImpactSummary = (days = 30) =>
  useQuery({
    queryKey: ["impact", "summary", days],
    queryFn: () => invokeImpact<ImpactSummary>("get-summary", { days }),
    staleTime: 60_000,
    retry: false,
  });

export const useImpactLinks = () =>
  useQuery({
    queryKey: ["impact", "links"],
    queryFn: () => invokeImpact<{ links: ImpactLink[] }>("get-links"),
    staleTime: 5 * 60_000,
    retry: false,
  });

export const useImpactActions = (days = 90) =>
  useQuery({
    queryKey: ["impact", "actions", days],
    queryFn: () => invokeImpact<{ actions: ImpactAction[] }>("get-actions", { days }),
    staleTime: 60_000,
    retry: false,
  });

export const useImpactPayouts = () =>
  useQuery({
    queryKey: ["impact", "payouts"],
    queryFn: () => invokeImpact<ImpactPayouts>("get-payouts"),
    staleTime: 5 * 60_000,
    retry: false,
  });