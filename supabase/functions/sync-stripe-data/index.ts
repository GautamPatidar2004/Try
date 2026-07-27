import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin using user_roles table
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      console.log(`User ${user.id} does not have admin role`);
      throw new Error("Admin access required");
    }

    console.log(`Admin access verified for user ${user.id}`);

    console.log("Starting Stripe data sync...");

    // Parse request body for options
    const body = await req.json().catch(() => ({}));
    const { limit = 100, startingAfter } = body;

    // Fetch invoices from Stripe
    const invoicesParams: Stripe.InvoiceListParams = {
      limit,
      status: "paid",
      expand: ["data.customer", "data.subscription"],
    };
    if (startingAfter) {
      invoicesParams.starting_after = startingAfter;
    }

    const invoices = await stripe.invoices.list(invoicesParams);
    console.log(`Fetched ${invoices.data.length} paid invoices from Stripe`);

    // Pre-fetch all auth users once (more efficient than per-invoice lookup)
    // Use perPage: 1000 to fetch all users (default is only 50!)
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authUsers = authData?.users || [];
    console.log(`Found ${authUsers.length} auth users for matching`);

    // Create email-to-userId map for fast lookup
    const emailToUserId = new Map<string, string>();
    for (const user of authUsers) {
      if (user.email) {
        emailToUserId.set(user.email.toLowerCase(), user.id);
      }
    }

    let synced = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (const invoice of invoices.data) {
      try {
        // Get customer email to find user
        const customer = invoice.customer as Stripe.Customer;
        if (!customer?.email) {
          console.log(`Skipping invoice ${invoice.id}: no customer email`);
          skipped++;
          continue;
        }

        // Find user by email using pre-fetched auth users
        const userId = emailToUserId.get(customer.email.toLowerCase());

        if (!userId) {
          console.log(`Skipping invoice ${invoice.id}: user not found for ${customer.email}`);
          skipped++;
          continue;
        }

        // Check if transaction already exists
        const { data: existingTx } = await supabaseAdmin
          .from("transactions")
          .select("id")
          .eq("stripe_payment_intent_id", invoice.payment_intent as string)
          .single();

        if (existingTx) {
          console.log(`Skipping invoice ${invoice.id}: transaction already exists`);
          skipped++;
          continue;
        }

        // Calculate platform fee (10%)
        const amount = invoice.amount_paid;
        const platformFee = Math.round(amount * 0.1);

        // Create transaction record
        const { error: txError } = await supabaseAdmin
          .from("transactions")
          .insert({
            payer_id: userId,
            amount: amount,
            platform_fee: platformFee,
            net_amount: amount - platformFee,
            type: "subscription",
            status: "completed",
            stripe_payment_intent_id: invoice.payment_intent as string,
            description: `Subscription payment - ${invoice.lines.data[0]?.description || "Plan"}`,
            created_at: new Date(invoice.created * 1000).toISOString(),
          });

        if (txError) {
          console.error(`Error creating transaction for invoice ${invoice.id}:`, txError);
          errors.push(`Invoice ${invoice.id}: ${txError.message}`);
          continue;
        }

        // Create or update invoice record (using correct column names)
        const { error: invError } = await supabaseAdmin
          .from("invoices")
          .upsert({
            user_id: userId,
            stripe_invoice_id: invoice.id,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: "paid",
            invoice_pdf_url: invoice.invoice_pdf,
            due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
            paid_at: invoice.status_transitions?.paid_at 
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
              : null,
          }, {
            onConflict: "stripe_invoice_id",
          });

        if (invError) {
          console.error(`Error upserting invoice ${invoice.id}:`, invError);
          errors.push(`Invoice record ${invoice.id}: ${invError.message}`);
        }

        synced++;
        console.log(`Synced invoice ${invoice.id} for user ${userId}`);
      } catch (err) {
        console.error(`Error processing invoice ${invoice.id}:`, err);
        errors.push(`Invoice ${invoice.id}: ${err.message}`);
      }
    }

    // === SYNC SUBSCRIPTIONS FROM STRIPE ===
    console.log("Starting subscription sync from Stripe...");
    
    let subscriptionsSynced = 0;
    let subscriptionsSkipped = 0;
    
    // Fetch active subscriptions from Stripe
    const stripeSubscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: "active",
      expand: ["data.customer"],
    });
    
    console.log(`Fetched ${stripeSubscriptions.data.length} active subscriptions from Stripe`);
    
    for (const stripeSub of stripeSubscriptions.data) {
      try {
        const customer = stripeSub.customer as Stripe.Customer;
        if (!customer?.email) {
          console.log(`Skipping subscription ${stripeSub.id}: no customer email`);
          subscriptionsSkipped++;
          continue;
        }
        
        const userId = emailToUserId.get(customer.email.toLowerCase());
        if (!userId) {
          console.log(`Skipping subscription ${stripeSub.id}: user not found for ${customer.email}`);
          subscriptionsSkipped++;
          continue;
        }
        
        // Find matching plan by Stripe price ID
        const priceId = stripeSub.items.data[0]?.price.id;
        if (!priceId) {
          console.log(`Skipping subscription ${stripeSub.id}: no price ID`);
          subscriptionsSkipped++;
          continue;
        }
        
        const { data: plan } = await supabaseAdmin
          .from("subscription_plans")
          .select("id")
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .maybeSingle();
        
        if (!plan) {
          console.log(`Skipping subscription ${stripeSub.id}: no matching plan for price ${priceId}`);
          subscriptionsSkipped++;
          continue;
        }
        
        const billingInterval = stripeSub.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly";
        
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            influencer_id: userId,
            plan_id: plan.id,
            stripe_subscription_id: stripeSub.id,
            stripe_customer_id: customer.id,
            status: stripeSub.status,
            billing_interval: billingInterval,
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
            trial_start: stripeSub.trial_start ? new Date(stripeSub.trial_start * 1000).toISOString() : null,
            trial_end: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null,
            cancel_at_period_end: stripeSub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "stripe_subscription_id",
          });
        
        if (subError) {
          console.error(`Error upserting subscription ${stripeSub.id}:`, subError);
          errors.push(`Subscription ${stripeSub.id}: ${subError.message}`);
          continue;
        }
        
        subscriptionsSynced++;
        console.log(`Synced subscription ${stripeSub.id} for user ${userId}`);
      } catch (err) {
        console.error(`Error processing subscription ${stripeSub.id}:`, err);
        errors.push(`Subscription ${stripeSub.id}: ${err.message}`);
      }
    }
    
    console.log(`Subscription sync complete: ${subscriptionsSynced} synced, ${subscriptionsSkipped} skipped`);

    const result = {
      success: true,
      synced,
      skipped,
      subscriptionsSynced,
      subscriptionsSkipped,
      errors: errors.length > 0 ? errors : undefined,
      hasMore: invoices.has_more,
      lastId: invoices.data[invoices.data.length - 1]?.id,
    };

    console.log("Sync complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});