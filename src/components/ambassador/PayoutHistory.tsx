import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, Loader2, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAmbassadorPayouts } from "@/hooks/useAmbassadorPayouts";

export const PayoutHistory = () => {
  const { payouts, isLoading, isRealTimeConnected } = useAmbassadorPayouts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Payout History</CardTitle>
              <CardDescription>
                Track your payout requests and status
              </CardDescription>
            </div>
          </div>
          {isRealTimeConnected && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payouts yet</p>
            <p className="text-sm">Request a payout when your balance reaches $50</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      ${Number(payout.amount).toFixed(2)} {payout.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payout.requested_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {payout.failure_reason && (
                      <p className="text-sm text-destructive mt-1">
                        {payout.failure_reason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {payout.processed_at && payout.status === "completed" && (
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Completed {format(new Date(payout.processed_at), "MMM d")}
                    </p>
                  )}
                  {getStatusBadge(payout.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
