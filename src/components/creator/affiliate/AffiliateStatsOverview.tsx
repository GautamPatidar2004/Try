import { DollarSign, TrendingUp, Clock, CheckCircle, Code, BarChart3 } from "lucide-react";
import { BrandCard, StatCard } from "@/components/ui/brand-card";
import { EarningsSummary } from "@/hooks/useAffiliateEarnings";

interface AffiliateStatsOverviewProps {
  earnings: EarningsSummary;
  activeCodesCount: number;
  totalConversions: number;
}

const AffiliateStatsOverview = ({
  earnings,
  activeCodesCount,
  totalConversions,
}: AffiliateStatsOverviewProps) => {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Hero Earnings Card */}
      <BrandCard variant="gradient" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-sm text-muted-foreground mb-1">Total Lifetime Earnings</p>
          <p className="text-4xl font-bold text-foreground mb-4">
            {formatCurrency(earnings.totalLifetimeEarnings)}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>From affiliate commissions</span>
          </div>
        </div>
      </BrandCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">{formatCurrency(earnings.pendingEarnings)}</p>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-semibold">{formatCurrency(earnings.availableForPayout)}</p>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Code className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Codes</p>
              <p className="text-lg font-semibold">{activeCodesCount}</p>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="text-lg font-semibold">{totalConversions}</p>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Paid Earnings */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Total Paid Out</span>
        </div>
        <span className="font-semibold">{formatCurrency(earnings.paidEarnings)}</span>
      </div>
    </div>
  );
};

export default AffiliateStatsOverview;
