import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calculate profile completeness/strength score (0-100)
const calculateProfileStrength = (creator: any): number => {
  let score = 0;
  if (creator.profiles?.bio && creator.profiles.bio.length > 20) score += 20;
  if (creator.profiles?.profile_photo_url) score += 20;
  if (creator.content_niches && creator.content_niches.length > 0) score += 20;
  if (creator.total_followers && creator.total_followers > 0) score += 20;
  if (creator.engagement_rate && creator.engagement_rate > 0) score += 20;
  return score;
};

// Determine collaboration readiness
const determineReadiness = (creator: any): string => {
  const strength = calculateProfileStrength(creator);
  const hasSocial = creator.instagram_url || creator.tiktok_url || creator.youtube_url;
  
  if (strength >= 80 && hasSocial) return "Ready";
  if (strength >= 40) return "Needs setup";
  return "Incomplete profile";
};

// Format rate range for display
const formatRateRange = (min?: number, max?: number): string | null => {
  if (!min && !max) return null;
  if (min && max) return `$${min}-$${max}`;
  if (min) return `From $${min}`;
  if (max) return `Up to $${max}`;
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId, userType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // User-type specific context
    const userTypeContext = userType === 'host' || userType === 'brand' 
      ? `
────────────────────────
USER CONTEXT: HOST/BRAND
────────────────────────
This user is a HOST or BRAND looking to source creators.

Your focus for this user:
• Help them find creators who are the BEST FIT for their property/campaign
• Emphasize: audience alignment, content style fit, engagement quality
• Proactively suggest: outreach approach, brief structure, deliverable expectations
• When showing results: lead with WHY these creators match their needs
• Include rate context when available (typical rates for creator tier)
• Suggest collaboration structures (free stay vs paid, content requirements)
`
      : userType === 'influencer' 
      ? `
────────────────────────
USER CONTEXT: CREATOR
────────────────────────
This user is a CREATOR looking for opportunities.

Your focus for this user:
• Help them find the BEST opportunities for their growth and portfolio
• Emphasize: property/brand quality, content requirements, compensation type
• Proactively suggest: pitch approach, portfolio positioning, rate negotiation
• When showing results: lead with collaboration VALUE (free stay, paid rate, exposure)
• Highlight what makes each opportunity worth pursuing
• Suggest how to stand out in applications
`
      : '';

    const systemPrompt = `You are Hosty, the official AI Discovery & Sourcing Strategist for Hostfluencer.

────────────────────────
EXPERT SOURCING IDENTITY
────────────────────────
You are NOT a generic search tool. You are an EXPERT MARKETER and SOURCING STRATEGIST with deep knowledge of:
• Creator-brand partnerships and collaboration structures
• Content marketing ROI and engagement optimization
• Influencer rate benchmarks by tier and niche
• Hospitality marketing and UGC best practices

Your mission: Help users discover the BEST opportunities and make confident decisions.
${userTypeContext}
────────────────────────
IDENTITY & TONE
────────────────────────
• Name: Hosty
• Voice: Confident expert, strategic advisor, concise
• Style: Lead with VALUE, explain the WHY
• Mindset: Strategic partner helping users win
• Never vague. Always actionable.

────────────────────────
PLATFORM CONTEXT
────────────────────────
Hostfluencer connects:
• Hosts & Property Owners → exchange stays for creator content
• Brands & Restaurants → partner with creators for UGC
• Creators & Influencers → secure stays, paid campaigns, portfolio growth

────────────────────────
EXPERT SOURCING BEHAVIOR (CRITICAL)
────────────────────────

When presenting search results:
1. LEAD with strategic fit: "These creators are ideal because..."
2. HIGHLIGHT top recommendation: "**Top pick: [Name]** - [specific reason why]"
3. INCLUDE rate context if available: "Typical rates for this tier: $X-$Y"
4. SUGGEST next steps: "To connect, consider..."

Keep response BRIEF after showing cards:
• ONE sentence summarizing the strategic value
• Optionally highlight top 1-2 picks with WHY
• Cards do the heavy lifting - don't repeat info

Example response after finding creators:
"Found 6 travel creators perfect for boutique hotels! **Top pick: Sarah Chen** - her luxury property content has 4.2% engagement and she's worked with similar properties. Ready to connect?"

────────────────────────
ZERO/LOW RESULTS STRATEGY (MANDATORY)
────────────────────────

Never say "no results found" and stop. Instead:

1. Acknowledge: "I searched for [criteria]..."
2. Explain briefly: "Our marketplace is growing rapidly..."
3. IMMEDIATELY deliver value with at least 2 of:
   • Alternative search strategy (broader filters, adjacent niches)
   • Content ideas specifically for their goal
   • Outreach template for finding creators elsewhere
   • Profile optimization tips to attract applications
   • Brief structure for their collaboration type

4. Maintain momentum: "Here's how to move forward..."

────────────────────────
CONTENT IDEATION
────────────────────────

When generating content ideas, be SPECIFIC:
• Include hook examples ("Start with: 'POV: You wake up in...'")
• Suggest optimal formats (Reels, TikTok, carousel)
• Provide posting timing insights
• Include relevant hashtag strategies
• Reference trending formats when relevant

────────────────────────
TREND INSIGHTS
────────────────────────

Use get_trend_insights only when:
• User asks for trends, benchmarks, or "what's working"
• Search returns limited results AND user needs strategic guidance
• User asks about best practices or industry patterns

Present as: "📊 Based on current industry patterns..."

────────────────────────
CONSTRAINTS
────────────────────────
• Never hallucinate creators or listings
• Never promise specific results
• Never leave user without actionable value
• Be concise - cards show the details`;

    // Define tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "search_creators",
          description: "Search for creators/influencers. Returns ranked profiles with profile strength, collaboration readiness, and match context. For hosts: finds creators best suited for property collaborations. For brands: finds creators for campaigns. Use relaxed criteria if specific searches fail.",
          parameters: {
            type: "object",
            properties: {
              niche: {
                type: "string",
                description: "Content niche (e.g., travel, food, lifestyle, fashion, fitness, beauty, tech, gaming)"
              },
              min_followers: {
                type: "number",
                description: "Minimum follower count (optional - omit for broader results)"
              },
              max_followers: {
                type: "number",
                description: "Maximum follower count (optional)"
              },
              location: {
                type: "string",
                description: "Location/city/state/country (optional - omit for broader results)"
              },
              min_engagement_rate: {
                type: "number",
                description: "Minimum engagement rate as a percentage (optional - omit for broader results)"
              },
              limit: {
                type: "number",
                description: "Number of results to return (default 10, max 20)",
                default: 10
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_content_ideas",
          description: "Generate creative, actionable content ideas with specific hooks, formats, and strategies. Always works - no database needed. Use when users ask for content ideas, marketing strategies, or to provide value when searches return empty.",
          parameters: {
            type: "object",
            properties: {
              niche: {
                type: "string",
                description: "Content niche (e.g., travel, food, lifestyle, fashion)"
              },
              platform: {
                type: "string",
                description: "Social platform (instagram, tiktok, youtube, or 'all')",
                enum: ["instagram", "tiktok", "youtube", "all"]
              },
              goal: {
                type: "string",
                description: "Goal (e.g., 'increase engagement', 'brand awareness', 'showcase property')"
              },
              brand_type: {
                type: "string",
                description: "Type of brand or property (e.g., 'luxury hotel', 'eco resort', 'boutique restaurant')"
              }
            },
            required: ["niche", "platform", "goal"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_recommendations",
          description: "Get AI-powered creator recommendations with match scores and reasons. Best for hosts looking for creators matched to their specific properties.",
          parameters: {
            type: "object",
            properties: {
              count: {
                type: "number",
                description: "Number of recommendations (default 5, max 10)",
                default: 5
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_stays",
          description: "Search for properties/stays offering creator collaborations. For creators: find free stays and content opportunities. Returns property details, collaboration terms, and host info.",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "Location (e.g., 'Malibu', 'Los Angeles', 'California')"
              },
              property_type: {
                type: "string",
                description: "Type: house, apartment, villa, cabin, treehouse, etc."
              },
              min_bedrooms: {
                type: "number",
                description: "Minimum bedrooms"
              },
              max_guests: {
                type: "number",
                description: "Minimum guest capacity"
              },
              amenities: {
                type: "array",
                items: { type: "string" },
                description: "Desired amenities (e.g., ['Pool', 'WiFi', 'Kitchen'])"
              },
              collaboration_type: {
                type: "string",
                description: "Type: 'free_stay' or 'discount'"
              },
              limit: {
                type: "number",
                description: "Number of results (default 8, max 15)",
                default: 8
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_brands",
          description: "Search for brands/restaurants seeking creator partnerships. For creators: find paid campaigns and brand deals. Returns brand info, budget range, and partnership details.",
          parameters: {
            type: "object",
            properties: {
              industry: {
                type: "string",
                description: "Industry (e.g., 'hospitality', 'food', 'fashion', 'fitness', 'tech')"
              },
              budget_range: {
                type: "string",
                description: "Budget: 'micro', 'small', 'medium', 'large', 'enterprise'"
              },
              location: {
                type: "string",
                description: "Brand location"
              },
              verified_only: {
                type: "boolean",
                description: "Only verified brands",
                default: false
              },
              limit: {
                type: "number",
                description: "Number of results (default 8, max 15)",
                default: 8
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_trend_insights",
          description: "Get industry trends, content format inspiration, and best practices. Use when user asks about trends, benchmarks, what's working, or when search returns limited results and strategic guidance is needed.",
          parameters: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The trend topic (e.g., 'TikTok content for luxury hotels', 'Instagram Reels travel content')"
              },
              context: {
                type: "string",
                description: "User's situation (e.g., 'boutique hotel seeking creators', 'creator building travel portfolio')"
              },
              platform: {
                type: "string",
                enum: ["tiktok", "instagram", "youtube", "general"],
                description: "Platform focus"
              }
            },
            required: ["topic"]
          }
        }
      }
    ];

    // Process messages and handle tool calls
    let processedMessages = [...messages];
    let toolResults = [];

    // Check if the last message has tool calls that need processing
    const lastMessage = processedMessages[processedMessages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.tool_calls) {
      console.log("Processing tool calls:", JSON.stringify(lastMessage.tool_calls));
      
      // Run all tool calls in this turn concurrently — each one queries independent
      // tables, uses a read-only client, and produces its own result, so there is no
      // shared mutable state between them. (Previously sequential, so a multi-tool
      // turn paid the sum of each query's latency.)
      toolResults = await Promise.all(lastMessage.tool_calls.map(async (toolCall: any) => {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${functionName} with args:`, args);
        
        let result;
        
        if (functionName === "search_creators") {
          // Build query for searching creators with enhanced ranking
          let query = supabase
            .from('influencers')
            .select(`
              id,
              content_niches,
              total_followers,
              engagement_rate,
              instagram_url,
              tiktok_url,
              youtube_url,
              rate_range_min,
              rate_range_max,
              profiles!inner (
                first_name,
                last_name,
                profile_photo_url,
                location,
                bio,
                is_active
              )
            `);

          // Apply filters
          if (args.niche) {
            const nicheCapitalized = args.niche.trim().charAt(0).toUpperCase() + args.niche.trim().slice(1).toLowerCase();
            query = query.contains('content_niches', [nicheCapitalized]);
          }
          if (args.min_followers) {
            query = query.gte('total_followers', args.min_followers);
          }
          if (args.max_followers) {
            query = query.lte('total_followers', args.max_followers);
          }
          if (args.min_engagement_rate) {
            query = query.gte('engagement_rate', args.min_engagement_rate);
          }
          if (args.location) {
            query = query.filter('profiles.location', 'ilike', `%${args.location}%`);
          }

          const limit = Math.min(args.limit || 10, 20);
          query = query.limit(limit * 2); // Fetch more to sort by quality

          let { data: creators, error } = await query;

          // Broaden search if no results with niche filter
          if (!error && (!creators || creators.length === 0) && args.niche) {
            console.log(`No creators matched niche='${args.niche}', broadening search`);
            
            let broadQuery = supabase
              .from('influencers')
              .select(`
                id,
                content_niches,
                total_followers,
                engagement_rate,
                instagram_url,
                tiktok_url,
                youtube_url,
                rate_range_min,
                rate_range_max,
                profiles!inner (
                  first_name,
                  last_name,
                  profile_photo_url,
                  location,
                  bio,
                  is_active
                )
              `)
              .limit(limit * 2);

            if (args.min_followers) {
              broadQuery = broadQuery.gte('total_followers', args.min_followers);
            }
            if (args.max_followers) {
              broadQuery = broadQuery.lte('total_followers', args.max_followers);
            }
            if (args.min_engagement_rate) {
              broadQuery = broadQuery.gte('engagement_rate', args.min_engagement_rate);
            }
            if (args.location) {
              broadQuery = broadQuery.filter('profiles.location', 'ilike', `%${args.location}%`);
            }

            const { data: broadCreators, error: broadError } = await broadQuery;
            
            if (!broadError && broadCreators && broadCreators.length > 0) {
              console.log(`Broad search found ${broadCreators.length} creators`);
              creators = broadCreators;
            }
          }

          if (error) {
            console.error("Error searching creators:", error);
            result = {
              creators: [],
              metadata: {
                searched_criteria: args,
                error_message: "Search encountered an issue",
                suggestions: [
                  "Try a broader search",
                  "Ask for content ideas while we sort this out",
                  "Tell me what type of collaboration you're planning"
                ]
              }
            };
          } else {
            // Sort by profile quality (completeness + engagement + followers)
            const rankedCreators = (creators || [])
              .map(c => ({
                ...c,
                _profileStrength: calculateProfileStrength(c),
                _hasEngagement: c.engagement_rate && c.engagement_rate > 0,
                _hasSocial: c.instagram_url || c.tiktok_url || c.youtube_url
              }))
              .sort((a, b) => {
                // Prioritize: profile strength > engagement presence > followers
                if (a._profileStrength !== b._profileStrength) {
                  return b._profileStrength - a._profileStrength;
                }
                if (a._hasEngagement !== b._hasEngagement) {
                  return a._hasEngagement ? -1 : 1;
                }
                return (b.total_followers || 0) - (a.total_followers || 0);
              })
              .slice(0, limit);

            console.log(`Found ${rankedCreators.length} creators (ranked by quality)`);
            
            result = {
              creators: rankedCreators.map((c, index) => ({
                id: c.id,
                name: `${c.profiles?.first_name || ''} ${c.profiles?.last_name || ''}`.trim() || 'Creator',
                avatar_url: c.profiles?.profile_photo_url || null,
                location: c.profiles?.location || null,
                bio: c.profiles?.bio || null,
                niches: c.content_niches || [],
                followers: c.total_followers || 0,
                engagement_rate: c.engagement_rate || null,
                instagram_url: c.instagram_url || null,
                tiktok_url: c.tiktok_url || null,
                youtube_url: c.youtube_url || null,
                // Enhanced fields
                profile_strength: c._profileStrength,
                collaboration_readiness: determineReadiness(c),
                rate_range: formatRateRange(c.rate_range_min, c.rate_range_max),
                is_top_pick: index === 0 && c._profileStrength >= 60
              })) || [],
              metadata: rankedCreators.length === 0 ? {
                searched_criteria: args,
                suggestions: [
                  "Try removing follower or engagement filters",
                  "I can generate content ideas for your niche instead",
                  "Let me suggest collaboration strategies"
                ]
              } : {
                total_found: rankedCreators.length,
                top_quality_count: rankedCreators.filter(c => c._profileStrength >= 60).length
              }
            };
          }
        } else if (functionName === "generate_content_ideas") {
          const { niche, platform, goal, brand_type } = args;
          
          result = {
            content_ideas: true,
            message: `Generating ${niche} content ideas for ${platform}...`,
            context: {
              niche,
              platform,
              goal,
              brand_type: brand_type || 'general brand',
              note: "AI-powered ideas generation"
            }
          };
          
          console.log(`Generating content ideas for: ${niche} on ${platform} with goal: ${goal}`);
        } else if (functionName === "get_recommendations") {
          const count = Math.min(args.count || 5, 10);
          
          let query = supabase
            .from('ai_match_scores')
            .select(`
              match_score,
              match_reasons,
              influencer_id,
              influencers!ai_match_scores_influencer_id_fkey (
                id,
                content_niches,
                total_followers,
                engagement_rate,
                instagram_url,
                tiktok_url,
                youtube_url,
                rate_range_min,
                rate_range_max,
                profiles!inner (
                  first_name,
                  last_name,
                  profile_photo_url,
                  location,
                  bio
                )
              )
            `)
            .order('match_score', { ascending: false })
            .limit(count);

          // Filter by user's properties if host
          if (userType === 'host' && userId) {
            const { data: properties } = await supabase
              .from('properties')
              .select('id')
              .eq('host_id', userId);
            
            if (properties && properties.length > 0) {
              const propertyIds = properties.map(p => p.id);
              query = query.in('property_id', propertyIds);
            }
          } else if (userType === 'influencer' && userId) {
            query = query.eq('influencer_id', userId);
          }

          const { data: matches, error } = await query;

          if (error) {
            console.error("Error getting recommendations:", error);
            result = { error: "Failed to get recommendations", details: error.message };
          } else {
            console.log(`Found ${matches?.length || 0} recommendations`);
            result = {
              creators: matches?.map((m, index) => {
                const inf = m.influencers;
                const profile = inf?.profiles;
                return {
                  id: inf?.id || m.influencer_id,
                  name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Creator',
                  avatar_url: profile?.profile_photo_url,
                  location: profile?.location,
                  bio: profile?.bio,
                  niches: inf?.content_niches,
                  followers: inf?.total_followers,
                  engagement_rate: inf?.engagement_rate,
                  instagram_url: inf?.instagram_url,
                  tiktok_url: inf?.tiktok_url,
                  youtube_url: inf?.youtube_url,
                  match_score: m.match_score,
                  match_reasons: m.match_reasons,
                  rate_range: formatRateRange(inf?.rate_range_min, inf?.rate_range_max),
                  is_top_pick: index === 0
                };
              }) || []
            };
          }
        } else if (functionName === "search_stays") {
          let query = supabase
            .from('properties')
            .select(`
              id,
              title,
              description,
              location,
              property_type,
              max_guests,
              bedrooms,
              bathrooms,
              amenities,
              content_requirements,
              collaboration_type,
              discount_percentage,
              property_images (
                image_url,
                is_primary,
                display_order
              ),
              profiles!properties_host_id_fkey (
                id,
                first_name,
                last_name,
                profile_photo_url
              )
            `)
            .eq('is_active', true)
            .eq('admin_deactivated', false);

          if (args.location) {
            const locationVariants = [args.location];
            if (args.location.toLowerCase() === 'la') locationVariants.push('Los Angeles');
            if (args.location.toLowerCase() === 'nyc') locationVariants.push('New York');
            if (args.location.toLowerCase() === 'sf') locationVariants.push('San Francisco');
            
            query = query.or(locationVariants.map(loc => `location.ilike.%${loc}%`).join(','));
          }
          if (args.property_type) {
            query = query.eq('property_type', args.property_type);
          }
          if (args.min_bedrooms) {
            query = query.gte('bedrooms', args.min_bedrooms);
          }
          if (args.max_guests) {
            query = query.gte('max_guests', args.max_guests);
          }
          if (args.amenities && args.amenities.length > 0) {
            query = query.overlaps('amenities', args.amenities);
          }
          if (args.collaboration_type) {
            query = query.eq('collaboration_type', args.collaboration_type);
          }

          const limit = Math.min(args.limit || 8, 15);
          query = query.limit(limit);

          const { data: properties, error } = await query;

          if (error) {
            console.error("Error searching properties:", error);
            result = { error: "Failed to search properties", details: error.message };
          } else {
            console.log(`Found ${properties?.length || 0} properties`);
            result = {
              properties: properties?.map(p => {
                const primaryImage = p.property_images?.find(img => img.is_primary);
                const firstImage = p.property_images?.[0];
                return {
                  id: p.id,
                  title: p.title,
                  description: p.description,
                  location: p.location,
                  property_type: p.property_type,
                  max_guests: p.max_guests,
                  bedrooms: p.bedrooms,
                  bathrooms: p.bathrooms,
                  amenities: p.amenities,
                  content_requirements: p.content_requirements,
                  collaboration_type: p.collaboration_type,
                  discount_percentage: p.discount_percentage,
                  image_url: (primaryImage || firstImage)?.image_url,
                  host: {
                    id: p.profiles.id,
                    name: `${p.profiles.first_name} ${p.profiles.last_name}`.trim(),
                    avatar_url: p.profiles.profile_photo_url
                  }
                };
              }) || [],
              metadata: properties?.length === 0 ? {
                searched_criteria: args,
                suggestions: [
                  "Try a different location or remove location filter",
                  "I can suggest content ideas for properties in your target area",
                  "Consider expanding your search criteria"
                ]
              } : null
            };
          }
        } else if (functionName === "search_brands") {
          let query = supabase
            .from('brands')
            .select(`
              id,
              company_name,
              brand_name,
              website,
              industry,
              description,
              budget_range,
              logo_url,
              verified,
              profiles!brands_user_id_fkey (
                id,
                first_name,
                last_name,
                location
              )
            `);

          if (args.industry) {
            query = query.ilike('industry', `%${args.industry}%`);
          }
          if (args.budget_range) {
            query = query.eq('budget_range', args.budget_range);
          }
          if (args.location) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id')
              .ilike('location', `%${args.location}%`);
            
            if (profiles && profiles.length > 0) {
              const profileIds = profiles.map(p => p.id);
              query = query.in('profiles.id', profileIds);
            }
          }
          if (args.verified_only) {
            query = query.eq('verified', true);
          }

          const limit = Math.min(args.limit || 8, 15);
          query = query.limit(limit);

          let { data: brands, error } = await query;

          // Retry without verified filter if no results
          if (!error && brands?.length === 0 && args.verified_only) {
            console.log("Retrying brand search without verified filter...");
            query = supabase
              .from('brands')
              .select(`
                id,
                company_name,
                brand_name,
                website,
                industry,
                description,
                budget_range,
                logo_url,
                verified,
                profiles!brands_user_id_fkey (
                  id,
                  first_name,
                  last_name,
                  location
                )
              `)
              .limit(limit);
            
            if (args.industry) {
              query = query.ilike('industry', `%${args.industry}%`);
            }
            if (args.budget_range) {
              query = query.eq('budget_range', args.budget_range);
            }
            
            const retryResult = await query;
            brands = retryResult.data;
            error = retryResult.error;
          }

          if (error) {
            console.error("Error searching brands:", error);
            result = { error: "Failed to search brands", details: error.message };
          } else {
            console.log(`Found ${brands?.length || 0} brands`);
            result = {
              brands: brands?.map(b => ({
                id: b.id,
                company_name: b.company_name,
                brand_name: b.brand_name,
                website: b.website,
                industry: b.industry,
                description: b.description,
                budget_range: b.budget_range,
                logo_url: b.logo_url,
                verified: b.verified,
                contact: {
                  user_id: b.profiles.id,
                  name: `${b.profiles.first_name} ${b.profiles.last_name}`.trim(),
                  location: b.profiles.location
                }
              })) || [],
              metadata: brands?.length === 0 ? {
                searched_criteria: args,
                suggestions: [
                  "Try searching without location filter",
                  "Remove budget range requirement",
                  "I can suggest partnership strategies for your niche"
                ]
              } : null
            };
          }
        } else if (functionName === "get_trend_insights") {
          const { topic, context, platform } = args;
          
          const researchPrompt = `You are a social media and hospitality marketing research analyst.

Based on your knowledge of what performs well on social platforms, provide insights on:

Topic: ${topic}
${context ? `Context: ${context}` : ''}
${platform && platform !== 'general' ? `Platform: ${platform}` : 'All major platforms'}

Provide a CONCISE, actionable response with:
1. **Current Trends** (3-4 specific formats/approaches that work)
2. **Engagement Patterns** (hooks that work, optimal formats)
3. **Hostfluencer Strategy** (how to apply this on the platform)

Be specific with examples. Include hook templates where relevant.
Focus on actionable patterns hosts, brands, or creators can implement immediately.

Present as industry knowledge, not real-time data.`;

          console.log(`Generating trend insights for: ${topic}`);
          
          try {
            const researchResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [{ role: "user", content: researchPrompt }],
              }),
            });
            
            if (!researchResponse.ok) {
              console.error("Trend insights API error:", researchResponse.status);
              result = {
                insights: null,
                error: "Could not fetch trend insights at this time",
                fallback: "I'll provide general best practices instead."
              };
            } else {
              const researchData = await researchResponse.json();
              const insightContent = researchData.choices?.[0]?.message?.content;
              
              result = {
                insights: insightContent,
                source: "industry_knowledge",
                disclaimer: "Based on industry patterns and best practices",
                topic: topic,
                platform: platform || "general"
              };
              console.log("Trend insights generated successfully");
            }
          } catch (insightError) {
            console.error("Error generating trend insights:", insightError);
            result = {
              insights: null,
              error: "Could not generate trend insights",
              fallback: "I'll provide general guidance based on my training."
            };
          }
        }

        return {
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result)
        };
      }));

      // Add tool results to messages
      processedMessages.push(...toolResults);
    }

    // Extract all data types from tool results to send to frontend
    const allCreators: any[] = [];
    const allProperties: any[] = [];
    const allBrands: any[] = [];
    let trendInsights: { content: string; disclaimer: string; topic: string; platform: string } | null = null;
    
    for (const toolResult of toolResults) {
      try {
        const resultData = JSON.parse(toolResult.content);
        if (resultData.creators && Array.isArray(resultData.creators)) {
          allCreators.push(...resultData.creators);
        }
        if (resultData.properties && Array.isArray(resultData.properties)) {
          allProperties.push(...resultData.properties);
        }
        if (resultData.brands && Array.isArray(resultData.brands)) {
          allBrands.push(...resultData.brands);
        }
        if (resultData.insights && resultData.source === "industry_knowledge") {
          trendInsights = {
            content: resultData.insights,
            disclaimer: resultData.disclaimer,
            topic: resultData.topic,
            platform: resultData.platform
          };
        }
      } catch (e) {
        console.error('Error parsing tool result:', e);
      }
    }

    // Make API call to Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...processedMessages,
        ],
        tools: tools,
        tool_choice: "auto",
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "We're receiving high volume right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI support is temporarily unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // If we have data from tool results, prepend them to the stream
    if (allCreators.length > 0 || allProperties.length > 0 || allBrands.length > 0 || trendInsights) {
      console.log(`Sending results to frontend - Creators: ${allCreators.length}, Properties: ${allProperties.length}, Brands: ${allBrands.length}, TrendInsights: ${trendInsights ? 'yes' : 'no'}`);
      const encoder = new TextEncoder();
      let customEvents = '';
      
      if (allCreators.length > 0) {
        customEvents += `data: ${JSON.stringify({ type: 'creators', creators: allCreators })}\n\n`;
      }
      if (allProperties.length > 0) {
        customEvents += `data: ${JSON.stringify({ type: 'properties', properties: allProperties })}\n\n`;
      }
      if (allBrands.length > 0) {
        customEvents += `data: ${JSON.stringify({ type: 'brands', brands: allBrands })}\n\n`;
      }
      if (trendInsights) {
        customEvents += `data: ${JSON.stringify({ type: 'trend_insights', trendInsights })}\n\n`;
      }
      
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(customEvents));
          
          const reader = response.body!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            controller.close();
          }
        }
      });
      
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("discovery-ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
