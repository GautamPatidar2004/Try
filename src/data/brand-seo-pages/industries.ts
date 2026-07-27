import { 
  Building2, 
  UtensilsCrossed, 
  Home, 
  Sparkles, 
  Dumbbell, 
  PartyPopper, 
  Compass,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Camera,
  Video,
  FileText,
  Image,
  Handshake,
  Gift,
  Calendar,
  Award
} from "lucide-react";
import type { IndustryData } from "./types";

export const industries: Record<string, IndustryData> = {
  hotels: {
    slug: "hotels",
    name: "Hotel",
    plural: "Hotels",
    description: "Luxury hotels, boutique properties, and hospitality brands looking to showcase their unique experiences through influencer content.",
    icon: Building2,
    problems: [
      {
        title: "Declining Organic Reach",
        description: "Traditional marketing channels deliver diminishing returns as audiences shift to social media discovery.",
        icon: TrendingDown
      },
      {
        title: "High Production Costs",
        description: "Professional photo and video shoots are expensive and don't capture authentic guest experiences.",
        icon: DollarSign
      },
      {
        title: "Finding the Right Creators",
        description: "Vetting influencers for authenticity, engagement quality, and brand alignment is time-consuming.",
        icon: Users
      },
      {
        title: "Measuring ROI",
        description: "Tracking the impact of influencer campaigns on bookings and brand awareness remains challenging.",
        icon: Clock
      }
    ],
    deliverables: [
      { name: "Room Tours", description: "Cinematic walkthroughs of suites and amenities", icon: Video },
      { name: "Property Photography", description: "High-quality images for your marketing", icon: Camera },
      { name: "Review Content", description: "Authentic stay reviews and testimonials", icon: FileText },
      { name: "Lifestyle Imagery", description: "Aspirational content showcasing experiences", icon: Image }
    ],
    collaborationTypes: [
      { name: "Complimentary Stays", description: "Host creators in exchange for content", icon: Gift },
      { name: "Sponsored Campaigns", description: "Paid partnerships with top-tier creators", icon: Handshake },
      { name: "Event Coverage", description: "Influencer attendance at property events", icon: Calendar },
      { name: "Brand Ambassadors", description: "Long-term creator partnerships", icon: Award }
    ],
    faqs: [
      { question: "How do I find the right influencers for my hotel?", answer: "Use our marketplace filters to search by niche (travel, luxury, lifestyle), follower count, engagement rate, and location. Review their content quality and audience demographics before reaching out." },
      { question: "What should I offer influencers for a collaboration?", answer: "Most hotel collaborations offer complimentary stays (1-3 nights) plus meals/experiences. For high-reach creators (100K+ followers), consider additional compensation or exclusive perks." },
      { question: "How many content pieces should I expect?", answer: "A standard hotel collaboration typically includes 3-5 Instagram posts/reels, 10-15 stories, and optionally a YouTube vlog or TikTok video. Define deliverables clearly in your agreement." },
      { question: "How do I protect my hotel's reputation?", answer: "Our platform includes content approval workflows, brand guidelines sharing, and verified creator profiles. You review all content before it goes live." }
    ],
    stats: {
      avgReach: "2.5M+",
      creators: "500+",
      campaigns: "1,200+"
    }
  },
  restaurants: {
    slug: "restaurants",
    name: "Restaurant",
    plural: "Restaurants",
    description: "Restaurants, cafes, and food establishments seeking to attract new customers through mouth-watering content and authentic reviews.",
    icon: UtensilsCrossed,
    problems: [
      {
        title: "Standing Out Locally",
        description: "Competing for attention in saturated local dining markets requires constant fresh content.",
        icon: TrendingDown
      },
      {
        title: "Food Photography Quality",
        description: "Phone photos don't do your dishes justice, but professional shoots are expensive.",
        icon: DollarSign
      },
      {
        title: "Building Social Proof",
        description: "New restaurants struggle to generate the reviews and buzz needed to attract customers.",
        icon: Users
      },
      {
        title: "Driving Foot Traffic",
        description: "Converting online engagement into actual restaurant visits remains the key challenge.",
        icon: Clock
      }
    ],
    deliverables: [
      { name: "Food Photography", description: "Stunning dish shots for menus and social", icon: Camera },
      { name: "Reels & TikToks", description: "Viral-ready short-form video content", icon: Video },
      { name: "Reviews & Stories", description: "Authentic dining experience coverage", icon: FileText },
      { name: "Behind-the-Scenes", description: "Kitchen tours and chef features", icon: Image }
    ],
    collaborationTypes: [
      { name: "Complimentary Dining", description: "Invite creators for a meal in exchange for content", icon: Gift },
      { name: "Menu Launch Events", description: "Influencer tastings for new menu items", icon: Calendar },
      { name: "Sponsored Posts", description: "Paid partnerships for wider reach", icon: Handshake },
      { name: "Local Ambassador", description: "Ongoing partnerships with local foodies", icon: Award }
    ],
    faqs: [
      { question: "How much does restaurant influencer marketing cost?", answer: "Many restaurant collaborations are barter-based (free meal for content). For paid partnerships, expect $50-500 per post depending on the creator's following and engagement." },
      { question: "What type of content works best for restaurants?", answer: "Short-form video (Reels, TikToks) performs best for restaurants. Focus on 'first bite' reactions, menu reveals, and visually stunning dish presentations." },
      { question: "How do I find food influencers in my city?", answer: "Filter our marketplace by location and select the 'Food & Dining' niche. Look for creators with strong local followings and high engagement on food content." },
      { question: "Should I invite micro or macro influencers?", answer: "For restaurants, micro-influencers (5K-50K followers) with local audiences often drive more actual visits than macro influencers with broader, less local reach." }
    ],
    stats: {
      avgReach: "1.8M+",
      creators: "800+",
      campaigns: "2,500+"
    }
  },
  "real-estate": {
    slug: "real-estate",
    name: "Real Estate",
    plural: "Real Estate",
    description: "Property developers, real estate agencies, and vacation rental owners showcasing properties through compelling visual content.",
    icon: Home,
    problems: [
      {
        title: "Property Differentiation",
        description: "Standard listing photos don't convey the lifestyle and experience your properties offer.",
        icon: TrendingDown
      },
      {
        title: "Reaching Buyers",
        description: "Traditional advertising misses the demographics increasingly using social media for discovery.",
        icon: Users
      },
      {
        title: "Content Production",
        description: "Creating aspirational property content requires expertise in staging, lighting, and storytelling.",
        icon: DollarSign
      },
      {
        title: "Market Visibility",
        description: "Standing out in competitive markets requires consistent, high-quality content.",
        icon: Clock
      }
    ],
    deliverables: [
      { name: "Property Tours", description: "Cinematic home walkthroughs", icon: Video },
      { name: "Lifestyle Content", description: "Aspirational living imagery", icon: Image },
      { name: "Neighborhood Guides", description: "Area highlight content", icon: FileText },
      { name: "Drone Footage", description: "Aerial property views", icon: Camera }
    ],
    collaborationTypes: [
      { name: "Property Features", description: "Dedicated property showcase content", icon: Gift },
      { name: "Open House Events", description: "Influencer coverage of showings", icon: Calendar },
      { name: "Sponsored Tours", description: "Paid property tour campaigns", icon: Handshake },
      { name: "Development Ambassadors", description: "Long-term project partnerships", icon: Award }
    ],
    faqs: [
      { question: "Can influencers help sell properties?", answer: "Yes! Real estate influencer content reaches targeted audiences of potential buyers and renters. Lifestyle-focused content helps buyers envision themselves in the property." },
      { question: "What platforms work best for real estate?", answer: "Instagram and YouTube are ideal for property tours. TikTok works well for luxury listings and reaching younger buyers. LinkedIn is great for commercial properties." },
      { question: "How do I showcase vacation rentals?", answer: "Partner with travel creators who can stay at your property and create authentic experience content. This works as both marketing and a mini-review." },
      { question: "What should a property collaboration include?", answer: "Typically: property tour video, 5-10 high-quality photos, stories coverage, and optionally a longer-form YouTube video. Include neighborhood/lifestyle elements." }
    ],
    stats: {
      avgReach: "1.5M+",
      creators: "300+",
      campaigns: "800+"
    }
  },
  spas: {
    slug: "spas",
    name: "Spa",
    plural: "Spas",
    description: "Wellness centers, spas, and beauty establishments promoting relaxation experiences and treatments through authentic creator content.",
    icon: Sparkles,
    problems: [
      {
        title: "Conveying Experience",
        description: "Photos alone can't capture the transformative feeling of spa and wellness treatments.",
        icon: TrendingDown
      },
      {
        title: "Building Trust",
        description: "Potential clients need social proof before booking personal wellness services.",
        icon: Users
      },
      {
        title: "Competing Online",
        description: "Local wellness businesses struggle to stand out in social media feeds.",
        icon: DollarSign
      },
      {
        title: "Showcasing Results",
        description: "Demonstrating treatment benefits requires authentic before/after storytelling.",
        icon: Clock
      }
    ],
    deliverables: [
      { name: "Treatment Videos", description: "ASMR-style treatment content", icon: Video },
      { name: "Facility Tours", description: "Calming environment showcases", icon: Camera },
      { name: "Review Content", description: "Authentic experience testimonials", icon: FileText },
      { name: "Wellness Tips", description: "Educational beauty/health content", icon: Image }
    ],
    collaborationTypes: [
      { name: "Complimentary Treatments", description: "Trade services for content", icon: Gift },
      { name: "Wellness Events", description: "Influencer spa days", icon: Calendar },
      { name: "Sponsored Content", description: "Paid treatment features", icon: Handshake },
      { name: "Wellness Ambassadors", description: "Ongoing beauty partnerships", icon: Award }
    ],
    faqs: [
      { question: "What influencer niches work for spas?", answer: "Beauty, lifestyle, wellness, and self-care influencers perform best. Look for creators whose aesthetic matches your spa's vibe and whose audience values self-care." },
      { question: "How do I handle privacy in spa content?", answer: "Establish clear guidelines for what can be filmed. Many spas offer private sessions for content creation. Focus on ambiance, products, and creator reactions rather than other guests." },
      { question: "What's the typical spa collaboration?", answer: "Offer a treatment package (facial, massage, etc.) in exchange for stories coverage and 1-2 feed posts. For larger creators, consider a full spa day experience." },
      { question: "Can influencers help sell treatment packages?", answer: "Yes! Influencer discount codes and special offers drive bookings. Track conversions with unique booking links or promo codes." }
    ],
    stats: {
      avgReach: "1.2M+",
      creators: "400+",
      campaigns: "950+"
    }
  },
  "fitness-studios": {
    slug: "fitness-studios",
    name: "Fitness Studio",
    plural: "Fitness Studios",
    description: "Gyms, yoga studios, and fitness brands building community and attracting new members through energetic creator partnerships.",
    icon: Dumbbell,
    problems: [
      {
        title: "Member Acquisition",
        description: "Converting social media followers into paying gym members requires trust-building content.",
        icon: TrendingDown
      },
      {
        title: "Content Consistency",
        description: "Maintaining an active, engaging social presence demands constant fresh content.",
        icon: Clock
      },
      {
        title: "Showcasing Culture",
        description: "Your studio's unique vibe and community can't be conveyed through stock photos.",
        icon: Users
      },
      {
        title: "Standing Out",
        description: "Differentiating from chains and competitors requires authentic storytelling.",
        icon: DollarSign
      }
    ],
    deliverables: [
      { name: "Workout Videos", description: "Class and exercise content", icon: Video },
      { name: "Trainer Features", description: "Coach spotlight content", icon: Camera },
      { name: "Transformation Stories", description: "Member journey content", icon: FileText },
      { name: "Facility Tours", description: "Equipment and space showcases", icon: Image }
    ],
    collaborationTypes: [
      { name: "Free Memberships", description: "Trade access for content", icon: Gift },
      { name: "Class Features", description: "Influencer workout content", icon: Calendar },
      { name: "Sponsored Campaigns", description: "Paid fitness partnerships", icon: Handshake },
      { name: "Fitness Ambassadors", description: "Long-term creator memberships", icon: Award }
    ],
    faqs: [
      { question: "What type of fitness influencers should I target?", answer: "Match your studio type: yoga studios partner with wellness creators, CrossFit gyms with athletic creators, etc. Local fitness influencers often drive the most memberships." },
      { question: "How do I get authentic workout content?", answer: "Invite creators to attend regular classes and capture their genuine experience. Arrange early/late access for filming if needed. Feature real members (with permission)." },
      { question: "What's a typical fitness studio collaboration?", answer: "Offer a month of free membership in exchange for weekly content. For larger creators, consider personal training sessions or exclusive class access." },
      { question: "How do I track membership sign-ups from influencers?", answer: "Use unique promo codes or referral links for each influencer. Offer followers a free class pass or membership discount to track conversions." }
    ],
    stats: {
      avgReach: "1.1M+",
      creators: "350+",
      campaigns: "700+"
    }
  },
  "event-venues": {
    slug: "event-venues",
    name: "Event Venue",
    plural: "Event Venues",
    description: "Wedding venues, conference centers, and event spaces showcasing their unique atmospheres through stunning creator content.",
    icon: PartyPopper,
    problems: [
      {
        title: "Showing Potential",
        description: "Empty venue photos don't help couples or planners visualize their events.",
        icon: TrendingDown
      },
      {
        title: "Reaching Planners",
        description: "Getting in front of event planners and couples requires targeted content.",
        icon: Users
      },
      {
        title: "Seasonal Demand",
        description: "Filling off-peak dates requires creative marketing approaches.",
        icon: Clock
      },
      {
        title: "Competition",
        description: "Differentiating from other venues requires compelling storytelling.",
        icon: DollarSign
      }
    ],
    deliverables: [
      { name: "Event Coverage", description: "Live event content creation", icon: Video },
      { name: "Venue Tours", description: "Cinematic space walkthroughs", icon: Camera },
      { name: "Setup Content", description: "Before/after transformations", icon: Image },
      { name: "Testimonial Content", description: "Client experience stories", icon: FileText }
    ],
    collaborationTypes: [
      { name: "Styled Shoots", description: "Create aspirational event content", icon: Gift },
      { name: "Event Coverage", description: "Influencer attendance at events", icon: Calendar },
      { name: "Venue Partnerships", description: "Paid content campaigns", icon: Handshake },
      { name: "Venue Ambassadors", description: "Ongoing wedding planner partnerships", icon: Award }
    ],
    faqs: [
      { question: "How do I get wedding content without real weddings?", answer: "Partner with photographers and creators for styled shoots. These showcase your venue's potential with professional models and decor." },
      { question: "What influencers work for event venues?", answer: "Wedding and event planners, wedding photographers, and lifestyle creators getting married soon. Also consider local society/lifestyle influencers." },
      { question: "Can I use influencer content from real events?", answer: "Yes, with guest permission. Offer photography packages that include social content rights. Partner with wedding photographers who can create content during real events." },
      { question: "How do I promote corporate event spaces?", answer: "Partner with business and entrepreneurship influencers for meeting/conference content. Showcase hybrid event capabilities and tech amenities." }
    ],
    stats: {
      avgReach: "900K+",
      creators: "200+",
      campaigns: "450+"
    }
  },
  "tour-operators": {
    slug: "tour-operators",
    name: "Tour Operator",
    plural: "Tour Operators",
    description: "Adventure companies, tour guides, and experience providers capturing the excitement of their offerings through immersive creator content.",
    icon: Compass,
    problems: [
      {
        title: "Conveying Experience",
        description: "Static marketing materials can't capture the thrill and emotion of your tours.",
        icon: TrendingDown
      },
      {
        title: "Building Trust",
        description: "Travelers need social proof before booking adventure experiences.",
        icon: Users
      },
      {
        title: "Reaching Travelers",
        description: "Getting discovered by tourists planning trips requires strategic content.",
        icon: Clock
      },
      {
        title: "Seasonal Marketing",
        description: "Maintaining visibility during off-peak seasons requires consistent content.",
        icon: DollarSign
      }
    ],
    deliverables: [
      { name: "Tour Videos", description: "Immersive experience content", icon: Video },
      { name: "Adventure Photography", description: "Action-packed tour imagery", icon: Camera },
      { name: "Travel Vlogs", description: "Full experience coverage", icon: FileText },
      { name: "Destination Content", description: "Location highlight reels", icon: Image }
    ],
    collaborationTypes: [
      { name: "Complimentary Tours", description: "Trade experiences for content", icon: Gift },
      { name: "Press Trips", description: "Multi-creator tour experiences", icon: Calendar },
      { name: "Sponsored Adventures", description: "Paid partnership campaigns", icon: Handshake },
      { name: "Destination Ambassadors", description: "Long-term travel partnerships", icon: Award }
    ],
    faqs: [
      { question: "How do I find travel influencers?", answer: "Search our marketplace for travel and adventure creators. Look for those who've covered similar destinations or activity types. Check their engagement on travel content specifically." },
      { question: "What should a tour collaboration include?", answer: "Typically: complimentary tour for 1-2 people, plus any additional experiences. Expect video content, photos, stories, and optionally a vlog or blog post." },
      { question: "How do I handle group tours with influencers?", answer: "You can add influencers to existing group tours or arrange private experiences. Group tours provide authentic interactions; private tours allow more filming flexibility." },
      { question: "What about adventure activities and waivers?", answer: "Ensure creators sign standard waivers. Discuss any filming restrictions for safety-critical moments. Consider GoPro mounts and equipment compatibility." }
    ],
    stats: {
      avgReach: "2.1M+",
      creators: "450+",
      campaigns: "1,100+"
    }
  }
};

export const industryList = Object.values(industries);
export const industrySlugs = Object.keys(industries);
