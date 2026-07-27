import { Helmet } from "react-helmet";
import { SITE_CONFIG } from "@/config/site";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  schema?: object;
  keywords?: string;
  noIndex?: boolean;
}

export const SEO = ({
  title,
  description = SITE_CONFIG.defaultDescription,
  canonical,
  image = SITE_CONFIG.defaultImage,
  type = "website",
  schema,
  keywords,
  noIndex = false,
}: SEOProps) => {
  // Title template: "{PageTitle} | Hostfluencer by Voyager"
  const fullTitle = title === SITE_CONFIG.siteNameFull 
    ? title 
    : `${title} | ${SITE_CONFIG.siteNameFull}`;
  
  // Auto-generate canonical from current pathname if not provided
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonicalUrl = `${SITE_CONFIG.productionUrl}${canonical || pathname}`;
  
  const imageUrl = image.startsWith("http") 
    ? image 
    : `${SITE_CONFIG.productionUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_CONFIG.siteNameFull} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

// Pre-built schema generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hostfluencer",
  url: SITE_CONFIG.productionUrl,
  logo: `${SITE_CONFIG.productionUrl}/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png`,
  description: SITE_CONFIG.defaultDescription,
  sameAs: [
    "https://www.instagram.com/hostfluencer",
    "https://www.tiktok.com/@hostfluencer"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@hostfluencer.com"
  }
});

export const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hostfluencer",
  url: SITE_CONFIG.productionUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_CONFIG.productionUrl}/marketplace?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_CONFIG.productionUrl}${item.url}`
  }))
});

// Blog-specific schema generators
export const generateBlogListSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Hostfluencer Blog",
  description: "Tips, guides, and insights for property hosts and content creators",
  url: `${SITE_CONFIG.productionUrl}/blog`,
  publisher: {
    "@type": "Organization",
    name: "Hostfluencer",
    url: SITE_CONFIG.productionUrl,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.productionUrl}/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png`,
      width: 600,
      height: 60
    }
  }
});

export const generateBlogPostSchema = (post: {
  title: string;
  description: string;
  image: string | null;
  datePublished: string;
  dateModified: string;
  authorName: string;
  url: string;
  tags?: string[] | null;
  category?: string | null;
  wordCount?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.description,
  image: post.image ? {
    "@type": "ImageObject",
    url: post.image,
    width: 1200,
    height: 630
  } : undefined,
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  author: {
    "@type": "Person",
    name: post.authorName,
    url: `${SITE_CONFIG.productionUrl}/about-us`
  },
  publisher: {
    "@type": "Organization",
    name: "Hostfluencer",
    url: SITE_CONFIG.productionUrl,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.productionUrl}/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png`,
      width: 600,
      height: 60
    }
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": post.url
  },
  keywords: post.tags?.join(", "),
  articleSection: post.category?.replace("-", " "),
  wordCount: post.wordCount
});

export default SEO;
