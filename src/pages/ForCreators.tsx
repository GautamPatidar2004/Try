import Navigation from "@/components/Navigation";
import CreatorHero from "@/components/CreatorHero";
import CreatorFeatures from "@/components/CreatorFeatures";
import CreatorShowcase from "@/components/CreatorShowcase";
import CreatorCTA from "@/components/CreatorCTA";
import Footer from "@/components/Footer";
import { useReferralCapture } from "@/hooks/useReferralCapture";
import { SEO, generateBreadcrumbSchema } from "@/components/SEO";

const ForCreators = () => {
  useReferralCapture();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "For Creators", url: "/for-creators" }
  ]);
  
  return (
    <div className="min-h-screen">
      <SEO
        title="For Creators - Get Paid Stays & Brand Deals"
        description="Join Hostfluencer to access exclusive paid stays, brand collaborations, and grow your content creator career. Connect with top hospitality brands."
        canonical="/for-creators"
        keywords="travel creator, influencer collaborations, paid stays, content creator jobs, ugc creator, brand deals"
        schema={breadcrumbSchema}
      />
      <Navigation />
      <CreatorHero />
      <CreatorFeatures />
      <CreatorShowcase />
      <CreatorCTA />
      <Footer />
    </div>
  );
};

export default ForCreators;