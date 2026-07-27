import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cross-app sync: pull per-post stats for hostfluencerX campaigns using the
// creators' EXISTING hostfluencer logins (social_accounts tokens stay here).
//
// Flow:
//   hostfluencerX.campaign_creator_links -> resolve creator
//   -> match hostfluencer.social_accounts (token)  [by hf_influencer_id, else handle]
//   -> hostfluencerX.posts (with platform_post_id) for that campaign+platform
//   -> fetch per-post metrics from Meta/TikTok
//   -> write hostfluencerX.post_metrics (daily) + posts (latest rollup)
//
// Reads hostfluencer DB with the service role key; writes hostfluencerX DB with
// HFX_SUPABASE_SERVICE_KEY (must be a real service_role/secret key to bypass RLS).
//
// Body: { campaignId?: string }  — omit to sync all campaigns with links.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const today = () => new Date().toISOString().slice(0, 10);
const normHandle = (h: string) => h.replace(/^@/, "").trim().toLowerCase();

// --- Per-post metric fetchers --------------------------------------------

async function fetchTikTokMetrics(accessToken: string, videoIds: string[]) {
  // TikTok video query — up to 20 ids per call.
  const res = await fetch(
    "https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: videoIds } }),
    },
  );
  const data = await res.json();
  const out: Record<string, any> = {};
  for (const v of data?.data?.videos ?? []) {
    out[v.id] = {
      views: v.view_count ?? 0,
      likes: v.like_count ?? 0,
      comments: v.comment_count ?? 0,
      shares: v.share_count ?? 0,
      saves: 0,
      raw: v,
    };
  }
  return out;
}

async function fetchInstagramMetrics(accessToken: string, mediaId: string) {
  const fields = await (
    await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}?fields=like_count,comments_count&access_token=${accessToken}`,
    )
  ).json();
  const insights = await (
    await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}/insights?metric=reach,saved,shares&access_token=${accessToken}`,
    )
  ).json();
  const ins: Record<string, number> = {};
  for (const m of insights?.data ?? []) ins[m.name] = m.values?.[0]?.value ?? 0;
  return {
    views: ins.reach ?? 0,
    likes: fields.like_count ?? 0,
    comments: fields.comments_count ?? 0,
    shares: ins.shares ?? 0,
    saves: ins.saved ?? 0,
    reach: ins.reach ?? 0,
    raw: { fields, insights: ins },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const hf = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const hfx = createClient(
    Deno.env.get("HFX_SUPABASE_URL") ?? "",
    Deno.env.get("HFX_SUPABASE_SERVICE_KEY") ?? "",
  );

  let runId: string | null = null;
  let postsUpdated = 0;

  try {
    const body = await req.json().catch(() => ({}));
    const campaignId: string | undefined = body?.campaignId;

    // Open a sync_runs record for observability.
    const { data: run } = await hfx
      .from("sync_runs")
      .insert({ source: "creator_login", platform: "instagram", status: "running" })
      .select("id")
      .single();
    runId = run?.id ?? null;

    // 1. Load creator links (optionally scoped to one campaign).
    let linkQuery = hfx
      .from("campaign_creator_links")
      .select("campaign_id, hf_creator_id, hf_influencer_id, handle, platforms");
    if (campaignId) linkQuery = linkQuery.eq("campaign_id", campaignId);
    const { data: links, error: linkErr } = await linkQuery;
    if (linkErr) throw linkErr;

    for (const link of links ?? []) {
      // 2. Load that campaign's posts that have a platform_post_id.
      const { data: posts } = await hfx
        .from("posts")
        .select("id, platform, platform_post_id")
        .eq("campaign_id", link.campaign_id)
        .not("platform_post_id", "is", null);
      if (!posts?.length) continue;

      // Group posts by platform for this creator.
      const byPlatform: Record<string, typeof posts> = {};
      for (const p of posts) (byPlatform[p.platform] ??= []).push(p);

      for (const [platform, platformPosts] of Object.entries(byPlatform)) {
        // 3. Resolve the creator's hostfluencer token.
        let saQuery = hf
          .from("social_accounts")
          .select("access_token, username, platform_user_id")
          .eq("platform", platform)
          .not("access_token", "is", null)
          .limit(1);
        if (link.hf_influencer_id) {
          saQuery = saQuery.eq("influencer_id", link.hf_influencer_id);
        } else {
          saQuery = saQuery.ilike("username", normHandle(link.handle));
        }
        const { data: accounts } = await saQuery;
        const account = accounts?.[0];
        if (!account?.access_token) continue; // creator not connected on this platform

        // 4. Fetch per-post metrics.
        let metricsById: Record<string, any> = {};
        try {
          if (platform === "tiktok") {
            metricsById = await fetchTikTokMetrics(
              account.access_token,
              platformPosts.map((p) => p.platform_post_id!),
            );
          } else if (platform === "instagram") {
            for (const p of platformPosts) {
              metricsById[p.platform_post_id!] = await fetchInstagramMetrics(
                account.access_token,
                p.platform_post_id!,
              );
            }
          }
        } catch (e) {
          console.error(`[sync-hfx] fetch failed (${platform}):`, (e as Error).message);
          continue;
        }

        // 5. Write post_metrics (daily) + posts (latest rollup).
        for (const p of platformPosts) {
          const m = metricsById[p.platform_post_id!];
          if (!m) continue;

          await hfx.from("post_metrics").upsert(
            {
              post_id: p.id,
              metric_date: today(),
              views: m.views ?? 0,
              likes: m.likes ?? 0,
              comments: m.comments ?? 0,
              shares: m.shares ?? 0,
              saves: m.saves ?? 0,
              reach: m.reach ?? 0,
              raw: m.raw ?? {},
            },
            { onConflict: "post_id,metric_date" },
          );

          await hfx
            .from("posts")
            .update({
              views: m.views ?? 0,
              likes: m.likes ?? 0,
              comments: m.comments ?? 0,
              shares: m.shares ?? 0,
              saves: m.saves ?? 0,
              last_synced_at: new Date().toISOString(),
            })
            .eq("id", p.id);

          postsUpdated++;
        }
      }
    }

    if (runId) {
      await hfx
        .from("sync_runs")
        .update({ status: "success", posts_updated: postsUpdated, finished_at: new Date().toISOString() })
        .eq("id", runId);
    }

    return new Response(JSON.stringify({ ok: true, postsUpdated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[sync-hfx-campaign-stats] error:", error);
    if (runId) {
      await hfx
        .from("sync_runs")
        .update({ status: "error", error: (error as Error).message, finished_at: new Date().toISOString() })
        .eq("id", runId);
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
