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

    // Fetch all users
    const { data: users, error } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, phone, location');

    if (error) throw error;

    // Detect duplicates based on multiple criteria
    const duplicateGroups = [];
    const processedUsers = new Set();

    for (let i = 0; i < users.length; i++) {
      if (processedUsers.has(users[i].id)) continue;

      const matchingUsers = [users[i].id];
      const matchingFields = [];
      let similarityScore = 0;

      for (let j = i + 1; j < users.length; j++) {
        if (processedUsers.has(users[j].id)) continue;

        let matches = 0;

        // Check name similarity
        if (users[i].first_name && users[j].first_name &&
            users[i].first_name.toLowerCase() === users[j].first_name.toLowerCase() &&
            users[i].last_name && users[j].last_name &&
            users[i].last_name.toLowerCase() === users[j].last_name.toLowerCase()) {
          matches += 40;
          matchingFields.push('name');
        }

        // Check phone similarity
        if (users[i].phone && users[j].phone && users[i].phone === users[j].phone) {
          matches += 30;
          matchingFields.push('phone');
        }

        // Check location similarity
        if (users[i].location && users[j].location &&
            users[i].location.toLowerCase() === users[j].location.toLowerCase()) {
          matches += 10;
          matchingFields.push('location');
        }

        // If similarity score is high enough, consider it a duplicate
        if (matches >= 50) {
          matchingUsers.push(users[j].id);
          processedUsers.add(users[j].id);
          similarityScore = Math.max(similarityScore, matches);
        }
      }

      if (matchingUsers.length > 1) {
        processedUsers.add(users[i].id);
        duplicateGroups.push({
          user_ids: matchingUsers,
          similarity_score: similarityScore,
          matching_fields: matchingFields,
          status: 'pending',
        });
      }
    }

    // Save duplicate groups to database
    if (duplicateGroups.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('duplicate_account_groups')
        .insert(duplicateGroups);

      if (insertError) {
        console.error('Error saving duplicate groups:', insertError);
      }
    }

    // Log admin activity
    await supabaseClient.from('admin_activity_log').insert({
      admin_id: user.id,
      action: 'detect_duplicates',
      target_type: 'user',
      details: { found: duplicateGroups.length },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: duplicateGroups.length,
        duplicates: duplicateGroups 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-duplicates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
