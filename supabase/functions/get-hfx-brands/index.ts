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
    // Authenticate the calling user (must be admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Connect to HostFluencerX Supabase database
    const hfxSupabase = createClient(
      Deno.env.get("HFX_SUPABASE_URL")!,
      Deno.env.get("HFX_SUPABASE_SERVICE_KEY")!,
    );

    const { data, error } = await hfxSupabase
      .from("clients")
      .select("id, name, status, industry, tier")
      .order("name", { ascending: true });

    if (error) {
      console.error("HFX DB error:", error);
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }

    const brands = (data ?? []).map((b: any) => ({
      id: String(b.id),
      name: b.name,
      // tier: b.tier,
      // industry: b.industry,
    }));
    return new Response(JSON.stringify({ brands }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-hfx-brands:", error);
    return new Response(JSON.stringify({ error: error.message, brands: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
