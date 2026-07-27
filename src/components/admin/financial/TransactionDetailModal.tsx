import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

interface TransactionDetailModalProps {
  transaction: any;
  open: boolean;
  onClose: () => void;
}

export const TransactionDetailModal = ({ transaction, open, onClose }: TransactionDetailModalProps) => {
  const { refundTransaction, isRefunding } = useTransactions();

  const handleRefund = () => {
    if (confirm('Are you sure you want to refund this transaction?')) {
      refundTransaction(transaction.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm">{transaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p>{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="capitalize">{transaction.type?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge>{transaction.status}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-lg font-bold">${(transaction.amount / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform Fee</p>
                <p className="text-lg">${((transaction.platform_fee || 0) / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Amount</p>
                <p className="text-lg">${((transaction.net_amount || 0) / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="uppercase">{transaction.currency}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Parties</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payer</p>
                <p>{transaction.payer?.first_name} {transaction.payer?.last_name}</p>
                <p className="text-sm text-muted-foreground">@{transaction.payer?.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipient</p>
                <p>{transaction.recipient?.first_name} {transaction.recipient?.last_name}</p>
                <p className="text-sm text-muted-foreground">@{transaction.recipient?.username}</p>
              </div>
            </div>
          </div>

          {transaction.stripe_payment_intent_id && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Stripe Information</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Payment Intent ID:</p>
                  <p className="font-mono text-sm">{transaction.stripe_payment_intent_id}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://dashboard.stripe.com/payments/${transaction.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            {transaction.status === 'completed' && (
              <Button
                variant="destructive"
                onClick={handleRefund}
                disabled={isRefunding}
              >
                {isRefunding ? 'Processing...' : 'Refund Transaction'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
