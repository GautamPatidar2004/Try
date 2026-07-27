import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const metaAppId = Deno.env.get("META_APP_ID") ?? "";
    const metaAppSecret = Deno.env.get("META_APP_SECRET") ?? "";
    const appDomain = Deno.env.get("APP_DOMAIN") || "https://hostfluencer.com";

    // Log configuration status (without exposing secrets)
    console.log("[Meta Analytics] Configuration check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasMetaAppId: !!metaAppId,
      hasMetaAppSecret: !!metaAppSecret,
      appDomain,
      supabaseUrlPrefix: supabaseUrl.substring(0, 30) + "...",
    });

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");
    const errorReason = url.searchParams.get("error_reason");
    const errorDescription = url.searchParams.get("error_description");

    // Log OAuth error if present (user denied permission, etc.)
    if (errorParam) {
      console.error("[Meta Analytics] OAuth error from Meta:", {
        error: errorParam,
        reason: errorReason,
        description: errorDescription,
      });
      return Response.redirect(
        `${appDomain}/profile?tab=analytics&error=${errorParam}&error_description=${encodeURIComponent(errorDescription || "")}`,
        302,
      );
    }

    // Try to get action from request body first (for initiate/disconnect)
    let action = null;
    let requestBody = null;

    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        action = requestBody.action;
      }
    } catch (e) {
      // If body parsing fails, that's okay - might be a callback URL
      console.log(
        "[Meta Analytics] No JSON body or parse error (expected for callbacks)",
      );
    }

    // If no action in body, check URL pathname (for callback)
    if (!action) {
      const pathParts = url.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== "connect-meta-analytics") {
        action = lastPart;
      }
    }

    console.log(`[Meta Analytics] Processing action: ${action}`, {
      hasBody: !!requestBody,
      hasCode: !!code,
      hasState: !!state,
      fullUrl: req.url,
      pathname: url.pathname,
    });

    // Step 1: Initiate OAuth Flow
    if (action === "initiate") {
      const userId = requestBody?.userId;

      if (!userId) {
        console.error("[Meta Analytics] initiate called without userId");
        throw new Error("userId is required for initiate action");
      }

      const redirectUri = `${supabaseUrl}/functions/v1/connect-meta-analytics/callback`;

      console.log(
        `[Meta Analytics] Initiating Facebook OAuth for Instagram access`,
        {
          userId,
          redirectUri,
          metaAppId: metaAppId ? `${metaAppId.substring(0, 8)}...` : "MISSING",
        },
      );

      if (!metaAppId) {
        throw new Error(
          "META_APP_ID is not configured. Please add it in Supabase secrets.",
        );
      }

      // Use Facebook OAuth endpoint for Instagram Graph API access
      const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
      authUrl.searchParams.set("client_id", metaAppId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set(
        "scope",
        "pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement,business_management",
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("state", userId);

      console.log(
        "[Meta Analytics] Generated auth URL:",
        authUrl.toString().substring(0, 100) + "...",
      );

      return new Response(
        JSON.stringify({
          authUrl: authUrl.toString(),
          redirectUri, // Include for debugging
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 2: Handle OAuth Callback
    if (action === "callback" && code && state) {
      const userId = state;

      console.log(`[Meta Analytics] Processing OAuth callback`, {
        userId,
        codeLength: code.length,
        codePrefix: code.substring(0, 10) + "...",
      });

      const redirectUri = `${supabaseUrl}/functions/v1/connect-meta-analytics/callback`;

      console.log("[Meta Analytics] Token exchange redirect URI:", redirectUri);

      // Exchange code for Facebook access token
      const tokenUrl = new URL(
        "https://graph.facebook.com/v21.0/oauth/access_token",
      );
      tokenUrl.searchParams.set("client_id", metaAppId);
      tokenUrl.searchParams.set("client_secret", metaAppSecret);
      tokenUrl.searchParams.set("redirect_uri", redirectUri);
      tokenUrl.searchParams.set("code", code);

      console.log("[Meta Analytics] Exchanging code for token...");
      const tokenResponse = await fetch(tokenUrl.toString());
      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        console.error("[Meta Analytics] Failed to get Facebook access token:", {
          error: tokenData.error,
          errorMessage: tokenData.error?.message,
          errorType: tokenData.error?.type,
          errorCode: tokenData.error?.code,
        });
        return Response.redirect(
          `${appDomain}/profile?tab=analytics&error=token_exchange_failed&details=${encodeURIComponent(tokenData.error?.message || "Unknown error")}`,
          302,
        );
      }

      const fbAccessToken = tokenData.access_token;
      console.log(
        "[Meta Analytics] Got Facebook access token, discovering Instagram Business Account",
      );

      // Get user's Facebook Pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account,name,access_token&access_token=${fbAccessToken}`,
      );
      const pagesData = await pagesResponse.json();

      console.log("[Meta Analytics] Facebook Pages response:", {
        hasData: !!pagesData.data,
        pageCount: pagesData.data?.length || 0,
        error: pagesData.error,
      });

      if (!pagesData.data || pagesData.data.length === 0) {
        console.log(
          "[Meta Analytics] No direct pages found, trying Business Portfolio...",
        );
        const businessRes = await fetch(
          `https://graph.facebook.com/v21.0/me/businesses?fields=owned_pages{id,name,access_token,instagram_business_account}&access_token=${fbAccessToken}`,
        );
        const businessData = await businessRes.json();
        console.log(
          "[Meta Analytics] Business Portfolio response:",
          JSON.stringify(businessData),
        );
        if (businessData.data && businessData.data.length > 0) {
          for (const business of businessData.data) {
            if (business.owned_pages?.data?.length > 0) {
              pagesData.data = business.owned_pages.data;
              console.log(
                `[Meta Analytics] Found ${pagesData.data.length} pages via Business Portfolio`,
              );
              break;
            }
          }
        }
      }
      // Step C: Still no pages found

      if (!pagesData.data || pagesData.data.length === 0) {
        console.error("[Meta Analytics] No Facebook Pages found for user");
        return Response.redirect(
          `${appDomain}/profile?tab=analytics&error=no_facebook_page`,
          302,
        );
      }

      // Find page with Instagram Business Account
      let pageWithIG = pagesData.data.find(
        (page: any) => page.instagram_business_account,
      );

      // Step D: If instagram_business_account not in fields, fetch per page
      if (!pageWithIG) {
        console.log(
          "[Meta Analytics] instagram_business_account not in initial response, checking each page...",
        );
        for (const page of pagesData.data) {
          const igCheckRes = await fetch(
            `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token || fbAccessToken}`,
          );
          const igCheckData = await igCheckRes.json();
          console.log(
            `[Meta Analytics] IG check for page "${page.name}":`,
            JSON.stringify(igCheckData),
          );
          if (igCheckData.instagram_business_account) {
            pageWithIG = {
              ...page,
              instagram_business_account:
                igCheckData.instagram_business_account,
            };
            break;
          }
        }
      }

      console.log("[Meta Analytics] Looking for Instagram Business Account:", {
        pagesChecked: pagesData.data.length,
        pageNames: pagesData.data.map((p: any) => p.name),
        foundInstagram: !!pageWithIG,
      });

      if (!pageWithIG || !pageWithIG.instagram_business_account) {
        console.error(
          "[Meta Analytics] No Instagram Business Account linked to Facebook Pages",
        );
        return Response.redirect(
          `${appDomain}/profile?tab=analytics&error=no_instagram_business`,
          302,
        );
      }

      const instagramAccountId = pageWithIG.instagram_business_account.id;
      const pageAccessToken = pageWithIG.access_token || fbAccessToken;

      console.log(
        `[Meta Analytics] Found Instagram Business Account: ${instagramAccountId}`,
      );

      // Exchange for long-lived Page token (60 days)
      const longLivedUrl = new URL(
        "https://graph.facebook.com/v21.0/oauth/access_token",
      );
      longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
      longLivedUrl.searchParams.set("client_id", metaAppId);
      longLivedUrl.searchParams.set("client_secret", metaAppSecret);
      longLivedUrl.searchParams.set("fb_exchange_token", pageAccessToken);

      console.log("[Meta Analytics] Exchanging for long-lived token...");
      const longLivedResponse = await fetch(longLivedUrl.toString());
      const longLivedData = await longLivedResponse.json();

      if (!longLivedData.access_token) {
        console.error(
          "[Meta Analytics] Failed to exchange for long-lived token:",
          longLivedData,
        );
        return Response.redirect(
          `${appDomain}/profile?tab=analytics&error=token_exchange_failed`,
          302,
        );
      }

      const longLivedToken = longLivedData.access_token;
      console.log("[Meta Analytics] Got long-lived Page token");

      // Get Instagram Business Account profile
      const profileResponse = await fetch(
        `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${longLivedToken}`,
      );
      const profileData = await profileResponse.json();

      if (profileData.error) {
        console.error(
          "[Meta Analytics] Failed to get Instagram profile:",
          profileData.error,
        );
        return Response.redirect(
          `${appDomain}/profile?tab=analytics&error=profile_fetch_failed`,
          302,
        );
      }

      console.log("[Meta Analytics] Got Instagram profile:", {
        username: profileData.username,
        followers: profileData.followers_count,
        mediaCount: profileData.media_count,
      });

      // Calculate token expiration (60 days from now)
      const expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() + (longLivedData.expires_in || 5184000),
      );

      // Store in database
      const { error } = await supabaseClient.from("social_accounts").upsert(
        {
          influencer_id: userId,
          platform: "instagram",
          username: profileData.username,
          follower_count: profileData.followers_count || 0,
          profile_url: `https://instagram.com/${profileData.username}`,
          platform_user_id: instagramAccountId,
          access_token: longLivedToken,
          refresh_token: null,
          token_expires_at: expiresAt.toISOString(),
          connected_at: new Date().toISOString(),
          sync_enabled: true,
          is_verified: true, // Instagram Business Accounts are always verified
          analytics_data: {
            account_type: "BUSINESS",
            media_count: profileData.media_count || 0,
            profile_picture_url: profileData.profile_picture_url,
            page_id: pageWithIG.id,
            page_name: pageWithIG.name,
          },
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "influencer_id,platform",
        },
      );

      if (error) {
        console.error("[Meta Analytics] Database error:", error);
        return Response.redirect(
          `${appDomain}/profile?tab=analytics&error=database_error`,
          302,
        );
      }

      console.log(
        "[Meta Analytics] Successfully stored Instagram Business Account data for user:",
        userId,
      );

      // Redirect back to app with success
      return Response.redirect(
        `${appDomain}/profile?tab=analytics&connected=instagram`,
        302,
      );
    }

    // Step 3: Disconnect Account
    if (action === "disconnect") {
      const userId = requestBody?.userId;
      const platform = requestBody?.platform;

      if (!userId || !platform) {
        console.error(
          "[Meta Analytics] disconnect called without userId or platform",
        );
        throw new Error(
          "userId and platform are required for disconnect action",
        );
      }

      console.log(
        `[Meta Analytics] Disconnecting ${platform} for user ${userId}`,
      );

      const { error } = await supabaseClient
        .from("social_accounts")
        .update({
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          sync_enabled: false,
        })
        .eq("influencer_id", userId)
        .eq("platform", platform);

      if (error) {
        console.error("[Meta Analytics] Disconnect error:", error);
        throw error;
      }

      console.log("[Meta Analytics] Successfully disconnected", platform);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.error("[Meta Analytics] Invalid action:", action);
    return new Response(
      JSON.stringify({ error: "Invalid action", receivedAction: action }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Meta Analytics] Unhandled error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
