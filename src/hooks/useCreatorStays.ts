import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StayBucket = "active" | "upcoming" | "completed" | "other";

export interface CreatorStay {
  id: string;
  status: string;
  agreed_rate: number | null;
  currency: string | null;
  deliverable_count: number | null;
  start_date: string | null;
  end_date: string | null;
  bucket: StayBucket;
  property: {
    id: string;
    title: string | null;
    location: string | null;
    image_url: string | null;
  } | null;
  host: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
  } | null;
}

const bucketFor = (status: string, start: string | null, end: string | null): StayBucket => {
  if (status === "completed" || status === "cancelled") return "completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start && end) {
    const s = new Date(start);
    const e = new Date(end);
    if (today < s) return "upcoming";
    if (today >= s && today <= e) return "active";
    return "completed";
  }
  if (status === "active") return "active";
  return "other";
};

export const useCreatorStays = (creatorId?: string) => {
  return useQuery({
    queryKey: ["creator-stays", creatorId],
    enabled: !!creatorId,
    queryFn: async (): Promise<CreatorStay[]> => {
      const { data, error } = await supabase
        .from("collaboration_agreements")
        .select(`
          id, status, agreed_rate, currency, deliverable_count, created_at,
          application:applications(
            proposed_dates_start, proposed_dates_end,
            property:properties(
              id, title, location,
              property_images(image_url, is_primary, display_order),
              host:hosts(
                id,
                profiles:profiles(id, first_name, last_name, profile_photo_url)
              )
            )
          )
        `)
        .eq("influencer_id", creatorId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const app = row.application;
        const property = app?.property;
        const images = property?.property_images || [];
        const primary = images.find((i: any) => i.is_primary) || images[0];
        const hostProfile = property?.host?.profiles;
        const start = app?.proposed_dates_start ?? null;
        const end = app?.proposed_dates_end ?? null;
        return {
          id: row.id,
          status: row.status,
          agreed_rate: row.agreed_rate,
          currency: row.currency,
          deliverable_count: row.deliverable_count,
          start_date: start,
          end_date: end,
          bucket: bucketFor(row.status, start, end),
          property: property
            ? {
                id: property.id,
                title: property.title,
                location: property.location,
                image_url: primary?.image_url ?? null,
              }
            : null,
          host: hostProfile
            ? {
                id: hostProfile.id,
                first_name: hostProfile.first_name,
                last_name: hostProfile.last_name,
                profile_photo_url: hostProfile.profile_photo_url,
              }
            : null,
        };
      });
    },
  });
};