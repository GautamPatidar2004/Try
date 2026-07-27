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

    const { type = "account_onboarding" } = await req.json().catch(() => ({}));

    // Get ambassador with Stripe Connect ID
    const { data: ambassador, error: ambassadorError } = await supabase
      .from("ambassador_members")
      .select("id, stripe_connect_id")
      .eq("user_id", user.id)
      .single();

    if (ambassadorError || !ambassador) {
      throw new Error("Ambassador not found");
    }

    if (!ambassador.stripe_connect_id) {
      throw new Error("No Stripe Connect account found. Please create one first.");
    }

    // Get the origin from request or use default
    const origin = req.headers.get("origin") || Deno.env.get("APP_DOMAIN") || "https://lovable.dev";

    console.log("Creating account link for:", ambassador.stripe_connect_id, "type:", type);

    // Create account link based on type
    if (type === "login_link") {
      // Create login link to Stripe Express dashboard
      const loginLink = await stripe.accounts.createLoginLink(ambassador.stripe_connect_id);
      
      return new Response(
        JSON.stringify({ url: loginLink.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create onboarding or update account link
    const accountLink = await stripe.accountLinks.create({
      account: ambassador.stripe_connect_id,
      refresh_url: `${origin}/ambassador-program?stripe_refresh=true`,
      return_url: `${origin}/ambassador-program?stripe_onboarding=complete`,
      type: type as "account_onboarding" | "account_update",
    });

    console.log("Created account link:", accountLink.url);

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating account link:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
