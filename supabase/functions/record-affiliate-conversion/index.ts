import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (!claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claims.claims.sub;

    const body = await req.json().catch(() => ({}));
    const slug: string | undefined = body.slug;
    const linkId: string | undefined = body.link_id;
    const orderAmount: number = Number(body.order_amount_cents);
    if ((!slug && !linkId) || !Number.isFinite(orderAmount) || orderAmount <= 0) {
      return new Response(JSON.stringify({ error: 'slug or link_id and positive order_amount_cents required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Authorization: must be admin OR brand owner of the link's campaign
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    const isAdmin = !!roleRow;

    const linkQuery = admin.from('brand_campaign_affiliate_links').select('id, campaign_id, creator_id, commission_rate');
    const { data: link } = slug ? await linkQuery.eq('slug', slug).maybeSingle() : await linkQuery.eq('id', linkId!).maybeSingle();
    if (!link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!isAdmin) {
      const { data: camp } = await admin.from('brand_campaigns').select('created_by').eq('id', link.campaign_id).maybeSingle();
      if (!camp || camp.created_by !== userId) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const commission = Math.round(orderAmount * (Number(link.commission_rate) / 100));

    const { data: conv, error: convErr } = await admin
      .from('brand_campaign_affiliate_conversions')
      .insert({
        link_id: link.id,
        campaign_id: link.campaign_id,
        creator_id: link.creator_id,
        order_amount_cents: orderAmount,
        commission_amount_cents: commission,
        currency: body.currency || 'usd',
        external_reference: body.external_reference || null,
        customer_email_hash: body.customer_email_hash || null,
        metadata: body.metadata || {},
        status: 'pending',
      })
      .select()
      .single();
    if (convErr) throw convErr;

    return new Response(JSON.stringify({ conversion: conv }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('record-affiliate-conversion error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});