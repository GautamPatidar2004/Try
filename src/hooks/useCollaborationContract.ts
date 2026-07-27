import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignContractParams {
  agreementId: string;
  signatureData: string;
  legalName: string;
  partyType: "host" | "influencer"| "brand" | "creator";
}

 export interface ContractData {
  agreementId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyType: string;
  hostName: string;
  hostId: string;
  influencerName: string;
  influencerId: string;
  influencerFollowers?: number;
  influencerInstagram?: string;
  checkInDate?: string;
  checkOutDate?: string;
  deliverables: string[];
  deadline?: string;
  collaborationType: string;
  agreedRate?: number;
  currency?: string;
   affiliateCommissionRate?: number;
    // Brand-specific
  campaignTitle?: string;
  brandName?: string;
}

export const useCollaborationContract = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signContractMutation = useMutation({
    mutationFn: async ({ agreementId, signatureData, legalName, partyType }: SignContractParams) => {
      const { data, error } = await supabase.functions.invoke("sign-collaboration-contract", {
        body: {
          agreement_id: agreementId,
          signature_data: signatureData,
          legal_name: legalName,
          party_type: partyType,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to sign contract");

      return data;
    },
    onSuccess: (data, variables) => {
      const isFullySigned = data.new_status === "active";
      
      toast({
        title: isFullySigned ? "Contract Signed!" : "Signature Recorded",
        description: data.message,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin-agreements"] });
      queryClient.invalidateQueries({ queryKey: ["host-applications"] });
      queryClient.invalidateQueries({ queryKey: ["influencer-agreements"] });
      queryClient.invalidateQueries({ queryKey: ["pending-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["brand-applications"] });
      queryClient.invalidateQueries({ queryKey: ["brand-agreements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Signing Contract",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Transform agreement data from database format to ContractData format
   */
  const buildContractData = (agreement: any): ContractData => {
    const application = agreement.application;
    const property = application?.property;
    const host = property?.host || agreement.host;
    const influencer = application?.influencer || agreement.influencer;

    return {
      agreementId: agreement.id,
      propertyTitle: property?.title || "Property",
      propertyLocation: property?.location || "Location TBD",
      propertyType: property?.property_type || "Accommodation",
      hostName: host?.profiles 
        ? `${host.profiles.first_name || ""} ${host.profiles.last_name || ""}`.trim() || "Host"
        : "Host",
      hostId: agreement.host_id,
      influencerName: influencer?.profiles
        ? `${influencer.profiles.first_name || ""} ${influencer.profiles.last_name || ""}`.trim() || "Creator"
        : "Creator",
      influencerId: agreement.influencer_id,
      influencerFollowers: influencer?.total_followers,
      influencerInstagram: influencer?.instagram_url?.replace(/.*instagram\.com\//, "").replace(/\/$/, ""),
      checkInDate: application?.proposed_dates_start,
      checkOutDate: application?.proposed_dates_end,
      deliverables: application?.content_deliverables || agreement.content_requirements || [],
      deadline: application?.content_deadline || agreement.deadline,
      collaborationType: property?.collaboration_type || "free_stay",
      agreedRate: agreement.agreed_rate,
      currency: agreement.currency || "USD",
       affiliateCommissionRate: agreement.affiliate_commission_rate || 0.10,
    };
  };
		
  // ── Brand campaign flow ──────────────────────────────────────────────────────
  const buildBrandContractData = (agreement: any): ContractData => {
    const campaign   = agreement.campaign;
    const influencer =  agreement.influencer;
    return {
      agreementId: agreement.id,
      // Re-use propertyTitle slot for campaign title — ContractContentPreview renders this
      propertyTitle: campaign?.campaign_title || agreement.campaign_title || "Campaign",
      propertyLocation: "Remote / Digital",
      propertyType: "Brand Campaign",
      hostName: campaign?.brand_name || agreement.brand_name || "Brand",
      hostId: agreement.brand_id,
      influencerName: agreement.profile
      ? `${agreement.profile.first_name || ""} ${agreement.profile.last_name || ""}`.trim() || "Creator"
      : "Creator",
      influencerId: agreement.influencer_id,
      influencerFollowers: influencer?.total_followers,
      influencerInstagram: influencer?.instagram_url
        ?.replace(/.*instagram\.com\//, "").replace(/\/$/, ""),
  
      checkInDate: undefined,
      checkOutDate: undefined,
      deliverables: campaign?.deliverables || campaign?.content_requirements || agreement.content_requirements || [],
      deadline: campaign?.timeline_end || agreement.deadline,
      collaborationType: "brand_campaign",
      agreedRate: campaign?.creator_payout || agreement.total_fee,
      currency: campaign?.currency || agreement.currency || "USD",
      affiliateCommissionRate: 0,   // brand campaigns use flat fee, not affiliate %
      campaignTitle: campaign?.campaign_title,
      brandName: campaign?.brand_name || agreement.brand_name,
    };
    };
  
  return {
    signContract: signContractMutation.mutate,
    signContractAsync: signContractMutation.mutateAsync,
    isSigningContract: signContractMutation.isPending,
    buildContractData,
    buildBrandContractData,
  };
};
