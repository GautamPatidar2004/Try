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

    // Get ambassador member
    const { data: ambassador, error: ambassadorError } = await supabase
      .from("ambassador_members")
      .select("id, stripe_connect_id, user_id")
      .eq("user_id", user.id)
      .single();

    if (ambassadorError || !ambassador) {
      throw new Error("Ambassador not found");
    }

    // If already has a connect account, return it
    if (ambassador.stripe_connect_id) {
      console.log("Ambassador already has Stripe Connect account:", ambassador.stripe_connect_id);
      return new Response(
        JSON.stringify({ 
          accountId: ambassador.stripe_connect_id,
          alreadyExists: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    // Create Express Connect account
    console.log("Creating Stripe Connect Express account for ambassador:", ambassador.id);
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      metadata: {
        ambassador_id: ambassador.id,
        user_id: user.id,
      },
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        product_description: "Ambassador program earnings and referral commissions",
      },
      ...(profile?.first_name && profile?.last_name && {
        individual: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: user.email,
        },
      }),
    });

    console.log("Created Stripe Connect account:", account.id);

    // Store the Connect account ID
    const { error: updateError } = await supabase
      .from("ambassador_members")
      .update({
        stripe_connect_id: account.id,
        stripe_onboarding_complete: false,
        stripe_payouts_enabled: false,
        stripe_details_submitted: false,
      })
      .eq("id", ambassador.id);

    if (updateError) {
      console.error("Failed to update ambassador with Stripe Connect ID:", updateError);
      throw new Error("Failed to save Stripe Connect account");
    }

    return new Response(
      JSON.stringify({ 
        accountId: account.id,
        alreadyExists: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating Connect account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
