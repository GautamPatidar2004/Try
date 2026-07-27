import type { IndustryData, PlatformData, LocationData, PageContent, FAQItem } from "./types";
import { industries } from "./industries";
import { platforms, platformSlugs } from "./platforms";
import { locations, locationSlugs } from "./locations";
import type { ParsedParams } from "./types";

// Parse URL params and detect if segment2 is platform or location
export function parseParams(
  industrySlug: string,
  segment2?: string,
  segment3?: string
): ParsedParams {
  const industry = industries[industrySlug] || null;
  
  if (!industry) {
    return { industry: null, platform: null, location: null, isValid: false };
  }

  let platform: PlatformData | null = null;
  let location: LocationData | null = null;

  if (segment3) {
    // Three segments: industry/platform/location
    platform = platforms[segment2 || ""] || null;
    location = locations[segment3] || null;
  } else if (segment2) {
    // Two segments: could be industry/platform OR industry/location
    if (platformSlugs.includes(segment2)) {
      platform = platforms[segment2];
    } else if (locationSlugs.includes(segment2)) {
      location = locations[segment2];
    }
  }

  return {
    industry,
    platform,
    location,
    isValid: !!industry
  };
}

// Generate page title (for <title> tag)
export function generateTitle(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string {
  if (platform && location) {
    return `${platform.name} Creators for ${industry.plural} in ${location.name}`;
  }
  if (platform) {
    return `${platform.name} Creators for ${industry.plural}`;
  }
  if (location) {
    return `${industry.name} Influencer Marketing in ${location.name}`;
  }
  return `Influencer Marketing for ${industry.plural}`;
}

// Generate meta description
export function generateDescription(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string {
  const creatorCount = location?.creatorCount || parseInt(industry.stats.creators);
  
  if (platform && location) {
    return `Partner with ${creatorCount}+ verified ${platform.name} creators in ${location.name} for your ${industry.name.toLowerCase()}. Launch authentic influencer campaigns that drive results.`;
  }
  if (platform) {
    return `Connect with ${platform.name} creators specializing in ${industry.name.toLowerCase()} content. Access ${industry.stats.creators} verified creators with ${platform.avgEngagement} avg engagement.`;
  }
  if (location) {
    return `Find ${creatorCount}+ ${location.name} influencers for your ${industry.name.toLowerCase()}. Local creators who know your market and audience. Start your campaign today.`;
  }
  return `${industry.description} Connect with ${industry.stats.creators} verified creators. Launch your first campaign today.`;
}

// Generate H1 headline and highlighted text
export function generateHeadline(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): { headline: string; highlightedText: string } {
  if (platform && location) {
    return {
      headline: `Connect with ${location.name} ${platform.name} Creators`,
      highlightedText: `for Your ${industry.name}`
    };
  }
  if (platform) {
    return {
      headline: `${platform.name} Influencer Marketing`,
      highlightedText: `for ${industry.plural}`
    };
  }
  if (location) {
    return {
      headline: `${location.name} Creators`,
      highlightedText: `for ${industry.plural}`
    };
  }
  return {
    headline: "Influencer Marketing",
    highlightedText: `for ${industry.plural}`
  };
}

// Generate subheadline
export function generateSubheadline(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string {
  if (platform && location) {
    return `Access ${location.creatorCount}+ verified ${platform.name} creators in ${location.name}. Launch ${industry.name.toLowerCase()} campaigns that resonate with local audiences.`;
  }
  if (platform) {
    return `Partner with ${platform.name} creators who specialize in ${industry.name.toLowerCase()} content. Average ${platform.avgEngagement} engagement rate.`;
  }
  if (location) {
    return `Connect with ${location.creatorCount}+ ${location.name}-based creators who understand your local market. Authentic content that drives real results.`;
  }
  return industry.description;
}

// Generate badge text
export function generateBadge(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string {
  if (platform && location) {
    return `${platform.name} • ${location.name} • ${industry.plural}`;
  }
  if (platform) {
    return `${platform.name} for ${industry.plural}`;
  }
  if (location) {
    return `${location.name} ${industry.name} Marketing`;
  }
  return `For ${industry.plural}`;
}

// Generate keywords
export function generateKeywords(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string {
  const keywords: string[] = [
    `${industry.name.toLowerCase()} influencer marketing`,
    `${industry.name.toLowerCase()} content creators`,
    `${industry.plural.toLowerCase()} marketing`
  ];

  if (platform) {
    keywords.push(
      `${platform.name.toLowerCase()} ${industry.name.toLowerCase()}`,
      `${platform.name.toLowerCase()} creators for ${industry.plural.toLowerCase()}`,
      `${industry.name.toLowerCase()} ${platform.name.toLowerCase()} marketing`
    );
  }

  if (location) {
    keywords.push(
      `${location.name.toLowerCase()} ${industry.name.toLowerCase()} influencers`,
      `${location.name.toLowerCase()} content creators`,
      `influencer marketing ${location.name.toLowerCase()}`
    );
  }

  if (platform && location) {
    keywords.push(
      `${platform.name.toLowerCase()} creators ${location.name.toLowerCase()}`,
      `${location.name.toLowerCase()} ${platform.name.toLowerCase()} influencers`
    );
  }

  return keywords.join(", ");
}

// Generate canonical URL
export function generateCanonical(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string {
  let path = `/brands/${industry.slug}`;
  if (platform) path += `/${platform.slug}`;
  if (location) path += `/${location.slug}`;
  return path;
}

// Generate combined FAQs
export function generateFAQs(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): FAQItem[] {
  const faqs: FAQItem[] = [...industry.faqs];

  if (platform) {
    faqs.push({
      question: `Why use ${platform.name} for ${industry.name.toLowerCase()} marketing?`,
      answer: `${platform.name} reaches ${platform.audienceDemo}. With ${platform.avgEngagement} average engagement, it's ideal for ${industry.name.toLowerCase()} brands looking to connect authentically with potential customers.`
    });
    faqs.push({
      question: `What content formats work best on ${platform.name}?`,
      answer: `For ${industry.plural.toLowerCase()}, the most effective ${platform.name} formats include: ${platform.contentFormats.slice(0, 3).join(", ")}. These formats drive the highest engagement for ${industry.name.toLowerCase()} content.`
    });
  }

  if (location) {
    faqs.push({
      question: `How many creators are available in ${location.name}?`,
      answer: `We have ${location.creatorCount}+ verified creators based in ${location.name}, ${location.state}. Popular niches include ${location.popularNiches.slice(0, 3).join(", ")}.`
    });
    faqs.push({
      question: `Why work with ${location.name} local creators?`,
      answer: `Local ${location.name} creators understand your market, have established local followings, and create content that resonates with the ${location.region} audience. They can feature location-specific content that tourists and locals alike engage with.`
    });
  }

  return faqs;
}

// Generate complete page content
export function generatePageContent(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): PageContent {
  const headline = generateHeadline(industry, platform, location);
  
  return {
    title: generateTitle(industry, platform, location),
    description: generateDescription(industry, platform, location),
    headline: headline.headline,
    highlightedText: headline.highlightedText,
    subheadline: generateSubheadline(industry, platform, location),
    badge: generateBadge(industry, platform, location),
    keywords: generateKeywords(industry, platform, location),
    canonical: generateCanonical(industry, platform, location)
  };
}

// Get niches to display (combine platform and location niches)
export function getNiches(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): string[] {
  const niches = new Set<string>();
  
  if (platform) {
    platform.creatorNiches.forEach(n => niches.add(n));
  }
  
  if (location) {
    location.popularNiches.forEach(n => niches.add(n));
  }
  
  if (!platform && !location) {
    // Default niches for industry-only pages
    niches.add("Travel & Lifestyle");
    niches.add("Luxury");
    niches.add("Food & Dining");
    niches.add("Photography");
    niches.add("Adventure");
    niches.add("Wellness");
  }
  
  return Array.from(niches).slice(0, 8);
}

// Get stats for display
export function getStats(
  industry: IndustryData,
  platform?: PlatformData | null,
  location?: LocationData | null
): { label: string; value: string }[] {
  const stats = [
    { label: "Verified Creators", value: location?.creatorCount ? `${location.creatorCount}+` : industry.stats.creators },
    { label: "Campaigns Completed", value: industry.stats.campaigns },
    { label: "Average Reach", value: industry.stats.avgReach }
  ];

  if (platform) {
    stats.push({ label: "Avg Engagement", value: platform.avgEngagement });
  }

  return stats;
}
