import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Subscription statuses we treat as currently billing.
const ACTIVE_SUB_STATUSES = new Set(["active", "trialing", "past_due"]);
const PENDING_COLLAB_STATUSES = new Set([
  "pending",
  "pending_host",
  "pending_influencer",
]);
const PAST_COLLAB_STATUSES = new Set(["completed", "cancelled", "canceled"]);

function toCents(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return Number.isFinite(v) ? v : 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userResult, error: userErr } = await supabaseUser.auth
      .getUser();
    if (userErr || !userResult?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userResult.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const endDate = body.endDate ? new Date(body.endDate) : now;
    const startDate = body.startDate
      ? new Date(body.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (
      Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) ||
      startDate > endDate
    ) {
      return new Response(JSON.stringify({ error: "Invalid date range" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const periodMs = endDate.getTime() - startDate.getTime();
    const prevEnd = new Date(startDate.getTime());
    const prevStart = new Date(startDate.getTime() - periodMs);

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();
    const prevStartISO = prevStart.toISOString();
    const prevEndISO = prevEnd.toISOString();

    // ---------- MRR / ARR ----------
    // Source of truth: active subscriptions joined to their plan price.
    // Free plans (price 0) and any non-active status are excluded from MRR.
    const { data: activeSubs } = await supabaseAdmin
      .from("subscriptions")
      .select(
        "id, influencer_id, status, billing_interval, current_period_end, plan:subscription_plans(price_monthly, price_yearly, name)",
      )
      .in("status", Array.from(ACTIVE_SUB_STATUSES));

    let mrrCents = 0;
    let paidActive = 0;
    let freeActive = 0;
    let trialingCount = 0;
    for (const s of (activeSubs ?? []) as any[]) {
      const plan = s.plan ?? {};
      const monthly = toCents(plan.price_monthly);
      const yearly = toCents(plan.price_yearly);
      const interval = (s.billing_interval || "monthly").toLowerCase();
      const amount = interval.startsWith("year") && yearly > 0
        ? Math.round(yearly / 12)
        : monthly;
      if (s.status === "trialing") trialingCount += 1;
      if (amount > 0) {
        mrrCents += amount;
        paidActive += 1;
      } else {
        freeActive += 1;
      }
    }
    const mrr = mrrCents / 100;
    const arr = mrr * 12;

    // Subscription totals (no row limit issues - count head)
    const subStatusCounts: Record<string, number> = {};
    for (
      const status of [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "cancelled",
        "incomplete",
      ]
    ) {
      const { count } = await supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      subStatusCounts[status] = count ?? 0;
    }
    const { count: totalSubs } = await supabaseAdmin
      .from("subscriptions")
      .select("id", { count: "exact", head: true });

    // ---------- Revenue (transactions) ----------
    async function fetchAllTx(filters: (q: any) => any) {
      const pageSize = 1000;
      let from = 0;
      const rows: Array<
        { amount: number | null; platform_fee: number | null; type: string | null; created_at: string }
      > = [];
      while (true) {
        const q = supabaseAdmin
          .from("transactions")
          .select("amount, platform_fee, type, created_at")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);
        const { data, error } = await filters(q);
        if (error) throw error;
        rows.push(...((data ?? []) as any[]));
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return rows;
    }

    const periodTx = await fetchAllTx((q) =>
      q.gte("created_at", startISO).lte("created_at", endISO)
    );
    const prevTx = await fetchAllTx((q) =>
      q.gte("created_at", prevStartISO).lt("created_at", prevEndISO)
    );
    const lifetimeTx = await fetchAllTx((q) => q);

    const sumAmount = (rows: typeof periodTx) =>
      rows.reduce((s, t) => s + toCents(t.amount), 0);
    const sumFee = (rows: typeof periodTx) =>
      rows.reduce((s, t) => s + toCents(t.platform_fee), 0);

    const periodRevenueCents = sumAmount(periodTx);
    const prevRevenueCents = sumAmount(prevTx);
    const lifetimeRevenueCents = sumAmount(lifetimeTx);
    const periodPlatformFeeCents = sumFee(periodTx);
    const lifetimePlatformFeeCents = sumFee(lifetimeTx);

    const revenueBySourceCents: Record<string, number> = {};
    for (const t of periodTx) {
      const k = (t.type || "other").toString();
      revenueBySourceCents[k] = (revenueBySourceCents[k] || 0) +
        toCents(t.amount);
    }

    const lifetimeRevenueBySourceCents: Record<string, number> = {};
    for (const t of lifetimeTx) {
      const k = (t.type || "other").toString();
      lifetimeRevenueBySourceCents[k] = (lifetimeRevenueBySourceCents[k] || 0) +
        toCents(t.amount);
    }

    const revenueGrowth = prevRevenueCents > 0
      ? ((periodRevenueCents - prevRevenueCents) / prevRevenueCents) * 100
      : periodRevenueCents > 0
      ? 100
      : 0;

    // 6-month MRR trend based on plan price snapshots from active subs
    // (using current paid active subs at the end of each month is approximate;
    // using completed subscription transactions gives a real per-month figure).
    const monthly: Array<{ month: string; mrr: number; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const ms = new Date(d.getFullYear(), d.getMonth(), 1);
      const me = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthRevenueCents = lifetimeTx
        .filter((t) => {
          const c = new Date(t.created_at);
          return c >= ms && c < me;
        })
        .reduce((s, t) => s + toCents(t.amount), 0);
      monthly.push({
        month: ms.toLocaleString("en-US", { month: "short", year: "numeric" }),
        mrr: monthRevenueCents / 100, // monthly subscription revenue actually billed
        revenue: monthRevenueCents / 100,
      });
    }

    // ---------- Users ----------
    const [{ count: totalUsers }, { count: newSignups }, { count: activeUsers }, { count: prevSignups }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true })
        .gte("created_at", startISO).lte("created_at", endISO),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true })
        .gte("last_login_at", startISO).lte("last_login_at", endISO),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true })
        .gte("created_at", prevStartISO).lt("created_at", prevEndISO),
    ]);

    // user types (paginated)
    const byType: Record<string, number> = {};
    {
      let from = 0;
      while (true) {
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .select("user_type")
          .range(from, from + 999);
        if (error) break;
        for (const r of data ?? []) {
          const k = (r as any).user_type || "unknown";
          byType[k] = (byType[k] || 0) + 1;
        }
        if (!data || data.length < 1000) break;
        from += 1000;
      }
    }
    const userGrowth = (prevSignups ?? 0) > 0
      ? (((newSignups ?? 0) - (prevSignups ?? 0)) / (prevSignups ?? 1)) * 100
      : (newSignups ?? 0) > 0
      ? 100
      : 0;

    // ---------- Collaborations ----------
    const collabBuckets = {
      total: 0,
      active: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    };
    {
      const { data: rows } = await supabaseAdmin
        .from("collaboration_agreements")
        .select("status, agreed_rate, created_at");
      for (const r of (rows ?? []) as any[]) {
        collabBuckets.total += 1;
        if (r.status === "active") collabBuckets.active += 1;
        else if (PENDING_COLLAB_STATUSES.has(r.status)) {
          collabBuckets.pending += 1;
        } else if (r.status === "completed") collabBuckets.completed += 1;
        else if (r.status === "cancelled" || r.status === "canceled") {
          collabBuckets.cancelled += 1;
        }
      }
    }
    const past = collabBuckets.completed + collabBuckets.cancelled;

    // ---------- Opportunities (marketplace inventory) ----------
    // Headline "opportunities" = stays + brand deals available on the platform.
    // Signed agreements (collaboration_agreements) are tracked separately above.
    const oppBuckets = {
      stays: { total: 0, active: 0, inactive: 0 },
      brandDeals: { total: 0, open: 0, pending: 0, closed: 0, draft: 0, paused: 0 },
    };
    {
      const { data: propRows } = await supabaseAdmin
        .from("properties")
        .select("id, is_active");
      for (const p of (propRows ?? []) as any[]) {
        oppBuckets.stays.total += 1;
        if (p.is_active) oppBuckets.stays.active += 1;
        else oppBuckets.stays.inactive += 1;
      }
    }
    {
      const { data: campRows } = await supabaseAdmin
        .from("brand_campaigns")
        .select("id, status");
      for (const c of (campRows ?? []) as any[]) {
        oppBuckets.brandDeals.total += 1;
        const s = (c.status || "").toString();
        if (s === "open") oppBuckets.brandDeals.open += 1;
        else if (s === "pending") oppBuckets.brandDeals.pending += 1;
        else if (s === "closed") oppBuckets.brandDeals.closed += 1;
        else if (s === "draft") oppBuckets.brandDeals.draft += 1;
        else if (s === "paused") oppBuckets.brandDeals.paused += 1;
      }
    }
    const opportunitiesActive =
      oppBuckets.stays.active + oppBuckets.brandDeals.open;
    const opportunitiesPending = oppBuckets.brandDeals.pending;
    const opportunitiesPast =
      oppBuckets.brandDeals.closed + oppBuckets.stays.inactive;
    const opportunitiesTotal =
      oppBuckets.stays.total + oppBuckets.brandDeals.total;

    // ---------- KPI inputs ----------
    const { data: applications } = await supabaseAdmin
      .from("applications")
      .select("status, created_at, id")
      .gte("created_at", startISO).lte("created_at", endISO);
    const totalApps = applications?.length ?? 0;
    const acceptedApps =
      applications?.filter((a) => a.status === "accepted").length ?? 0;
    const applicationSuccessRate = totalApps > 0
      ? (acceptedApps / totalApps) * 100
      : 0;

    const { data: posts } = await supabaseAdmin
      .from("content_posts")
      .select("delivery_status, created_at")
      .gte("created_at", startISO).lte("created_at", endISO);
    const totalPosts = posts?.length ?? 0;
    const deliveredPosts =
      posts?.filter((p) => p.delivery_status === "published" || p.delivery_status === "approved").length ?? 0;
    const contentDeliveryRate = totalPosts > 0
      ? (deliveredPosts / totalPosts) * 100
      : 0;

    const { data: reviews } = await supabaseAdmin
      .from("reviews_and_ratings")
      .select("rating, created_at")
      .gte("created_at", startISO).lte("created_at", endISO);
    const reviewsCount = reviews?.length ?? 0;
    const avgRating = reviewsCount > 0
      ? (reviews ?? []).reduce((s, r: any) => s + (r.rating || 0), 0) /
        reviewsCount
      : 0;

    // average days from application -> collaboration agreement (period scope)
    const { data: collabsForKpi } = await supabaseAdmin
      .from("collaboration_agreements")
      .select("created_at, application_id, applications!inner(created_at)")
      .gte("created_at", startISO).lte("created_at", endISO);
    let avgTimeToCollabMs = 0;
    let avgTimeToCollabCount = 0;
    for (const a of (collabsForKpi ?? []) as any[]) {
      const apps = a.applications;
      const appCreated = Array.isArray(apps)
        ? apps[0]?.created_at
        : apps?.created_at;
      if (!appCreated) continue;
      avgTimeToCollabMs += new Date(a.created_at).getTime() -
        new Date(appCreated).getTime();
      avgTimeToCollabCount += 1;
    }
    const avgTimeToCollabDays = avgTimeToCollabCount > 0
      ? avgTimeToCollabMs / avgTimeToCollabCount / (1000 * 60 * 60 * 24)
      : 0;

    const signupToApplication = (newSignups ?? 0) > 0
      ? (totalApps / (newSignups ?? 1)) * 100
      : 0;
    const applicationToCollaboration = totalApps > 0
      ? ((collabsForKpi?.length ?? 0) / totalApps) * 100
      : 0;
    const freeToPaid = (newSignups ?? 0) > 0
      ? (paidActive / (newSignups ?? 1)) * 100
      : 0;

    const result = {
      revenue: {
        mrr,
        arr,
        periodRevenue: periodRevenueCents / 100,
        previousPeriodRevenue: prevRevenueCents / 100,
        lifetimeRevenue: lifetimeRevenueCents / 100,
        platformFees: periodPlatformFeeCents / 100,
        lifetimePlatformFees: lifetimePlatformFeeCents / 100,
        growth: revenueGrowth,
        bySource: Object.fromEntries(
          Object.entries(revenueBySourceCents).map(([k, v]) => [k, v / 100]),
        ),
        lifetimeBySource: Object.fromEntries(
          Object.entries(lifetimeRevenueBySourceCents).map((
            [k, v],
          ) => [k, v / 100]),
        ),
        monthly,
        transactionsInPeriod: periodTx.length,
      },
      subscriptions: {
        total: totalSubs ?? 0,
        paidActive,
        freeActive,
        trialing: trialingCount,
        canceled: (subStatusCounts["canceled"] ?? 0) +
          (subStatusCounts["cancelled"] ?? 0),
        pastDue: subStatusCounts["past_due"] ?? 0,
        incomplete: subStatusCounts["incomplete"] ?? 0,
        byStatus: subStatusCounts,
      },
      collaborations: {
        total: collabBuckets.total,
        active: collabBuckets.active,
        pending: collabBuckets.pending,
        completed: collabBuckets.completed,
        cancelled: collabBuckets.cancelled,
        past,
      },
      opportunities: {
        total: opportunitiesTotal,
        active: opportunitiesActive,
        pending: opportunitiesPending,
        past: opportunitiesPast,
        stays: oppBuckets.stays,
        brandDeals: oppBuckets.brandDeals,
      },
      users: {
        total: totalUsers ?? 0,
        active: activeUsers ?? 0,
        newSignups: newSignups ?? 0,
        previousSignups: prevSignups ?? 0,
        growth: userGrowth,
        byType,
      },
      retention: {
        day1: 0,
        day7: 0,
        day30: 0,
        churnRate: 0,
      },
      conversion: {
        signupToApplication,
        applicationToCollaboration,
        freeToPaid,
      },
      kpis: {
        avgTimeToCollaborationDays: avgTimeToCollabDays,
        applicationSuccessRate,
        contentDeliveryRate,
        avgRating,
        reviewsCount,
      },
      health: {
        applicationSuccessRate,
        contentDeliveryRate,
        averageResponseTime: 0,
      },
      meta: {
        startDate: startISO,
        endDate: endISO,
        previousStartDate: prevStartISO,
        previousEndDate: prevEndISO,
        generatedAt: new Date().toISOString(),
      },
    };

    console.log("Platform metrics calculated", {
      mrr,
      arr,
      periodRevenue: result.revenue.periodRevenue,
      lifetimeRevenue: result.revenue.lifetimeRevenue,
      collabBuckets,
      paidActive,
      freeActive,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("calculate-platform-metrics error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
