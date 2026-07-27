import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not found');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not found');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get existing subscription plans from database
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (plansError) {
      throw new Error(`Failed to fetch plans: ${plansError.message}`);
    }

    console.log(`Found ${plans?.length || 0} plans to process`);

    const results = [];

    for (const plan of plans || []) {
      try {
        // Create Stripe product
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description || `${plan.name} subscription plan`,
          metadata: {
            plan_id: plan.id,
            max_applications: plan.max_applications_per_month?.toString() || '0',
          },
        });

        console.log(`Created product: ${product.id} for plan: ${plan.name}`);

        // Create monthly price
        let monthlyPrice = null;
        if (plan.price_monthly) {
          monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price_monthly,
            currency: 'usd',
            recurring: {
              interval: 'month',
              trial_period_days: plan.trial_days || 0,
            },
            metadata: {
              plan_id: plan.id,
              billing_interval: 'monthly',
            },
          });
          console.log(`Created monthly price: ${monthlyPrice.id}`);
        }

        // Create yearly price
        let yearlyPrice = null;
        if (plan.price_yearly) {
          yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price_yearly,
            currency: 'usd',
            recurring: {
              interval: 'year',
              trial_period_days: plan.trial_days || 0,
            },
            metadata: {
              plan_id: plan.id,
              billing_interval: 'yearly',
            },
          });
          console.log(`Created yearly price: ${yearlyPrice.id}`);
        }

        // Update the plan in database with Stripe IDs
        const { error: updateError } = await supabase
          .from('subscription_plans')
          .update({
            stripe_price_id_monthly: monthlyPrice?.id || null,
            stripe_price_id_yearly: yearlyPrice?.id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', plan.id);

        if (updateError) {
          console.error(`Failed to update plan ${plan.id}:`, updateError);
        } else {
          console.log(`Updated plan ${plan.id} with Stripe price IDs`);
        }

        results.push({
          plan_id: plan.id,
          plan_name: plan.name,
          product_id: product.id,
          monthly_price_id: monthlyPrice?.id,
          yearly_price_id: yearlyPrice?.id,
        });

      } catch (error) {
        console.error(`Error processing plan ${plan.id}:`, error);
        results.push({
          plan_id: plan.id,
          plan_name: plan.name,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} plans`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in setup-stripe-products:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});