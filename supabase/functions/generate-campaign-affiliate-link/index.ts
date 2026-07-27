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

    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claims.claims.sub;

    const body = await req.json().catch(() => ({}));
    const campaignId: string | undefined = body.campaign_id;
    if (!campaignId || typeof campaignId !== 'string') {
      return new Response(JSON.stringify({ error: 'campaign_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Verify creator was accepted on this campaign and campaign has affiliate enabled
    const { data: campaign, error: campErr } = await admin
      .from('brand_campaigns')
      .select('id, brand_name, brand_website, affiliate_enabled, affiliate_percentage, status')
      .eq('id', campaignId)
      .maybeSingle();
    if (campErr || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!campaign.affiliate_enabled) {
      return new Response(JSON.stringify({ error: 'Affiliate program not enabled for this campaign' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: app } = await admin
      .from('brand_campaign_applications')
      .select('id, status')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', userId)
      .eq('status', 'accepted')
      .maybeSingle();
    if (!app) {
      return new Response(JSON.stringify({ error: 'You must be an accepted creator on this campaign' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check existing
    const { data: existing } = await admin
      .from('brand_campaign_affiliate_links')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('creator_id', userId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ link: existing }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get creator name
    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, username')
      .eq('id', userId)
      .maybeSingle();
    const creatorName = profile?.username || profile?.first_name || 'creator';

    // Generate slug via RPC
    const { data: slugData, error: slugErr } = await admin.rpc('generate_brand_affiliate_slug', {
      p_brand_name: campaign.brand_name,
      p_creator_name: creatorName,
    });
    if (slugErr) throw slugErr;

    const destination = campaign.brand_website || `https://hostfluencer.com/brand-deals/${campaignId}`;

    const { data: link, error: insErr } = await admin
      .from('brand_campaign_affiliate_links')
      .insert({
        campaign_id: campaignId,
        creator_id: userId,
        slug: slugData,
        destination_url: destination,
        commission_rate: campaign.affiliate_percentage || 0,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ link }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('generate-campaign-affiliate-link error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});