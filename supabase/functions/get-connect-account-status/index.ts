import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get ambassador with Stripe Connect ID
    const { data: ambassador, error: ambassadorError } = await supabase
      .from("ambassador_members")
      .select("id, stripe_connect_id, stripe_onboarding_complete, stripe_payouts_enabled, stripe_details_submitted")
      .eq("user_id", user.id)
      .single();

    if (ambassadorError || !ambassador) {
      throw new Error("Ambassador not found");
    }

    if (!ambassador.stripe_connect_id) {
      return new Response(
        JSON.stringify({
          hasAccount: false,
          onboardingComplete: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch latest status from Stripe
    console.log("Fetching account status from Stripe:", ambassador.stripe_connect_id);
    const account = await stripe.accounts.retrieve(ambassador.stripe_connect_id);

    // Update database with latest status
    const updateData = {
      stripe_onboarding_complete: account.charges_enabled,
      stripe_payouts_enabled: account.payouts_enabled,
      stripe_details_submitted: account.details_submitted,
    };

    await supabase
      .from("ambassador_members")
      .update(updateData)
      .eq("id", ambassador.id);

    return new Response(
      JSON.stringify({
        hasAccount: true,
        accountId: ambassador.stripe_connect_id,
        onboardingComplete: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements,
        capabilities: account.capabilities,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting account status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
