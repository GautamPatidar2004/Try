import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandCard } from "@/components/ui/brand-card";
import { format } from "date-fns";
import { CreatorPayout } from "@/hooks/useAffiliateEarnings";

interface AffiliatePayoutHistoryProps {
  payouts: CreatorPayout[];
  isLoading: boolean;
}

const AffiliatePayoutHistory = ({ payouts, isLoading }: AffiliatePayoutHistoryProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500/20 text-blue-600 bg-blue-50 dark:bg-blue-950/30">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="gap-1 border-emerald-500/20 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (cents: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <BrandCard variant="default" className="text-center py-8">
        <p className="text-muted-foreground">
          No payouts yet. Request a payout when your balance reaches $50.
        </p>
      </BrandCard>
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((payout) => (
        <BrandCard key={payout.id} variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">
                {formatCurrency(payout.amount, payout.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                Requested {format(new Date(payout.requested_at), "MMM d, yyyy")}
              </p>
              {payout.processed_at && (
                <p className="text-xs text-muted-foreground">
                  Processed {format(new Date(payout.processed_at), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(payout.status)}
              {payout.failure_reason && (
                <p className="text-xs text-destructive mt-1 max-w-[200px]">
                  {payout.failure_reason}
                </p>
              )}
            </div>
          </div>
        </BrandCard>
      ))}
    </div>
  );
};

export default AffiliatePayoutHistory;
