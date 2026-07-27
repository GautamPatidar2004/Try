import { useState } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandCard } from "@/components/ui/brand-card";
import { useCreatorAffiliateCodes } from "@/hooks/useCreatorAffiliateCodes";
import { useAffiliateEarnings } from "@/hooks/useAffiliateEarnings";
import { useAffiliateConversions } from "@/hooks/useAffiliateConversions";
import AffiliateStatsOverview from "./AffiliateStatsOverview";
import AffiliateCodeCard from "./AffiliateCodeCard";
import AffiliateConversionHistory from "./AffiliateConversionHistory";
import AffiliatePayoutHistory from "./AffiliatePayoutHistory";
import RequestAffiliatePayoutDialog from "./RequestAffiliatePayoutDialog";
import CampaignAffiliateLinks from "./CampaignAffiliateLinks";
import { useCampaignAffiliateLinks } from "@/hooks/useCampaignAffiliateLinks";
import ImpactDashboard from "./impact/ImpactDashboard";

const MINIMUM_PAYOUT = 5000; // $50.00 in cents

const CreatorAffiliateSection = () => {
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const {
    affiliateCodes,
    activeCodes,
    isLoading: codesLoading,
    toggleCodeStatus,
    isTogglingStatus,
  } = useCreatorAffiliateCodes();

  const {
    earnings,
    payouts,
    isLoading: earningsLoading,
    requestPayout,
    isRequestingPayout,
  } = useAffiliateEarnings();

  const {
    conversions,
    isLoading: conversionsLoading,
  } = useAffiliateConversions({ role: "creator" });

  const { links: campaignLinks, eligibleCampaigns } = useCampaignAffiliateLinks();
  const hasCampaignAffiliate = campaignLinks.length > 0 || eligibleCampaigns.length > 0;

  const isLoading = codesLoading || earningsLoading;
  const hasPendingPayout = payouts.some(p => p.status === "pending" || p.status === "processing");

  const handleRequestPayout = () => {
    requestPayout();
    setShowPayoutDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state when no affiliate codes
  if (affiliateCodes.length === 0 && !hasCampaignAffiliate) {
    return (
      <div className="space-y-6">
        <BrandCard variant="gradient" className="text-center py-8">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <DollarSign className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No In-House Affiliate Codes Yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete a host collaboration or get accepted into a brand campaign to receive trackable codes. Your Impact.com data is shown below.
            </p>
          </div>
        </BrandCard>
        <ImpactDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <AffiliateStatsOverview
        earnings={earnings}
        activeCodesCount={activeCodes.length}
        totalConversions={conversions.length}
      />

      {/* Request Payout Button */}
      {earnings.availableForPayout > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowPayoutDialog(true)}
            className="gap-2"
            disabled={earnings.availableForPayout < MINIMUM_PAYOUT || hasPendingPayout}
          >
            <DollarSign className="h-4 w-4" />
            Request Payout
          </Button>
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="codes">My Codes</TabsTrigger>
          <TabsTrigger value="campaigns">Brand Links</TabsTrigger>
          <TabsTrigger value="impact">Impact.com</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          {affiliateCodes.map((code) => (
            <AffiliateCodeCard
              key={code.id}
              code={code}
              onToggleStatus={(codeId, isActive) => toggleCodeStatus({ codeId, isActive })}
              isTogglingStatus={isTogglingStatus}
            />
          ))}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignAffiliateLinks />
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <ImpactDashboard />
        </TabsContent>

        <TabsContent value="conversions">
          <AffiliateConversionHistory
            conversions={conversions}
            isLoading={conversionsLoading}
          />
        </TabsContent>

        <TabsContent value="payouts">
          <AffiliatePayoutHistory
            payouts={payouts}
            isLoading={earningsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Payout Dialog */}
      <RequestAffiliatePayoutDialog
        open={showPayoutDialog}
        onOpenChange={setShowPayoutDialog}
        availableBalance={earnings.availableForPayout}
        minimumPayout={MINIMUM_PAYOUT}
        onRequestPayout={handleRequestPayout}
        isRequesting={isRequestingPayout}
        hasPendingPayout={hasPendingPayout}
      />
    </div>
  );
};

export default CreatorAffiliateSection;
