import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCreatorDashboardCounts = (userId: string | undefined) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [activeCollaborations, setActiveCollaborations] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        // Fetch pending applications submitted by creator
        const { count: applicationsCount } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("influencer_id", userId)
          .eq("status", "pending");

        setPendingApplications(applicationsCount || 0);

        // Fetch active collaborations for creator
        const { count: collaborationsCount } = await supabase
          .from("collaboration_agreements")
          .select("*", { count: "exact", head: true })
          .eq("influencer_id", userId)
          .eq("status", "active");

        setActiveCollaborations(collaborationsCount || 0);

        // TODO: Add messages count when messages table is implemented
        setUnreadMessages(0);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchCounts();

    // Set up real-time subscriptions for applications
    const applicationsChannel = supabase
      .channel("creator-dashboard-applications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
    };
  }, [userId]);

  return {
    unreadMessages,
    pendingApplications,
    activeCollaborations,
  };
};
