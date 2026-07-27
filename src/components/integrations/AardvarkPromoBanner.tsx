import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConnectAardvarkButton } from "@/components/integrations/ConnectAardvarkButton";

interface AardvarkPromoBannerProps {
  userId: string;
}

/**
 * Prominent creator-dashboard promo driving creators to connect Aardvark
 * (extra earnings via brand deals / affiliate). Renders a big highlighted banner
 * when not connected, and a slim confirmation strip once connected.
 */
export const AardvarkPromoBanner = ({ userId }: AardvarkPromoBannerProps) => {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // `as any`: generated Supabase types don't include `has_aardvark` until the
      // migration is applied + `npm run types:gen` is run. Remove cast afterward.
      const { data } = await (supabase.from("profiles") as any)
        .select("has_aardvark")
        .eq("id", userId)
        .maybeSingle();
      if (active)
        setConnected(
          Boolean((data as { has_aardvark?: boolean } | null)?.has_aardvark),
        );
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  if (connected === null) return null;

  if (connected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-700">
        <Check className="h-4 w-4" /> Aardvark connected — your extra earning
        channel is active.
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-lg">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5" /> Make more money with Aardvark
            </h3>
            <p className="max-w-xl text-sm text-primary-foreground/90">
              Connect your Aardvark account to unlock exclusive brand deals and
              affiliate earnings on top of your Hostfluencer collaborations. It
              only takes a minute.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <ConnectAardvarkButton
            userId={userId}
            className="bg-white text-primary hover:bg-white/90"
          />
        </div>
      </CardContent>
    </Card>
  );
};
