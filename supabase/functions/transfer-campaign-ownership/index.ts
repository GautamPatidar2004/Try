import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  action: 'transfer';
  campaignId: string;
  newBrandId: string;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }


    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;


    const userClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );


    const token = authHeader.replace('Bearer ', '');

    const { data: claimsData, error: claimsError } =
      await userClient.auth.getClaims(token);


    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({
          error: 'Invalid token',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }


    const adminId = claimsData.claims.sub;


    const serviceClient = createClient(
      supabaseUrl,
      serviceKey
    );


    // admin check
    const { data: role } =
      await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', adminId)
        .eq('role', 'admin')
        .single();


    if (!role) {
      return new Response(
        JSON.stringify({
          error: 'Admin access required',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }



    const body: TransferRequest = await req.json();

    const {
      action,
      campaignId,
      newBrandId,
      reason,
    } = body;



    if (action !== 'transfer') {
      return new Response(
        JSON.stringify({
          error: 'Invalid action',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }



    // existing campaign
    const { data: campaign, error: campaignError } =
      await serviceClient
        .from('brand_campaigns')
        .select(`
          id,
          brand_name,
          created_by,
          hfx_brand_id
        `)
        .eq('id', campaignId)
        .single();



    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({
          error: 'Campaign not found',
        }),
        {
          status:404,
          headers:{
            ...corsHeaders,
            'Content-Type':'application/json'
          }
        }
      );
    }



    // selected brand
    const { data: brand, error: brandError } =
      await serviceClient
        .from('brands')
        .select(`
          user_id,
          brand_name
        `)
        .eq('id', newBrandId)
        .single();



    if (brandError || !brand) {
      return new Response(
        JSON.stringify({
          error:'Brand not found'
        }),
        {
          status:404,
          headers:{
            ...corsHeaders,
            'Content-Type':'application/json'
          }
        }
      );
    }



    // already same brand
    if (
      campaign.created_by === brand.user_id
    ) {
      return new Response(
        JSON.stringify({
          error:'Campaign already assigned to this brand'
        }),
        {
          status:400,
          headers:{
            ...corsHeaders,
            'Content-Type':'application/json'
          }
        }
      );
    }



    /**
     * ONLY UPDATE THESE:
     *
     * created_by
     * brand_name
     *
     * hfx_brand_id untouched
     */


    const { error:updateError } =
      await serviceClient
        .from('brand_campaigns')
        .update({
          created_by: brand.user_id,
          brand_name: brand.brand_name,
          hfx_brand_id: null,
          platform_source:"hostfluencer"
        })
        .eq('id', campaignId);



    if(updateError){
      console.error(updateError);

      return new Response(
        JSON.stringify({
          error:'Campaign transfer failed'
        }),
        {
          status:500,
          headers:{
            ...corsHeaders,
            'Content-Type':'application/json'
          }
        }
      );
    }



    // optional log
    await serviceClient
      .from('admin_activity_log')
      .insert({
        admin_id: adminId,
        action:'brand_campaign_transfer',
        target_type:'brand_campaign',
        target_id:campaignId,
        details:{
          previous_created_by:
            campaign.created_by,

          previous_brand_name:
            campaign.brand_name,

          new_brand_id:newBrandId,

          new_brand_user_id:
            brand.user_id,

          new_brand_name:
            brand.brand_name,

          reason: reason || null
        }
      });



    return new Response(
      JSON.stringify({
        success:true,
        message:'Campaign transferred successfully',
        campaign:{
          id:campaignId,
          brand_name:brand.brand_name,
          created_by:brand.user_id,
          hfx_brand_id:
            campaign.hfx_brand_id
        }
      }),
      {
        status:200,
        headers:{
          ...corsHeaders,
          'Content-Type':'application/json'
        }
      }
    );



  } catch(error){

    console.error(error);

    return new Response(
      JSON.stringify({
        error:'Internal server error'
      }),
      {
        status:500,
        headers:{
          ...corsHeaders,
          'Content-Type':'application/json'
        }
      }
    );

  }
});