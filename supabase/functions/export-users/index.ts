import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to chunk arrays for batched processing
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

    const { userIds, filters } = await req.json();

    let users: any[] = [];

    if (userIds && userIds.length > 0) {
      // Batch user IDs into chunks of 100 to avoid URL length limits
      const BATCH_SIZE = 100;
      const userIdChunks = chunkArray(userIds, BATCH_SIZE);
      
      console.log(`Processing ${userIds.length} users in ${userIdChunks.length} batches`);
      
      for (const chunk of userIdChunks) {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select(`
            *,
            hosts(*),
            influencers(*)
          `)
          .in('id', chunk);
        
        if (error) throw error;
        if (data) users = users.concat(data);
      }
    } else {
      // No specific user IDs - apply filters to get all matching users
      let query = supabaseClient
        .from('profiles')
        .select(`
          *,
          hosts(*),
          influencers(*)
        `);

      // Apply filters
      if (filters) {
        if (filters.userType) {
          query = query.eq('user_type', filters.userType);
        }
        if (filters.accountTier) {
          query = query.eq('account_tier', filters.accountTier);
        }
        if (filters.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive);
        }
        if (filters.isBanned !== undefined) {
          query = query.eq('is_banned', filters.isBanned);
        }
        if (filters.engagementMin !== undefined) {
          query = query.gte('engagement_score', filters.engagementMin);
        }
        if (filters.engagementMax !== undefined) {
          query = query.lte('engagement_score', filters.engagementMax);
        }
        if (filters.loginCountMin !== undefined) {
          query = query.gte('login_count', filters.loginCountMin);
        }
        if (filters.registeredAfter) {
          query = query.gte('created_at', filters.registeredAfter);
        }
        if (filters.registeredBefore) {
          query = query.lte('created_at', filters.registeredBefore);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      users = data || [];
    }

    // Fetch emails from auth.users using Admin API (emails are not in profiles table)
    const userEmails = new Map<string, string>();
    
    if (users.length > 0) {
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const { data: authData, error: authError } = await supabaseClient.auth.admin.listUsers({
          page: page,
          perPage: 1000
        });
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
          hasMore = false;
        } else if (!authData?.users || authData.users.length === 0) {
          hasMore = false;
        } else {
          for (const authUser of authData.users) {
            userEmails.set(authUser.id, authUser.email || '');
          }
          if (authData.users.length < 1000) {
            hasMore = false;
          }
          page++;
        }
      }
    }

    // Convert to CSV
    const headers = [
      'ID', 'Email', 'First Name', 'Last Name', 'User Type',
      'Profile Photo URL', 'Account Tier', 'Active', 'Banned', 'Engagement Score',
      'Login Count', 'Last Login', 'Created At'
    ];

    const rows = users.map(user => [
      user.id,
      userEmails.get(user.id) || '',
      user.first_name || '',
      user.last_name || '',
      user.user_type || '',
      user.profile_photo_url || '',
      user.account_tier || '',
      user.is_active ? 'Yes' : 'No',
      user.is_banned ? 'Yes' : 'No',
      user.engagement_score || 0,
      user.login_count || 0,
      user.last_login_at || '',
      user.created_at || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Log admin activity
    await supabaseClient.from('admin_activity_log').insert({
      admin_id: user.id,
      action: 'export_users',
      target_type: 'user',
      details: { count: users.length, filters },
    });

    return new Response(
      JSON.stringify({ csv, count: users.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in export-users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
