import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useHostDashboardCounts = (userId: string | undefined) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [activeCollaborations, setActiveCollaborations] = useState(0);
   const [pendingContent, setPendingContent] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        // Fetch pending applications for host's properties
        const { data: properties } = await supabase
          .from("properties")
          .select("id")
          .eq("host_id", userId);

        if (properties && properties.length > 0) {
          const propertyIds = properties.map((p) => p.id);

          const { count: applicationsCount } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .in("property_id", propertyIds)
            .eq("status", "pending");

          setPendingApplications(applicationsCount || 0);

          const { count: collaborationsCount } = await supabase
            .from("collaboration_agreements")
            .select("*", { count: "exact", head: true })
            .eq("host_id", userId)
            .eq("status", "active");

          setActiveCollaborations(collaborationsCount || 0);

           // Get applications for content count
           const { data: applications } = await supabase
             .from("applications")
             .select("id")
             .in("property_id", propertyIds);

           if (applications && applications.length > 0) {
             const applicationIds = applications.map((a) => a.id);

             const { count: contentCount } = await supabase
               .from("content_posts")
               .select("*", { count: "exact", head: true })
               .in("application_id", applicationIds)
               .eq("host_approval_status", "pending");

             setPendingContent(contentCount || 0);
           }
        }

        // TODO: Add messages count when messages table is implemented
        setUnreadMessages(0);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchCounts();

    // Set up real-time subscriptions for applications
    const applicationsChannel = supabase
      .channel("dashboard-applications")
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

     // Set up real-time subscription for content posts
     const contentChannel = supabase
       .channel("dashboard-content")
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "content_posts",
         },
         () => {
           fetchCounts();
         }
       )
       .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
       supabase.removeChannel(contentChannel);
    };
  }, [userId]);

  return {
    unreadMessages,
    pendingApplications,
    activeCollaborations,
     pendingContent,
  };
};
