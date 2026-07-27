import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { AffiliatePayout } from "@/hooks/useAdminAffiliateManagement";
import { UseMutationResult } from "@tanstack/react-query";
import { PayoutProcessModal } from "./PayoutProcessModal";

interface AffiliatePayoutsManagementProps {
  payouts: AffiliatePayout[];
  processPayoutManually: UseMutationResult<void, Error, { payoutId: string; stripeTransferId?: string }>;
  rejectPayout: UseMutationResult<void, Error, { payoutId: string; reason: string }>;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">Pending</Badge>;
    case "processing":
      return <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">Processing</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">Completed</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const AffiliatePayoutsManagement = ({
  payouts,
  processPayoutManually,
  rejectPayout,
}: AffiliatePayoutsManagementProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<AffiliatePayout | null>(null);
  const [modalMode, setModalMode] = useState<"process" | "reject">("process");

  const filteredPayouts = payouts.filter((payout) => {
    return statusFilter === "all" || payout.status === statusFilter;
  });

  const getCreatorName = (payout: AffiliatePayout) => {
    if (!payout.creator?.profiles) return "Unknown";
    const { first_name, last_name } = payout.creator.profiles;
    return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";
  };

  const handleOpenModal = (payout: AffiliatePayout, mode: "process" | "reject") => {
    setSelectedPayout(payout);
    setModalMode(mode);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Stripe ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getCreatorName(payout)}</div>
                          {payout.creator?.stripe_connect_id && (
                            <div className="text-xs text-muted-foreground">
                              Stripe Connected
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payout.amount)}
                      </TableCell>
                      <TableCell>{payout.conversion_ids?.length || 0}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(payout.requested_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payout.processed_at
                          ? format(new Date(payout.processed_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {payout.stripe_transfer_id ? (
                          <a
                            href={`https://dashboard.stripe.com/transfers/${payout.stripe_transfer_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            {payout.stripe_transfer_id.slice(0, 12)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payout.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleOpenModal(payout, "process")}
                              disabled={processPayoutManually.isPending}
                            >
                              {processPayoutManually.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleOpenModal(payout, "reject")}
                              disabled={rejectPayout.isPending}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                        {payout.status === "failed" && payout.failure_reason && (
                          <span className="text-xs text-red-600 max-w-[150px] truncate block">
                            {payout.failure_reason}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredPayouts.length} of {payouts.length} payouts
          </p>
        </CardContent>
      </Card>

      {selectedPayout && (
        <PayoutProcessModal
          payout={selectedPayout}
          mode={modalMode}
          open={!!selectedPayout}
          onClose={() => setSelectedPayout(null)}
          onProcess={(stripeTransferId) => {
            processPayoutManually.mutate(
              { payoutId: selectedPayout.id, stripeTransferId },
              { onSuccess: () => setSelectedPayout(null) }
            );
          }}
          onReject={(reason) => {
            rejectPayout.mutate(
              { payoutId: selectedPayout.id, reason },
              { onSuccess: () => setSelectedPayout(null) }
            );
          }}
          isProcessing={processPayoutManually.isPending || rejectPayout.isPending}
        />
      )}
    </>
  );
};
