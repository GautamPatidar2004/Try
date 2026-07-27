import { Camera, DollarSign, ImageOff, Smartphone, Users, Clock, RefreshCw, FileText, Search, MessageSquare, ShieldCheck, CalendarX, FileQuestion, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SEOLandingPageData {
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  hero: {
    badge: string;
    headline: string;
    highlightedText: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  problems: {
    title: string;
    subtitle: string;
    items: Array<{ icon: LucideIcon; title: string; description: string }>;
  };
  solution: {
    title: string;
    subtitle: string;
    steps: Array<{ step: number; title: string; description: string }>;
  };
  deliverables: {
    title: string;
    subtitle: string;
    items: Array<{ count: string; type: string; description: string }>;
  };
  pricing: {
    title: string;
    subtitle: string;
    highlight: string;
    ctaText: string;
  };
  faqs: Array<{ question: string; answer: string }>;
  finalCTA: {
    headline: string;
    subheadline: string;
    buttonText: string;
  };
}

export const ugcForAirbnbHostsData: SEOLandingPageData = {
  slug: "ugc-for-airbnb-hosts",
  seo: {
    title: "UGC for Airbnb Hosts",
    description: "Stop paying $4,500 for Airbnb content. Trade one empty night for 50+ professional photos, videos, and reels with full commercial rights.",
    keywords: "UGC for Airbnb, Airbnb content creator, Airbnb photography, Airbnb marketing, vacation rental UGC, property content"
  },
  hero: {
    badge: "For Airbnb Hosts",
    headline: "Stop Paying $4,500 for",
    highlightedText: "Airbnb UGC Content",
    subheadline: "Trade one empty night for a year's worth of professional photos, videos, and reels—all with full commercial rights.",
    primaryCTA: "List Your Property Free",
    secondaryCTA: "View Pricing"
  },
  problems: {
    title: "The Content Problem Every Airbnb Host Faces",
    subtitle: "Creating professional content for your listing is expensive and time-consuming",
    items: [
      {
        icon: DollarSign,
        title: "Photographers Charge $500-2,000",
        description: "A single photo session costs hundreds, and you'll need multiple to cover all angles and seasons"
      },
      {
        icon: Camera,
        title: "Videographers Add $1,000-3,000",
        description: "Video content is essential for standing out, but professional videography is prohibitively expensive"
      },
      {
        icon: ImageOff,
        title: "Stock Photos Look Fake",
        description: "Generic stock images hurt your bookings and make your listing blend in with the competition"
      },
      {
        icon: Smartphone,
        title: "DIY Can't Compete",
        description: "Amateur photos and videos can't match professional listings that dominate search results"
      }
    ]
  },
  solution: {
    title: "The Smarter Way to Get Airbnb Content",
    subtitle: "Trade an off-peak night for a complete content library",
    steps: [
      { step: 1, title: "List Your Property", description: "Create a free listing with your property details and content needs" },
      { step: 2, title: "Get Matched", description: "Our AI matches you with vetted creators whose style fits your property" },
      { step: 3, title: "Host for One Night", description: "The creator stays one off-peak night and produces 50+ content pieces" },
      { step: 4, title: "Own Forever", description: "Receive your content library with full ownership and commercial rights" }
    ]
  },
  deliverables: {
    title: "What You'll Receive",
    subtitle: "A complete content library from every collaboration",
    items: [
      { count: "50+", type: "Professional Photos", description: "High-resolution images of every room, angle, and detail" },
      { count: "10+", type: "Video Clips", description: "Cinematic walkthroughs and lifestyle footage" },
      { count: "5+", type: "Social Reels", description: "Ready-to-post content optimized for Instagram and TikTok" },
      { count: "100%", type: "Commercial Rights", description: "Use the content anywhere, forever—it's yours" }
    ]
  },
  pricing: {
    title: "Hosts Join Free",
    subtitle: "No subscription fees. No per-listing charges.",
    highlight: "$4,500+ in content value for the cost of one empty night",
    ctaText: "See Full Pricing"
  },
  faqs: [
    {
      question: "What is UGC and why do Airbnb hosts need it?",
      answer: "UGC (User-Generated Content) is authentic content created by real people rather than brands. For Airbnb hosts, UGC provides professional-quality photos and videos that feel genuine and relatable, helping your listing stand out and build trust with potential guests. Studies show listings with professional content receive 40% more bookings."
    },
    {
      question: "How does trading a night for content work?",
      answer: "You offer one off-peak night at your property to a vetted content creator. During their stay, they produce 50+ professional photos, videos, and social media content. You receive the complete content library within 7 days, and you own all rights to use it however you want."
    },
    {
      question: "Who owns the content after the collaboration?",
      answer: "You do—100%. All content created during a collaboration becomes your property with full commercial rights. You can use it on Airbnb, VRBO, social media, your website, or any marketing materials forever."
    },
    {
      question: "What types of content will I receive?",
      answer: "You'll receive 50+ high-resolution photos covering every room and detail, 10+ video clips including property walkthroughs, and 5+ ready-to-post social media reels. All content is professionally edited and delivered in formats optimized for each platform."
    },
    {
      question: "How do I get matched with the right creator?",
      answer: "Our AI analyzes your property type, location, and content needs to match you with creators whose portfolio style fits your aesthetic. You can review creator profiles and past work before accepting any match, ensuring you find the perfect fit."
    }
  ],
  finalCTA: {
    headline: "Stop Overpaying for Airbnb Content",
    subheadline: "Join 150+ property owners building professional content libraries through creator collaborations",
    buttonText: "Get Started Free"
  }
};

export const ugcForVacationRentalsData: SEOLandingPageData = {
  slug: "ugc-for-vacation-rentals",
  seo: {
    title: "Vacation Rental Content & Photography",
    description: "Get 50+ professional marketing assets for your vacation rental. Works with VRBO, Vacasa, and direct booking sites. Trade one night for a year of content.",
    keywords: "vacation rental content, VRBO photos, vacation rental photography, rental property marketing, beach house content, cabin photography"
  },
  hero: {
    badge: "For Vacation Rentals",
    headline: "Professional Content for Your",
    highlightedText: "Vacation Rental",
    subheadline: "Whether you're on VRBO, Vacasa, or direct booking, get 50+ marketing assets for the cost of one off-peak night.",
    primaryCTA: "List Your Property Free",
    secondaryCTA: "View Pricing"
  },
  problems: {
    title: "Standing Out in a Crowded Market",
    subtitle: "Your vacation rental competes with thousands—here's what's holding you back",
    items: [
      {
        icon: Users,
        title: "Thousands of Competitors",
        description: "Your listing competes with countless properties in your area, all fighting for the same guests"
      },
      {
        icon: Clock,
        title: "Guests Scroll Fast",
        description: "Travelers spend milliseconds on each listing—amateur photos mean instant rejection"
      },
      {
        icon: RefreshCw,
        title: "Seasonal Content Needs",
        description: "Beach houses, cabins, and seasonal rentals need fresh content that shows each season's appeal"
      },
      {
        icon: FileText,
        title: "Manual Updates Take Time",
        description: "Keeping content fresh across multiple platforms is time-consuming and overwhelming"
      }
    ]
  },
  solution: {
    title: "The Modern Approach to Rental Marketing",
    subtitle: "Get professional content without the professional price tag",
    steps: [
      { step: 1, title: "List Your Property", description: "Add your vacation rental with details about your unique features" },
      { step: 2, title: "Match with Creators", description: "We connect you with creators experienced in your property type" },
      { step: 3, title: "Host One Night", description: "A creator stays during an off-peak period and captures everything" },
      { step: 4, title: "Use Everywhere", description: "Deploy your content across VRBO, Airbnb, your website, and social media" }
    ]
  },
  deliverables: {
    title: "Your Complete Content Package",
    subtitle: "Everything you need to market your vacation rental",
    items: [
      { count: "50+", type: "Property Photos", description: "Interior, exterior, amenities, and detail shots" },
      { count: "10+", type: "Video Tours", description: "Walkthroughs, aerial shots, and lifestyle content" },
      { count: "5+", type: "Platform-Ready Reels", description: "Optimized for Instagram, TikTok, and Facebook" },
      { count: "100%", type: "Multi-Platform Rights", description: "Use on any booking platform or marketing channel" }
    ]
  },
  pricing: {
    title: "No Subscription Required",
    subtitle: "Hosts join completely free—pay nothing upfront",
    highlight: "Get $4,500+ in professional content for the cost of one quiet night",
    ctaText: "View Pricing Details"
  },
  faqs: [
    {
      question: "Do creators cover my property type (beach house, cabin, etc.)?",
      answer: "Yes! Our creator network includes specialists in every vacation rental type—beach houses, mountain cabins, lakefront cottages, urban lofts, and more. We match you with creators who have experience and portfolios featuring properties similar to yours."
    },
    {
      question: "Can I use the content on multiple booking platforms?",
      answer: "Absolutely. You receive full commercial rights to all content, meaning you can use it on VRBO, Airbnb, Vacasa, your direct booking website, social media, email marketing, and any other channel you choose."
    },
    {
      question: "How quickly will I receive my content?",
      answer: "Most creators deliver your complete content package within 7 days of their stay. Rush delivery options are available for time-sensitive needs. You'll receive everything in organized folders with files optimized for each platform."
    },
    {
      question: "What if I don't like the content?",
      answer: "We vet all creators carefully, and you can review their portfolios before accepting a match. If the delivered content doesn't meet the agreed-upon specifications, our team works with you to resolve any issues and ensure satisfaction."
    },
    {
      question: "Is this available for international properties?",
      answer: "Currently, we focus on properties in the United States and Canada, with expansion to additional countries planned. If you have an international property, contact us to discuss availability in your region."
    }
  ],
  finalCTA: {
    headline: "Transform Your Rental's Marketing Today",
    subheadline: "Join property owners who've built complete content libraries through smart collaborations",
    buttonText: "Start Free"
  }
};

export const influencerStaysForHostsData: SEOLandingPageData = {
  slug: "influencer-stays-for-hosts",
  seo: {
    title: "Influencer Stays for Hosts",
    description: "The modern way to market your property: vetted creators produce professional content in exchange for a single-night stay. Full contracts and accountability included.",
    keywords: "influencer stays, host influencer collaborations, influencer marketing property, creator stays, property influencer, vacation rental influencer"
  },
  hero: {
    badge: "Influencer Collaborations",
    headline: "Turn Empty Nights Into",
    highlightedText: "Marketing Gold",
    subheadline: "The modern way to market your property: vetted creators produce professional content in exchange for a single-night stay.",
    primaryCTA: "List Your Property Free",
    secondaryCTA: "Learn How It Works"
  },
  problems: {
    title: "The Influencer Marketing Struggle",
    subtitle: "Finding and working with creators shouldn't be this hard",
    items: [
      {
        icon: Search,
        title: "Finding Reliable Influencers",
        description: "Searching for trustworthy creators is hit-or-miss, with no way to verify their work quality"
      },
      {
        icon: MessageSquare,
        title: "Endless Negotiations",
        description: "Back-and-forth DMs about terms, expectations, and deliverables waste hours of your time"
      },
      {
        icon: FileQuestion,
        title: "Unclear Expectations",
        description: "Without formal agreements, you never know exactly what you'll receive—or when"
      },
      {
        icon: ShieldCheck,
        title: "No Accountability",
        description: "Informal arrangements mean no recourse if a creator doesn't deliver as promised"
      }
    ]
  },
  solution: {
    title: "Influencer Collaborations, Done Right",
    subtitle: "We handle the vetting, contracts, and accountability so you don't have to",
    steps: [
      { step: 1, title: "Create Your Listing", description: "Tell us about your property and the content you need" },
      { step: 2, title: "Review Vetted Creators", description: "Browse pre-screened creators with verified portfolios and reviews" },
      { step: 3, title: "Accept a Match", description: "Choose your creator—we handle contracts and expectations" },
      { step: 4, title: "Receive Guaranteed Content", description: "Get your deliverables on time, backed by our satisfaction guarantee" }
    ]
  },
  deliverables: {
    title: "Guaranteed Deliverables",
    subtitle: "Every collaboration includes contractually-agreed content",
    items: [
      { count: "50+", type: "Professional Photos", description: "Lifestyle and property images shot by experienced creators" },
      { count: "10+", type: "Video Content", description: "Tours, reels, and B-roll footage for your marketing" },
      { count: "5+", type: "Social Posts", description: "Ready-to-share content tagged and optimized for reach" },
      { count: "Full", type: "Usage Rights", description: "Commercial rights included with every collaboration" }
    ]
  },
  pricing: {
    title: "Zero Cost to Join",
    subtitle: "List your property and start receiving creator applications for free",
    highlight: "Professional influencer content for the value of one empty night",
    ctaText: "See Pricing Options"
  },
  faqs: [
    {
      question: "How are creators vetted before matching?",
      answer: "Every creator goes through a multi-step verification process including portfolio review, identity verification, past collaboration ratings, and content quality assessment. Only creators who meet our quality standards appear in your matches."
    },
    {
      question: "What's included in a typical influencer collaboration?",
      answer: "Standard collaborations include 50+ professional photos, 10+ video clips, and 5+ social media posts. The exact deliverables are agreed upon before the stay and documented in a formal collaboration agreement that protects both parties."
    },
    {
      question: "Do I have to negotiate terms with creators?",
      answer: "No. We've standardized the process with clear deliverable templates. You simply choose from predefined content packages, and we handle the formal agreement. No back-and-forth DMs or confusing negotiations."
    },
    {
      question: "What happens if a creator cancels?",
      answer: "Creators who cancel face account penalties, and we immediately work to rematch you with another qualified creator. Our system tracks reliability metrics to ensure you're matched with dependable creators."
    },
    {
      question: "Can I review a creator's portfolio before accepting?",
      answer: "Absolutely. Every creator profile includes their full portfolio, past collaboration reviews, content samples, and verified metrics. You have complete visibility before accepting any match."
    }
  ],
  finalCTA: {
    headline: "Professional Influencer Content, Guaranteed",
    subheadline: "Join hosts who've transformed their marketing with vetted creator collaborations",
    buttonText: "Get Started Free"
  }
};
