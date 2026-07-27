import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const appDomain = Deno.env.get('APP_DOMAIN') || 'https://hostfluencer-influencer.lovable.app';

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      title,
      description,
      location,
      property_type,
      max_guests,
      bedrooms,
      bathrooms,
      amenities,
      content_requirements,
      currency,
      campaign_rate, // in cents
    } = body;

    // Validate required fields
    if (!title || !location || !property_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate campaign rate minimum $250 = 25000 cents
    if (!campaign_rate || campaign_rate < 25000) {
      return new Response(JSON.stringify({ error: 'Campaign rate must be at least $250' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const platformFeeCents = Math.round(campaign_rate * 0.20);
    const creatorPayoutCents = campaign_rate - platformFeeCents;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert property with awaiting_payment status
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert({
        host_id: user.id,
        title,
        description: description || null,
        location,
        property_type,
        max_guests: max_guests || 1,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        amenities: amenities || [],
        collaboration_type: 'free_stay',
        discount_percentage: null,
        content_requirements: content_requirements || [],
        base_nightly_rate: null,
        currency: currency || 'USD',
        campaign_rate,
        platform_fee: platformFeeCents,
        creator_payout: creatorPayoutCents,
        payment_status: 'awaiting_payment',
        is_active: false,
      })
      .select('id')
      .single();

    if (insertError || !property) {
      console.error('Error inserting property:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create property' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Stripe Checkout Session
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Property Listing: ${title}`,
              description: `Property listing campaign on Hostfluencer - ${location}`,
            },
            unit_amount: campaign_rate,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'property_listing',
        property_id: property.id,
        user_id: user.id,
      },
      success_url: `${appDomain}/properties/confirmation?property_id=${property.id}`,
      cancel_url: `${appDomain}/profile?tab=properties&cancelled=true`,
      customer_email: user.email,
    });

    // Store checkout session ID
    await supabase
      .from('properties')
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq('id', property.id);

    return new Response(
      JSON.stringify({ url: checkoutSession.url, property_id: property.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating property checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
