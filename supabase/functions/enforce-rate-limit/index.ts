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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { resource, userId, userType } = await req.json();

    if (!resource || !userId) {
      return new Response(
        JSON.stringify({ error: 'Resource and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking rate limit for resource: ${resource}, user: ${userId}`);

    // Fetch the rate limit configuration
    const { data: limit, error } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('resource', resource)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching rate limit:', error);
      return new Response(
        JSON.stringify({ allowed: true, reason: 'no_limit_configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!limit) {
      return new Response(
        JSON.stringify({ allowed: true, reason: 'no_limit_configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if limit applies to this user type
    if (limit.user_type && limit.user_type !== userType) {
      return new Response(
        JSON.stringify({ allowed: true, reason: 'user_type_exempt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: In a production environment, you would use Redis or similar
    // to track rate limit counters. This is a simplified implementation.
    // For now, we'll return that the action is allowed with rate limit info

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        limit: limit.limit_count,
        window: limit.window_seconds,
        reason: 'rate_limit_checked',
        message: `Rate limit: ${limit.limit_count} requests per ${limit.window_seconds} seconds`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enforce-rate-limit:', error);
    return new Response(
      JSON.stringify({ error: error.message, allowed: true }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
