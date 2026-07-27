import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CRMLead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  lead_type: string;
  lifecycle_stage: string;
  source: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_by: string | null;
  converted_profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useCRMLeads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_leads")
        .select("*")
        .is("converted_profile_id", null)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as CRMLead[];
    },
  });

  const createLead = useMutation({
    mutationFn: async (lead: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      company?: string;
      lead_type: string;
      source?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("crm_leads").insert({
        ...lead,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
      toast({ title: "Lead added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; lifecycle_stage?: string; [key: string]: any }) => {
      const { error } = await supabase.from("crm_leads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
      toast({ title: "Lead removed" });
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    createLead,
    updateLead,
    deleteLead,
  };
};
