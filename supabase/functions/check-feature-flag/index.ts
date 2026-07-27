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

    const { flagName, userId } = await req.json();

    if (!flagName) {
      return new Response(
        JSON.stringify({ error: 'Flag name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking feature flag: ${flagName} for user: ${userId || 'anonymous'}`);

    // Fetch the feature flag
    const { data: flag, error } = await supabaseClient
      .from('feature_flags')
      .select('*')
      .eq('name', flagName)
      .single();

    if (error) {
      console.error('Error fetching feature flag:', error);
      return new Response(
        JSON.stringify({ enabled: false, reason: 'flag_not_found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!flag || !flag.is_enabled) {
      return new Response(
        JSON.stringify({ enabled: false, reason: 'flag_disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if targeted to specific users
    if (userId && flag.target_user_ids && flag.target_user_ids.length > 0) {
      const isTargeted = flag.target_user_ids.includes(userId);
      return new Response(
        JSON.stringify({ 
          enabled: isTargeted, 
          reason: isTargeted ? 'user_targeted' : 'not_targeted' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rollout percentage
    if (flag.rollout_percentage < 100 && userId) {
      const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const userPercentage = hash % 100;
      const enabled = userPercentage < flag.rollout_percentage;
      
      return new Response(
        JSON.stringify({ 
          enabled, 
          reason: enabled ? 'rollout_percentage' : 'rollout_excluded',
          rollout: flag.rollout_percentage 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enabled = flag.rollout_percentage === 100;
    return new Response(
      JSON.stringify({ 
        enabled, 
        reason: enabled ? 'fully_rolled_out' : 'partial_rollout' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-feature-flag:', error);
    return new Response(
      JSON.stringify({ error: error.message, enabled: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
