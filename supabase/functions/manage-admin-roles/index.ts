import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

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

    // Verify the requesting user is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin
    const { data: adminCheck } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminCheck) {
      console.error('User is not an admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!action || !['grant', 'revoke'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Valid action (grant or revoke) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-removal
    if (action === 'revoke' && targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot remove your own admin privileges' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify target user exists
    const { data: targetProfile } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!targetProfile) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'grant') {
      // Grant admin role
      const { data: existingRole } = await supabaseClient
        .from('user_roles')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (existingRole) {
        return new Response(
          JSON.stringify({ error: 'User already has admin role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role: 'admin',
          granted_by: user.id,
          granted_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error granting admin role:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to grant admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log the action
      await supabaseClient
        .from('admin_activity_log')
        .insert({
          admin_id: user.id,
          action: 'grant_admin_role',
          target_type: 'user',
          target_id: targetUserId,
          details: {
            target_name: `${targetProfile.first_name || ''} ${targetProfile.last_name || ''}`.trim()
          }
        });

      console.log(`Admin role granted to ${targetUserId} by ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin role granted successfully',
          targetUser: targetProfile 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'revoke') {
      // Check if this is the last admin
      const { data: adminCount } = await supabaseClient
        .from('user_roles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        return new Response(
          JSON.stringify({ error: 'Cannot remove the last admin' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Revoke admin role
      const { error: deleteError } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', 'admin');

      if (deleteError) {
        console.error('Error revoking admin role:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to revoke admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log the action
      await supabaseClient
        .from('admin_activity_log')
        .insert({
          admin_id: user.id,
          action: 'revoke_admin_role',
          target_type: 'user',
          target_id: targetUserId,
          details: {
            target_name: `${targetProfile.first_name || ''} ${targetProfile.last_name || ''}`.trim()
          }
        });

      console.log(`Admin role revoked from ${targetUserId} by ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin role revoked successfully',
          targetUser: targetProfile 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manage-admin-roles function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});