import { useState } from "react";
import { ShoppingBag, Home, Utensils, Ticket, Clock, CheckCircle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/ui/brand-card";
import { format } from "date-fns";
import { AffiliateConversion } from "@/hooks/useAffiliateConversions";

interface AffiliateConversionHistoryProps {
  conversions: AffiliateConversion[];
  isLoading: boolean;
}

const AffiliateConversionHistory = ({ conversions, isLoading }: AffiliateConversionHistoryProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredConversions = statusFilter === "all"
    ? conversions
    : conversions.filter(c => c.status === statusFilter);

  const getConversionIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Home className="h-4 w-4" />;
      case "product_sale":
        return <ShoppingBag className="h-4 w-4" />;
      case "restaurant_reservation":
        return <Utensils className="h-4 w-4" />;
      case "experience":
        return <Ticket className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="gap-1 border-primary/20 text-primary bg-primary/10">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="gap-1 border-emerald-500/20 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
            <DollarSign className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
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
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "paid"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Conversions List */}
      {filteredConversions.length === 0 ? (
        <BrandCard variant="default" className="text-center py-8">
          <p className="text-muted-foreground">
            {statusFilter === "all"
              ? "No conversions yet. Share your code with followers to start earning!"
              : `No ${statusFilter} conversions.`}
          </p>
        </BrandCard>
      ) : (
        <div className="space-y-3">
          {filteredConversions.map((conversion) => (
            <BrandCard key={conversion.id} variant="default" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {getConversionIcon(conversion.conversion_type)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {conversion.conversion_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conversion.converted_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    {getStatusBadge(conversion.status)}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(conversion.order_amount, conversion.currency)}
                    </span>
                    <span className="mx-1">→</span>
                    <span className="font-semibold text-primary">
                      +{formatCurrency(conversion.commission_amount, conversion.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </BrandCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AffiliateConversionHistory;
