import { CreditCard, ExternalLink, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const PayoutSettings = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    accountStatus,
    isLoadingStatus,
    refetchStatus,
    isCreating,
    isGettingLink,
    startOnboarding,
    openStripeDashboard,
    updateAccount,
  } = useStripeConnect();

  // Handle return from Stripe onboarding
  useEffect(() => {
    const stripeOnboarding = searchParams.get("stripe_onboarding");
    const stripeRefresh = searchParams.get("stripe_refresh");

    if (stripeOnboarding === "complete") {
      toast({
        title: "Onboarding Complete!",
        description: "Your Stripe account setup is complete. We're verifying your details.",
      });
      refetchStatus();
      // Clear the params
      searchParams.delete("stripe_onboarding");
      setSearchParams(searchParams);
    }

    if (stripeRefresh === "true") {
      toast({
        title: "Session Expired",
        description: "Your onboarding session expired. Please try again.",
        variant: "destructive",
      });
      // Clear the params
      searchParams.delete("stripe_refresh");
      setSearchParams(searchParams);
    }
  }, [searchParams, refetchStatus, toast, setSearchParams]);

  if (isLoadingStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasAccount = accountStatus?.hasAccount;
  const isComplete = accountStatus?.onboardingComplete && accountStatus?.payoutsEnabled;
  const needsAction = hasAccount && !isComplete;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Payout Settings</CardTitle>
              <CardDescription>
                Connect your Stripe account to receive payouts
              </CardDescription>
            </div>
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-green-500">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
          {needsAction && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAccount && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To receive your ambassador earnings, you need to set up a Stripe Connect account. 
              This is a secure way to receive payments directly to your bank account.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Fast transfers to your bank
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Secure & encrypted
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Track all payouts in one place
              </li>
            </ul>
            <Button 
              onClick={startOnboarding}
              disabled={isCreating || isGettingLink}
              className="w-full sm:w-auto"
            >
              {(isCreating || isGettingLink) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Connect with Stripe
                </>
              )}
            </Button>
          </div>
        )}

        {needsAction && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Your Stripe account setup is incomplete. Please complete the onboarding to receive payouts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => startOnboarding()}
                disabled={isGettingLink}
              >
                {isGettingLink ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                Your Stripe account is set up and ready to receive payouts!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline"
                onClick={openStripeDashboard}
                disabled={isGettingLink}
              >
                {isGettingLink ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    View Stripe Dashboard
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button 
                variant="ghost"
                onClick={updateAccount}
                disabled={isGettingLink}
              >
                Update Account Info
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
