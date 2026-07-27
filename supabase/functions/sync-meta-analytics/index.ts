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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { userId, platform } = await req.json();

    console.log(`Syncing ${platform} analytics for user ${userId}`);

    // Get social account with access token
    const { data: account, error: accountError } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("influencer_id", userId)
      .eq("platform", platform)
      .eq("sync_enabled", true)
      .single();

    if (accountError || !account) {
      throw new Error("Social account not found or sync disabled");
    }

    if (!account.access_token) {
      throw new Error("No access token available");
    }

    // Check if token is expired
    if (
      account.token_expires_at &&
      new Date(account.token_expires_at) < new Date()
    ) {
      throw new Error("Access token expired - requires re-authentication");
    }

    console.log(`Fetching insights for ${account.username}`);

    // Calculate date range for historical data (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Format as Unix timestamps for the API
    const since = Math.floor(startDate.getTime() / 1000);
    const until = Math.floor(endDate.getTime() / 1000);

    console.log(
      `Fetching historical data from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // First, get the current follower count from the account info
    const accountInfoUrl = new URL(
      `https://graph.facebook.com/v21.0/${account.platform_user_id}`,
    );
    accountInfoUrl.searchParams.set(
      "fields",
      "followers_count,follows_count,media_count",
    );
    accountInfoUrl.searchParams.set("access_token", account.access_token);

    const accountInfoResponse = await fetch(accountInfoUrl.toString());
    const accountInfo = await accountInfoResponse.json();

    if (accountInfo.error) {
      console.error("Account info API error:", accountInfo.error);
    } else {
      console.log(
        `Current follower count from API: ${accountInfo.followers_count}`,
      );
    }

    const currentFollowerCount =
      accountInfo.followers_count || account.follower_count || 0;

    // API Call #1: Daily metrics with period=day and date range
    const dailyMetrics = ["reach", "follower_count"];
    const dailyUrl = new URL(
      `https://graph.facebook.com/v21.0/${account.platform_user_id}/insights`,
    );
    dailyUrl.searchParams.set("metric", dailyMetrics.join(","));
    dailyUrl.searchParams.set("period", "day");
    dailyUrl.searchParams.set("since", since.toString());
    dailyUrl.searchParams.set("until", until.toString());
    dailyUrl.searchParams.set("access_token", account.access_token);

    console.log(
      "Daily metrics URL:",
      dailyUrl.toString().replace(account.access_token, "[REDACTED]"),
    );

    const dailyResponse = await fetch(dailyUrl.toString());
    const dailyData = await dailyResponse.json();

    if (dailyData.error) {
      console.error("Daily metrics API error:", dailyData.error);
      const errorMessage =
        dailyData.error.error_user_msg || dailyData.error.message;
      throw new Error(
        `Instagram API Error (daily metrics): ${errorMessage} (Code: ${dailyData.error.code})`,
      );
    }

    console.log(
      "Got daily metrics:",
      JSON.stringify(
        dailyData.data?.map((m: any) => ({
          name: m.name,
          values: m.values?.length,
        })) || [],
      ),
    );

    // API Call #2: Total value metrics with metric_type=total_value and date range
    const totalValueMetrics = [
      "profile_views",
      "website_clicks",
      "total_interactions",
      "accounts_engaged",
    ];
    const totalValueUrl = new URL(
      `https://graph.facebook.com/v21.0/${account.platform_user_id}/insights`,
    );
    totalValueUrl.searchParams.set("metric", totalValueMetrics.join(","));
    totalValueUrl.searchParams.set("metric_type", "total_value");
    totalValueUrl.searchParams.set("period", "day");
    totalValueUrl.searchParams.set("since", since.toString());
    totalValueUrl.searchParams.set("until", until.toString());
    totalValueUrl.searchParams.set("access_token", account.access_token);

    console.log(
      "Total value metrics URL:",
      totalValueUrl.toString().replace(account.access_token, "[REDACTED]"),
    );

    const totalValueResponse = await fetch(totalValueUrl.toString());
    const totalValueData = await totalValueResponse.json();

    if (totalValueData.error) {
      console.error("Total value metrics API error:", totalValueData.error);
      const errorMessage =
        totalValueData.error.error_user_msg || totalValueData.error.message;
      console.warn(`Some metrics unavailable: ${errorMessage}`);
    }

    console.log(
      "Got total value metrics:",
      JSON.stringify(
        totalValueData.data?.map((m: any) => ({
          name: m.name,
          values: m.values?.length,
        })) || [],
      ),
    );

    // Process daily values and group by date
    const dailyRecords: Record<string, any> = {};

    // Process daily metrics (reach, follower_count)
    if (dailyData.data) {
      dailyData.data.forEach((metric: any) => {
        if (metric.values) {
          metric.values.forEach((val: any) => {
            const date = val.end_time.split("T")[0];
            if (!dailyRecords[date]) {
              dailyRecords[date] = { date };
            }
            dailyRecords[date][metric.name] = val.value;
          });
        }
      });
    }

    // Process total value metrics
    if (totalValueData.data) {
      totalValueData.data.forEach((metric: any) => {
        if (metric.values) {
          metric.values.forEach((val: any) => {
            const date = val.end_time.split("T")[0];
            if (!dailyRecords[date]) {
              dailyRecords[date] = { date };
            }
            dailyRecords[date][metric.name] = val.value;
          });
        }
      });
    }

    console.log(`Processed ${Object.keys(dailyRecords).length} days of data`);

    // API Call #3: Audience demographics with breakdowns (only once, not per day)
    console.log("Fetching audience demographics...");
    const breakdowns = ["age", "gender", "city", "country"];

    const demographicsResults: Record<string, any> = {};

    for (const breakdown of breakdowns) {
      try {
        const demoUrl = new URL(
          `https://graph.facebook.com/v21.0/${account.platform_user_id}/insights`,
        );
        demoUrl.searchParams.set("metric", "follower_demographics");
        demoUrl.searchParams.set("period", "lifetime");
        demoUrl.searchParams.set("metric_type", "total_value");
        demoUrl.searchParams.set("breakdown", breakdown);
        demoUrl.searchParams.set("access_token", account.access_token);

        const demoResponse = await fetch(demoUrl.toString());
        const demoData = await demoResponse.json();

        if (demoData.error) {
          console.warn(
            `Demographics ${breakdown} unavailable:`,
            demoData.error.message,
          );
        } else if (demoData.data?.[0]?.total_value?.breakdowns?.[0]?.results) {
          demographicsResults[breakdown] =
            demoData.data[0].total_value.breakdowns[0].results;
          console.log(
            `Got ${breakdown} demographics:`,
            demographicsResults[breakdown].length,
            "entries",
          );
        }
      } catch (err) {
        console.warn(`Error fetching ${breakdown} demographics:`, err);
      }
    }

    // Parse demographics data into structured format
    const audienceDemographics: any = {
      gender: { male: 0, female: 0, other: 0 },
      age: {},
      topCities: [],
      topCountries: [],
    };

    // Parse gender breakdown
    if (demographicsResults.gender) {
      let totalGender = 0;
      demographicsResults.gender.forEach((item: any) => {
        totalGender += item.value || 0;
      });
      demographicsResults.gender.forEach((item: any) => {
        const pct =
          totalGender > 0 ? Math.round((item.value / totalGender) * 100) : 0;
        const dim = item.dimension_values?.[0]?.toLowerCase() || "";
        if (dim === "m" || dim === "male")
          audienceDemographics.gender.male = pct;
        else if (dim === "f" || dim === "female")
          audienceDemographics.gender.female = pct;
        else audienceDemographics.gender.other += pct;
      });
    }

    // Parse age breakdown
    if (demographicsResults.age) {
      let totalAge = 0;
      demographicsResults.age.forEach(
        (item: any) => (totalAge += item.value || 0),
      );
      demographicsResults.age.forEach((item: any) => {
        const ageRange = item.dimension_values?.[0] || "Unknown";
        const pct =
          totalAge > 0 ? Math.round((item.value / totalAge) * 100) : 0;
        audienceDemographics.age[ageRange] = pct;
      });
    }

    // Parse city breakdown (top 5)
    if (demographicsResults.city) {
      let totalCity = 0;
      demographicsResults.city.forEach(
        (item: any) => (totalCity += item.value || 0),
      );
      audienceDemographics.topCities = demographicsResults.city
        .slice(0, 5)
        .map((item: any) => ({
          name: item.dimension_values?.[0] || "Unknown",
          percentage:
            totalCity > 0 ? Math.round((item.value / totalCity) * 100) : 0,
        }));
    }

    // Parse country breakdown (top 5)
    if (demographicsResults.country) {
      let totalCountry = 0;
      demographicsResults.country.forEach(
        (item: any) => (totalCountry += item.value || 0),
      );
      audienceDemographics.topCountries = demographicsResults.country
        .slice(0, 5)
        .map((item: any) => ({
          name: item.dimension_values?.[0] || "Unknown",
          percentage:
            totalCountry > 0
              ? Math.round((item.value / totalCountry) * 100)
              : 0,
        }));
    }

    // Fetch recent media performance
    const mediaUrl = new URL(
      `https://graph.facebook.com/v21.0/${account.platform_user_id}/media`,
    );
    mediaUrl.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
    );
    mediaUrl.searchParams.set("limit", "25");
    mediaUrl.searchParams.set("access_token", account.access_token);

    const mediaResponse = await fetch(mediaUrl.toString());
    const mediaData = await mediaResponse.json();

    console.log(`Got ${mediaData.data?.length || 0} media items`);

    // Calculate engagement metrics from recent posts
    let engagementData: any = {};
    if (mediaData.data && mediaData.data.length > 0) {
      const totalLikes = mediaData.data.reduce(
        (sum: number, post: any) => sum + (post.like_count || 0),
        0,
      );
      const totalComments = mediaData.data.reduce(
        (sum: number, post: any) => sum + (post.comments_count || 0),
        0,
      );
      const totalEngagement = totalLikes + totalComments;
      const avgEngagement = totalEngagement / mediaData.data.length;
      const totalReach = Object.values(dailyRecords).reduce(
        (sum: number, day: any) => sum + (day.reach || 0),
        0,
      );

      const engagementRate =
        totalReach > 0
          ? parseFloat(((totalEngagement / totalReach) * 100).toFixed(2))
          : currentFollowerCount > 0
            ? parseFloat(
                Math.min(
                  (avgEngagement / currentFollowerCount) * 100,
                  20,
                ).toFixed(2),
              )
            : 0;

      engagementData = {
        avg_engagement_per_post: Math.round(avgEngagement),
        avg_likes: Math.round(totalLikes / mediaData.data.length),
        avg_comments: Math.round(totalComments / mediaData.data.length),
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        total_posts: mediaData.data.length,
        posts_count: mediaData.data.length,
        recent_media: mediaData.data.slice(0, 10).map((post: any) => ({
          id: post.id,
          media_type: post.media_type,
          media_url: post.media_url || "",
          thumbnail_url: post.thumbnail_url || post.media_url || "",
          caption: post.caption || "",
          permalink: post.permalink,
          timestamp: post.timestamp,
          like_count: post.like_count || 0,
          comments_count: post.comments_count || 0,
        })),
      };
    }

    console.log("Storing analytics data for multiple days");

    // Store each day's record in the database
    let storedCount = 0;
    for (const [date, metrics] of Object.entries(dailyRecords)) {
      // For the most recent day, add engagement data, demographics, and use current follower count
      const isToday = date === new Date().toISOString().split("T")[0];
      const fullMetrics = {
        ...metrics,
        // Use actual follower count from API if available
        follower_count: metrics.follower_count || currentFollowerCount,
        ...(isToday ? engagementData : {}),
        ...(isToday ? { audience_demographics: audienceDemographics } : {}),
      };

      const { error: analyticsError } = await supabaseClient
        .from("external_analytics")
        .upsert(
          {
            influencer_id: userId,
            platform: platform,
            account_id: account.username,
            metric_date: date,
            metrics: fullMetrics,
          },
          {
            onConflict: "influencer_id,platform,account_id,metric_date",
          },
        );

      if (analyticsError) {
        console.error(`Error storing analytics for ${date}:`, analyticsError);
      } else {
        storedCount++;
      }
    }

    console.log(`Stored ${storedCount} daily records`);

    // Update social_accounts with latest summary
    const todayMetrics =
      dailyRecords[new Date().toISOString().split("T")[0]] || {};
    const latestMetrics = {
      ...todayMetrics,
      ...engagementData,
      follower_count: currentFollowerCount,
      audience_demographics: audienceDemographics,
    };

    const { error: updateError } = await supabaseClient
      .from("social_accounts")
      .update({
        last_sync_at: new Date().toISOString(),
        analytics_data: latestMetrics,
        follower_count: currentFollowerCount,
        last_updated: new Date().toISOString(),
      })
      .eq("id", account.id);

    if (updateError) {
      console.error("Error updating social account:", updateError);
      throw updateError;
    }

    // Also update the influencers table with engagement_rate and total_followers
    const calculatedEngagementRate = engagementData.engagement_rate || 0;
    console.log(
      `Updating influencers table with engagement_rate: ${calculatedEngagementRate}, total_followers: ${currentFollowerCount}`,
    );

    const { error: influencerUpdateError } = await supabaseClient
      .from("influencers")
      .update({
        engagement_rate: Math.min(calculatedEngagementRate, 20),
        total_followers: currentFollowerCount,
      })
      .eq("id", userId);

    if (influencerUpdateError) {
      console.error("Error updating influencer:", influencerUpdateError);
    } else {
      console.log(`Successfully updated influencers table for user ${userId}`);
    }

    console.log(
      `Successfully synced ${platform} analytics for user ${userId} - ${storedCount} days of data`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        metrics: latestMetrics,
        days_synced: storedCount,
        synced_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in sync-meta-analytics:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
