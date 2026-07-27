import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-COLLABORATION-PAYMENT] ${step}${detailsStr}`);
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

    // Use service role key for database operations
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

    // Parse request body
    const { collaborationAgreementId, paymentMethodId } = await req.json();
    if (!collaborationAgreementId) {
      throw new Error("Collaboration agreement ID is required");
    }
    logStep("Request parsed", { collaborationAgreementId, paymentMethodId });

    // Get collaboration agreement details
    const { data: agreement, error: agreementError } = await supabaseClient
      .from('collaboration_agreements')
      .select(`
        *,
        applications(
          influencer_id,
          property_id,
          properties(host_id, title)
        )
      `)
      .eq('id', collaborationAgreementId)
      .single();

    if (agreementError || !agreement) {
      throw new Error("Collaboration agreement not found");
    }

    // Verify user is the host
    if (agreement.host_id !== user.id) {
      throw new Error("Only the host can process payment for this collaboration");
    }

    // Check if payment already processed
    const { data: existingTransaction } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('related_id', collaborationAgreementId)
      .eq('type', 'collaboration')
      .eq('status', 'completed')
      .maybeSingle();

    if (existingTransaction) {
      throw new Error("Payment has already been processed for this collaboration");
    }

    if (!agreement.agreed_rate || agreement.agreed_rate <= 0) {
      throw new Error("No payment amount specified for this collaboration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get or create Stripe customer for host
    const hostCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
    let hostCustomerId;
    
    if (hostCustomers.data.length > 0) {
      hostCustomerId = hostCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      hostCustomerId = customer.id;
    }
    logStep("Host customer resolved", { hostCustomerId });

    // Calculate platform fee
    const platformFee = Math.round(agreement.agreed_rate * 0.10); // 10% platform fee
    const netAmount = agreement.agreed_rate - platformFee;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: agreement.agreed_rate,
      currency: agreement.currency || 'usd',
      customer: hostCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      description: `Payment for collaboration: ${agreement.applications?.properties?.title}`,
      metadata: {
        collaboration_agreement_id: collaborationAgreementId,
        host_id: user.id,
        influencer_id: agreement.influencer_id,
        type: 'collaboration'
      }
    });

    logStep("Payment intent created", { 
      paymentIntentId: paymentIntent.id, 
      status: paymentIntent.status,
      amount: agreement.agreed_rate
    });

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        payer_id: user.id,
        recipient_id: agreement.influencer_id,
        amount: agreement.agreed_rate,
        currency: agreement.currency || 'usd',
        type: 'collaboration',
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        platform_fee: platformFee,
        net_amount: netAmount,
        related_id: collaborationAgreementId,
        description: `Payment for collaboration: ${agreement.applications?.properties?.title}`,
        processed_at: paymentIntent.status === 'succeeded' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (transactionError) {
      logStep("Error creating transaction record", transactionError);
      throw new Error("Failed to create transaction record");
    }

    // Update collaboration agreement status if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      await supabaseClient
        .from('collaboration_agreements')
        .update({ 
          status: 'active',
          host_signed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', collaborationAgreementId);

      logStep("Collaboration agreement updated to active");
    }

    return new Response(JSON.stringify({ 
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      transactionId: transaction.id,
      amount: agreement.agreed_rate,
      platformFee,
      netAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-collaboration-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});