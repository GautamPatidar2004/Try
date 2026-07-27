import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SID = Deno.env.get("IMPACT_ACCOUNT_SID");
const TOKEN = Deno.env.get("IMPACT_AUTH_TOKEN");
const BASE = SID ? `https://api.impact.com/Mediapartners/${SID}` : "";
const AUTH = SID && TOKEN ? "Basic " + btoa(`${SID}:${TOKEN}`) : "";

async function impactGet(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ ...params, PageSize: "100" }).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: AUTH, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Impact API ${res.status}: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SID || !TOKEN) {
      return new Response(
        JSON.stringify({
          error:
            "Impact.com not configured. Add IMPACT_ACCOUNT_SID and IMPACT_AUTH_TOKEN secrets.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") || "" },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const subId = user.id;

    let result: unknown;

    switch (action) {
      case "get-links": {
        // List campaigns this partner is approved for, then build subId-tagged links.
        const campaigns = await impactGet("/Campaigns");
        const items = (campaigns?.Campaigns || []).map((c: any) => ({
          campaignId: c.Id,
          campaignName: c.Name || c.AdvertiserName,
          advertiserName: c.AdvertiserName,
          trackingUrl: c.TrackingLink
            ? `${c.TrackingLink}${c.TrackingLink.includes("?") ? "&" : "?"}subId1=${subId}`
            : null,
          contractStatus: c.ContractStatus,
        }));
        result = { links: items };
        break;
      }
      case "get-actions": {
        const days = Number(body.days || 90);
        const start = new Date(Date.now() - days * 86400000)
          .toISOString()
          .slice(0, 10);
        const data = await impactGet("/Actions", {
          SubId1: subId,
          ActionDateStart: start,
        });
        const actions = (data?.Actions || []).map((a: any) => ({
          id: a.Id,
          campaignName: a.CampaignName,
          actionDate: a.EventDate || a.CreationDate,
          payout: parseFloat(a.Payout || "0"),
          amount: parseFloat(a.Amount || "0"),
          state: a.State,
          currency: a.Currency,
          customerArea: a.CustomerArea,
          referringDomain: a.ReferringDomain,
        }));
        result = { actions };
        break;
      }
      case "get-payouts": {
        const [invoices, payments] = await Promise.all([
          impactGet("/Invoices").catch(() => ({ Invoices: [] })),
          impactGet("/Payments").catch(() => ({ Payments: [] })),
        ]);
        result = {
          invoices: (invoices?.Invoices || []).map((i: any) => ({
            id: i.Id,
            amount: parseFloat(i.Total || "0"),
            currency: i.Currency,
            status: i.Status,
            date: i.CreatedDate,
            dueDate: i.DueDate,
          })),
          payments: (payments?.Payments || []).map((p: any) => ({
            id: p.Id,
            amount: parseFloat(p.Amount || "0"),
            currency: p.Currency,
            status: p.Status,
            paidAt: p.PaymentDate || p.CreatedDate,
            method: p.PaymentMethod,
          })),
        };
        break;
      }
      case "get-summary": {
        const days = Number(body.days || 30);
        const start = new Date(Date.now() - days * 86400000)
          .toISOString()
          .slice(0, 10);
        const data = await impactGet("/Actions", {
          SubId1: subId,
          ActionDateStart: start,
        });
        const actions = data?.Actions || [];
        let pending = 0,
          approved = 0,
          reversed = 0,
          sales = 0,
          count = 0;
        for (const a of actions) {
          const payout = parseFloat(a.Payout || "0");
          const amount = parseFloat(a.Amount || "0");
          count++;
          sales += amount;
          if (a.State === "PENDING") pending += payout;
          else if (a.State === "APPROVED" || a.State === "LOCKED")
            approved += payout;
          else if (a.State === "REVERSED") reversed += payout;
        }
        result = {
          pendingEarnings: pending,
          approvedEarnings: approved,
          reversedEarnings: reversed,
          totalSales: sales,
          actionCount: count,
          windowDays: days,
        };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Touch last_synced_at (best effort)
    await supabase
      .from("impact_creator_accounts")
      .upsert(
        {
          creator_id: user.id,
          impact_subid: user.id,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" },
      );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("impact-affiliate error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});