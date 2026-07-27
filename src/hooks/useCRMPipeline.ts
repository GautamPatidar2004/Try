import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type LifecycleStage = 'lead' | 'signed_up' | 'profile_complete' | 'active' | 'churned';

export const LIFECYCLE_STAGES: { id: LifecycleStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
  { id: 'signed_up', label: 'Signed Up', color: 'bg-blue-100 text-blue-800' },
  { id: 'profile_complete', label: 'Profile Complete', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { id: 'churned', label: 'Churned', color: 'bg-red-100 text-red-800' },
];

export interface PipelineUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  lifecycle_stage: string | null;
  engagement_score: number | null;
  avatar_url: string | null;
  created_at: string;
  last_login_at: string | null;
  is_lead?: boolean;
}

export const useCRMPipeline = (filters?: { userType?: string; search?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pipelineQuery = useQuery({
    queryKey: ["crm-pipeline", filters],
    retry: 2,
    staleTime: 30000,
    queryFn: async () => {
      console.log("[CRM Pipeline] Fetching pipeline data...");
      // Fetch profiles
      let profileQuery = supabase
        .from("profiles")
        .select("id, first_name, last_name, user_type, lifecycle_stage, engagement_score, profile_photo_url, created_at, last_login_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (filters?.userType && filters.userType !== "all") {
        profileQuery = profileQuery.eq("user_type", filters.userType);
      }
      if (filters?.search) {
        profileQuery = profileQuery.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
      }

      // Fetch leads
      let leadQuery = supabase
        .from("crm_leads")
        .select("id, first_name, last_name, lead_type, lifecycle_stage, company, created_at")
        .is("converted_profile_id", null)
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters?.userType && filters.userType !== "all") {
        leadQuery = leadQuery.eq("lead_type", filters.userType === "influencer" ? "creator" : filters.userType);
      }
      if (filters?.search) {
        leadQuery = leadQuery.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const [profileResult, leadResult] = await Promise.all([profileQuery, leadQuery]);
      if (profileResult.error) {
        console.error("[CRM Pipeline] Profile query error:", profileResult.error);
        throw profileResult.error;
      }
      if (leadResult.error) {
        console.error("[CRM Pipeline] Lead query error:", leadResult.error);
        throw leadResult.error;
      }
      console.log("[CRM Pipeline] Fetched", profileResult.data?.length, "profiles,", leadResult.data?.length, "leads");

      const grouped: Record<LifecycleStage, PipelineUser[]> = {
        lead: [],
        signed_up: [],
        profile_complete: [],
        active: [],
        churned: [],
      };

      // Add profiles
      (profileResult.data || []).forEach((user: any) => {
        const stage = (user.lifecycle_stage || 'signed_up') as LifecycleStage;
        if (grouped[stage]) {
          grouped[stage].push({ ...user, avatar_url: user.profile_photo_url, is_lead: false });
        } else {
          grouped['signed_up'].push({ ...user, avatar_url: user.profile_photo_url, is_lead: false });
        }
      });

      // Add leads
      (leadResult.data || []).forEach((lead: any) => {
        const stage = (lead.lifecycle_stage || 'lead') as LifecycleStage;
        const pipelineUser: PipelineUser = {
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          user_type: lead.lead_type,
          lifecycle_stage: lead.lifecycle_stage,
          engagement_score: null,
          avatar_url: null,
          created_at: lead.created_at,
          last_login_at: null,
          is_lead: true,
        };
        if (grouped[stage]) {
          grouped[stage].push(pipelineUser);
        } else {
          grouped['lead'].push(pipelineUser);
        }
      });

      return grouped;
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ userId, stage, isLead }: { userId: string; stage: LifecycleStage; isLead?: boolean }) => {
      if (isLead) {
        const { error } = await supabase
          .from("crm_leads")
          .update({ lifecycle_stage: stage })
          .eq("id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({ lifecycle_stage: stage } as any)
          .eq("id", userId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
      toast({ title: "Stage updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return { ...pipelineQuery, updateStage: updateStageMutation.mutate, isError: pipelineQuery.isError, error: pipelineQuery.error, refetch: pipelineQuery.refetch };
};
