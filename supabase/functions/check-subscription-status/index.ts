import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user profile including user type and premium override
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type, premium_override, premium_override_expires_at')
      .eq('id', user.id)
      .single();

    const userType = profile?.user_type;
    const getUserTypeCategory = (type: string | null): string => {
      if (!type) return 'unknown';
      if (type === 'influencer') return 'supply';
      return 'demand';
    };
    const userCategory = getUserTypeCategory(userType);

    logStep("User type determined", { userType, userCategory });

    // Check for premium override first
    const hasPremiumOverride = profile?.premium_override && 
      (!profile.premium_override_expires_at || new Date(profile.premium_override_expires_at) > new Date());
    
    if (hasPremiumOverride) {
      logStep("User has active premium override, granting full access");
      return new Response(JSON.stringify({ 
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        plan: {
          name: 'Premium Override',
          description: 'Admin granted premium access',
          features: ['Unlimited access', 'All premium features'],
          maxApplicationsPerMonth: -1,
          maxBrandPartnerships: -1,
          // New fields
          userTypeCategory: userCategory,
          maxListings: -1,
          maxCampaigns: -1,
          maxProfileViewsPerMonth: -1,
          maxOutboundInvitesPerMonth: -1,
          maxPitchesPerMonth: -1,
          searchPriority: 10,
          hasVerifiedBadge: true,
          hasAiMatching: true,
          hasMediaKit: true,
          hasAdvancedAnalytics: true,
          teamSeats: 10,
          marketplaceBoostsPerMonth: 10
        },
        currentPeriodEnd: profile.premium_override_expires_at,
        cancelAtPeriodEnd: false,
        billingInterval: 'override',
        isTrialing: false,
        hasPremiumOverride: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Resolve Stripe customer: profile cache → prior subscription row → email lookup
    let customerId: string | null = null;

    const { data: profileCache } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
    if (profileCache?.stripe_customer_id) {
      customerId = profileCache.stripe_customer_id;
      logStep("Using cached stripe_customer_id from profile", { customerId });
    }

    if (!customerId) {
      const { data: priorSub } = await supabaseClient
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('influencer_id', user.id)
        .not('stripe_customer_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (priorSub?.stripe_customer_id) {
        customerId = priorSub.stripe_customer_id;
        logStep("Using stripe_customer_id from prior subscription row", { customerId });
      }
    }

    if (!customerId && user.email) {
      // Email search (case-insensitive via Stripe search API; fall back to list)
      try {
        const search = await stripe.customers.search({
          query: `email:"${user.email.toLowerCase()}"`,
          limit: 1,
        });
        if (search.data.length > 0) customerId = search.data[0].id;
      } catch (_e) {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) customerId = customers.data[0].id;
      }
      if (customerId) {
        logStep("Found Stripe customer by email", { customerId });
        await supabaseClient
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      } else {
        logStep("No Stripe customer found, checking for local subscription");
      }
    }

    // Check for local subscriptions (including free plans)
    const { data: localSubscriptions } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('influencer_id', user.id)
      .in('status', ['lifetime', 'active', 'trialing'])
      .order('created_at', { ascending: false });

    // Check for active Stripe subscriptions
    let activeStripeSubscriptions: any[] = [];
    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });
      activeStripeSubscriptions = subscriptions.data.filter(sub => 
        sub.status === "active" || sub.status === "trialing"
      );
    }

    // Determine which subscription to use
    let subscriptionData = null;
    let planData = null;

    // Priority: Stripe subscription > Local active subscription > Free plan
    if (activeStripeSubscriptions.length > 0) {
      const subscription = activeStripeSubscriptions[0];
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      logStep("Active Stripe subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        currentPeriodEnd
      });

      // Find matching local subscription
      const { data: existingSub } = await supabaseClient
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('influencer_id', user.id)
        .eq('stripe_subscription_id', subscription.id)
        .maybeSingle();

      if (existingSub) {
        await supabaseClient
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id);

        subscriptionData = {
          ...existingSub,
          status: subscription.status,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end
        };
        planData = existingSub.subscription_plans;
      } else {
        // Match plan: prefer stripe_price_id mapping, fall back to amount match
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;

        let matchingPlan: any = null;
        const { data: byPriceId } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .limit(1)
          .maybeSingle();
        matchingPlan = byPriceId;

        if (!matchingPlan && amount > 0) {
          const interval = price.recurring?.interval;
          const col = interval === 'year' ? 'price_yearly' : 'price_monthly';
          const { data: byAmount } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq(col, amount)
            .eq('is_active', true)
            .order('display_order')
            .limit(1)
            .maybeSingle();
          matchingPlan = byAmount;
        }

        if (!matchingPlan) {
          logStep("WARN: no subscription_plan mapped to Stripe price", { priceId, amount });
        }

        if (matchingPlan) {
          // Supersede any leftover free-tier rows for this user
          await supabaseClient
            .from('subscriptions')
            .update({ status: 'superseded', canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('influencer_id', user.id)
            .is('stripe_subscription_id', null)
            .eq('status', 'active');

          const { data: newSub } = await supabaseClient
            .from('subscriptions')
            .insert({
              influencer_id: user.id,
              plan_id: matchingPlan.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              billing_interval: price.recurring?.interval || 'monthly',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end
            })
            .select('*, subscription_plans(*)')
            .single();

          subscriptionData = newSub;
          planData = newSub?.subscription_plans;
        }
      }
    } else if (localSubscriptions && localSubscriptions.length > 0) {
      // Use local subscription (free or lifetime)
      for (const sub of localSubscriptions) {
        if (sub.status === 'lifetime' || sub.status === 'active') {
          subscriptionData = sub;
          planData = sub.subscription_plans;
          logStep("Local subscription found", { 
            planName: planData?.name,
            status: sub.status
          });
          break;
        }
      }
    }

    if (!subscriptionData) {
      logStep("No active subscription found", { userCategory });
    }

    const hasActiveSubscription = subscriptionData !== null;

    // Build response with all new fields
    const response = {
      hasActiveSubscription,
      subscriptionStatus: subscriptionData?.status || null,
      plan: planData ? {
        name: planData.name,
        description: planData.description,
        features: planData.features || [],
        maxApplicationsPerMonth: planData.max_applications_per_month,
        maxBrandPartnerships: planData.max_brand_partnerships,
        // New two-sided marketplace fields
        userTypeCategory: planData.user_type_category || userCategory,
        maxListings: planData.max_listings,
        maxCampaigns: planData.max_campaigns,
        maxProfileViewsPerMonth: planData.max_profile_views_per_month,
        maxOutboundInvitesPerMonth: planData.max_outbound_invites_per_month,
        maxPitchesPerMonth: planData.max_pitches_per_month,
        searchPriority: planData.search_priority || 1,
        hasVerifiedBadge: planData.has_verified_badge || false,
        hasAiMatching: planData.has_ai_matching || false,
        hasMediaKit: planData.has_media_kit || false,
        hasAdvancedAnalytics: planData.has_advanced_analytics || false,
        teamSeats: planData.team_seats || 1,
        marketplaceBoostsPerMonth: planData.marketplace_boosts_per_month || 0
      } : null,
      currentPeriodEnd: subscriptionData?.current_period_end || null,
      cancelAtPeriodEnd: subscriptionData?.cancel_at_period_end || false,
      billingInterval: subscriptionData?.billing_interval || null,
      isTrialing: subscriptionData?.status === 'trialing' || false,
      hasPremiumOverride: false
    };

    logStep("Returning subscription status", { 
      hasActiveSubscription,
      planName: planData?.name,
      userCategory
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription-status", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
