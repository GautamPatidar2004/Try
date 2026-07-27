import { useState, lazy, Suspense } from "react";
import { useAmbassador } from "@/hooks/useAmbassador";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2, FileText } from "lucide-react";
import { ReferralLinkGenerator } from "./ReferralLinkGenerator";
import { CollaborationTracker } from "./CollaborationTracker";
// Lazy: carries react-pdf/pdfjs — only load the chunk when the modal opens.
const AmbassadorContractModal = lazy(() =>
  import("./AmbassadorContractModal").then((m) => ({ default: m.AmbassadorContractModal })),
);
import { EarningsOverview } from "./EarningsOverview";
import { QuickWinCard } from "./QuickWinCard";
import { ProgressSection } from "./ProgressSection";
import { AchievementBanner } from "./gamification";
import { BrandCard } from "@/components/ui/brand-card";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { PayoutSettings } from "./PayoutSettings";
import { PayoutHistory } from "./PayoutHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AmbassadorDashboard = () => {
  const { ambassador, isLoading, isAmbassador, isPending, enroll, enrolling, signContract, signingContract, getReferralLink } = useAmbassador();
  const [showContractModal, setShowContractModal] = useState(false);

  const handleEnroll = () => {
    enroll(undefined, {
      onSuccess: () => {
        setShowContractModal(true);
      },
    });
  };

  const handleContractSigned = (data: { signatureData: string; legalName: string }) => {
    signContract(data, {
      onSuccess: () => {
        setShowContractModal(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  // If pending contract signature, show contract signing screen
  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 sm:py-8 px-4 sm:px-0">
        <BrandCard variant="gradient" className="p-6 sm:p-8 text-center">
          <AnimatedIcon animation="bounce" size="lg" className="mx-auto mb-4 bg-brand-green/10">
            <FileText className="h-8 w-8 text-brand-green" />
          </AnimatedIcon>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Complete Your Enrollment</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            You're almost there! Please review and sign the Ambassador Agreement to activate your account.
          </p>
          
          <Button 
            onClick={() => setShowContractModal(true)} 
            size="lg"
            className="bg-brand-green hover:bg-brand-green/90 min-h-[44px] touch-manipulation"
          >
            <FileText className="mr-2 h-4 w-4" />
            Review & Sign Agreement
          </Button>
        </BrandCard>

        {showContractModal && (
          <Suspense fallback={null}>
            <AmbassadorContractModal
              open={showContractModal}
              onOpenChange={setShowContractModal}
              onContractSigned={handleContractSigned}
              isSubmitting={signingContract}
            />
          </Suspense>
        )}
      </div>
    );
  }

  if (!isAmbassador) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 sm:py-8 px-4 sm:px-0">
        <BrandCard variant="glow" className="p-6 sm:p-8 text-center">
          <AnimatedIcon animation="float" size="lg" className="mx-auto mb-4 bg-yellow-500/10">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </AnimatedIcon>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Join the Ambassador Program</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Earn recurring commissions and flat fees by connecting creators with properties and businesses.
          </p>
          
          {/* Benefits grid - responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="p-4 border border-brand-green/20 rounded-lg bg-brand-green/5">
              <div className="text-2xl font-bold text-brand-green mb-1">20%</div>
              <div className="text-sm text-muted-foreground">Recurring Commission</div>
            </div>
            <div className="p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
              <div className="text-2xl font-bold text-blue-600 mb-1">$500</div>
              <div className="text-sm text-muted-foreground">Property Match</div>
            </div>
            <div className="p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
              <div className="text-2xl font-bold text-purple-600 mb-1">$100</div>
              <div className="text-sm text-muted-foreground">Restaurant Match</div>
            </div>
          </div>

          <Button 
            onClick={handleEnroll} 
            disabled={enrolling} 
            size="lg"
            className="bg-brand-green hover:bg-brand-green/90 min-h-[44px] touch-manipulation"
          >
            {enrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Become an Ambassador
              </>
            )}
          </Button>
        </BrandCard>

        {showContractModal && (
          <Suspense fallback={null}>
            <AmbassadorContractModal
              open={showContractModal}
              onOpenChange={setShowContractModal}
              onContractSigned={handleContractSigned}
              isSubmitting={signingContract}
            />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 w-full overflow-hidden">
      {/* Achievement Banner */}
      <AchievementBanner />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
          Ambassador Dashboard
        </h1>
      </div>

      {/* Earnings Overview - Hero stat */}
      <EarningsOverview />

      {/* Quick Win Tip */}
      <QuickWinCard />

      {/* Share Your Link */}
      <ReferralLinkGenerator referralLink={getReferralLink()} />

      {/* Tabbed Content */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="mt-4 space-y-4">
          <ProgressSection />
        </TabsContent>
        
        <TabsContent value="payouts" className="mt-4 space-y-4">
          <PayoutSettings />
          <PayoutHistory />
        </TabsContent>
        
        <TabsContent value="collaborations" className="mt-4 space-y-4">
          <CollaborationTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};
