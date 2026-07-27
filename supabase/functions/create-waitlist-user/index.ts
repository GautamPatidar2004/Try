import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  name: string;
  tempPassword: string;
  userType: string | null;
  waitlistId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin authorization check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { email, name, tempPassword, userType, waitlistId } = body as CreateUserRequest;

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!email || !emailRegex.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!name || name.length < 1 || name.length > 100) {
      return new Response(JSON.stringify({ error: "Name must be between 1 and 100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!tempPassword || tempPassword.length < 8 || tempPassword.length > 72) {
      return new Response(JSON.stringify({ error: "Password must be between 8 and 72 characters" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (userType && !['host', 'influencer', 'both'].includes(userType)) {
      return new Response(JSON.stringify({ error: "Invalid user type. Must be 'host', 'influencer', or 'both'" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!waitlistId || !uuidRegex.test(waitlistId)) {
      return new Response(JSON.stringify({ error: "Invalid waitlist ID format" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing waitlist entry:', { waitlistId, userType });

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify caller is an admin
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!adminRole) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try to create auth user with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        from_waitlist: true,
        temp_password: true
      }
    });

    let userId: string;
    let isExistingUser = false;

    if (authError) {
      // Handle case where user already exists
      if (authError.message.includes('already been registered') || authError.message.includes('email_exists')) {
        // Refuse to overwrite an existing user's password. Direct admin to use
        // the standard password-reset flow instead.
        console.warn('Refusing to overwrite existing user password for:', email);
        return new Response(
          JSON.stringify({
            error: 'A user with this email already exists. Use the password reset flow instead of re-inviting.',
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        // Handle other auth errors
        console.error('Auth creation error:', authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // New user created successfully
      userId = authData.user?.id!;
      console.log('New user created successfully:', userId);
    }

    // Update waitlist entry status
    const { error: updateError } = await supabaseAdmin
      .from('waitlist')
      .update({
        status: 'invited',
        invited_at: new Date().toISOString(),
        temp_password: tempPassword
      })
      .eq('id', waitlistId);

    if (updateError) {
      console.error('Waitlist update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update waitlist status' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Waitlist entry updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userId,
        message: isExistingUser ? 'Existing user updated and waitlist updated successfully' : 'User created and waitlist updated successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in create-waitlist-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);