import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostToBoost {
  id: string;
  created_at: string;
  views_count: number;
}

// Calculate target views based on post age (exponential decay curve)
function calculateTargetViews(ageInMinutes: number): number {
  if (ageInMinutes >= 180) return 1000; // 3 hours = full boost
  
  // Exponential decay curve for natural-looking growth
  const progress = ageInMinutes / 180; // 0 to 1
  const curve = Math.pow(progress, 0.7); // Steeper early growth
  return Math.floor(curve * 1000);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Restrict to internal/cron callers (must pass the service role key as Bearer token).
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token || token !== supabaseKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting view boost job...');

    // Get posts created in the last 3 hours that are published and approved
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    
    const { data: posts, error: fetchError } = await supabase
      .from('content_posts')
      .select('id, created_at, views_count')
      .gte('created_at', threeHoursAgo)
      .eq('delivery_status', 'published')
      .eq('host_approval_status', 'approved')
      .lt('views_count', 1000); // Only boost posts under 1000 views

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      console.log('No posts to boost');
      return new Response(
        JSON.stringify({ message: 'No posts to boost', boosted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${posts.length} posts to process`);

    // Calculate updates for each post
    const updates = posts.map((post: PostToBoost) => {
      const postAge = Date.now() - new Date(post.created_at).getTime();
      const ageInMinutes = Math.floor(postAge / 60000);
      const targetViews = calculateTargetViews(ageInMinutes);
      const viewsToAdd = Math.max(0, targetViews - post.views_count);

      return {
        id: post.id,
        newViews: Math.min(post.views_count + viewsToAdd, 1000),
        added: viewsToAdd,
      };
    }).filter(update => update.added > 0);

    if (updates.length === 0) {
      console.log('All posts are already at target views');
      return new Response(
        JSON.stringify({ message: 'All posts up to date', boosted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update posts in batch
    let boostedCount = 0;
    let totalViewsAdded = 0;

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('content_posts')
        .update({ views_count: update.newViews })
        .eq('id', update.id);

      if (updateError) {
        console.error(`Error updating post ${update.id}:`, updateError);
      } else {
        boostedCount++;
        totalViewsAdded += update.added;
        console.log(`Boosted post ${update.id}: added ${update.added} views (now at ${update.newViews})`);
      }
    }

    const result = {
      message: 'View boost completed',
      boosted: boostedCount,
      totalViewsAdded,
      processed: posts.length,
    };

    console.log('Boost job completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in boost-post-views function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
