import { LucideIcon } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface DeliverableItem {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface CollaborationType {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface ProblemItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface IndustryData {
  slug: string;
  name: string;
  plural: string;
  description: string;
  icon: LucideIcon;
  problems: ProblemItem[];
  deliverables: DeliverableItem[];
  collaborationTypes: CollaborationType[];
  faqs: FAQItem[];
  stats: {
    avgReach: string;
    creators: string;
    campaigns: string;
  };
}

export interface PlatformData {
  slug: string;
  name: string;
  icon: LucideIcon;
  creatorNiches: string[];
  contentFormats: string[];
  avgEngagement: string;
  audienceDemo: string;
  color: string;
}

export interface LocationData {
  slug: string;
  name: string;
  state: string;
  region: string;
  creatorCount: number;
  popularNiches: string[];
}

export interface PageContent {
  title: string;
  description: string;
  headline: string;
  highlightedText: string;
  subheadline: string;
  badge: string;
  keywords: string;
  canonical: string;
}

export interface ParsedParams {
  industry: IndustryData | null;
  platform: PlatformData | null;
  location: LocationData | null;
  isValid: boolean;
}
