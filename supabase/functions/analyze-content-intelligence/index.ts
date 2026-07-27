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

    console.log('[CONTENT-INTELLIGENCE] Analyzing for user:', user.id);

    // Check rate limiting - only allow once per 7 days
    const { data: recentReport } = await supabase
      .from('content_intelligence_reports')
      .select('created_at')
      .eq('influencer_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentReport) {
      return new Response(JSON.stringify({ 
        error: 'Rate limited. Please wait 7 days between intelligence reports.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch comprehensive creator data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, influencers(*)')
      .eq('id', user.id)
      .single();

    const { data: posts } = await supabase
      .from('content_posts')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('influencer_id', user.id);

    const { data: collaborations } = await supabase
      .from('collaboration_agreements')
      .select('*, properties(*)')
      .eq('influencer_id', user.id);

    const { data: applications } = await supabase
      .from('applications')
      .select('*, properties(*)')
      .eq('influencer_id', user.id);

    const { data: rates } = await supabase
      .from('collaboration_rates')
      .select('*')
      .eq('influencer_id', user.id);

    const { data: benchmarks } = await supabase
      .from('benchmark_data')
      .select('*');

    // Calculate advanced metrics
    const totalFollowers = socialAccounts?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0;
    const totalPosts = posts?.length || 0;
    const totalEngagement = posts?.reduce((sum, p) => sum + (p.likes_count || 0) + (p.views_count || 0), 0) || 0;
    const avgEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;
    const engagementRate = totalFollowers > 0 ? (avgEngagement / totalFollowers) * 100 : 0;
    
    const acceptedCollaborations = collaborations?.filter(c => c.status === 'active').length || 0;
    const totalApplications = applications?.length || 0;
    const successRate = totalApplications > 0 ? (acceptedCollaborations / totalApplications) * 100 : 0;

    // Build comprehensive AI prompt
    const prompt = `You are an advanced AI analyst specializing in content creator intelligence and market positioning. Analyze this creator's comprehensive data and provide deep strategic insights.

CREATOR PROFILE:
- Name: ${profile?.first_name} ${profile?.last_name}
- Niches: ${profile?.influencers?.content_niches?.join(', ') || 'Not specified'}
- Total Followers: ${totalFollowers.toLocaleString()}
- Platforms: ${socialAccounts?.map(a => `${a.platform} (${a.follower_count?.toLocaleString()} followers)`).join(', ')}

PERFORMANCE METRICS:
- Total Posts: ${totalPosts}
- Average Engagement: ${avgEngagement.toFixed(0)} per post
- Engagement Rate: ${engagementRate.toFixed(2)}%
- Collaboration Success Rate: ${successRate.toFixed(1)}%
- Active Collaborations: ${acceptedCollaborations}

CONTENT ANALYSIS (Last ${Math.min(totalPosts, 100)} posts):
${posts?.slice(0, 20).map((p, i) => `
Post ${i + 1}: ${p.media_type} - ${p.likes_count || 0} likes, ${p.views_count || 0} views
Hashtags: ${p.hashtags?.slice(0, 5).join(', ') || 'None'}
Status: ${p.delivery_status}`).join('\n')}

COLLABORATION HISTORY:
- Total Applications: ${totalApplications}
- Accepted: ${acceptedCollaborations}
- Success Rate: ${successRate.toFixed(1)}%

RATE CARD:
${rates?.map(r => `${r.collaboration_type}: $${r.base_rate || 'Not set'}`).join('\n') || 'No rates defined'}

MARKET DATA:
${benchmarks?.slice(0, 3).map(b => `${b.platform} ${b.follower_range}: ${b.avg_engagement_rate}% avg engagement`).join('\n')}

Provide a comprehensive intelligence report with the following structure:

{
  "overallScore": number (0-100, weighted assessment of creator's market position),
  "scores": {
    "contentQuality": number (0-100),
    "growthTrajectory": number (0-100),
    "monetizationPotential": number (0-100),
    "marketPosition": number (0-100)
  },
  "trendAnalysis": {
    "trendingTopics": [
      {
        "topic": string,
        "opportunityScore": number (0-100),
        "currentCoverage": string,
        "recommendation": string
      }
    ],
    "contentGaps": [string],
    "emergingOpportunities": [string]
  },
  "contentStrategy": {
    "bestPerformingTypes": [{"type": string, "avgEngagement": number}],
    "underperformingTypes": [{"type": string, "reason": string}],
    "quickWins": [string],
    "longTermBets": [string]
  },
  "audienceInsights": {
    "bestPostingTimes": [{"day": string, "time": string, "score": number}],
    "contentPreferences": [string],
    "engagementDrivers": [string],
    "growthPredictions": {
      "30days": string,
      "60days": string,
      "90days": string
    }
  },
  "competitivePosition": {
    "strengths": [string],
    "weaknesses": [string],
    "differentiators": [string],
    "benchmarkComparison": string
  },
  "collaborationIntelligence": {
    "idealPropertyTypes": [string],
    "predictedSuccessRate": number,
    "estimatedRoiRange": string,
    "recommendedTypes": [string]
  },
  "actionPlan": {
    "immediate": [string],
    "short_term": [string],
    "long_term": [string],
    "kpis": [{"metric": string, "target": string, "timeframe": string}]
  }
}

Return ONLY valid JSON. Be specific and data-driven.`;

    console.log('[CONTENT-INTELLIGENCE] Calling Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert content intelligence analyst. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[CONTENT-INTELLIGENCE] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    // Parse AI response - strip markdown code blocks if present
    let intelligenceData;
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
      
      intelligenceData = JSON.parse(jsonContent);
    } catch (e) {
      console.error('[CONTENT-INTELLIGENCE] Failed to parse:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Store report in database
    const { data: savedReport, error: saveError } = await supabase
      .from('content_intelligence_reports')
      .insert({
        influencer_id: user.id,
        intelligence_data: intelligenceData,
        overall_score: intelligenceData.overallScore || 0,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[CONTENT-INTELLIGENCE] Failed to save:', saveError);
      throw saveError;
    }

    console.log('[CONTENT-INTELLIGENCE] Successfully generated and saved');

    return new Response(JSON.stringify({
      ...savedReport,
      intelligence_data: intelligenceData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[CONTENT-INTELLIGENCE] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate intelligence report' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});