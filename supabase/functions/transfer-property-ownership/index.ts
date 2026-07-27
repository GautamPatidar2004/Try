import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  action: 'transfer';
  propertyId: string;
  newHostId: string;
  reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user token and get claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Create service client for admin operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified:', userId);

    // Parse request body
    const body: TransferRequest = await req.json();
    const { action, propertyId, newHostId, reason } = body;

    if (action !== 'transfer') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!propertyId || !newHostId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: propertyId and newHostId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch property with current host info
    const { data: property, error: propertyError } = await serviceClient
      .from('properties')
      .select(`
        id,
        title,
        location,
        host_id,
        admin_notes,
        hosts!inner (
          id,
          business_name,
          profiles!inner (
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('Property fetch error:', propertyError);
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Property found:', property.title);

    // Fetch new host info
    const { data: newHost, error: newHostError } = await serviceClient
      .from('hosts')
      .select(`
        id,
        business_name,
        profiles!inner (
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', newHostId)
      .single();

    if (newHostError || !newHost) {
      console.error('New host fetch error:', newHostError);
      return new Response(
        JSON.stringify({ error: 'Target host not found. Make sure they have a host account.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('New host found:', newHost.business_name);

    // Check if already owned by this host
    if (property.host_id === newHostId) {
      return new Response(
        JSON.stringify({ error: 'Property is already owned by this host' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin info for logging
    const { data: adminProfile } = await serviceClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const adminName = adminProfile 
      ? `${adminProfile.first_name || ''} ${adminProfile.last_name || ''}`.trim() || 'Admin'
      : 'Admin';

    // Build transfer note
    const currentHost = property.hosts as any;
    const currentHostName = `${currentHost.profiles.first_name || ''} ${currentHost.profiles.last_name || ''}`.trim() 
      || 'Unknown Host';
    const newHostName = `${(newHost.profiles as any).first_name || ''} ${(newHost.profiles as any).last_name || ''}`.trim() 
      || 'Unknown Host';
    
    const transferNote = `[Transfer ${new Date().toISOString()}] Transferred from "${currentHostName}" (${currentHost.business_name || 'No business name'}) to "${newHostName}" (${newHost.business_name || 'No business name'}) by Admin: ${adminName}. Reason: ${reason || 'Not specified'}`;
    
    const updatedNotes = property.admin_notes 
      ? `${property.admin_notes}\n${transferNote}`
      : transferNote;

    // Perform the transfer
    const { error: updateError } = await serviceClient
      .from('properties')
      .update({ 
        host_id: newHostId,
        admin_notes: updatedNotes
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('Transfer update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to transfer property' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Property transferred successfully');

    // Log to admin_activity_log
    const { error: logError } = await serviceClient
      .from('admin_activity_log')
      .insert({
        admin_id: userId,
        action: 'property_transfer',
        target_type: 'property',
        target_id: propertyId,
        details: {
          property_title: property.title,
          property_location: property.location,
          previous_host_id: property.host_id,
          previous_host_name: currentHostName,
          previous_host_business: currentHost.business_name,
          new_host_id: newHostId,
          new_host_name: newHostName,
          new_host_business: newHost.business_name,
          reason: reason || null,
        },
      });

    if (logError) {
      console.error('Activity log error (non-fatal):', logError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Property transferred successfully',
        property: {
          id: property.id,
          title: property.title,
        },
        previousHost: {
          id: property.host_id,
          name: currentHostName,
          businessName: currentHost.business_name,
        },
        newHost: {
          id: newHostId,
          name: newHostName,
          businessName: newHost.business_name,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
