import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: "email" | "notification" | "both";
  subject: string | null;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationCampaign {
  id: string;
  name: string;
  type: "email" | "notification" | "both";
  subject: string | null;
  content: string;
  template_id: string | null;
  target_segment: any;
  scheduled_at: string | null;
  sent_at: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  total_recipients: number;
  successful_deliveries: number;
  failed_deliveries: number;
  created_at: string;
  updated_at: string;
}

export const useCommunications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["communication-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CommunicationCampaign[];
    },
  });

  // Fetch all templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["communication-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as CommunicationTemplate[];
    },
  });

  // Get campaign stats
  const { data: stats } = useQuery({
    queryKey: ["communication-stats"],
    queryFn: async () => {
      const { data: campaignsData } = await supabase
        .from("communication_campaigns")
        .select("status, total_recipients, successful_deliveries");

      const totalCampaigns = campaignsData?.length || 0;
      const sentCampaigns = campaignsData?.filter(c => c.status === "sent").length || 0;
      const totalRecipients = campaignsData?.reduce((sum, c) => sum + (c.total_recipients || 0), 0) || 0;
      const successfulDeliveries = campaignsData?.reduce((sum, c) => sum + (c.successful_deliveries || 0), 0) || 0;
      const deliveryRate = totalRecipients > 0 ? (successfulDeliveries / totalRecipients) * 100 : 0;

      return {
        totalCampaigns,
        sentCampaigns,
        totalRecipients,
        deliveryRate,
      };
    },
  });

  // Send broadcast notification
  const sendBroadcastNotification = useMutation({
    mutationFn: async ({
      name,
      content,
      targetSegment,
      notificationType = "platform_announcement",
    }: {
      name: string;
      content: string;
      targetSegment: any;
      notificationType?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get target users
      let query = supabase.from("profiles").select("id");
      
      if (targetSegment.userType && targetSegment.userType !== "all") {
        query = query.eq("user_type", targetSegment.userType);
      }
      if (targetSegment.isActive !== undefined) {
        query = query.eq("is_active", targetSegment.isActive);
      }

      const { data: users, error: usersError } = await query;
      if (usersError) throw usersError;

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("communication_campaigns")
        .insert({
          name,
          type: "notification",
          content,
          target_segment: targetSegment,
          status: "sent",
          sent_at: new Date().toISOString(),
          total_recipients: users?.length || 0,
          created_by: user.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Send notifications to all users
      const notifications = users?.map((u) => ({
        user_id: u.id,
        title: name,
        message: content,
        type: notificationType,
      })) || [];

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) throw notifError;

      // Track recipients - note: for notifications we don't have email in profiles
      // We'll need to fetch emails from auth if needed later
      const recipients = users?.map((u) => ({
        campaign_id: campaign.id,
        user_id: u.id,
        status: "sent",
        sent_at: new Date().toISOString(),
      })) || [];

      await supabase.from("campaign_recipients").insert(recipients);

      // Update campaign with successful deliveries
      await supabase
        .from("communication_campaigns")
        .update({
          successful_deliveries: users?.length || 0,
        })
        .eq("id", campaign.id);

      return campaign;
    },
    onSuccess: () => {
      toast({
        title: "Broadcast sent",
        description: "Notification sent to all targeted users",
      });
      queryClient.invalidateQueries({ queryKey: ["communication-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["communication-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send broadcast",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send email campaign
  const sendEmailCampaign = useMutation({
    mutationFn: async ({
      name,
      subject,
      content,
      targetSegment,
      templateId,
    }: {
      name: string;
      subject: string;
      content: string;
      targetSegment: any;
      templateId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("communication_campaigns")
        .insert({
          name,
          type: "email",
          subject,
          content,
          template_id: templateId,
          target_segment: targetSegment,
          status: "sending",
          created_by: user.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Call edge function to send emails
      const { data, error } = await supabase.functions.invoke("send-broadcast-email", {
        body: {
          campaignId: campaign.id,
          subject,
          content,
          targetSegment,
        },
      });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email campaign started",
        description: "Emails are being sent in the background",
      });
      queryClient.invalidateQueries({ queryKey: ["communication-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["communication-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send email campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<CommunicationTemplate, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("communication_templates")
        .insert({
          ...template,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Template saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["communication-templates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("communication_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "Template removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["communication-templates"] });
    },
  });

  return {
    campaigns,
    campaignsLoading,
    templates,
    templatesLoading,
    stats,
    sendBroadcastNotification,
    sendEmailCampaign,
    createTemplate,
    deleteTemplate,
  };
};
