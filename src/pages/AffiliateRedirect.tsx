import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/site";

const AffiliateRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Invalid link");
      return;
    }

    const utm = {
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
      utm_term: searchParams.get("utm_term") || undefined,
      utm_content: searchParams.get("utm_content") || undefined,
    };

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("track-affiliate-click", {
          body: { slug, referrer: document.referrer || null, ...utm },
        });
        if (error || !data?.destination_url) {
          throw new Error(error?.message || "Link not found");
        }

        // Forward UTM params to destination
        const dest = new URL(data.destination_url);
        Object.entries(utm).forEach(([k, v]) => {
          if (v) dest.searchParams.set(k, v);
        });

        window.location.replace(dest.toString());
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [slug, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4 max-w-md">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold">Link not available</h1>
            <p className="text-muted-foreground">{error}</p>
            <a href={SITE_CONFIG.productionUrl} className="text-primary hover:underline">
              Go to {SITE_CONFIG.productionUrl.replace(/^https?:\/\//, "")}
            </a>
          </>
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Redirecting…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AffiliateRedirect;