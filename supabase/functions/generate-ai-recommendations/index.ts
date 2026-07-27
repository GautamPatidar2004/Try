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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('[AI-RECOMMENDATIONS] Generating for user:', user.id);

    // Check rate limiting - only allow once per 24 hours
    const { data: recentRec } = await supabase
      .from('ai_recommendations')
      .select('created_at')
      .eq('influencer_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentRec) {
      return new Response(JSON.stringify({ 
        error: 'Rate limited. Please wait 24 hours between recommendation generations.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stage 1: Fetch base profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[AI-RECOMMENDATIONS] Profile fetch error:', profileError);
      throw profileError;
    }

    // Stage 2: Fetch influencer data separately
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (influencerError) {
      console.error('[AI-RECOMMENDATIONS] Influencer data fetch error:', influencerError);
    }

    console.log('[AI-RECOMMENDATIONS] Profile fetched:', {
      userId: user.id,
      hasProfile: !!profile,
      hasInfluencerData: !!influencer
    });

    // Fetch content posts with metrics
    const { data: posts } = await supabase
      .from('content_posts')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch social accounts
    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('influencer_id', user.id);

    // Fetch collaboration history
    const { data: collaborations } = await supabase
      .from('collaboration_agreements')
      .select('*, properties(*)')
      .eq('influencer_id', user.id)
      .eq('status', 'active');

    // Fetch collaboration rates
    const { data: rates } = await supabase
      .from('collaboration_rates')
      .select('*')
      .eq('influencer_id', user.id)
      .eq('is_active', true);

    // Fetch benchmark data for comparison
    const { data: benchmarks } = await supabase
      .from('benchmark_data')
      .select('*')
      .limit(5);

    // Calculate engagement metrics
    const totalEngagement = posts?.reduce((sum, post) => 
      sum + (post.likes_count || 0) + (post.views_count || 0), 0) || 0;
    const avgEngagement = posts?.length ? totalEngagement / posts.length : 0;
    const totalFollowers = socialAccounts?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0;
    const engagementRate = totalFollowers > 0 ? (avgEngagement / totalFollowers) * 100 : 0;

    // Build AI prompt
    const prompt = `You are an expert social media strategist and creator growth consultant analyzing a content creator's profile and performance data.

Creator Profile:
- Name: ${profile?.first_name} ${profile?.last_name}
- Niches: ${influencer?.content_niches?.join(', ') || 'Not specified'}
- Total Followers: ${totalFollowers.toLocaleString()}
- Engagement Rate: ${engagementRate.toFixed(2)}%
- Bio: ${profile?.bio || 'Not provided'}
- Collaboration Preferences: ${influencer?.collaboration_preferences?.join(', ') || 'Not specified'}

Recent Content Performance (last ${posts?.length || 0} posts):
${posts?.slice(0, 10).map((post, i) => `
  Post ${i + 1}:
  - Type: ${post.media_type}
  - Likes: ${post.likes_count || 0}
  - Views: ${post.views_count || 0}
  - Hashtags: ${post.hashtags?.join(', ') || 'None'}
  - Status: ${post.delivery_status}
`).join('\n') || 'No posts available'}

Active Collaborations: ${collaborations?.length || 0}
Social Platforms: ${socialAccounts?.map(acc => acc.platform).join(', ') || 'None connected'}

Current Rates:
${rates?.map(r => `- ${r.collaboration_type}: $${r.base_rate || 'Not set'} (${r.rate_type})`).join('\n') || 'No rates set'}

Industry Benchmarks Available: ${benchmarks?.length || 0} data points

Analyze this data and provide 5-7 specific, actionable recommendations in the following categories:

1. Content Strategy (2-3 recommendations)
2. Growth Opportunities (2-3 recommendations)  
3. Monetization (1-2 recommendations)

For each recommendation, provide:
- category (content_strategy, growth, or monetization)
- priority (critical, high, medium, or low)
- title (short, punchy, under 60 characters)
- description (2-3 sentences explaining WHY and WHAT)
- actionSteps (array of 3-5 specific steps to implement)
- expectedImpact (quantitative if possible, be specific)
- timeline (how long to see results)
- confidence (number between 0 and 1)

Also provide an insights object with:
- strengths (array of 2-3 key strengths)
- weaknesses (array of 2-3 areas to improve)
- opportunities (array of 2-3 market opportunities)

Return ONLY valid JSON in this exact format:
{
  "recommendations": [...],
  "insights": {
    "strengths": [...],
    "weaknesses": [...],
    "opportunities": [...]
  }
}`;

    console.log('[AI-RECOMMENDATIONS] Calling Lovable AI...');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a social media strategy expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-RECOMMENDATIONS] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    // Parse AI response - strip markdown code blocks if present
    let recommendationData;
    try {
      // Clean the AI response by removing markdown code blocks
      let jsonContent = aiContent.trim();
      
      // Check if response is wrapped in markdown code blocks
      if (jsonContent.startsWith('```')) {
        // Remove opening ```json or ``` 
        jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '');
        // Remove closing ```
        jsonContent = jsonContent.replace(/\n?```$/, '');
        jsonContent = jsonContent.trim();
      }
      
      recommendationData = JSON.parse(jsonContent);
    } catch (e) {
      console.error('[AI-RECOMMENDATIONS] Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Add IDs to recommendations
    recommendationData.recommendations = recommendationData.recommendations.map((rec: any, i: number) => ({
      ...rec,
      id: `rec_${Date.now()}_${i}`
    }));

    // Store recommendations in database
    const { data: savedRec, error: saveError } = await supabase
      .from('ai_recommendations')
      .insert({
        influencer_id: user.id,
        recommendation_data: recommendationData,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[AI-RECOMMENDATIONS] Failed to save:', saveError);
      throw saveError;
    }

    console.log('[AI-RECOMMENDATIONS] Successfully generated and saved');

    return new Response(JSON.stringify({
      ...savedRec,
      recommendation_data: recommendationData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[AI-RECOMMENDATIONS] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate recommendations' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});