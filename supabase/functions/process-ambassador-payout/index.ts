import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MINIMUM_PAYOUT_AMOUNT = 50; // $50 minimum

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

    // Get ambassador with Stripe Connect info
    const { data: ambassador, error: ambassadorError } = await supabase
      .from("ambassador_members")
      .select("id, stripe_connect_id, stripe_payouts_enabled, stripe_onboarding_complete")
      .eq("user_id", user.id)
      .single();

    if (ambassadorError || !ambassador) {
      throw new Error("Ambassador not found");
    }

    if (!ambassador.stripe_connect_id) {
      throw new Error("No Stripe Connect account found. Please complete Stripe onboarding first.");
    }

    if (!ambassador.stripe_payouts_enabled || !ambassador.stripe_onboarding_complete) {
      throw new Error("Stripe Connect onboarding not complete. Please finish setting up your payout account.");
    }

    // Get pending earnings
    const { data: pendingEarnings, error: earningsError } = await supabase
      .from("ambassador_earnings")
      .select("id, amount")
      .eq("ambassador_id", ambassador.id)
      .eq("status", "pending");

    if (earningsError) {
      throw new Error("Failed to fetch pending earnings");
    }

    if (!pendingEarnings || pendingEarnings.length === 0) {
      throw new Error("No pending earnings to pay out");
    }

    // Calculate total amount
    const totalAmount = pendingEarnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const earningIds = pendingEarnings.map(e => e.id);

    if (totalAmount < MINIMUM_PAYOUT_AMOUNT) {
      throw new Error(`Minimum payout amount is $${MINIMUM_PAYOUT_AMOUNT}. Current balance: $${totalAmount.toFixed(2)}`);
    }

    console.log(`Processing payout of $${totalAmount} to ${ambassador.stripe_connect_id}`);

    // Create payout record first
    const { data: payoutRecord, error: payoutCreateError } = await supabase
      .from("ambassador_payouts")
      .insert({
        ambassador_id: ambassador.id,
        amount: totalAmount,
        currency: "usd",
        status: "processing",
        earnings_ids: earningIds,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payoutCreateError) {
      throw new Error("Failed to create payout record");
    }

    try {
      // Create transfer to connected account (amount in cents)
      const transfer = await stripe.transfers.create({
        amount: Math.round(totalAmount * 100),
        currency: "usd",
        destination: ambassador.stripe_connect_id,
        metadata: {
          ambassador_id: ambassador.id,
          payout_id: payoutRecord.id,
          earnings_count: earningIds.length.toString(),
        },
        description: `Ambassador payout - ${earningIds.length} earnings`,
      });

      console.log("Created Stripe transfer:", transfer.id);

      // Update payout record with transfer ID
      await supabase
        .from("ambassador_payouts")
        .update({
          stripe_transfer_id: transfer.id,
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", payoutRecord.id);

      // Update earnings to paid status
      await supabase
        .from("ambassador_earnings")
        .update({ 
          status: "paid",
          payment_date: new Date().toISOString(),
        })
        .in("id", earningIds);

      return new Response(
        JSON.stringify({
          success: true,
          payoutId: payoutRecord.id,
          transferId: transfer.id,
          amount: totalAmount,
          earningsCount: earningIds.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (stripeError: any) {
      console.error("Stripe transfer failed:", stripeError);

      // Update payout record with failure
      await supabase
        .from("ambassador_payouts")
        .update({
          status: "failed",
          failure_reason: stripeError.message,
        })
        .eq("id", payoutRecord.id);

      throw new Error(`Stripe transfer failed: ${stripeError.message}`);
    }
  } catch (error) {
    console.error("Error processing payout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
