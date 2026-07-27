import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Validate user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    const body = await req.json();
    const { influencerId, propertyId } = body;

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!influencerId || !propertyId || !uuidRegex.test(influencerId) || !uuidRegex.test(propertyId)) {
      return new Response(JSON.stringify({ error: 'Invalid influencerId or propertyId format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!influencerId || !propertyId) {
      throw new Error('influencerId and propertyId are required');
    }

    // Fetch influencer data
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          location
        ),
        social_accounts(platform, follower_count)
      `)
      .eq('id', influencerId)
      .single();

    if (influencerError) throw influencerError;

    // Fetch property data
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        hosts!inner(
          business_name,
          min_follower_count,
          preferred_collaboration_types
        )
      `)
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

    // Check if match already exists and is recent (< 24 hours old)
    const { data: existingMatch } = await supabase
      .from('ai_match_scores')
      .select('*')
      .eq('influencer_id', influencerId)
      .eq('property_id', propertyId)
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingMatch) {
      return new Response(JSON.stringify(existingMatch), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate match using AI
    const prompt = `Analyze the compatibility between this creator and property for a collaboration:

Creator Profile:
- Name: ${influencer.profiles.first_name} ${influencer.profiles.last_name}
- Content Niches: ${influencer.content_niches?.join(', ') || 'Not specified'}
- Total Followers: ${influencer.total_followers || 0}
- Engagement Rate: ${influencer.engagement_rate || 0}%
- Location: ${influencer.profiles.location || 'Not specified'}
- Collaboration Preferences: ${influencer.collaboration_preferences?.join(', ') || 'Not specified'}
- Rate Range: $${influencer.rate_range_min || 0} - $${influencer.rate_range_max || 0}

Property Details:
- Title: ${property.title}
- Type: ${property.property_type}
- Location: ${property.location}
- Collaboration Type: ${property.collaboration_type}
- Content Requirements: ${property.content_requirements?.join(', ') || 'Not specified'}
- Amenities: ${property.amenities?.join(', ') || 'Not specified'}
- Max Guests: ${property.max_guests}
- Host Min Follower Requirement: ${property.hosts.min_follower_count || 0}

Calculate a compatibility score (0-100) based on:
1. Content Alignment (30%): Match between creator's niches and property's content requirements
2. Collaboration Type Match (25%): Creator preferences vs host's collaboration type
3. Audience Match (20%): Follower count and engagement vs host's requirements
4. Location Fit (15%): Geographic alignment and travel preferences
5. Rate Alignment (10%): Creator's rates vs collaboration budget/type

Provide:
1. Overall match score (0-100)
2. Top 3 specific reasons why they match (be specific and actionable)
3. One compelling sentence recommendation for why they should collaborate

Return ONLY valid JSON in this exact format:
{
  "score": <number>,
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "recommendation": "single sentence recommendation"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at matching content creators with properties for collaborations. Provide accurate, data-driven compatibility scores.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('AI rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      throw new Error('AI gateway error');
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No AI response received');
    }

    // Parse AI response
    let matchData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      matchData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    // Validate score is within range
    const score = Math.max(0, Math.min(100, matchData.score));

    // Calculate metadata
    const metadata = {
      content_alignment: influencer.content_niches?.some((niche: string) => 
        property.content_requirements?.some((req: string) => 
          req.toLowerCase().includes(niche.toLowerCase())
        )
      ),
      follower_meets_requirement: influencer.total_followers >= (property.hosts.min_follower_count || 0),
      collaboration_type_match: influencer.collaboration_preferences?.includes(property.collaboration_type),
      calculated_at: new Date().toISOString(),
    };

    // Store match score in database
    const { data: matchScore, error: insertError } = await supabase
      .from('ai_match_scores')
      .upsert({
        influencer_id: influencerId,
        property_id: propertyId,
        match_score: score,
        match_reasons: matchData.reasons || [],
        ai_recommendation: matchData.recommendation || '',
        calculation_metadata: metadata,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify(matchScore), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-ai-match:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});