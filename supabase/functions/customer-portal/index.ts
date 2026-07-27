import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

/**
 * Resolve an existing Stripe customer ID for this user.
 * Priority:
 *  1. profiles.stripe_customer_id (fastest – cached on webhook)
 *  2. subscriptions.stripe_customer_id (set when subscription was created)
 *  3. Stripe email search (fallback for older records)
 * Returns null when no customer exists (user has never subscribed).
 */
async function resolveStripeCustomerId(
  supabase: any,
  stripe: Stripe,
  userId: string,
  userEmail: string,
): Promise<string | null> {
  // 1. Check profile cache
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    logStep("Customer ID from profile cache", { customerId: profile.stripe_customer_id });
    return profile.stripe_customer_id;
  }

  // 2. Check subscriptions table
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('influencer_id', userId)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sub?.stripe_customer_id) {
    logStep("Customer ID from subscriptions table", { customerId: sub.stripe_customer_id });
    // Back-fill profile cache so future lookups are instant
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: sub.stripe_customer_id })
      .eq('id', userId);
    return sub.stripe_customer_id;
  }

  // 3. Search Stripe by email
  const customers = await stripe.customers.list({ email: userEmail, limit: 5 });
  if (customers.data.length > 0) {
    // Prefer customers that match user_id in metadata, then take the most recent
    const byMeta = customers.data.find((c) => c.metadata?.user_id === userId);
    const chosen = byMeta || customers.data[0];
    logStep("Customer ID from Stripe email search", { customerId: chosen.id });
    // Cache it
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: chosen.id })
      .eq('id', userId);
    return chosen.id;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const customerId = await resolveStripeCustomerId(
      supabaseClient,
      stripe,
      user.id,
      user.email,
    );

    // No customer means user has never completed a Stripe checkout.
    // Return a structured response so the frontend can redirect to /pricing.
    if (!customerId) {
      logStep("No Stripe customer found – user has never subscribed");
      return new Response(
        JSON.stringify({ error: "no_customer", message: "No active subscription found. Please choose a plan to get started." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    logStep("Resolved Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Billing Portal session.
    // The portal supports: upgrade, downgrade, cancel, reactivate, update payment method.
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/subscription`,
    });

    logStep("Billing Portal session created", {
      sessionId: portalSession.id,
      url: portalSession.url,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});