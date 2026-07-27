import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Code, ArrowRightLeft, Wallet, Percent } from "lucide-react";
import { useAdminAffiliateManagement } from "@/hooks/useAdminAffiliateManagement";
import { AffiliateStatsCard } from "./AffiliateStatsCard";
import { TopAffiliatesCard } from "./TopAffiliatesCard";
import { AffiliateCodesManagement } from "./AffiliateCodesManagement";
import { AffiliateConversionsManagement } from "./AffiliateConversionsManagement";
import { AffiliatePayoutsManagement } from "./AffiliatePayoutsManagement";

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export const AffiliateManagementDashboard = () => {
  const {
    codes,
    conversions,
    payouts,
    stats,
    topAffiliates,
    isLoading,
    toggleCodeStatus,
    updateConversionStatus,
    processPayoutManually,
    rejectPayout,
  } = useAdminAffiliateManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Percent className="h-6 w-6" />
          Creator Affiliates
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage affiliate codes, track conversions, and process payouts
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AffiliateStatsCard
          title="Total Affiliate Codes"
          value={stats.totalCodes}
          icon={Code}
          subtitle={`${stats.activeCodes} active`}
        />
        <AffiliateStatsCard
          title="Active Conversions"
          value={stats.pendingConversions + conversions.filter(c => c.status === "confirmed").length}
          icon={ArrowRightLeft}
          subtitle={`${stats.pendingConversions} pending confirmation`}
        />
        <AffiliateStatsCard
          title="Total Paid Out"
          value={formatCurrency(stats.totalCommissionPaid)}
          icon={Wallet}
          subtitle={`${formatCurrency(stats.totalCommissionGenerated)} total generated`}
        />
        <AffiliateStatsCard
          title="Pending Payouts"
          value={formatCurrency(stats.pendingPayoutsAmount)}
          icon={Wallet}
          subtitle={`${stats.pendingPayoutsCount} requests`}
        />
      </div>

      {/* Top Affiliates */}
      <TopAffiliatesCard affiliates={topAffiliates} />

      {/* Tabs */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes" className="gap-2">
            <Code className="h-4 w-4" />
            Codes ({codes.length})
          </TabsTrigger>
          <TabsTrigger value="conversions" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Conversions ({conversions.length})
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <Wallet className="h-4 w-4" />
            Payouts ({payouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          <AffiliateCodesManagement
            codes={codes}
            toggleCodeStatus={toggleCodeStatus}
          />
        </TabsContent>

        <TabsContent value="conversions">
          <AffiliateConversionsManagement
            conversions={conversions}
            updateConversionStatus={updateConversionStatus}
          />
        </TabsContent>

        <TabsContent value="payouts">
          <AffiliatePayoutsManagement
            payouts={payouts}
            processPayoutManually={processPayoutManually}
            rejectPayout={rejectPayout}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
