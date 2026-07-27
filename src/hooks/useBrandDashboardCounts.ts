import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BrandDashboardCounts {
  unreadMessages: number;
  pendingApplications: number;
  activeCollaborations: number;
  activeCampaigns: number;
}

export const useBrandDashboardCounts = (userId: string | undefined): BrandDashboardCounts => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [activeCollaborations, setActiveCollaborations] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        // Fetch active campaigns count
        const { data: campaigns } = await supabase
          .from("brand_campaigns")
          .select("id, status")
          .eq("created_by", userId);

        const activeCount = campaigns?.filter(c => c.status === 'open').length || 0;
        setActiveCampaigns(activeCount);

        if (campaigns && campaigns.length > 0) {
          const campaignIds = campaigns.map((c) => c.id);

          // Fetch pending applications count
          const { count: applicationsCount } = await supabase
            .from("brand_campaign_applications")
            .select("*", { count: "exact", head: true })
            .in("campaign_id", campaignIds)
            .eq("status", "pending");

          setPendingApplications(applicationsCount || 0);

          // Fetch active collaborations (accepted applications)
          const { count: collaborationsCount } = await supabase
            .from("brand_campaign_applications")
            .select("*", { count: "exact", head: true })
            .in("campaign_id", campaignIds)
            .eq("status", "accepted");

          setActiveCollaborations(collaborationsCount || 0);
        }

        // TODO: Add messages count when messages table is properly set up for brands
        setUnreadMessages(0);
      } catch (error) {
        console.error("Error fetching brand dashboard counts:", error);
      }
    };

    fetchCounts();

    // Set up real-time subscriptions
    const applicationsChannel = supabase
      .channel("brand-dashboard-applications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brand_campaign_applications",
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    const campaignsChannel = supabase
      .channel("brand-dashboard-campaigns")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brand_campaigns",
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(campaignsChannel);
    };
  }, [userId]);

  return {
    unreadMessages,
    pendingApplications,
    activeCollaborations,
    activeCampaigns,
  };
};
