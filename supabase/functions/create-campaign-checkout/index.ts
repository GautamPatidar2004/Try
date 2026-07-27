import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GIFTED_LISTING_FEE_CENTS = 20000; // $200

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
      campaign_title,
      campaign_description,
      campaign_type,
      target_destination,
      deliverables_count,
      start_date,
      end_date,
      creator_niche,
      min_followers,
      creators_needed,
      geo_focus,
      requirements,
      total_budget, // in dollars (only used for paid campaigns)
      compensation_type, // 'paid' | 'gifted' | 'affiliate'
      product_description, // for gifted campaigns
      affiliate_percentage, // for affiliate campaigns
      campaign_subject_type,
      property_id,
    } = body;

    const isGifted = compensation_type === 'gifted';
    const isAffiliate = compensation_type === 'affiliate';

    // Validate required fields
    if (!campaign_title || !campaign_description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Validate campaign subject type
if (
  campaign_subject_type === 'property_stay' &&
  !property_id
) {
  return new Response(
    JSON.stringify({
      error: 'Property is required for property stay campaigns',
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

    let totalBudgetCents: number;
    let platformFeeCents: number;
    let creatorPayoutCents: number;

    if (isGifted || isAffiliate) {
      // Gifted/Affiliate: flat $200 listing fee, no creator payout through platform
      totalBudgetCents = GIFTED_LISTING_FEE_CENTS;
      platformFeeCents = GIFTED_LISTING_FEE_CENTS;
      creatorPayoutCents = 0;
    } else {
      // Paid: validate budget and calculate 20% fee
      if (!total_budget) {
        return new Response(JSON.stringify({ error: 'Budget is required for paid campaigns' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (total_budget < 500) {
        return new Response(JSON.stringify({ error: 'Minimum campaign budget is $500' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      totalBudgetCents = Math.round(total_budget * 100);
      platformFeeCents = Math.round(totalBudgetCents * 0.20);
      creatorPayoutCents = totalBudgetCents - platformFeeCents;
    }

    // Get brand name from profile
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const brandName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Brand' : 'Brand';

    // Insert campaign with awaiting_payment status
    const { data: campaign, error: insertError } = await supabase
      .from('brand_campaigns')
      .insert({
        created_by: user.id,
        brand_name: brandName,
        campaign_title,
        campaign_description,
        campaign_type,
        target_destination,
        deliverables_count: deliverables_count || 1,
        deliverables: [],
        compensation_type: isAffiliate ? 'affiliate' : isGifted ? 'product' : 'paid',
        affiliate_enabled: isAffiliate ? true : false,
        affiliate_percentage: isAffiliate ? (affiliate_percentage || 10) : null,
        required_niches: creator_niche || [],
        min_followers: min_followers ? parseInt(min_followers) : 0,
        creators_needed: creators_needed || 1,
        geo_focus,
        requirements: isGifted && product_description
          ? `${requirements || ''}\n\nProduct/Gift: ${product_description}`.trim()
          : requirements,
        total_budget: totalBudgetCents,
        platform_fee: platformFeeCents,
        creator_payout: creatorPayoutCents,
        budget_min: (isGifted || isAffiliate) ? 0 : totalBudgetCents,
        spots_available: creators_needed || 1,
        status: 'pending',
        payment_status: 'awaiting_payment',
        timeline_start: start_date || null,
        timeline_end: end_date || null,
        campaign_subject_type:
       campaign_subject_type || 'platform_brand',

      property_id:
      campaign_subject_type === 'property_stay'
         ? property_id
        : null,
      })
      .select('id')
      .single();

    if (insertError || !campaign) {
      console.error('Error inserting campaign:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create campaign' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Stripe Checkout Session
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const lineItemName = isGifted
      ? `Gifted Campaign Listing: ${campaign_title}`
      : isAffiliate
      ? `Affiliate Campaign Listing: ${campaign_title}`
      : `Campaign: ${campaign_title}`;
    const lineItemDescription = isGifted
      ? `Gifted campaign listing fee on Hostfluencer`
      : isAffiliate
      ? `Affiliate campaign listing fee on Hostfluencer`
      : `Brand campaign on Hostfluencer - ${creators_needed || 1} creator(s)`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: lineItemName,
              description: lineItemDescription,
            },
            unit_amount: (isGifted || isAffiliate) ? GIFTED_LISTING_FEE_CENTS : totalBudgetCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'campaign_payment',
        campaign_id: campaign.id,
        user_id: user.id,
        compensation_type: isAffiliate ? 'affiliate' : isGifted ? 'gifted' : 'paid',
      },
      success_url: `${appDomain}/campaigns/confirmation?campaign_id=${campaign.id}`,
      cancel_url: `${appDomain}/campaigns/create?cancelled=true`,
      customer_email: user.email,
    });

    // Store checkout session ID
    await supabase
      .from('brand_campaigns')
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq('id', campaign.id);

    return new Response(
      JSON.stringify({ url: checkoutSession.url, campaign_id: campaign.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating campaign checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
