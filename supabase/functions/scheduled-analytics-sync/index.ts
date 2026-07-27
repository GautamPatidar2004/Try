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

  const startTime = Date.now();
  console.log('[SCHEDULED-SYNC] Starting scheduled analytics sync at', new Date().toISOString());

  try {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Restrict to internal/cron callers (must pass the service role key as Bearer token).
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token || token !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    );

    const metaAppId = Deno.env.get('META_APP_ID') ?? '';
    const metaAppSecret = Deno.env.get('META_APP_SECRET') ?? '';

    // Fetch all active Instagram accounts with valid tokens
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('social_accounts')
      .select('*')
      .eq('platform', 'instagram')
      .eq('sync_enabled', true)
      .not('access_token', 'is', null)
      .gt('token_expires_at', new Date().toISOString());

    if (accountsError) {
      console.error('[SCHEDULED-SYNC] Error fetching accounts:', accountsError);
      throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
      console.log('[SCHEDULED-SYNC] No active Instagram accounts to sync');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No accounts to sync',
          syncedCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SCHEDULED-SYNC] Found ${accounts.length} accounts to sync`);

    const results = {
      total: accounts.length,
      successful: 0,
      failed: 0,
      tokensRefreshed: 0,
      errors: [] as any[],
    };

    // Sync each account
    for (const account of accounts) {
      try {
        console.log(`[SCHEDULED-SYNC] Syncing account: ${account.username} (${account.influencer_id})`);

        // Check if token is expiring soon (less than 7 days) and attempt refresh
        const expiresAt = new Date(account.token_expires_at);
        const daysUntilExpiration = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let activeToken = account.access_token;
        
        if (daysUntilExpiration < 7 && metaAppId && metaAppSecret) {
          console.log(`[SCHEDULED-SYNC] Token expiring in ${daysUntilExpiration} days for ${account.username}, attempting refresh...`);
          
          try {
            // Refresh the long-lived token
            const refreshUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
            refreshUrl.searchParams.set('grant_type', 'fb_exchange_token');
            refreshUrl.searchParams.set('client_id', metaAppId);
            refreshUrl.searchParams.set('client_secret', metaAppSecret);
            refreshUrl.searchParams.set('fb_exchange_token', account.access_token);

            const refreshResponse = await fetch(refreshUrl.toString());
            const refreshData = await refreshResponse.json();

            if (refreshData.access_token) {
              const newExpiresAt = new Date();
              newExpiresAt.setSeconds(newExpiresAt.getSeconds() + (refreshData.expires_in || 5184000));

              await supabaseClient
                .from('social_accounts')
                .update({
                  access_token: refreshData.access_token,
                  token_expires_at: newExpiresAt.toISOString(),
                })
                .eq('id', account.id);

              activeToken = refreshData.access_token;
              results.tokensRefreshed++;
              console.log(`[SCHEDULED-SYNC] Successfully refreshed token for ${account.username}, new expiry: ${newExpiresAt.toISOString()}`);
            } else {
              console.warn(`[SCHEDULED-SYNC] Token refresh failed for ${account.username}:`, refreshData.error?.message);
              // Still notify admin
              await supabaseClient.from('admin_notifications').insert({
                type: 'token_expiration',
                title: 'Instagram Token Refresh Failed',
                message: `Token refresh failed for @${account.username}. Expires in ${daysUntilExpiration} days. User may need to reconnect.`,
                data: {
                  user_id: account.influencer_id,
                  platform: 'instagram',
                  username: account.username,
                  days_until_expiration: daysUntilExpiration,
                  refresh_error: refreshData.error?.message,
                },
              });
            }
          } catch (refreshErr) {
            console.error(`[SCHEDULED-SYNC] Token refresh error for ${account.username}:`, refreshErr);
          }
        }

        // Calculate date range for historical data (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const since = Math.floor(startDate.getTime() / 1000);
        const until = Math.floor(endDate.getTime() / 1000);

        console.log(`[SCHEDULED-SYNC] Fetching data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // ========= API Call #1: Get account info (follower count) =========
        const accountInfoUrl = new URL(`https://graph.facebook.com/v21.0/${account.platform_user_id}`);
        accountInfoUrl.searchParams.set('fields', 'followers_count,follows_count,media_count');
        accountInfoUrl.searchParams.set('access_token', activeToken);

        console.log(`[SCHEDULED-SYNC] Fetching account info for ${account.username}`);
        const accountInfoResponse = await fetch(accountInfoUrl.toString());
        const accountInfo = await accountInfoResponse.json();

        if (accountInfo.error) {
          console.error(`[SCHEDULED-SYNC] Account info API error:`, accountInfo.error);
          if (accountInfo.error.code === 190) {
            await supabaseClient
              .from('social_accounts')
              .update({ sync_enabled: false })
              .eq('id', account.id);
            console.log(`[SCHEDULED-SYNC] Disabled sync for ${account.username} due to invalid token`);
          }
          throw new Error(accountInfo.error.message);
        }

        const currentFollowerCount = accountInfo.followers_count || account.follower_count || 0;
        console.log(`[SCHEDULED-SYNC] Current follower count: ${currentFollowerCount}`);

        // ========= API Call #2: Daily metrics (reach, follower_count) =========
        const dailyMetrics = ['reach', 'follower_count'];
        const dailyUrl = new URL(`https://graph.facebook.com/v21.0/${account.platform_user_id}/insights`);
        dailyUrl.searchParams.set('metric', dailyMetrics.join(','));
        dailyUrl.searchParams.set('period', 'day');
        dailyUrl.searchParams.set('since', since.toString());
        dailyUrl.searchParams.set('until', until.toString());
        dailyUrl.searchParams.set('access_token', activeToken);

        console.log(`[SCHEDULED-SYNC] Fetching daily metrics for ${account.username}`);
        const dailyResponse = await fetch(dailyUrl.toString());
        const dailyData = await dailyResponse.json();

        if (dailyData.error) {
          console.error(`[SCHEDULED-SYNC] Daily metrics API error for ${account.username}:`, dailyData.error);
          throw new Error(dailyData.error.message);
        }

        console.log(`[SCHEDULED-SYNC] Got daily metrics:`, dailyData.data?.map((m: any) => ({ name: m.name, values: m.values?.length })) || []);

        // ========= API Call #3: Total value metrics (interactions, profile views, etc.) =========
        const totalValueMetrics = ['profile_views', 'website_clicks', 'total_interactions', 'accounts_engaged'];
        const totalValueUrl = new URL(`https://graph.facebook.com/v21.0/${account.platform_user_id}/insights`);
        totalValueUrl.searchParams.set('metric', totalValueMetrics.join(','));
        totalValueUrl.searchParams.set('metric_type', 'total_value');
        totalValueUrl.searchParams.set('period', 'day');
        totalValueUrl.searchParams.set('since', since.toString());
        totalValueUrl.searchParams.set('until', until.toString());
        totalValueUrl.searchParams.set('access_token', activeToken);

        console.log(`[SCHEDULED-SYNC] Fetching total value metrics for ${account.username}`);
        const totalValueResponse = await fetch(totalValueUrl.toString());
        const totalValueData = await totalValueResponse.json();

        if (totalValueData.error) {
          console.warn(`[SCHEDULED-SYNC] Total value metrics warning for ${account.username}:`, totalValueData.error.message);
        } else {
          console.log(`[SCHEDULED-SYNC] Got total value metrics:`, totalValueData.data?.map((m: any) => ({ name: m.name, values: m.values?.length })) || []);
        }

        // Process daily values and group by date
        const dailyRecords: Record<string, any> = {};

        if (dailyData.data) {
          dailyData.data.forEach((metric: any) => {
            if (metric.values) {
              metric.values.forEach((val: any) => {
                const date = val.end_time.split('T')[0];
                if (!dailyRecords[date]) {
                  dailyRecords[date] = { date };
                }
                dailyRecords[date][metric.name] = val.value;
              });
            }
          });
        }

        if (totalValueData.data) {
          totalValueData.data.forEach((metric: any) => {
            if (metric.values) {
              metric.values.forEach((val: any) => {
                const date = val.end_time.split('T')[0];
                if (!dailyRecords[date]) {
                  dailyRecords[date] = { date };
                }
                dailyRecords[date][metric.name] = val.value;
              });
            }
          });
        }

        console.log(`[SCHEDULED-SYNC] Processed ${Object.keys(dailyRecords).length} days of data`);

        // ========= API Call #4: Fetch recent media for engagement calculation =========
        const mediaUrl = new URL(`https://graph.facebook.com/v21.0/${account.platform_user_id}/media`);
        mediaUrl.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count');
        mediaUrl.searchParams.set('limit', '25');
        mediaUrl.searchParams.set('access_token', activeToken);

        const mediaResponse = await fetch(mediaUrl.toString());
        const mediaData = await mediaResponse.json();

        console.log(`[SCHEDULED-SYNC] Got ${mediaData.data?.length || 0} media items for ${account.username}`);

        // Calculate engagement metrics from recent posts
        let engagementData: any = {};
        if (mediaData.data && mediaData.data.length > 0) {
          const totalLikes = mediaData.data.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0);
          const totalComments = mediaData.data.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0);
          const totalEngagement = totalLikes + totalComments;
          const avgEngagement = totalEngagement / mediaData.data.length;
          const engagementRate = currentFollowerCount > 0 
            ? (avgEngagement / currentFollowerCount) * 100 
            : 0;

          engagementData = {
            avg_engagement_per_post: Math.round(avgEngagement),
            avg_likes: Math.round(totalLikes / mediaData.data.length),
            avg_comments: Math.round(totalComments / mediaData.data.length),
            engagement_rate: parseFloat(engagementRate.toFixed(2)),
            total_posts: mediaData.data.length,
          };

          console.log(`[SCHEDULED-SYNC] Engagement rate: ${engagementData.engagement_rate}%, Avg engagement: ${engagementData.avg_engagement_per_post}`);
        }

        // Store each day's record in the database
        let storedCount = 0;
        for (const [date, metrics] of Object.entries(dailyRecords)) {
          const isToday = date === new Date().toISOString().split('T')[0];
          const fullMetrics = {
            ...metrics,
            follower_count: metrics.follower_count || currentFollowerCount,
            ...(isToday ? engagementData : {}),
          };

          const { error: analyticsError } = await supabaseClient
            .from('external_analytics')
            .upsert({
              influencer_id: account.influencer_id,
              platform: 'instagram',
              account_id: account.username,
              metric_date: date,
              metrics: fullMetrics,
            }, {
              onConflict: 'influencer_id,platform,account_id,metric_date'
            });

          if (analyticsError) {
            console.error(`[SCHEDULED-SYNC] Error storing analytics for ${date}:`, analyticsError);
          } else {
            storedCount++;
          }
        }

        console.log(`[SCHEDULED-SYNC] Stored ${storedCount} daily records for ${account.username}`);

        // Update social_accounts with latest summary
        const todayMetrics = dailyRecords[new Date().toISOString().split('T')[0]] || {};
        const latestMetrics = {
          ...todayMetrics,
          ...engagementData,
          follower_count: currentFollowerCount,
        };

        const { error: updateError } = await supabaseClient
          .from('social_accounts')
          .update({
            last_sync_at: new Date().toISOString(),
            analytics_data: latestMetrics,
            follower_count: currentFollowerCount,
            last_updated: new Date().toISOString(),
          })
          .eq('id', account.id);

        if (updateError) {
          console.error(`[SCHEDULED-SYNC] Error updating account for ${account.username}:`, updateError);
          throw updateError;
        }

        // Update influencers table
        const { error: influencerUpdateError } = await supabaseClient
          .from('influencers')
          .update({
            engagement_rate: engagementData.engagement_rate || 0,
            total_followers: currentFollowerCount,
          })
          .eq('id', account.influencer_id);

        if (influencerUpdateError) {
          console.warn(`[SCHEDULED-SYNC] Error updating influencer:`, influencerUpdateError);
        }

        console.log(`[SCHEDULED-SYNC] Successfully synced ${account.username} - ${storedCount} days`);
        results.successful++;

      } catch (error: any) {
        console.error(`[SCHEDULED-SYNC] Failed to sync ${account.username}:`, error);
        results.failed++;
        results.errors.push({
          username: account.username,
          user_id: account.influencer_id,
          error: error.message,
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[SCHEDULED-SYNC] Completed in ${duration}ms. Success: ${results.successful}, Failed: ${results.failed}, Tokens refreshed: ${results.tokensRefreshed}`);

    // ===== TikTok branch =====
    let tiktokResults = { total: 0, successful: 0, failed: 0 };
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const { data: tkAccounts } = await supabaseClient
        .from('social_accounts')
        .select('influencer_id, username')
        .eq('platform', 'tiktok')
        .eq('sync_enabled', true)
        .not('access_token', 'is', null);

      tiktokResults.total = tkAccounts?.length || 0;
      for (const tk of tkAccounts || []) {
        try {
          const r = await fetch(`${supabaseUrl}/functions/v1/sync-tiktok-analytics`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({ userId: tk.influencer_id }),
          });
          if (r.ok) tiktokResults.successful++;
          else tiktokResults.failed++;
        } catch (e) {
          console.error('[SCHEDULED-SYNC] TikTok sync failed for', tk.username, e);
          tiktokResults.failed++;
        }
      }
      console.log(`[SCHEDULED-SYNC] TikTok: ${tiktokResults.successful}/${tiktokResults.total} synced`);
    } catch (e) {
      console.error('[SCHEDULED-SYNC] TikTok branch error:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration,
        ...results,
        tiktok: tiktokResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SCHEDULED-SYNC] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
