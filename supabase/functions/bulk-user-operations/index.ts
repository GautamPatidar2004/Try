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

    const { operation, userIds, reason } = await req.json();

    if (!operation || !userIds || !Array.isArray(userIds)) {
      throw new Error('Invalid request: operation and userIds array required');
    }

    let updateData: any = {};
    let activityType = '';
    let activityDescription = '';

    switch (operation) {
      case 'activate':
        updateData = { is_active: true, is_banned: false };
        activityType = 'bulk_activate';
        activityDescription = 'Account activated by admin';
        break;
      case 'deactivate':
        updateData = { is_active: false };
        activityType = 'bulk_deactivate';
        activityDescription = 'Account deactivated by admin';
        break;
      case 'ban':
        if (!reason) {
          throw new Error('Ban reason required');
        }
        updateData = {
          is_banned: true,
          is_active: false,
          ban_reason: reason,
          banned_at: new Date().toISOString(),
          banned_by_admin_id: user.id,
        };
        activityType = 'bulk_ban';
        activityDescription = `Account banned by admin: ${reason}`;
        break;
      default:
        throw new Error(`Invalid operation: ${operation}`);
    }

    // Update users in bulk
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .in('id', userIds);

    if (updateError) throw updateError;

    // Log activity for each user
    const activityLogs = userIds.map(userId => ({
      user_id: userId,
      activity_type: activityType,
      activity_description: activityDescription,
      metadata: { admin_id: user.id, operation, reason },
    }));

    const { error: logError } = await supabaseClient
      .from('user_activity_timeline')
      .insert(activityLogs);

    if (logError) {
      console.error('Failed to log activity:', logError);
    }

    // Log admin activity
    await supabaseClient.from('admin_activity_log').insert({
      admin_id: user.id,
      action: `bulk_${operation}`,
      target_type: 'user',
      details: { userIds, count: userIds.length, reason },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        affected: userIds.length,
        message: `Successfully ${operation}d ${userIds.length} users` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk-user-operations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
