import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 1. Authenticate User
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new Error(`Authentication error: ${userError?.message || 'User not authenticated'}`);
    }

    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id });

    // 2. Parse & Validate Payload
    const body = await req.json();
    const { planId, billingInterval = 'monthly', returnUrl } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!planId || !uuidRegex.test(planId)) {
      return new Response(JSON.stringify({ error: "Invalid plan ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return new Response(JSON.stringify({ error: "Invalid billing interval. Must be 'monthly' or 'yearly'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Request validated", { planId, billingInterval });

    // 3. FETCH PLAN FIRST (Crucial Fix: Pehle Database se plan lana zaroori hai)
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .maybeSingle();

    if (planError || !plan) {
      throw new Error(`Invalid or inactive subscription plan: ${planError?.message || 'Plan not found'}`);
    }

    logStep("Plan found", {
      planName: plan.name,
      price: billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly,
      userTypeCategory: plan.user_type_category
    });

    // 4. Fetch User Profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle();

    const userType = profile?.user_type || null;
    logStep("User type determined", { userType });

    // 5. COMPARE CATEGORIES (Plan fetch hone ke BAAD hi chalega)
    const getPlanCategory = (planName: string, planDbCategory: string): 'creator' | 'demand' | 'supply' => {
      const nameLower = planName.toLowerCase();
      if (nameLower.includes('creator')) return 'creator';
      if (['entry', 'growth', 'scale'].includes(nameLower)) return 'demand';
      if (['check-in', 'extended stay', 'owner'].includes(nameLower)) return 'supply';
      return planDbCategory === 'supply' ? 'creator' : 'demand';
    };

    const getUserCategory = (type: string | null): 'creator' | 'demand' | 'supply' => {
      if (!type) return 'demand';
      if (type === 'influencer') return 'creator';
      if (type === 'host') return 'supply';
      return 'demand';
    };

    const userCategory = getUserCategory(userType);
    const planCategory = getPlanCategory(plan.name, plan.user_type_category);

    if (userCategory !== planCategory) {
      logStep("Category mismatch", { userCategory, planCategory });
      return new Response(JSON.stringify({
        error: `This plan is for ${planCategory === 'demand' ? 'brands' : planCategory === 'supply' ? 'hosts' : 'creators'}. Please choose a plan that matches your account type.`
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Handle Free Plans
    const rawPrice = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
    if (rawPrice === 0) {
      logStep("Free plan detected, creating direct subscription");

      const subscriptionData: any = {
        plan_id: plan.id,
        status: 'active',
        billing_interval: billingInterval,
        current_period_start: new Date().toISOString(),
        current_period_end: null,
        influencer_id: user.id,
      };

      const { error: subError } = await supabaseClient
        .from('subscriptions')
        .insert(subscriptionData);

      if (subError) {
        throw new Error(`Failed to create free subscription: ${subError.message}`);
      }

      logStep("Free subscription created successfully");
      return new Response(JSON.stringify({
        message: 'Free subscription activated',
        planName: plan.name,
        isFree: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 7. Check Existing Active Subscriptions
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('influencer_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      const existingPlan = existingSub.subscription_plans;
      const isFreePlan = existingPlan?.price_monthly === 0;

      if (!isFreePlan) {
        throw new Error("You already have an active subscription. Please use the customer portal to manage your subscription.");
      }

      logStep("User upgrading from free plan");
      await supabaseClient
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id);
    }

    // 8. Stripe Customer Setup
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    let customerId: string;

    const { data: profileForCustomer } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileForCustomer?.stripe_customer_id) {
      customerId = profileForCustomer.stripe_customer_id;
      logStep("Existing customer from profile cache", { customerId });
    } else {
      const customers = await stripe.customers.list({ email: user.email, limit: 5 });
      if (customers.data.length > 0) {
        const byMeta = customers.data.find((c) => c.metadata?.user_id === user.id);
        const chosen = byMeta || customers.data[0];
        customerId = chosen.id;
        logStep("Existing Stripe customer found by email", { customerId });
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id, user_type: userType || 'unknown' }
        });
        customerId = customer.id;
        logStep("New Stripe customer created", { customerId });
      }

      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // 9. Create Stripe Session
    const stripePrice = billingInterval === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const buildUrl = (path: string, params: Record<string, string>) => {
      const base = path.startsWith("http") ? path : `${origin}${path}`;
      const sep = base.includes('?') ? '&' : '?';
      const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
      return `${base}${sep}${query}`;
    };

    const successUrl = returnUrl
      ? buildUrl(returnUrl, { session_id: '{CHECKOUT_SESSION_ID}', status: 'success' })
      : `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}&status=success`;

    const cancelUrl = returnUrl
      ? buildUrl(returnUrl, { status: 'canceled' })
      : `${origin}/pricing?status=canceled`;

    const sessionConfig: any = {
      customer: customerId,
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_interval: billingInterval,
        user_type: userType || 'unknown',
        plan_category: planCategory
      },
      allow_promotion_codes: true,
    };

    if (stripePrice) {
      sessionConfig.line_items = [
        {
          price: stripePrice,
          quantity: 1,
        },
      ];
    } else {
      // Fix: Inline price in cents
      const unitAmountInCents = Math.round(rawPrice * 100);

      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description || undefined,
            },
            unit_amount: unitAmountInCents,
            recurring: {
              interval: billingInterval === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});