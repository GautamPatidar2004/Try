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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin access
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: adminCheck } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { primaryUserId, secondaryUserIds } = await req.json();

    if (!primaryUserId || !secondaryUserIds || !Array.isArray(secondaryUserIds)) {
      throw new Error('Invalid request: primaryUserId and secondaryUserIds array required');
    }

    console.log(`Merging accounts: ${secondaryUserIds.join(', ')} into ${primaryUserId}`);

    // Tables to merge
    const tablesToMerge = [
      'applications',
      'properties',
      'content_posts',
      'collaboration_agreements',
      'messages',
      'user_follows',
      'likes',
      'comments',
      'point_transactions',
      'user_badges',
      'onboarding_progress',
    ];

    // For each secondary account, update references to point to primary account
    for (const secondaryId of secondaryUserIds) {
      // Update foreign key references in various tables
      for (const table of tablesToMerge) {
        try {
          // Try updating common ID fields
          const { error: updateError1 } = await supabaseClient
            .from(table)
            .update({ user_id: primaryUserId })
            .eq('user_id', secondaryId);

          if (updateError1 && !updateError1.message.includes('column \"user_id\" of relation')) {
            console.error(`Error updating ${table} user_id:`, updateError1);
          }

          // Try influencer_id
          const { error: updateError2 } = await supabaseClient
            .from(table)
            .update({ influencer_id: primaryUserId })
            .eq('influencer_id', secondaryId);

          if (updateError2 && !updateError2.message.includes('column \"influencer_id\" of relation')) {
            console.error(`Error updating ${table} influencer_id:`, updateError2);
          }

          // Try host_id
          const { error: updateError3 } = await supabaseClient
            .from(table)
            .update({ host_id: primaryUserId })
            .eq('host_id', secondaryId);

          if (updateError3 && !updateError3.message.includes('column \"host_id\" of relation')) {
            console.error(`Error updating ${table} host_id:`, updateError3);
          }

          // Try sender_id and receiver_id for messages
          if (table === 'messages') {
            await supabaseClient
              .from(table)
              .update({ sender_id: primaryUserId })
              .eq('sender_id', secondaryId);

            await supabaseClient
              .from(table)
              .update({ receiver_id: primaryUserId })
              .eq('receiver_id', secondaryId);
          }

          // Try follower_id and following_id for follows
          if (table === 'user_follows') {
            await supabaseClient
              .from(table)
              .update({ follower_id: primaryUserId })
              .eq('follower_id', secondaryId);

            await supabaseClient
              .from(table)
              .update({ following_id: primaryUserId })
              .eq('following_id', secondaryId);
          }
        } catch (err) {
          console.error(`Error merging ${table} for user ${secondaryId}:`, err);
        }
      }

      // Merge profile data (keep primary, but update engagement metrics)
      const { data: secondaryProfile } = await supabaseClient
        .from('profiles')
        .select('engagement_score, login_count')
        .eq('id', secondaryId)
        .single();

      if (secondaryProfile) {
        const { data: primaryProfile } = await supabaseClient
          .from('profiles')
          .select('engagement_score, login_count')
          .eq('id', primaryUserId)
          .single();

        if (primaryProfile) {
          await supabaseClient
            .from('profiles')
            .update({
              engagement_score: (primaryProfile.engagement_score || 0) + (secondaryProfile.engagement_score || 0),
              login_count: (primaryProfile.login_count || 0) + (secondaryProfile.login_count || 0),
            })
            .eq('id', primaryUserId);
        }
      }

      // Deactivate secondary account
      await supabaseClient
        .from('profiles')
        .update({
          is_active: false,
          admin_notes: `Merged into account ${primaryUserId} by admin`,
        })
        .eq('id', secondaryId);

      // Log activity
      await supabaseClient.from('user_activity_timeline').insert({
        user_id: secondaryId,
        activity_type: 'account_merged',
        activity_description: `Account merged into ${primaryUserId}`,
        metadata: { merged_by: user.id },
      });
    }

    // Log admin activity
    await supabaseClient.from('admin_activity_log').insert({
      admin_id: user.id,
      action: 'merge_accounts',
      target_type: 'user',
      target_id: primaryUserId,
      details: { secondaryUserIds, count: secondaryUserIds.length },
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully merged ${secondaryUserIds.length} accounts into ${primaryUserId}`,
        primaryUserId,
        mergedCount: secondaryUserIds.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in merge-accounts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

