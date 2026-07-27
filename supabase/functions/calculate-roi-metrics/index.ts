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

    const { collaborationId } = await req.json();
    console.log('[ROI-METRICS] Calculating for collaboration:', collaborationId);

    // Fetch collaboration details
    const { data: collaboration } = await supabase
      .from('collaboration_agreements')
      .select('*, properties(*)')
      .eq('id', collaborationId)
      .single();

    if (!collaboration) {
      return new Response(JSON.stringify({ 
        error: 'Collaboration not found',
        collaborationId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch content deliveries for this collaboration
    const { data: deliveries } = await supabase
      .from('content_deliveries')
      .select('*, content_posts(*)')
      .eq('agreement_id', collaborationId);

    // Calculate total engagement
    const totalLikes = deliveries?.reduce((sum, d) => 
      sum + (d.content_posts?.likes_count || 0), 0) || 0;
    const totalViews = deliveries?.reduce((sum, d) => 
      sum + (d.content_posts?.views_count || 0), 0) || 0;

    // Calculate reach
    const totalReach = totalViews || (totalLikes * 10); // Estimate reach if views not available

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100) : 0;

    // Calculate cost per engagement
    const agreedRate = collaboration.agreed_rate || 0;
    const costPerEngagement = totalLikes > 0 ? agreedRate / totalLikes : 0;
    const costPerThousandImpressions = totalReach > 0 ? (agreedRate / totalReach) * 1000 : 0;

    // Calculate ROI metrics
    const estimatedValue = totalReach * 0.05; // $0.05 per impression industry standard
    const roi = agreedRate > 0 ? ((estimatedValue - agreedRate) / agreedRate) * 100 : 0;

    const result = {
      collaborationId,
      propertyName: collaboration.properties?.title || 'Unknown',
      agreedRate,
      totalReach,
      totalEngagement: totalLikes,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      costPerEngagement: parseFloat(costPerEngagement.toFixed(2)),
      costPerThousandImpressions: parseFloat(costPerThousandImpressions.toFixed(2)),
      estimatedValue: Math.round(estimatedValue),
      roi: parseFloat(roi.toFixed(2)),
      deliverableCount: deliveries?.length || 0,
    };

    console.log('[ROI-METRICS] Calculated:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ROI-METRICS] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});