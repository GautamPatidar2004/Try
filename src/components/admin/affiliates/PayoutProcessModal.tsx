import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, DollarSign, Loader2 } from "lucide-react";
import { AffiliatePayout } from "@/hooks/useAdminAffiliateManagement";

interface PayoutProcessModalProps {
  payout: AffiliatePayout;
  mode: "process" | "reject";
  open: boolean;
  onClose: () => void;
  onProcess: (stripeTransferId?: string) => void;
  onReject: (reason: string) => void;
  isProcessing: boolean;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export const PayoutProcessModal = ({
  payout,
  mode,
  open,
  onClose,
  onProcess,
  onReject,
  isProcessing,
}: PayoutProcessModalProps) => {
  const [stripeTransferId, setStripeTransferId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const getCreatorName = () => {
    if (!payout.creator?.profiles) return "Unknown Creator";
    const { first_name, last_name } = payout.creator.profiles;
    return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown Creator";
  };

  const handleSubmit = () => {
    if (mode === "process") {
      onProcess(stripeTransferId || undefined);
    } else {
      if (!rejectReason.trim()) return;
      onReject(rejectReason);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "process" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Process Payout
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Reject Payout
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "process"
              ? "Mark this payout as completed. Optionally add a Stripe transfer ID."
              : "Reject this payout request with a reason."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payout Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Creator</span>
              <span className="text-sm font-medium">{getCreatorName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-bold flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(payout.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Conversions</span>
              <span className="text-sm">{payout.conversion_ids?.length || 0}</span>
            </div>
            {payout.creator?.stripe_connect_id && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stripe Account</span>
                <span className="text-xs font-mono">
                  {payout.creator.stripe_connect_id.slice(0, 15)}...
                </span>
              </div>
            )}
          </div>

          {mode === "process" ? (
            <div className="space-y-2">
              <Label htmlFor="stripeId">Stripe Transfer ID (optional)</Label>
              <Input
                id="stripeId"
                placeholder="tr_..."
                value={stripeTransferId}
                onChange={(e) => setStripeTransferId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If you processed this through Stripe, enter the transfer ID for tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejecting this payout..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be visible to the creator.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || (mode === "reject" && !rejectReason.trim())}
            variant={mode === "reject" ? "destructive" : "default"}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : mode === "process" ? (
              "Mark as Completed"
            ) : (
              "Reject Payout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
