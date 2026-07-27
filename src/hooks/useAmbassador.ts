import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SITE_CONFIG } from "@/config/site";

export interface AmbassadorMember {
  id: string;
  user_id: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  referral_code: string;
  joined_at: string;
  payment_method: any;
  monthly_requirements_met: boolean;
}

export const useAmbassador = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ambassador, isLoading } = useQuery({
    queryKey: ["ambassador-member"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ambassador_members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AmbassadorMember | null;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get username for referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, first_name")
        .eq("id", user.id)
        .single();

      const username = profile?.username || profile?.first_name || user.id.slice(0, 8);
      const referralCode = `${username.toUpperCase()}${new Date().getFullYear()}`;

      const { data, error } = await supabase
        .from("ambassador_members")
        .insert({
          user_id: user.id,
          referral_code: referralCode,
          status: 'pending', // Changed to pending - awaiting contract signature
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassador-member"] });
      // Don't show success toast yet - contract signing still needed
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signContractMutation = useMutation({
    mutationFn: async ({
      signatureData,
      legalName,
    }: {
      signatureData: string;
      legalName: string;
    }) => {
      if (!ambassador) throw new Error("Not enrolled as ambassador");

      const { data, error } = await supabase.functions.invoke("sign-ambassador-contract", {
        body: {
          ambassador_member_id: ambassador.id,
          signature_data: signatureData,
          legal_name: legalName,
          agreed_terms: true,
          user_agent: navigator.userAgent,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassador-member"] });
      toast({
        title: "Welcome to the Ambassador Program! 🎉",
        description: "Your contract has been signed. Check your email for a copy.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Contract signing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async (paymentMethod: any) => {
      if (!ambassador) throw new Error("Not an ambassador");

      const { error } = await supabase
        .from("ambassador_members")
        .update({ payment_method: paymentMethod })
        .eq("id", ambassador.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambassador-member"] });
      toast({
        title: "Payment method updated",
      });
    },
  });

  const getReferralLink = () => {
    if (!ambassador) return "";
    return `${SITE_CONFIG.productionUrl}/for-creators?ref=${ambassador.referral_code}`;
  };

  return {
    ambassador,
    isLoading,
    isAmbassador: !!ambassador && ambassador.status === 'active',
    isPending: !!ambassador && ambassador.status === 'pending',
    enroll: enrollMutation.mutate,
    enrolling: enrollMutation.isPending,
    signContract: signContractMutation.mutate,
    signingContract: signContractMutation.isPending,
    updatePaymentMethod: updatePaymentMethod.mutate,
    getReferralLink,
  };
};
