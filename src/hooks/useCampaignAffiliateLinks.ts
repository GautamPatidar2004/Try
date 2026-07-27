import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";

export interface CampaignAffiliateLink {
  id: string;
  campaign_id: string;
  creator_id: string;
  slug: string;
  destination_url: string;
  commission_rate: number;
  clicks_count: number;
  conversions_count: number;
  total_revenue_cents: number;
  total_commission_cents: number;
  is_active: boolean;
  created_at: string;
  campaign?: {
    id: string;
    brand_name: string;
    campaign_title: string;
    brand_logo_url: string | null;
    affiliate_percentage: number | null;
  };
}

export const buildTrackableUrl = (slug: string) =>
  `${SITE_CONFIG.productionUrl}/r/${slug}`;

export const useCampaignAffiliateLinks = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const linksQuery = useQuery({
    queryKey: ["campaign-affiliate-links", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CampaignAffiliateLink[]> => {
      const { data, error } = await supabase
        .from("brand_campaign_affiliate_links" as any)
        .select(`*, campaign:brand_campaigns(id, brand_name, campaign_title, brand_logo_url, affiliate_percentage)`)
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CampaignAffiliateLink[];
    },
  });

  // Eligible campaigns: accepted on a campaign with affiliate_enabled
  const eligibleQuery = useQuery({
    queryKey: ["affiliate-eligible-campaigns", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_campaign_applications")
        .select(`campaign_id, status, campaign:brand_campaigns!inner(id, brand_name, campaign_title, brand_logo_url, affiliate_enabled, affiliate_percentage, status)`)
        .eq("influencer_id", userId!)
        .eq("status", "accepted");
      if (error) throw error;
      return (data || []).filter((r: any) => r.campaign?.affiliate_enabled);
    },
  });

  const generateLink = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke("generate-campaign-affiliate-link", {
        body: { campaign_id: campaignId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.link as CampaignAffiliateLink;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-affiliate-links"] });
      toast({ title: "Link ready", description: "Your trackable affiliate URL has been generated." });
    },
    onError: (e: Error) => {
      toast({ title: "Could not generate link", description: e.message, variant: "destructive" });
    },
  });

  return {
    links: linksQuery.data || [],
    eligibleCampaigns: eligibleQuery.data || [],
    isLoading: linksQuery.isLoading || eligibleQuery.isLoading,
    generateLink: generateLink.mutateAsync,
    isGenerating: generateLink.isPending,
  };
};