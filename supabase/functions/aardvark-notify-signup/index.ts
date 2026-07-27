// Outbound notify: Hostfluencer -> Aardvark completion callback.
// Called by the client right after a logged-in user who arrived via an Aardvark
// link finishes signing up on Hostfluencer. We flag their profile and notify
// Aardvark's API (keeping Aardvark's API key server-side).
//
//   POST /functions/v1/aardvark-notify-signup   (Authorization: Bearer <user jwt>)
//   Body: { "aardvark_ref": "<marker from the /auth?from=aardvark&aardvark_ref=… link>" }
//
// verify_jwt is true for this function (config.toml) — it runs as the logged-in user.
//
// NOTE: the exact shape/endpoint of Aardvark's API is TBD (pending Cole). It is
// driven entirely by env vars (AARDVARK_API_URL, AARDVARK_API_KEY); adjust the
// outbound payload below once the contract is confirmed.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    // Resolve the calling user from their JWT.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}) as Record<string, unknown>);
    const aardvarkRef = (body.aardvark_ref as string | undefined) ?? null;

    // Flag the profile (service role — the profile row is the user's own).
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await admin
      .from("profiles")
      .update({
        has_aardvark: true,
        aardvark_connected_at: new Date().toISOString(),
        aardvark_ref: aardvarkRef,
      })
      .eq("id", user.id);
    if (error) throw error;

    // Notify Aardvark (contract TBD — env-driven).
    const apiUrl = Deno.env.get("AARDVARK_API_URL");
    const apiKey = Deno.env.get("AARDVARK_API_KEY");
    if (apiUrl && apiKey) {
      try {
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            hf_uid: user.id,
            email: user.email,
            aardvark_ref: aardvarkRef,
            status: "completed",
          }),
        });
      } catch (e) {
        // Don't fail the user's signup flow if the outbound notify hiccups.
        console.error("Aardvark outbound notify failed:", e);
      }
    } else {
      console.warn(
        "AARDVARK_API_URL / AARDVARK_API_KEY not set — skipping outbound notify",
      );
    }

    return json({ ok: true }, 200);
  } catch (e) {
    console.error("aardvark-notify-signup error:", e);
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
