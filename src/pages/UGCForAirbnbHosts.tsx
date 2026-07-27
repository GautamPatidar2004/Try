import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO, generateFAQSchema, generateBreadcrumbSchema } from "@/components/SEO";
import { useReferralCapture } from "@/hooks/useReferralCapture";
import { ugcForAirbnbHostsData } from "@/data/seo-landing-pages";

import SEOLandingHero from "@/components/seo-landing/SEOLandingHero";
import ProblemStatement from "@/components/seo-landing/ProblemStatement";
import SolutionSteps from "@/components/seo-landing/SolutionSteps";
import DeliverablesShowcase from "@/components/seo-landing/DeliverablesShowcase";
import HostPricingCallout from "@/components/seo-landing/HostPricingCallout";
import SEOLandingFAQ from "@/components/seo-landing/SEOLandingFAQ";
import SEOLandingCTA from "@/components/seo-landing/SEOLandingCTA";

const UGCForAirbnbHosts = () => {
  useReferralCapture();
  const data = ugcForAirbnbHostsData;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "UGC for Airbnb Hosts", url: `/${data.slug}` }
  ]);

  const faqSchema = generateFAQSchema(data.faqs);

  const combinedSchema = [breadcrumbSchema, faqSchema];

  return (
    <div className="min-h-screen">
      <SEO
        title={data.seo.title}
        description={data.seo.description}
        canonical={`/${data.slug}`}
        keywords={data.seo.keywords}
        schema={combinedSchema}
      />
      <Navigation />
      
      <SEOLandingHero
        badge={data.hero.badge}
        headline={data.hero.headline}
        highlightedText={data.hero.highlightedText}
        subheadline={data.hero.subheadline}
        primaryCTA={data.hero.primaryCTA}
        secondaryCTA={data.hero.secondaryCTA}
      />
      
      <ProblemStatement
        title={data.problems.title}
        subtitle={data.problems.subtitle}
        items={data.problems.items}
      />
      
      <SolutionSteps
        title={data.solution.title}
        subtitle={data.solution.subtitle}
        steps={data.solution.steps}
      />
      
      <DeliverablesShowcase
        title={data.deliverables.title}
        subtitle={data.deliverables.subtitle}
        items={data.deliverables.items}
      />
      
      <HostPricingCallout
        title={data.pricing.title}
        subtitle={data.pricing.subtitle}
        highlight={data.pricing.highlight}
        ctaText={data.pricing.ctaText}
      />
      
      <SEOLandingFAQ faqs={data.faqs} />
      
      <SEOLandingCTA
        headline={data.finalCTA.headline}
        subheadline={data.finalCTA.subheadline}
        buttonText={data.finalCTA.buttonText}
      />
      
      <Footer />
    </div>
  );
};

export default UGCForAirbnbHosts;
