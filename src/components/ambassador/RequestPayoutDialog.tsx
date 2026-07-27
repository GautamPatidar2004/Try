import { useState } from "react";
import { DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAmbassadorPayouts } from "@/hooks/useAmbassadorPayouts";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { useAmbassadorEarnings } from "@/hooks/useAmbassadorEarnings";

const MINIMUM_PAYOUT = 50;

export const RequestPayoutDialog = () => {
  const [open, setOpen] = useState(false);
  const { requestPayout, isRequestingPayout } = useAmbassadorPayouts();
  const { accountStatus } = useStripeConnect();
  const { calculation } = useAmbassadorEarnings();

  const pendingBalance = calculation.pendingPayouts;
  const canRequestPayout = pendingBalance >= MINIMUM_PAYOUT && accountStatus?.payoutsEnabled;

  const handleRequestPayout = () => {
    requestPayout(undefined, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  const getButtonState = () => {
    if (!accountStatus?.hasAccount) {
      return { disabled: true, text: "Set up Stripe first" };
    }
    if (!accountStatus?.payoutsEnabled) {
      return { disabled: true, text: "Complete Stripe setup" };
    }
    if (pendingBalance < MINIMUM_PAYOUT) {
      return { disabled: true, text: `Min $${MINIMUM_PAYOUT} required` };
    }
    return { disabled: false, text: `Request Payout ($${pendingBalance.toFixed(2)})` };
  };

  const buttonState = getButtonState();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={buttonState.disabled}
          className="gap-2"
        >
          <DollarSign className="h-4 w-4" />
          {buttonState.text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Transfer your available earnings to your bank account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-primary/5 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-3xl font-bold">${pendingBalance.toFixed(2)}</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Important</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum payout is ${MINIMUM_PAYOUT}</li>
                <li>Transfers typically arrive within 2-3 business days</li>
                <li>All pending earnings will be included in this payout</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isRequestingPayout}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequestPayout}
            disabled={isRequestingPayout || !canRequestPayout}
          >
            {isRequestingPayout ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Payout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
