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

    console.log('[ACCOUNT-VALUE] Calculating for user:', user.id);

    // Fetch influencer profile and social accounts
    const { data: profile } = await supabase
      .from('influencers')
      .select('*, profiles!inner(*)')
      .eq('id', user.id)
      .single();

    const { data: socialAccounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('influencer_id', user.id);

    const { data: contentPosts } = await supabase
      .from('content_posts')
      .select('*')
      .eq('influencer_id', user.id);

    const { data: collaborations } = await supabase
      .from('collaboration_agreements')
      .select('*')
      .eq('influencer_id', user.id)
      .eq('status', 'active');

    // Calculate total reach
    const totalFollowers = socialAccounts?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0;

    // Calculate engagement rate
    const totalEngagement = contentPosts?.reduce((sum, post) => 
      sum + (post.likes_count || 0) + (post.views_count || 0) * 0.1, 0) || 0;
    const avgEngagement = contentPosts?.length > 0 ? totalEngagement / contentPosts.length : 0;
    const engagementRate = totalFollowers > 0 ? (avgEngagement / totalFollowers) * 100 : 0;

    // Calculate base value per post
    let baseValuePerPost = 0;
    if (totalFollowers < 10000) {
      baseValuePerPost = totalFollowers * 0.01;
    } else if (totalFollowers < 50000) {
      baseValuePerPost = totalFollowers * 0.015;
    } else if (totalFollowers < 100000) {
      baseValuePerPost = totalFollowers * 0.02;
    } else {
      baseValuePerPost = totalFollowers * 0.025;
    }

    // Apply engagement multiplier
    const engagementMultiplier = Math.max(0.5, Math.min(2.0, engagementRate / 3));
    const valuePerPost = Math.round(baseValuePerPost * engagementMultiplier);

    // Calculate monthly value based on typical posting frequency
    const avgPostsPerMonth = 12; // Industry average
    const monthlyValue = valuePerPost * avgPostsPerMonth;

    // Calculate annual value
    const annualValue = monthlyValue * 12;

    // Calculate platform breakdown
    const platformValues = socialAccounts?.map(account => {
      const followers = account.follower_count || 0;
      const platformMultiplier = account.platform === 'instagram' ? 1.2 : 
                                 account.platform === 'tiktok' ? 1.0 : 
                                 account.platform === 'youtube' ? 1.5 : 0.8;
      return {
        platform: account.platform,
        followers,
        valuePerPost: Math.round((followers * 0.02) * platformMultiplier),
      };
    }) || [];

    const result = {
      totalFollowers,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      valuePerPost,
      monthlyValue,
      annualValue,
      platformValues,
      collaborationCount: collaborations?.length || 0,
      contentCount: contentPosts?.length || 0,
    };

    console.log('[ACCOUNT-VALUE] Calculated:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ACCOUNT-VALUE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});