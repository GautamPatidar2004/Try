import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AARDVARK_SIGNUP_URL = import.meta.env.VITE_AARDVARK_SIGNUP_URL as
  string | undefined;

interface ConnectAardvarkButtonProps {
  userId: string;
  /** Extra classes for the connect button (e.g. contrasting styles on a colored banner). */
  className?: string;
}

/**
 * "Connect Aardvark" button (Hostfluencer -> Aardvark direction).
 * Opens the Aardvark-provided signup link in a new tab with our user id attached
 * (`hf_uid`), so Aardvark can echo it back to our `aardvark-signup-complete`
 * webhook when the user finishes. Shows a connected state once `has_aardvark` is
 * set on the profile.
 */
export const ConnectAardvarkButton = ({
  userId,
  className,
}: ConnectAardvarkButtonProps) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // NOTE: `as any` on from() because the generated Supabase types don't yet
      // include `has_aardvark` (added in 20260712000100_add_aardvark_integration_fields).
      // Remove the cast after running `npm run types:gen` once the migration is applied.
      const { data } = await (supabase.from("profiles") as any)
        .select("has_aardvark")
        .eq("id", userId)
        .maybeSingle();
      if (active) {
        setConnected(
          Boolean((data as { has_aardvark?: boolean } | null)?.has_aardvark),
        );
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleConnect = () => {
    if (!AARDVARK_SIGNUP_URL) {
      console.warn("VITE_AARDVARK_SIGNUP_URL is not configured");
      return;
    }
    const url = new URL(AARDVARK_SIGNUP_URL);
    url.searchParams.set("hf_uid", userId);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  if (loading) return null;

  if (connected) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Check className="w-4 h-4" /> Aardvark connected
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={!AARDVARK_SIGNUP_URL}
      className={`gap-2 ${className ?? ""}`}
    >
      Connect Aardvark <ExternalLink className="w-4 h-4" />
    </Button>
  );
};
