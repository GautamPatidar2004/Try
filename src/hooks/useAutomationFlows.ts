import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AutomationFlow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationStep {
  id: string;
  flow_id: string;
  step_type: string;
  step_config: any;
  delay_hours: number;
  position: number;
  created_at: string;
}

export interface AutomationEnrollment {
  id: string;
  user_id: string;
  flow_id: string;
  current_step_id: string | null;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  last_step_at: string | null;
}

// Pre-built automation flow templates
export const PREBUILT_FLOWS = [
  {
    name: "Creator Onboarding",
    description: "Welcome new creators and guide them to their first application",
    trigger_type: "user_signup",
    trigger_config: { user_type: "influencer" },
    steps: [
      { step_type: "send_notification", delay_hours: 0, position: 0, step_config: { title: "Welcome to Hostfluencer! 🎉", message: "We're excited to have you. Start by completing your profile to get matched with amazing stays." } },
      { step_type: "send_email", delay_hours: 24, position: 1, step_config: { subject: "Complete Your Profile", content: "Hi {{first_name}}, your profile is the key to getting selected for collaborations. Add your social links and bio to stand out!" } },
      { step_type: "wait", delay_hours: 72, position: 2, step_config: { description: "Wait 3 days" } },
      { step_type: "send_notification", delay_hours: 0, position: 3, step_config: { title: "Tips for Success", message: "Creators who complete their profile get 3x more matches. Check out campaigns in the marketplace!" } },
      { step_type: "send_email", delay_hours: 96, position: 4, step_config: { subject: "Need Help Getting Started?", content: "Hi {{first_name}}, we noticed you haven't applied to any campaigns yet. Browse our marketplace to find the perfect match!" } },
    ],
  },
  {
    name: "Brand Onboarding",
    description: "Guide new brands to post their first campaign",
    trigger_type: "user_signup",
    trigger_config: { user_type: "brand" },
    steps: [
      { step_type: "send_notification", delay_hours: 0, position: 0, step_config: { title: "Welcome to Hostfluencer! 🏢", message: "Find the perfect creators for your brand. Start by posting your first campaign." } },
      { step_type: "send_email", delay_hours: 24, position: 1, step_config: { subject: "Post Your First Campaign", content: "Hi {{first_name}}, posting a campaign is the fastest way to connect with verified creators. Let's get started!" } },
      { step_type: "wait", delay_hours: 120, position: 2, step_config: { description: "Wait 5 days" } },
      { step_type: "send_notification", delay_hours: 0, position: 3, step_config: { title: "Need Inspiration?", message: "Browse successful campaigns on Hostfluencer to get ideas for your first post." } },
    ],
  },
  {
    name: "Re-engagement",
    description: "Win back users who haven't logged in for 14+ days",
    trigger_type: "inactive_days",
    trigger_config: { days: 14 },
    steps: [
      { step_type: "send_email", delay_hours: 0, position: 0, step_config: { subject: "We Miss You! 👋", content: "Hi {{first_name}}, there are new opportunities waiting for you on Hostfluencer. Come check them out!" } },
      { step_type: "wait", delay_hours: 168, position: 1, step_config: { description: "Wait 7 days" } },
      { step_type: "send_notification", delay_hours: 0, position: 2, step_config: { title: "New Campaigns Added", message: "Several new campaigns have been posted since your last visit. Don't miss out!" } },
    ],
  },
  {
    name: "Win-Back Inactive Creators",
    description: "Re-engage dropped-off creators with real platform stats and trending opportunities",
    trigger_type: "inactive_days",
    trigger_config: { days: 14 },
    steps: [
      {
        step_type: "send_email",
        delay_hours: 0,
        position: 0,
        step_config: {
          subject: "Hey {{first_name}}, {{new_opportunities_count}} new opportunities are waiting",
          content: "Hey {{first_name}},\n\nQuick update since you've been away:\n\n• {{new_opportunities_count}} new opportunities added\n• {{recent_collab_location}} just went live (filling fast)\n• {{creators_matched_count}} creators matched with brands this month\n\nYour profile's still active — brands can still find you. But the best opportunities go to creators who move first.\n\nHere's what's trending right now: {{trending_category}}\n\n→ View New Opportunities\n\nTake 2 minutes. See if anything fits.\n\n— Team Hostfluencer",
        },
      },
      {
        step_type: "send_notification",
        delay_hours: 72,
        position: 1,
        step_config: {
          title: "Still {{new_opportunities_count}} fresh opportunities 👀",
          message: "{{recent_collab_location}} and other listings are filling fast. Don't miss out!",
        },
      },
    ],
  },
  {
    name: "New Property Alert",
    description: "Notify creators when a new property is listed on the marketplace",
    trigger_type: "property_listed",
    trigger_config: {},
    steps: [
      { step_type: "send_email", delay_hours: 0, position: 0, step_config: { subject: "New Stay Available: {{property_title}} 🏠", content: "Hi {{first_name}}, a new property just went live on Hostfluencer! Check out \"{{property_title}}\" and apply before spots fill up." } },
      { step_type: "send_notification", delay_hours: 0, position: 1, step_config: { title: "New Stay Listed! 🏠", message: "\"{{property_title}}\" was just added to the marketplace. Apply now!" } },
    ],
  },
  {
    name: "New Campaign Alert",
    description: "Notify creators when a new brand campaign is posted",
    trigger_type: "campaign_listed",
    trigger_config: {},
    steps: [
      { step_type: "send_email", delay_hours: 0, position: 0, step_config: { subject: "New Brand Deal: {{campaign_title}} 🎯", content: "Hi {{first_name}}, a new brand campaign \"{{campaign_title}}\" is now accepting applications on Hostfluencer. Don't miss this opportunity!" } },
      { step_type: "send_notification", delay_hours: 0, position: 1, step_config: { title: "New Brand Campaign! 🎯", message: "\"{{campaign_title}}\" is looking for creators. Check it out!" } },
    ],
  },
];

export const useAutomationFlows = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flows, isLoading: flowsLoading } = useQuery({
    queryKey: ["automation-flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_flows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AutomationFlow[];
    },
  });

  const { data: allSteps } = useQuery({
    queryKey: ["automation-steps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_steps")
        .select("*")
        .order("position");
      if (error) throw error;
      return data as AutomationStep[];
    },
  });

  const { data: enrollmentCounts } = useQuery({
    queryKey: ["automation-enrollment-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_enrollments")
        .select("flow_id, status");
      if (error) throw error;
      
      const counts: Record<string, { active: number; completed: number; total: number }> = {};
      data?.forEach((e: any) => {
        if (!counts[e.flow_id]) counts[e.flow_id] = { active: 0, completed: 0, total: 0 };
        counts[e.flow_id].total++;
        if (e.status === "active") counts[e.flow_id].active++;
        if (e.status === "completed") counts[e.flow_id].completed++;
      });
      return counts;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["automation-flows"] });
    queryClient.invalidateQueries({ queryKey: ["automation-steps"] });
  };

  const createFlow = useMutation({
    mutationFn: async (template: typeof PREBUILT_FLOWS[0]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: flow, error: flowError } = await supabase
        .from("automation_flows")
        .insert({
          name: template.name,
          description: template.description,
          trigger_type: template.trigger_type,
          trigger_config: template.trigger_config,
          status: "inactive",
          created_by: user.id,
        })
        .select()
        .single();
      if (flowError) throw flowError;

      const steps = template.steps.map((s) => ({
        flow_id: flow.id,
        step_type: s.step_type,
        step_config: s.step_config,
        delay_hours: s.delay_hours,
        position: s.position,
      }));

      const { error: stepsError } = await supabase.from("automation_steps").insert(steps);
      if (stepsError) throw stepsError;

      return flow as AutomationFlow;
    },
    onSuccess: () => {
      toast({ title: "Automation flow created" });
      invalidateAll();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create flow", description: error.message, variant: "destructive" });
    },
  });

  const createBlankFlow = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: flow, error } = await supabase
        .from("automation_flows")
        .insert({
          name: "New Flow",
          description: "",
          trigger_type: "manual",
          trigger_config: {},
          status: "inactive",
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return flow as AutomationFlow;
    },
    onSuccess: () => {
      invalidateAll();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create flow", description: error.message, variant: "destructive" });
    },
  });

  const updateFlow = useMutation({
    mutationFn: async (params: { id: string; name?: string; description?: string; trigger_type?: string; trigger_config?: any }) => {
      const { id, ...updates } = params;
      const { error } = await supabase.from("automation_flows").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-flows"] });
    },
  });

  const toggleFlowStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("automation_flows")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      toast({ title: `Flow ${newStatus === "active" ? "activated" : "deactivated"}` });
      queryClient.invalidateQueries({ queryKey: ["automation-flows"] });
    },
  });

  const deleteFlow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("automation_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Flow deleted" });
      invalidateAll();
    },
  });

  const addStep = useMutation({
    mutationFn: async (params: { flow_id: string; step_type: string; step_config: any; delay_hours: number; position: number }) => {
      const { data, error } = await supabase.from("automation_steps").insert(params).select().single();
      if (error) throw error;
      return data as AutomationStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-steps"] });
    },
  });

  const updateStep = useMutation({
    mutationFn: async (params: { id: string; step_type?: string; step_config?: any; delay_hours?: number }) => {
      const { id, ...updates } = params;
      const { error } = await supabase.from("automation_steps").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-steps"] });
    },
  });

  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("automation_steps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-steps"] });
    },
  });

  const reorderSteps = useMutation({
    mutationFn: async (steps: { id: string; position: number }[]) => {
      for (const step of steps) {
        const { error } = await supabase.from("automation_steps").update({ position: step.position }).eq("id", step.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-steps"] });
    },
  });

  const getStepsForFlow = (flowId: string) => {
    return allSteps?.filter((s) => s.flow_id === flowId).sort((a, b) => a.position - b.position) || [];
  };

  return {
    flows,
    flowsLoading,
    allSteps,
    enrollmentCounts,
    createFlow,
    createBlankFlow,
    updateFlow,
    toggleFlowStatus,
    deleteFlow,
    addStep,
    updateStep,
    deleteStep,
    reorderSteps,
    getStepsForFlow,
  };
};
