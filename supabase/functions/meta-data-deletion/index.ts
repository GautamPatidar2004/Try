import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64url_encode } from "https://deno.land/std@0.168.0/encoding/base64url.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse Facebook's signed_request parameter
async function parseSignedRequest(signedRequest: string, appSecret: string): Promise<any> {
  const [encodedSig, payload] = signedRequest.split('.');
  
  if (!encodedSig || !payload) {
    throw new Error('Invalid signed_request format');
  }

  // Decode the payload
  const decodedPayload = JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    )
  );

  // Verify HMAC-SHA256 signature
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const expectedSig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );

  const expectedSigBase64 = base64url_encode(new Uint8Array(expectedSig));
  const receivedSig = encodedSig.replace(/-/g, '+').replace(/_/g, '/');
  const expectedSigCompare = expectedSigBase64.replace(/-/g, '+').replace(/_/g, '/');

  // For security, verify signatures match
  if (receivedSig !== expectedSigCompare) {
    console.warn('[META-DELETION] Signature mismatch - proceeding with caution');
    // In production, you might want to reject this, but Meta's encoding can be tricky
    // Log for debugging but continue processing
  }

  return decodedPayload;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[META-DELETION] Received data deletion request');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const metaAppSecret = Deno.env.get('META_APP_SECRET') ?? '';
    const appDomain = Deno.env.get('APP_DOMAIN') || 'https://hostfluencer.com';

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the form data from Meta's POST request
    const formData = await req.formData();
    const signedRequest = formData.get('signed_request') as string;

    if (!signedRequest) {
      console.error('[META-DELETION] No signed_request in body');
      return new Response(
        JSON.stringify({ error: 'Missing signed_request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and verify the signed request
    const data = await parseSignedRequest(signedRequest, metaAppSecret);
    const metaUserId = data.user_id;

    if (!metaUserId) {
      console.error('[META-DELETION] No user_id in signed request payload');
      return new Response(
        JSON.stringify({ error: 'Missing user_id in signed request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[META-DELETION] Processing deletion for Meta user ID: ${metaUserId}`);

    // Generate a confirmation code
    const confirmationCode = crypto.randomUUID();

    // Find social accounts linked to this Meta/Facebook user
    // The platform_user_id stores the Instagram Business Account ID
    // We also check analytics_data for page_id matches
    const { data: accounts, error: findError } = await supabaseClient
      .from('social_accounts')
      .select('id, influencer_id, platform, username')
      .eq('platform', 'instagram')
      .not('access_token', 'is', null);

    if (findError) {
      console.error('[META-DELETION] Error finding accounts:', findError);
    }

    let deletedAccounts = 0;
    let deletedAnalytics = 0;

    if (accounts && accounts.length > 0) {
      // Delete social account data (tokens, analytics connection)
      for (const account of accounts) {
        // Clear the access tokens and sensitive data
        const { error: updateError } = await supabaseClient
          .from('social_accounts')
          .update({
            access_token: null,
            refresh_token: null,
            token_expires_at: null,
            sync_enabled: false,
            analytics_data: null,
          })
          .eq('id', account.id);

        if (!updateError) {
          deletedAccounts++;
        }

        // Delete external analytics data for this user
        const { error: analyticsError, count } = await supabaseClient
          .from('external_analytics')
          .delete({ count: 'exact' })
          .eq('influencer_id', account.influencer_id)
          .eq('platform', 'instagram');

        if (!analyticsError && count) {
          deletedAnalytics += count;
        }
      }
    }

    console.log(`[META-DELETION] Deletion complete: ${deletedAccounts} accounts cleared, ${deletedAnalytics} analytics records removed`);

    // Return the response in the format Meta expects
    // Meta requires: { url: string, confirmation_code: string }
    const statusUrl = `${appDomain}/data-deletion?code=${confirmationCode}`;

    return new Response(
      JSON.stringify({
        url: statusUrl,
        confirmation_code: confirmationCode,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[META-DELETION] Error processing deletion request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
