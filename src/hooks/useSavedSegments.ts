import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SegmentFilters } from "@/components/admin/communications/SegmentBuilder";

export interface SavedSegment {
  id: string;
  name: string;
  description: string | null;
  filter_json: SegmentFilters;
  is_smart: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Pre-built smart segment definitions
export const SMART_SEGMENTS: Omit<SavedSegment, "id" | "created_by" | "created_at" | "updated_at">[] = [
  {
    name: "New Signups (7 days)",
    description: "Users who signed up in the last 7 days",
    is_smart: true,
    filter_json: {
      userType: "all",
      accountStatus: "all",
      isVerified: "all",
      accountTier: "all",
      engagementLevel: "all",
      location: "",
      lastLoginDays: "7",
      registeredAfter: undefined,
      registeredBefore: undefined,
    },
  },
  {
    name: "At-Risk Users (30+ days inactive)",
    description: "Users who haven't logged in for 30+ days",
    is_smart: true,
    filter_json: {
      userType: "all",
      accountStatus: "all",
      isVerified: "all",
      accountTier: "all",
      engagementLevel: "all",
      location: "",
      lastLoginDays: "inactive90",
      registeredAfter: undefined,
      registeredBefore: undefined,
    },
  },
  {
    name: "All Creators",
    description: "All influencer/creator accounts",
    is_smart: true,
    filter_json: {
      userType: "influencer",
      accountStatus: "all",
      isVerified: "all",
      accountTier: "all",
      engagementLevel: "all",
      location: "",
      lastLoginDays: "all",
      registeredAfter: undefined,
      registeredBefore: undefined,
    },
  },
  {
    name: "All Brands",
    description: "All brand accounts",
    is_smart: true,
    filter_json: {
      userType: "brand",
      accountStatus: "all",
      isVerified: "all",
      accountTier: "all",
      engagementLevel: "all",
      location: "",
      lastLoginDays: "all",
      registeredAfter: undefined,
      registeredBefore: undefined,
    },
  },
  {
    name: "All Hosts",
    description: "All property host accounts",
    is_smart: true,
    filter_json: {
      userType: "host",
      accountStatus: "all",
      isVerified: "all",
      accountTier: "all",
      engagementLevel: "all",
      location: "",
      lastLoginDays: "all",
      registeredAfter: undefined,
      registeredBefore: undefined,
    },
  },
  {
    name: "Verified & Active",
    description: "Verified users who are actively using the platform",
    is_smart: true,
    filter_json: {
      userType: "all",
      accountStatus: "active",
      isVerified: "verified",
      accountTier: "all",
      engagementLevel: "all",
      location: "",
      lastLoginDays: "30",
      registeredAfter: undefined,
      registeredBefore: undefined,
    },
  },
];

export const useSavedSegments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: segments, isLoading } = useQuery({
    queryKey: ["saved-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_segments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown) as SavedSegment[];
    },
  });

  const saveSegment = useMutation({
    mutationFn: async ({ name, description, filters, isSmart = false }: {
      name: string;
      description?: string;
      filters: SegmentFilters;
      isSmart?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("saved_segments")
        .insert({
          name,
          description: description || null,
          filter_json: filters as any,
          is_smart: isSmart,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Segment saved" });
      queryClient.invalidateQueries({ queryKey: ["saved-segments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save segment", description: error.message, variant: "destructive" });
    },
  });

  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_segments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Segment deleted" });
      queryClient.invalidateQueries({ queryKey: ["saved-segments"] });
    },
  });

  return { segments, isLoading, saveSegment, deleteSegment };
};
