import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const tiktokClientKey = Deno.env.get('TIKTOK_CLIENT_KEY') ?? '';
    const tiktokClientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET') ?? '';
    const appDomain = Deno.env.get('APP_DOMAIN') || 'https://hostfluencer.com';

    console.log('[TikTok Analytics] Configuration check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasTiktokClientKey: !!tiktokClientKey,
      hasTiktokClientSecret: !!tiktokClientSecret,
      appDomain,
    });

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    const defaultReturnTo = `${appDomain}/profile?tab=analytics`;

    const toBase64Url = (input: string) =>
      btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    const fromBase64Url = (input: string) => {
      const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      return atob(padded);
    };

    const parseOAuthState = (raw: string | null): { userId?: string; returnTo?: string } => {
      if (!raw) return {};

      // Backwards-compatible: previous versions used raw UUID state
      const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (looksLikeUuid) return { userId: raw };

      try {
        const decoded = fromBase64Url(raw);
        const parsed = JSON.parse(decoded);
        return {
          userId: typeof parsed?.userId === 'string' ? parsed.userId : undefined,
          returnTo: typeof parsed?.returnTo === 'string' ? parsed.returnTo : undefined,
        };
      } catch {
        return {};
      }
    };

    const buildRedirectUrl = (base: string, params: Record<string, string>) => {
      const u = new URL(base);
      // Ensure analytics tab stays selected
      u.searchParams.set('tab', u.searchParams.get('tab') || 'analytics');
      for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
      return u.toString();
    };

    const stateData = parseOAuthState(state);
    const returnTo = stateData.returnTo || defaultReturnTo;

    // Handle OAuth error from TikTok
    if (errorParam) {
      console.error('[TikTok Analytics] OAuth error from TikTok:', {
        error: errorParam,
        description: errorDescription,
      });

      return Response.redirect(
        buildRedirectUrl(returnTo, {
          error: `tiktok_${errorParam}`,
          error_description: encodeURIComponent(errorDescription || ''),
        }),
        302
      );
    }

    // Parse request body for initiate/disconnect actions
    let action = null;
    let requestBody = null;

    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        action = requestBody.action;
      }
    } catch (e) {
      console.log('[TikTok Analytics] No JSON body (expected for callbacks)');
    }

    // Check URL path for callback action
    if (!action) {
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== 'connect-tiktok-analytics') {
        action = lastPart;
      }
    }

    console.log(`[TikTok Analytics] Processing action: ${action}`, {
      hasBody: !!requestBody,
      hasCode: !!code,
      hasState: !!state,
    });

    // Step 1: Initiate OAuth Flow
    if (action === 'initiate') {
      const userId = requestBody?.userId;

      if (!userId) {
        throw new Error('userId is required for initiate action');
      }

      if (!tiktokClientKey) {
        throw new Error('TIKTOK_CLIENT_KEY is not configured. Please add it in Supabase secrets.');
      }

      const redirectUri = `${supabaseUrl}/functions/v1/connect-tiktok-analytics/callback`;

      console.log('[TikTok Analytics] Initiating TikTok OAuth', {
        userId,
        redirectUri,
      });

      // TikTok Login Kit V2 authorization URL
      const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
      authUrl.searchParams.set('client_key', tiktokClientKey);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'user.info.basic,user.info.profile,user.info.stats');
      authUrl.searchParams.set('response_type', 'code');

      const returnToFromClient = requestBody?.returnTo;
      const finalReturnTo = typeof returnToFromClient === 'string' && returnToFromClient.startsWith('http')
        ? returnToFromClient
        : defaultReturnTo;

      const oauthState = toBase64Url(JSON.stringify({ userId, returnTo: finalReturnTo }));
      authUrl.searchParams.set('state', oauthState);

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString(), redirectUri }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Handle OAuth Callback
    if (action === 'callback' && code && state) {
      const userId = stateData.userId || state;
      const returnToForCallback = stateData.returnTo || defaultReturnTo;
      const redirectUri = `${supabaseUrl}/functions/v1/connect-tiktok-analytics/callback`;

      console.log('[TikTok Analytics] Processing OAuth callback', {
        userId,
        codeLength: code.length,
      });

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: tiktokClientKey,
          client_secret: tiktokClientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error || !tokenData.access_token) {
        console.error('[TikTok Analytics] Token exchange failed:', tokenData);
        return Response.redirect(
          buildRedirectUrl(returnToForCallback, { error: 'tiktok_token_exchange_failed' }),
          302
        );
      }

      const { access_token, refresh_token, expires_in, open_id } = tokenData;

      console.log('[TikTok Analytics] Got access token, fetching user profile');

      // Fetch user info with stats
      const userInfoResponse = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      );

      const userInfoData = await userInfoResponse.json();

      const errCode = userInfoData?.error?.code;
      if (errCode && errCode !== 'ok') {
        console.error('[TikTok Analytics] Failed to fetch user info:', userInfoData);
        return Response.redirect(
          buildRedirectUrl(returnToForCallback, {
            error: errCode === 'scope_not_authorized' ? 'tiktok_scope_not_authorized' : 'tiktok_profile_fetch_failed',
          }),
          302
        );
      }

      const userInfo = userInfoData.data?.user;
      if (!userInfo) {
        console.error('[TikTok Analytics] No user data in response:', userInfoData);
        return Response.redirect(
          buildRedirectUrl(returnToForCallback, { error: 'tiktok_profile_fetch_failed' }),
          302
        );
      }

      console.log('[TikTok Analytics] Got TikTok profile:', {
        username: userInfo.username || userInfo.display_name,
        followers: userInfo.follower_count,
        videos: userInfo.video_count,
      });

      // Calculate token expiration
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 86400));

      // Store in database
      const { error } = await supabaseClient
        .from('social_accounts')
        .upsert({
          influencer_id: userId,
          platform: 'tiktok',
          username: userInfo.username || userInfo.display_name || open_id,
          follower_count: userInfo.follower_count || 0,
          profile_url: userInfo.username ? `https://tiktok.com/@${userInfo.username}` : null,
          platform_user_id: open_id,
          access_token: access_token,
          refresh_token: refresh_token || null,
          token_expires_at: expiresAt.toISOString(),
          connected_at: new Date().toISOString(),
          sync_enabled: true,
          is_verified: true,
          analytics_data: {
            following_count: userInfo.following_count || 0,
            likes_count: userInfo.likes_count || 0,
            video_count: userInfo.video_count || 0,
            avatar_url: userInfo.avatar_url,
            display_name: userInfo.display_name,
          },
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'influencer_id,platform'
        });

      if (error) {
        console.error('[TikTok Analytics] Database error:', error);
        return Response.redirect(
          buildRedirectUrl(returnToForCallback, { error: 'tiktok_database_error' }),
          302
        );
      }

      console.log('[TikTok Analytics] Successfully stored TikTok account data for user:', userId);

      return Response.redirect(
        buildRedirectUrl(returnToForCallback, { connected: 'tiktok' }),
        302
      );
    }

    // Step 3: Disconnect Account
    if (action === 'disconnect') {
      const userId = requestBody?.userId;

      if (!userId) {
        throw new Error('userId is required for disconnect action');
      }

      console.log(`[TikTok Analytics] Disconnecting TikTok for user ${userId}`);

      const { error } = await supabaseClient
        .from('social_accounts')
        .update({
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          sync_enabled: false,
        })
        .eq('influencer_id', userId)
        .eq('platform', 'tiktok');

      if (error) {
        console.error('[TikTok Analytics] Disconnect error:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('[TikTok Analytics] Invalid action:', action);
    return new Response(
      JSON.stringify({ error: 'Invalid action', receivedAction: action }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[TikTok Analytics] Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
