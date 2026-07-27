import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface ActivityEvent {
  id: string;
  user_id: string | null;
  activity_type: string;
  activity_description: string;
  metadata: any;
  created_at: string;
  user?: { first_name: string | null; last_name: string | null; user_type: string | null } | null;
}

export const useCRMActivityFeed = (filters?: { activityType?: string; userType?: string }) => {
  const [realtimeEvents, setRealtimeEvents] = useState<ActivityEvent[]>([]);

  const feedQuery = useQuery({
    queryKey: ["crm-activity-feed", filters],
    queryFn: async () => {
      let query = supabase
        .from("user_activity_timeline")
        .select("*, user:profiles!user_activity_timeline_user_id_fkey(first_name, last_name, user_type)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters?.activityType && filters.activityType !== "all") {
        query = query.eq("activity_type", filters.activityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityEvent[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("crm-activity-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_activity_timeline" }, (payload) => {
        setRealtimeEvents((prev) => [payload.new as ActivityEvent, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allEvents = [...realtimeEvents, ...(feedQuery.data || [])];
  // Deduplicate by id
  const seen = new Set<string>();
  const uniqueEvents = allEvents.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return {
    events: uniqueEvents,
    isLoading: feedQuery.isLoading,
    refetch: feedQuery.refetch,
  };
};
