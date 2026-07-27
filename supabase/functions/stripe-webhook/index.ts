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

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET must be configured');
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(supabase, subscription);
        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceCreated(supabase, invoice);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(supabase, stripe, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(supabase, invoice);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, stripe, session);
        break;
      }

      // Stripe Connect events for ambassador payouts
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleConnectAccountUpdated(supabase, account);
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransferCreated(supabase, transfer);
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutPaid(supabase, payout);
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutFailed(supabase, payout);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ============= Helper Functions =============

async function getUserIdFromInvoice(supabase: any, invoice: Stripe.Invoice): Promise<string | null> {
  try {
    // Try to get from subscription first
    if (invoice.subscription) {
      const { data } = await supabase
        .from('subscriptions')
        .select('influencer_id')
        .eq('stripe_subscription_id', invoice.subscription)
        .maybeSingle();

      if (data?.influencer_id) {
        console.log('Found user from subscription:', data.influencer_id);
        return data.influencer_id;
      }
    }

    // Fallback: Get from customer
    const { data } = await supabase
      .from('subscriptions')
      .select('influencer_id')
      .eq('stripe_customer_id', invoice.customer)
      .maybeSingle();

    if (data?.influencer_id) {
      console.log('Found user from customer:', data.influencer_id);
      return data.influencer_id;
    }

    console.error('User not found for invoice:', invoice.id);
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

async function getSubscriptionDetails(supabase: any, stripeSubscriptionId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, plan_id, billing_interval, current_period_start, current_period_end, influencer_id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle();

    if (error || !data) {
      console.error('Subscription not found:', stripeSubscriptionId, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
}

async function getPlanDetails(supabase: any, planId: string) {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('name, price_monthly, price_yearly')
      .eq('id', planId)
      .maybeSingle();

    if (error || !data) {
      console.error('Plan not found:', planId, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting plan details:', error);
    return null;
  }
}

// ============= Event Handlers =============

async function handleSubscriptionChange(supabase: any, subscription: Stripe.Subscription) {
  try {
    const customer = subscription.customer as string;

    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      console.error('No price ID found in subscription');
      return;
    }

    let { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
      .limit(1)
      .maybeSingle();

    // Fallback: match by amount + interval if price IDs aren't mapped on the plan
    if (!plans) {
      const amount = subscription.items.data[0]?.price.unit_amount || 0;
      const interval = subscription.items.data[0]?.price.recurring?.interval;
      const col = interval === 'year' ? 'price_yearly' : 'price_monthly';
      if (amount > 0) {
        const { data: byAmount } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq(col, amount)
          .eq('is_active', true)
          .order('display_order')
          .limit(1)
          .maybeSingle();
        plans = byAmount;
      }
    }

    if (!plans) {
      console.error(`No plan found for price ID: ${priceId}. Map it in subscription_plans.stripe_price_id_monthly/yearly.`);
      return;
    }

    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('influencer_id')
      .eq('stripe_customer_id', customer)
      .maybeSingle();

    let userId = existingSubscription?.influencer_id;

    if (!userId) {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      const stripe = new Stripe(stripeKey!, { apiVersion: '2023-10-16' });
      const customerData = await stripe.customers.retrieve(customer as string);

      if (customerData.deleted) {
        console.error('Customer was deleted');
        return;
      }

      const email = (customerData as Stripe.Customer).email;
      if (email) {
        // Use perPage: 1000 to fetch all users (default is only 50!)
        const { data: authUser } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const user = authUser.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        userId = user?.id;
      }
    }

    if (!userId) {
      console.error('Could not find user for customer:', customer);
      return;
    }

    const billingInterval = subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly';

    // Cancel any existing free (no stripe_subscription_id) subscriptions — upgrade path
    await supabase
      .from('subscriptions')
      .update({
        status: 'superseded',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('influencer_id', userId)
      .is('stripe_subscription_id', null)
      .eq('status', 'active');

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        influencer_id: userId,
        plan_id: plans.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer,
        status: subscription.status,
        billing_interval: billingInterval,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) {
      console.error('Error upserting subscription:', error);
    } else {
      console.log(`Updated subscription for user ${userId}`);
      // Cache stripe_customer_id on the profile for fast lookups
      await supabase.from('profiles').update({ stripe_customer_id: customer }).eq('id', userId);

      // Enforce one active paid subscription per user.
      // Cancel any OTHER paid active subscriptions (different stripe_subscription_id).
      // This handles upgrade/downgrade where Billing Portal may briefly have two active subs.
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        await supabase
          .from('subscriptions')
          .update({
            status: 'superseded',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('influencer_id', userId)
          .not('stripe_subscription_id', 'eq', subscription.id)
          .not('stripe_subscription_id', 'is', null)
          .in('status', ['active', 'trialing']);
      }
    }

  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handleSubscriptionCancellation(supabase: any, subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error canceling subscription:', error);
    } else {
      console.log(`Canceled subscription: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleInvoiceCreated(supabase: any, invoice: Stripe.Invoice) {
  try {
    console.log('=== Invoice Created Handler ===');
    console.log('Invoice ID:', invoice.id);

    const userId = await getUserIdFromInvoice(supabase, invoice);
    if (!userId) {
      console.error('Cannot create invoice record: user not found');
      return;
    }

    const { error } = await supabase.from('invoices').insert({
      user_id: userId,
      subscription_id: invoice.subscription || null,
      stripe_invoice_id: invoice.id,
      invoice_number: invoice.number,
      amount_due: invoice.amount_due,
      amount_paid: 0,
      currency: invoice.currency || 'usd',
      status: invoice.status || 'draft',
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      invoice_pdf_url: invoice.invoice_pdf || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error creating invoice record:', error);
    } else {
      console.log('Invoice record created successfully');
    }
    console.log('================================');
  } catch (error) {
    console.error('Error handling invoice creation:', error);
  }
}

async function handlePaymentSuccess(supabase: any, stripe: Stripe, invoice: Stripe.Invoice) {
  try {
    console.log('=== Payment Success Handler ===');
    console.log('Invoice ID:', invoice.id);
    console.log('Subscription ID:', invoice.subscription);
    console.log('Amount paid:', invoice.amount_paid);

    const userId = await getUserIdFromInvoice(supabase, invoice);
    if (!userId) {
      console.error('Cannot process payment: user not found');
      return;
    }

    console.log('User ID:', userId);

    if (!invoice.subscription) {
      console.error('No subscription linked to invoice');
      return;
    }

    const subscription = await getSubscriptionDetails(supabase, invoice.subscription as string);
    if (!subscription) {
      console.error('Subscription details not found');
      return;
    }

    const plan = await getPlanDetails(supabase, subscription.plan_id);
    if (!plan) {
      console.error('Plan details not found');
      return;
    }

    // Calculate amount based on billing interval
    const amount = subscription.billing_interval === 'yearly'
      ? plan.price_yearly
      : plan.price_monthly;

    console.log('Plan:', plan.name);
    console.log('Billing interval:', subscription.billing_interval);
    console.log('Amount:', amount);

    // === AMBASSADOR COMMISSION HANDLING ===
    // Check if this user was referred by an ambassador and create commission
    await createAmbassadorCommission(supabase, userId, amount, plan.name, invoice.id);

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        payer_id: userId,
        recipient_id: null, // Platform revenue
        amount: amount,
        currency: invoice.currency || 'usd',
        type: 'subscription',
        status: 'completed',
        stripe_payment_intent_id: invoice.payment_intent,
        stripe_charge_id: invoice.charge,
        platform_fee: 0,
        net_amount: amount,
        related_id: subscription.id,
        description: `Subscription payment: ${plan.name} (${subscription.billing_interval})`,
        metadata: {
          stripe_invoice_id: invoice.id,
          stripe_invoice_number: invoice.number,
          plan_name: plan.name,
          billing_interval: subscription.billing_interval,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end
        },
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
    } else {
      console.log('Transaction created:', transaction?.id);
    }

    // Update/create invoice record
    const { error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        user_id: userId,
        subscription_id: subscription.id,
        stripe_invoice_id: invoice.id,
        invoice_number: invoice.number,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency || 'usd',
        status: 'paid',
        paid_at: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : new Date().toISOString(),
        invoice_pdf_url: invoice.invoice_pdf || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_invoice_id'
      });

    if (invoiceError) {
      console.error('Error upserting invoice:', invoiceError);
    } else {
      console.log('Invoice record updated');
    }

    // Update subscription status to active
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (subscriptionError) {
      console.error('Error updating subscription status:', subscriptionError);
    } else {
      console.log('Subscription status updated to active');
    }

    console.log('================================');
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(supabase: any, invoice: Stripe.Invoice) {
  try {
    console.log('=== Payment Failure Handler ===');
    console.log('Invoice ID:', invoice.id);

    const userId = await getUserIdFromInvoice(supabase, invoice);
    if (!userId) {
      console.error('Cannot process failed payment: user not found');
      return;
    }

    // Create failed transaction record for tracking
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        payer_id: userId,
        recipient_id: null,
        amount: invoice.amount_due,
        currency: invoice.currency || 'usd',
        type: 'subscription',
        status: 'failed',
        stripe_payment_intent_id: invoice.payment_intent,
        related_id: invoice.subscription,
        description: 'Failed subscription payment',
        metadata: {
          stripe_invoice_id: invoice.id,
          failure_reason: 'Payment failed',
          attempt_count: invoice.attempt_count
        },
        processed_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error creating failed transaction:', transactionError);
    } else {
      console.log('Failed transaction recorded');
    }

    // Update invoice status
    const { error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        user_id: userId,
        subscription_id: invoice.subscription,
        stripe_invoice_id: invoice.id,
        invoice_number: invoice.number,
        amount_due: invoice.amount_due,
        amount_paid: 0,
        currency: invoice.currency || 'usd',
        status: 'open',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_invoice_id'
      });

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
    } else {
      console.log('Invoice marked as unpaid');
    }

    // Update subscription status to past_due if applicable
    if (invoice.subscription) {
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (subscriptionError) {
        console.error('Error updating subscription status:', subscriptionError);
      } else {
        console.log('Subscription marked as past_due');
      }
    }

    console.log('================================');
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCheckoutCompleted(supabase: any, stripe: Stripe, session: Stripe.Checkout.Session) {
  try {
    console.log('=== Checkout Completed Handler ===');
    console.log('Session ID:', session.id);
    console.log('Mode:', session.mode);

    // Only handle subscription checkouts
    if (session.mode !== 'subscription' || !session.subscription) {
      console.log('Not a subscription checkout, skipping');
      return;
    }

    const stripeSubscriptionId = session.subscription as string;
    const metadata = session.metadata || {};
    const userId = metadata.user_id;
    const planId = metadata.plan_id;
    const billingIntervalMeta = (metadata.billing_interval === 'yearly') ? 'yearly' : 'monthly';

    if (!userId) {
      console.error('No user_id in session metadata — cannot upsert subscription');
      return;
    }

    // Retrieve full Stripe subscription to get accurate period dates and status
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Resolve plan from DB: prefer metadata.plan_id, fall back to price-ID / amount match
    let resolvedPlanId: string | null = planId || null;
    let resolvedPlanName = 'Unknown Plan';
    let resolvedPlanPriceMonthly = 0;
    let resolvedPlanPriceYearly = 0;

    if (!resolvedPlanId) {
      const priceId = stripeSubscription.items.data[0]?.price.id;
      if (priceId) {
        const { data: byPriceId } = await supabase
          .from('subscription_plans')
          .select('id, name, price_monthly, price_yearly')
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .limit(1)
          .maybeSingle();
        if (byPriceId) {
          resolvedPlanId = byPriceId.id;
          resolvedPlanName = byPriceId.name;
          resolvedPlanPriceMonthly = byPriceId.price_monthly;
          resolvedPlanPriceYearly = byPriceId.price_yearly;
        } else {
          // Fallback: match by amount
          const amount = stripeSubscription.items.data[0]?.price.unit_amount || 0;
          const interval = stripeSubscription.items.data[0]?.price.recurring?.interval;
          const col = interval === 'year' ? 'price_yearly' : 'price_monthly';
          if (amount > 0) {
            const { data: byAmount } = await supabase
              .from('subscription_plans')
              .select('id, name, price_monthly, price_yearly')
              .eq(col, amount)
              .eq('is_active', true)
              .order('display_order')
              .limit(1)
              .maybeSingle();
            if (byAmount) {
              resolvedPlanId = byAmount.id;
              resolvedPlanName = byAmount.name;
              resolvedPlanPriceMonthly = byAmount.price_monthly;
              resolvedPlanPriceYearly = byAmount.price_yearly;
            }
          }
        }
      }
    } else {
      // Fetch plan details for resolved plan
      const { data: planRow } = await supabase
        .from('subscription_plans')
        .select('name, price_monthly, price_yearly')
        .eq('id', resolvedPlanId)
        .maybeSingle();
      if (planRow) {
        resolvedPlanName = planRow.name;
        resolvedPlanPriceMonthly = planRow.price_monthly;
        resolvedPlanPriceYearly = planRow.price_yearly;
      }
    }

    if (!resolvedPlanId) {
      console.error('Could not resolve plan for checkout session:', session.id);
      // Do not return — still create the subscription row with null plan_id if possible
    }

    const billingInterval: 'monthly' | 'yearly' =
      billingIntervalMeta ||
      (stripeSubscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly');

    const customerId = session.customer as string;

    // Supersede any free subscriptions for this user
    await supabase
      .from('subscriptions')
      .update({
        status: 'superseded',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('influencer_id', userId)
      .is('stripe_subscription_id', null)
      .eq('status', 'active');

    // Upsert subscription row — this is the authoritative write from checkout
    const { data: upsertedSub, error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        influencer_id: userId,
        plan_id: resolvedPlanId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: customerId,
        status: stripeSubscription.status,
        billing_interval: billingInterval,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
      .select('id')
      .single();

    if (upsertError) {
      console.error('Error upserting subscription from checkout:', upsertError);
    } else {
      console.log('Subscription upserted from checkout:', upsertedSub?.id);
      // Cache stripe_customer_id on profile
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);

      // Enforce one active paid subscription per user
      await supabase
        .from('subscriptions')
        .update({
          status: 'superseded',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('influencer_id', userId)
        .not('stripe_subscription_id', 'eq', stripeSubscriptionId)
        .not('stripe_subscription_id', 'is', null)
        .in('status', ['active', 'trialing']);
    }

    // Create initial transaction record
    const amount = billingInterval === 'yearly' ? resolvedPlanPriceYearly : resolvedPlanPriceMonthly;
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        payer_id: userId,
        recipient_id: null,
        amount: session.amount_total || amount,
        currency: session.currency || 'usd',
        type: 'subscription',
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        related_id: upsertedSub?.id || null,
        description: `Initial subscription: ${resolvedPlanName}`,
        metadata: {
          stripe_session_id: session.id,
          plan_name: resolvedPlanName,
          billing_interval: billingInterval
        },
        processed_at: new Date().toISOString()
      });

    if (txError) {
      console.error('Error creating checkout transaction:', txError);
    } else {
      console.log('Checkout transaction created for:', resolvedPlanName);
    }

    console.log('================================');
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// ============= Stripe Connect Event Handlers =============

async function handleConnectAccountUpdated(supabase: any, account: Stripe.Account) {
  try {
    console.log('=== Connect Account Updated Handler ===');
    console.log('Account ID:', account.id);
    console.log('Payouts enabled:', account.payouts_enabled);
    console.log('Details submitted:', account.details_submitted);
    console.log('Charges enabled:', account.charges_enabled);

    // Update ambassador_members with the latest account status
    const { data, error } = await supabase
      .from('ambassador_members')
      .update({
        stripe_onboarding_complete: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        stripe_details_submitted: account.details_submitted,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_connect_id', account.id)
      .select('id, user_id')
      .single();

    if (error) {
      console.error('Error updating ambassador Connect status:', error);
    } else if (data) {
      console.log('Updated ambassador:', data.id);

      // Create notification for user if onboarding just completed
      if (account.payouts_enabled && account.details_submitted) {
        await supabase
          .from('notifications')
          .insert({
            user_id: data.user_id,
            type: 'ambassador_stripe_ready',
            title: 'Stripe Account Ready!',
            message: 'Your Stripe account is now set up. You can start receiving payouts.',
            related_id: data.id,
          });
        console.log('Sent onboarding complete notification');
      }
    }

    console.log('================================');
  } catch (error) {
    console.error('Error handling Connect account update:', error);
  }
}

async function handleTransferCreated(supabase: any, transfer: Stripe.Transfer) {
  try {
    console.log('=== Transfer Created Handler ===');
    console.log('Transfer ID:', transfer.id);
    console.log('Amount:', transfer.amount);
    console.log('Destination:', transfer.destination);

    const payoutId = transfer.metadata?.payout_id;
    if (!payoutId) {
      console.log('No payout_id in transfer metadata, skipping');
      return;
    }

    // Update payout status
    const { error } = await supabase
      .from('ambassador_payouts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutId);

    if (error) {
      console.error('Error updating payout with transfer:', error);
    } else {
      console.log('Updated payout with transfer ID');
    }

    console.log('================================');
  } catch (error) {
    console.error('Error handling transfer created:', error);
  }
}

async function handlePayoutPaid(supabase: any, payout: Stripe.Payout) {
  try {
    console.log('=== Payout Paid Handler ===');
    console.log('Payout ID:', payout.id);
    console.log('Amount:', payout.amount);

    // This is the payout from Stripe to the connected account's bank
    // We need to find the ambassador_payout associated with this
    // The payout object has destination which is the bank account, not the Connect account
    // We need to use the arrival_date and amount to match

    // For now, log the event - full matching would require storing stripe_payout_id
    console.log('Payout paid to bank account');
    console.log('================================');
  } catch (error) {
    console.error('Error handling payout paid:', error);
  }
}

async function handlePayoutFailed(supabase: any, payout: Stripe.Payout) {
  try {
    console.log('=== Payout Failed Handler ===');
    console.log('Payout ID:', payout.id);
    console.log('Failure code:', payout.failure_code);
    console.log('Failure message:', payout.failure_message);

    // Log the failure for debugging
    console.log('Payout to bank account failed');
    console.log('================================');
  } catch (error) {
    console.error('Error handling payout failed:', error);
  }
}

// ============= Ambassador Commission Handler =============

async function createAmbassadorCommission(
  supabase: any,
  userId: string,
  amount: number,
  planName: string,
  stripeInvoiceId: string
) {
  try {
    console.log('=== Ambassador Commission Check ===');
    console.log('Checking if user was referred:', userId);

    // Find if this user was referred by an ambassador
    const { data: referral, error: referralError } = await supabase
      .from('ambassador_referrals')
      .select(`
        id,
        ambassador_id,
        commission_rate,
        ambassador_members!inner (
          id,
          user_id,
          status
        )
      `)
      .eq('referred_user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (referralError) {
      console.error('Error checking referral:', referralError);
      return;
    }

    if (!referral) {
      console.log('No active referral found for user');
      return;
    }

    console.log('Found referral from ambassador:', referral.ambassador_id);

    // Calculate commission (default 20% if not set)
    const commissionRate = referral.commission_rate || 0.20;
    const commissionAmount = amount * commissionRate;

    console.log('commission rate:', commissionRate);
    console.log('Commission amount:', commissionAmount);

    // Check if we already created a commission for this invoice (idempotency)
    const { data: existingEarning } = await supabase
      .from('ambassador_earnings')
      .select('id')
      .eq('ambassador_id', referral.ambassador_id)
      .contains('metadata', { stripe_invoice_id: stripeInvoiceId })
      .maybeSingle();

    if (existingEarning) {
      console.log('Commission already exists for this invoice, skipping');
      return;
    }

    // Create pending earning record for admin approval
    const { data: earning, error: earningError } = await supabase
      .from('ambassador_earnings')
      .insert({
        ambassador_id: referral.ambassador_id,
        amount: commissionAmount,
        earning_type: 'referral_commission',
        status: 'pending', // Requires admin approval
        metadata: {
          referred_user_id: userId,
          subscription_tier: planName,
          original_amount: amount,
          stripe_invoice_id: stripeInvoiceId,
          referral_id: referral.id,
          commission_rate: commissionRate
        }
      })
      .select()
      .single();

    if (earningError) {
      console.error('Error creating earning:', earningError);
      return;
    }

    console.log('Created pending earning:', earning.id);

    // Update the referral record with subscription info
    const { error: updateError } = await supabase
      .from('ambassador_referrals')
      .update({
        conversion_stage: 'subscription',
        subscription_tier: planName,
        total_earned: supabase.rpc('increment_column', {
          row_id: referral.id,
          column_name: 'total_earned',
          amount: commissionAmount
        }),
        lifetime_value: supabase.rpc('increment_column', {
          row_id: referral.id,
          column_name: 'lifetime_value',
          amount: amount
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    if (updateError) {
      // Fallback: just update the stage and tier if RPC fails
      await supabase
        .from('ambassador_referrals')
        .update({
          conversion_stage: 'subscription',
          subscription_tier: planName,
          updated_at: new Date().toISOString()
        })
        .eq('id', referral.id);
    }

    // Create notification for the ambassador
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: referral.ambassador_members.user_id,
        type: 'ambassador_subscription',
        title: 'New Commission Earned!',
        message: `You earned $${commissionAmount.toFixed(2)} from a referral subscription (${planName}). Pending admin approval.`,
        related_id: earning.id,
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    } else {
      console.log('Notification sent to ambassador');
    }

    console.log('================================');
  } catch (error) {
    console.error('Error creating ambassador commission:', error);
  }
}
