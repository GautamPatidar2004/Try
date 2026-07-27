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

    console.log('[CONTENT-RECOMMENDATIONS] Generating for user:', user.id);

    // Fetch user's content performance
    const { data: posts } = await supabase
      .from('content_posts')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({
        recommendations: [
          { type: 'posting_frequency', priority: 'high', message: 'Start posting regularly to build your presence' },
          { type: 'content_mix', priority: 'high', message: 'Mix different content types (photos, videos, stories)' },
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze posting patterns
    const postDates = posts.map(p => new Date(p.created_at).getDay());
    const postingByDay = postDates.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const bestDay = Object.entries(postingByDay)
      .sort(([, a], [, b]) => b - a)[0];

    // Analyze content types
    const mediaTypes = posts.map(p => p.media_type);
    const mediaTypeCount = mediaTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyze hashtag usage
    const allHashtags = posts.flatMap(p => p.hashtags || []);
    const hashtagPerformance = allHashtags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate recommendations
    const recommendations = [];

    // Posting time recommendation
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    recommendations.push({
      type: 'posting_time',
      priority: 'medium',
      message: `Your best performing day is ${dayNames[parseInt(bestDay[0])]}. Consider posting more on this day.`,
    });

    // Content diversity
    const dominantType = Object.entries(mediaTypeCount)
      .sort(([, a], [, b]) => b - a)[0];
    if (dominantType && (dominantType[1] / posts.length) > 0.7) {
      recommendations.push({
        type: 'content_mix',
        priority: 'high',
        message: 'Diversify your content types. Mix photos, videos, and other formats for better engagement.',
      });
    }

    // Hashtag recommendations
    const topHashtags = Object.entries(hashtagPerformance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    if (topHashtags.length > 0) {
      recommendations.push({
        type: 'hashtags',
        priority: 'low',
        message: `Your top performing hashtags: ${topHashtags.join(', ')}`,
      });
    }

    // Posting frequency
    const daysSinceLastPost = Math.floor(
      (Date.now() - new Date(posts[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastPost > 7) {
      recommendations.push({
        type: 'posting_frequency',
        priority: 'high',
        message: `It's been ${daysSinceLastPost} days since your last post. Post regularly to maintain engagement.`,
      });
    }

    console.log('[CONTENT-RECOMMENDATIONS] Generated:', recommendations.length);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[CONTENT-RECOMMENDATIONS] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});