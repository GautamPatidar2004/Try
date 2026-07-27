import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) => console.log(`[RESYNC] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Admin gate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Unauthorized");
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
    if (!isAdmin) throw new Error("Forbidden — admin only");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2023-10-16" });

    let processed = 0, matched = 0, missingPlan = 0, missingUser = 0;
    let starting_after: string | undefined;

    while (true) {
      const page = await stripe.subscriptions.list({ status: "all", limit: 100, starting_after });
      for (const sub of page.data) {
        processed++;
        if (!["active", "trialing", "past_due"].includes(sub.status)) continue;

        const priceId = sub.items.data[0]?.price.id;
        const amount = sub.items.data[0]?.price.unit_amount || 0;
        const interval = sub.items.data[0]?.price.recurring?.interval;

        let plan: any = null;
        const { data: byPrice } = await supabase
          .from('subscription_plans')
          .select('*')
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .limit(1)
          .maybeSingle();
        plan = byPrice;
        if (!plan && amount > 0) {
          const col = interval === 'year' ? 'price_yearly' : 'price_monthly';
          const { data: byAmount } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq(col, amount)
            .eq('is_active', true)
            .order('display_order')
            .limit(1)
            .maybeSingle();
          plan = byAmount;
        }
        if (!plan) { missingPlan++; log("no plan for price", { priceId }); continue; }

        // Resolve user via Stripe customer email
        const customer = sub.customer as string;
        let userId: string | null = null;
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('influencer_id')
          .eq('stripe_customer_id', customer)
          .maybeSingle();
        userId = existing?.influencer_id ?? null;
        if (!userId) {
          const cust = await stripe.customers.retrieve(customer);
          if (!('deleted' in cust) || !cust.deleted) {
            const email = (cust as Stripe.Customer).email?.toLowerCase();
            if (email) {
              const { data: au } = await supabase.auth.admin.listUsers({ perPage: 1000 });
              userId = au.users.find((u: any) => u.email?.toLowerCase() === email)?.id ?? null;
            }
          }
        }
        if (!userId) { missingUser++; continue; }

        // Supersede free rows
        await supabase
          .from('subscriptions')
          .update({ status: 'superseded', canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('influencer_id', userId)
          .is('stripe_subscription_id', null)
          .eq('status', 'active');

        const billing_interval = interval === 'year' ? 'yearly' : 'monthly';
        await supabase.from('subscriptions').upsert({
          influencer_id: userId,
          plan_id: plan.id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: customer,
          status: sub.status,
          billing_interval,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        await supabase.from('profiles').update({ stripe_customer_id: customer }).eq('id', userId);
        matched++;
      }
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1].id;
    }

    const summary = { processed, matched, missingPlan, missingUser };
    log("done", summary);
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});