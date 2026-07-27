import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, Award } from "lucide-react";
import { ReferralStatsCard } from "./ReferralStatsCard";
import { ReferralCodesManagement } from "./ReferralCodesManagement";
import { ReferralsTracking } from "./ReferralsTracking";
import { CommissionsManagement } from "./CommissionsManagement";
import { TopReferrersCard } from "./TopReferrersCard";
import { useReferralManagement } from "@/hooks/useReferralManagement";

export const ReferralProgramDashboard = () => {
  const {
    referralCodes,
    referrals,
    commissions,
    stats,
    loading,
    toggleCodeStatus,
    updateCommissionStatus,
    getTopReferrers
  } = useReferralManagement();

  const topReferrers = getTopReferrers();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReferralStatsCard
          title="Total Referrals"
          value={stats.totalReferrals}
          icon={Users}
          subtitle="All-time signups"
        />
        <ReferralStatsCard
          title="Active Referrals"
          value={stats.activeReferrals}
          icon={TrendingUp}
          subtitle="With paid subscriptions"
        />
        <ReferralStatsCard
          title="Commissions Paid"
          value={`$${stats.totalCommissionsPaid.toFixed(2)}`}
          icon={DollarSign}
          subtitle="Total earnings distributed"
        />
        <ReferralStatsCard
          title="Pending Commissions"
          value={`$${stats.pendingCommissions.toFixed(2)}`}
          icon={Award}
          subtitle="Awaiting payment"
        />
      </div>

      {/* Conversion Rate */}
      <div className="grid gap-4 md:grid-cols-3">
        <ReferralStatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="Signups → Paid users"
        />
        <div className="md:col-span-2">
          <TopReferrersCard topReferrers={topReferrers} />
        </div>
      </div>

      {/* Detailed Management Tabs */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes">Referral Codes</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          <ReferralCodesManagement
            referralCodes={referralCodes}
            onToggleStatus={toggleCodeStatus}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <ReferralsTracking referrals={referrals} />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <CommissionsManagement
            commissions={commissions}
            onUpdateStatus={updateCommissionStatus}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
