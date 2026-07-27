import { Instagram, Video, Youtube } from "lucide-react";
import type { PlatformData } from "./types";

export const platforms: Record<string, PlatformData> = {
  instagram: {
    slug: "instagram",
    name: "Instagram",
    icon: Instagram,
    creatorNiches: [
      "Travel & Lifestyle",
      "Luxury & Fashion",
      "Food & Dining",
      "Wellness & Fitness",
      "Photography",
      "Family & Parenting",
      "Adventure & Outdoor",
      "Beauty & Skincare"
    ],
    contentFormats: [
      "Reels (15-90 seconds)",
      "Carousel Posts",
      "Stories (24-hour)",
      "Story Highlights",
      "Live Streams",
      "Collaborative Posts"
    ],
    avgEngagement: "3.5%",
    audienceDemo: "25-44 year olds, slight female skew, high-intent travelers and lifestyle enthusiasts",
    color: "pink"
  },
  tiktok: {
    slug: "tiktok",
    name: "TikTok",
    icon: Video,
    creatorNiches: [
      "Travel Hacks",
      "Food Reviews",
      "Hidden Gems",
      "GRWM & Lifestyle",
      "Comedy & Entertainment",
      "POV Content",
      "Day-in-the-Life",
      "Budget Travel"
    ],
    contentFormats: [
      "Short Videos (15-60 sec)",
      "Longer Stories (1-3 min)",
      "Duets & Stitches",
      "Trends & Challenges",
      "LIVE Streams",
      "Photo Carousels"
    ],
    avgEngagement: "5.7%",
    audienceDemo: "18-34 year olds, Gen Z and young millennials, discovery-focused users seeking authentic content",
    color: "cyan"
  },
  youtube: {
    slug: "youtube",
    name: "YouTube",
    icon: Youtube,
    creatorNiches: [
      "Travel Vlogs",
      "Hotel Reviews",
      "Destination Guides",
      "Food Tourism",
      "Luxury Travel",
      "Budget Travel",
      "Adventure & Outdoor",
      "City Guides"
    ],
    contentFormats: [
      "Long-form Vlogs (10-30 min)",
      "YouTube Shorts",
      "Property Tours",
      "Review Videos",
      "Travel Documentaries",
      "Compilation Videos"
    ],
    avgEngagement: "2.1%",
    audienceDemo: "25-54 year olds, research-oriented travelers, high purchase intent for travel and experiences",
    color: "red"
  }
};

export const platformList = Object.values(platforms);
export const platformSlugs = Object.keys(platforms);
