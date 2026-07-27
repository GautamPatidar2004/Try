import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Verify admin authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles?.some(r => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { batchSize = 10, forceRecalculate = false } = await req.json().catch(() => ({}));

    console.log('[BULK-CALCULATE] Starting bulk calculation...');
    
    // Fetch all active properties
    const { data: properties, error: propError } = await supabaseClient
      .from('properties')
      .select('id, host_id')
      .eq('is_active', true);

    if (propError) throw propError;

    // Fetch all active influencers
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_type', 'influencer')
      .eq('is_active', true);

    if (profileError) throw profileError;

    const totalCombinations = (properties?.length || 0) * (profiles?.length || 0);
    
    console.log(`[BULK-CALCULATE] Found ${properties?.length} properties and ${profiles?.length} influencers = ${totalCombinations} combinations`);

    // Create operation record
    const { data: operation, error: opError } = await supabaseClient
      .from('bulk_match_operations')
      .insert({
        status: 'processing',
        total_combinations: totalCombinations,
        batch_size: batchSize,
        started_by: user.id,
        configuration: { forceRecalculate, batchSize },
      })
      .select()
      .single();

    if (opError) throw opError;

    // Start background processing
    processMatches(operation.id, properties || [], profiles || [], batchSize, forceRecalculate);

    return new Response(JSON.stringify({ 
      operationId: operation.id,
      totalCombinations,
      message: 'Bulk calculation started'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[BULK-CALCULATE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processMatches(
  operationId: string,
  properties: any[],
  profiles: any[],
  batchSize: number,
  forceRecalculate: boolean
) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let processed = 0;
  let success = 0;
  let failed = 0;
  let skipped = 0;
  const errorLog: any[] = [];

  try {
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const batch: Promise<void>[] = [];

      for (let j = 0; j < profiles.length && batch.length < batchSize; j++) {
        const profile = profiles[j];
        
        batch.push(
          (async () => {
            try {
              // Check if match already exists (< 24 hours old)
              if (!forceRecalculate) {
                const { data: existing } = await supabaseClient
                  .from('ai_match_scores')
                  .select('id, created_at')
                  .eq('property_id', property.id)
                  .eq('influencer_id', profile.id)
                  .single();

                if (existing) {
                  const age = Date.now() - new Date(existing.created_at).getTime();
                  if (age < 24 * 60 * 60 * 1000) {
                    skipped++;
                    return;
                  }
                }
              }

              // Call calculate-ai-match function
              const { data, error } = await supabaseClient.functions.invoke('calculate-ai-match', {
                body: {
                  influencerId: profile.id,
                  propertyId: property.id,
                },
              });

              if (error) {
                if (error.message?.includes('429')) {
                  // Rate limited - wait and retry
                  await new Promise(resolve => setTimeout(resolve, 5000));
                  
                  const { error: retryError } = await supabaseClient.functions.invoke('calculate-ai-match', {
                    body: {
                      influencerId: profile.id,
                      propertyId: property.id,
                    },
                  });

                  if (retryError) throw retryError;
                } else {
                  throw error;
                }
              }

              success++;
            } catch (err) {
              failed++;
              errorLog.push({
                propertyId: property.id,
                influencerId: profile.id,
                error: err.message,
                timestamp: new Date().toISOString(),
              });
              console.error(`[BULK-CALCULATE] Failed for property ${property.id}, influencer ${profile.id}:`, err);
            }
          })()
        );
      }

      // Wait for batch to complete
      await Promise.all(batch);
      processed += batch.length;

      // Update progress
      await supabaseClient
        .from('bulk_match_operations')
        .update({
          processed_count: processed,
          success_count: success,
          failed_count: failed,
          skipped_count: skipped,
          current_batch: i + 1,
          error_log: errorLog,
        })
        .eq('id', operationId);

      console.log(`[BULK-CALCULATE] Progress: ${processed}/${properties.length * profiles.length} (${success} success, ${failed} failed, ${skipped} skipped)`);

      // Small delay between batches to avoid rate limits
      if (i < properties.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Mark as completed
    await supabaseClient
      .from('bulk_match_operations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', operationId);

    console.log(`[BULK-CALCULATE] Completed! ${success} successful, ${failed} failed, ${skipped} skipped`);

  } catch (error) {
    console.error('[BULK-CALCULATE] Fatal error:', error);
    
    await supabaseClient
      .from('bulk_match_operations')
      .update({
        status: 'failed',
        error_log: [...errorLog, { error: error.message, timestamp: new Date().toISOString() }],
      })
      .eq('id', operationId);
  }
}
