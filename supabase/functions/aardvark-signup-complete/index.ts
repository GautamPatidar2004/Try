// Inbound webhook: Aardvark -> Hostfluencer completion callback.
// Aardvark calls this after a user who came FROM Hostfluencer finishes signing up
// on Aardvark. We flag that user's Hostfluencer profile as connected.
//
// Contract we expose to Aardvark:
//   POST /functions/v1/aardvark-signup-complete
//   Header:  x-aardvark-secret: <AARDVARK_WEBHOOK_SECRET>
//   Body:    { "hf_uid": "<the hf_uid we passed on the signup link>",
//              "aardvark_user_id": "<optional: their id for the user>" }
//
// verify_jwt is false for this function (config.toml) — it is authenticated by the
// shared secret, not by a logged-in Supabase user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-aardvark-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // The shared secret is what authenticates the caller as Aardvark.
    const secret = req.headers.get("x-aardvark-secret");
    const expected = Deno.env.get("AARDVARK_WEBHOOK_SECRET");
    if (!expected || secret !== expected) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}) as Record<string, unknown>);
    const hfUid = body.hf_uid as string | undefined;
    const aardvarkUserId =
      (body.aardvark_user_id as string | undefined) ?? null;
    if (!hfUid) return json({ error: "Missing hf_uid" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase
      .from("profiles")
      .update({
        has_aardvark: true,
        aardvark_connected_at: new Date().toISOString(),
        aardvark_external_id: aardvarkUserId,
      })
      .eq("id", hfUid);

    if (error) throw error;
    return json({ ok: true }, 200);
  } catch (e) {
    console.error("aardvark-signup-complete error:", e);
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
