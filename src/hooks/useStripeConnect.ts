import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAmbassador } from "./useAmbassador";

export interface ConnectAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: any;
  capabilities?: any;
}

export const useStripeConnect = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { ambassador } = useAmbassador();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch Connect account status
  const { data: accountStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["stripe-connect-status", ambassador?.id],
    enabled: !!ambassador,
    queryFn: async (): Promise<ConnectAccountStatus> => {
      const { data, error } = await supabase.functions.invoke("get-connect-account-status");
      
      if (error) throw error;
      return data;
    },
  });

  // Create Connect account
  const createAccountMutation = useMutation({
    mutationFn: async () => {
      setIsCreating(true);
      const { data, error } = await supabase.functions.invoke("create-connect-account");
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["stripe-connect-status"] });
      queryClient.invalidateQueries({ queryKey: ["ambassador-member"] });
      
      if (data.alreadyExists) {
        toast({
          title: "Account exists",
          description: "You already have a Stripe Connect account.",
        });
      } else {
        toast({
          title: "Account created",
          description: "Your Stripe Connect account has been created. Complete onboarding to receive payouts.",
        });
      }
    },
    onError: (error: Error) => {
      setIsCreating(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get onboarding link
  const getOnboardingLinkMutation = useMutation({
    mutationFn: async (type: "account_onboarding" | "account_update" | "login_link" = "account_onboarding") => {
      const { data, error } = await supabase.functions.invoke("create-connect-account-link", {
        body: { type },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Open Stripe in new tab
      window.open(data.url, "_blank");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startOnboarding = async () => {
    // First, create account if doesn't exist
    if (!accountStatus?.hasAccount) {
      const result = await createAccountMutation.mutateAsync();
      if (result) {
        // Then get onboarding link
        await getOnboardingLinkMutation.mutateAsync("account_onboarding");
      }
    } else {
      // Just get onboarding link
      await getOnboardingLinkMutation.mutateAsync("account_onboarding");
    }
  };

  const openStripeDashboard = async () => {
    await getOnboardingLinkMutation.mutateAsync("login_link");
  };

  const updateAccount = async () => {
    await getOnboardingLinkMutation.mutateAsync("account_update");
  };

  return {
    accountStatus,
    isLoadingStatus,
    refetchStatus,
    isCreating: isCreating || createAccountMutation.isPending,
    isGettingLink: getOnboardingLinkMutation.isPending,
    startOnboarding,
    openStripeDashboard,
    updateAccount,
    createAccount: createAccountMutation.mutate,
  };
};
