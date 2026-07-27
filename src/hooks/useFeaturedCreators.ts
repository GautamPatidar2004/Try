import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FeaturedCreator = {
  id: string;
  name: string;
  photo: string;
  location: string | null;
  followers: number;
  instagramUrl: string | null;
  niches: string[];
};

const formatFollowers = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

export const formatFollowerCount = formatFollowers;

export const useFeaturedCreators = () => {
  const [creators, setCreators] = useState<FeaturedCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.rpc("get_featured_creators", { p_limit: 20 });
      if (!active) return;
      if (error || !data) {
        setCreators([]);
        setLoading(false);
        return;
      }
      const mapped: FeaturedCreator[] = (data as any[])
        .filter((r) => r.profile_photo_url)
        .map((r) => ({
          id: r.id,
          name: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || "Creator",
          photo: r.profile_photo_url,
          location: r.location ?? null,
          followers: r.total_followers ?? 0,
          instagramUrl: r.instagram_url ?? null,
          niches: r.content_niches ?? [],
        }));
      setCreators(mapped);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { creators, loading };
};
