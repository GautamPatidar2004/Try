import { DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestAffiliatePayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  minimumPayout: number;
  onRequestPayout: () => void;
  isRequesting: boolean;
  hasPendingPayout: boolean;
}

const RequestAffiliatePayoutDialog = ({
  open,
  onOpenChange,
  availableBalance,
  minimumPayout,
  onRequestPayout,
  isRequesting,
  hasPendingPayout,
}: RequestAffiliatePayoutDialogProps) => {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const canRequestPayout = availableBalance >= minimumPayout && !hasPendingPayout;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Request a payout for your confirmed affiliate earnings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(availableBalance)}
            </p>
          </div>

          {hasPendingPayout && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You already have a pending payout request. Please wait for it to be processed.
              </AlertDescription>
            </Alert>
          )}

          {!hasPendingPayout && availableBalance < minimumPayout && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Minimum payout amount is {formatCurrency(minimumPayout)}. You need{" "}
                {formatCurrency(minimumPayout - availableBalance)} more to request a payout.
              </AlertDescription>
            </Alert>
          )}

          {canRequestPayout && (
            <p className="text-sm text-muted-foreground text-center">
              Your payout will be processed to your connected Stripe account within 3-5 business days.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onRequestPayout}
            disabled={!canRequestPayout || isRequesting}
          >
            {isRequesting ? "Requesting..." : `Request ${formatCurrency(availableBalance)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestAffiliatePayoutDialog;
