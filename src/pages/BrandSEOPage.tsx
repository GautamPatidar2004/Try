import { useParams, Navigate } from "react-router-dom";
import { SEO, generateBreadcrumbSchema, generateFAQSchema } from "@/components/SEO";
import { SITE_CONFIG } from "@/config/site";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Data and content generation
import { parseParams, generatePageContent, getNiches, getStats, generateFAQs } from "@/data/brand-seo-pages/content-generator";

// Components
import { BrandSEOHero } from "@/components/brand-seo/BrandSEOHero";
import { ProblemsSection } from "@/components/brand-seo/ProblemsSection";
import { CreatorNichesSection } from "@/components/brand-seo/CreatorNichesSection";
import { DeliverablesSection } from "@/components/brand-seo/DeliverablesSection";
import { CollaborationTypesSection } from "@/components/brand-seo/CollaborationTypesSection";
import { BrandStatsSection } from "@/components/brand-seo/BrandStatsSection";
import { BrandFAQSection } from "@/components/brand-seo/BrandFAQSection";
import { BrandCTASection } from "@/components/brand-seo/BrandCTASection";

const BrandSEOPage = () => {
  const { industry: industrySlug, segment2, platform: platformSlug, location: locationSlug } = useParams();

  // Parse params - segment2 could be platform OR location
  const parsed = parseParams(
    industrySlug || "",
    segment2 || platformSlug,
    locationSlug
  );

  // If invalid industry, redirect to 404
  if (!parsed.isValid || !parsed.industry) {
    return <Navigate to="/404" replace />;
  }

  const { industry, platform, location } = parsed;

  // Generate all page content
  const content = generatePageContent(industry, platform, location);
  const niches = getNiches(industry, platform, location);
  const stats = getStats(industry, platform, location);
  const faqs = generateFAQs(industry, platform, location);

  // Generate breadcrumbs
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "For Brands", url: "/for-brands" },
    { name: industry.plural, url: `/brands/${industry.slug}` }
  ];
  
  if (platform) {
    breadcrumbItems.push({ 
      name: platform.name, 
      url: `/brands/${industry.slug}/${platform.slug}` 
    });
  }
  
  if (location) {
    breadcrumbItems.push({ 
      name: location.name, 
      url: content.canonical 
    });
  }

  // Combined schema
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      generateBreadcrumbSchema(breadcrumbItems),
      generateFAQSchema(faqs),
      {
        "@type": "Service",
        "name": content.title,
        "description": content.description,
        "provider": {
          "@type": "Organization",
          "name": "Hostfluencer",
          "url": SITE_CONFIG.productionUrl
        },
        "serviceType": "Influencer Marketing",
        "areaServed": location ? {
          "@type": "City",
          "name": location.name,
          "containedInPlace": {
            "@type": "State",
            "name": location.state
          }
        } : {
          "@type": "Country",
          "name": "United States"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={content.title}
        description={content.description}
        canonical={content.canonical}
        keywords={content.keywords}
        schema={combinedSchema}
      />
      
      <Navigation />
      
      <main>
        <BrandSEOHero 
          content={content} 
          industry={industry} 
          platform={platform} 
          location={location} 
        />
        
        <ProblemsSection industry={industry} />
        
        <CreatorNichesSection 
          niches={niches} 
          platform={platform} 
          location={location} 
        />
        
        <DeliverablesSection 
          industry={industry} 
          platform={platform} 
        />
        
        <CollaborationTypesSection industry={industry} />
        
        <BrandStatsSection stats={stats} />
        
        <BrandFAQSection 
          faqs={faqs} 
          industryName={industry.name} 
        />
        
        <BrandCTASection 
          industry={industry} 
          location={location} 
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BrandSEOPage;
