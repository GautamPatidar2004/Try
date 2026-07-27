// supabase/functions/sync-all-post-analytics/index.ts
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Saare posts jo social_post_url rakhte hain
    const { data: posts, error } = await supabaseClient
      .from('content_posts')
      .select('id, influencer_id, social_post_url')
      .not('social_post_url', 'is', null);

    if (error) throw error;

    console.log(`[Sync All] Total posts to sync: ${posts?.length}`);

    const results: { postId: string; success: boolean; error?: string }[] = [];

    for (const post of posts || []) {
      try {
        // sync-post-analytics function call karo
        const response = await supabaseClient.functions.invoke('sync-post-analytics', {
          body: {
            postId: post.id,
            userId: post.influencer_id,
            postUrl: post.social_post_url,
          }
        });
        results.push({ postId: post.id, success: true });
        console.log(`[Sync All] Synced post: ${post.id}`);
      } catch (err) {
        results.push({ postId: post.id, success: false, error: err.message });
        console.error(`[Sync All] Failed post: ${post.id}`, err);
      }

      // Rate limit avoid karne ke liye 500ms wait
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({ success: true, synced: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Sync All] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});