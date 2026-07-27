import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function detectDevice(ua: string): string {
  if (!ua) return 'unknown';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const slug: string | undefined = body.slug;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: link, error } = await admin
      .from('brand_campaign_affiliate_links')
      .select('id, campaign_id, creator_id, destination_url, is_active')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !link || !link.is_active) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive link' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const ua = req.headers.get('user-agent') || '';
    const ipHash = ip !== 'unknown' ? await hashIp(ip) : null;

    await admin.from('brand_campaign_affiliate_clicks').insert({
      link_id: link.id,
      campaign_id: link.campaign_id,
      creator_id: link.creator_id,
      ip_hash: ipHash,
      user_agent: ua,
      referrer_url: body.referrer || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_term: body.utm_term || null,
      utm_content: body.utm_content || null,
      device_type: detectDevice(ua),
      country: req.headers.get('cf-ipcountry') || null,
    });

    return new Response(JSON.stringify({ destination_url: link.destination_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('track-affiliate-click error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});