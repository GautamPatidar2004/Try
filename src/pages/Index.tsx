import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollProgress } from "@/components/shared/ScrollProgress";
import { EditorialHero } from "@/components/landing/editorial/EditorialHero";
import { LatestOpportunitiesPreview } from "@/components/landing/editorial/LatestOpportunitiesPreview";
import { EditorialStatsRow } from "@/components/landing/editorial/EditorialStatsRow";
import { EditorialHowItWorks } from "@/components/landing/editorial/EditorialHowItWorks";
import { EditorialFinalCallout } from "@/components/landing/editorial/EditorialFinalCallout";
import { ScrollSignupPopup } from "@/components/landing/ScrollSignupPopup";
import { useReferralCapture } from "@/hooks/useReferralCapture";
import { SEO, generateOrganizationSchema, generateWebSiteSchema } from "@/components/SEO";

const Index = () => {
  const { user, isReady } = useAuth();

  useReferralCapture();

  useEffect(() => {
    if (isReady && user) {
      window.location.href = '/marketplace';
    }
  }, [isReady, user]);

  if (!isReady || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            {user ? 'Redirecting to marketplace...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [generateOrganizationSchema(), generateWebSiteSchema()]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="The feed for hospitality collabs"
        description="New stays, brand deals and creator collabs drop daily on Hostfluencer. Be the first to apply."
        canonical="/"
        keywords="hospitality collabs, creator collabs, vacation rental marketing, UGC content, brand deals, influencer stays"
        schema={combinedSchema}
      />
      <ScrollProgress />
      <Navigation />
      <EditorialHero />
      <LatestOpportunitiesPreview />
      <EditorialStatsRow />
      <EditorialHowItWorks />
      <EditorialFinalCallout />
      <Footer />
      <ScrollSignupPopup />
    </div>
  );
};

export default Index;
