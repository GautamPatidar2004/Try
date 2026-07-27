import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BrandDashboardStats {
  activeCampaigns: number;
  pendingApplications: number;
  completedCollaborations: number;
  totalViews: number;
}

export const useBrandDashboardStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['brand-dashboard-stats', userId],
    queryFn: async (): Promise<BrandDashboardStats> => {
      if (!userId) {
        return {
          activeCampaigns: 0,
          pendingApplications: 0,
          completedCollaborations: 0,
          totalViews: 0,
        };
      }

      // Get active campaigns count
      const { data: campaigns, error: campaignsError } = await supabase
        .from('brand_campaigns')
        .select('id, views_count, status')
        .eq('created_by', userId);

      if (campaignsError) throw campaignsError;

      const activeCampaigns = campaigns?.filter(c => c.status === 'open').length || 0;
      const totalViews = campaigns?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0;

      // Get campaign IDs for fetching applications
      const campaignIds = campaigns?.map(c => c.id) || [];

      let pendingApplications = 0;
      let completedCollaborations = 0;

      if (campaignIds.length > 0) {
        // Get pending applications count
        const { data: applications, error: applicationsError } = await supabase
          .from('brand_campaign_applications')
          .select('id, status')
          .in('campaign_id', campaignIds);

        if (applicationsError) throw applicationsError;

        pendingApplications = applications?.filter(a => a.status === 'pending').length || 0;
        completedCollaborations = applications?.filter(a => a.status === 'accepted').length || 0;
      }

      return {
        activeCampaigns,
        pendingApplications,
        completedCollaborations,
        totalViews,
      };
    },
    enabled: !!userId,
  });
};
