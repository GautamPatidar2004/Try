import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';

export const useGetCampaignApplications = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign-applications', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaign_applications')
        .select(`
          *,
          influencers (
            id,
            instagram_url,
            tiktok_url,
            youtube_url,
            twitter_url,
            total_followers,
            engagement_rate,
            content_niches,
            profiles (
              first_name,
              last_name,
              username,
              profile_photo_url,
              bio,
              location
            )
          )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });
};

export const useAcceptApplication = () => {
  const queryClient = useQueryClient();
  const { trackInviteAccepted } = useProductAnalytics();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('brand_campaign_applications')
        .update({
          status: 'accepted',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;
      return applicationId;
    },
    onSuccess: (applicationId) => {
      trackInviteAccepted({ application_id: applicationId });
      queryClient.invalidateQueries({ queryKey: ['campaign-applications'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      toast.success('Application accepted');
    },
    onError: (error: Error) => {
      toast.error('Failed to accept application: ' + error.message);
    },
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();
  const { trackInviteDeclined } = useProductAnalytics();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      rejectionReason 
    }: { 
      applicationId: string; 
      rejectionReason: string;
    }) => {
      const { error } = await supabase
        .from('brand_campaign_applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;
      return applicationId;
    },
    onSuccess: (applicationId) => {
      trackInviteDeclined({ application_id: applicationId });
      queryClient.invalidateQueries({ queryKey: ['campaign-applications'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      toast.success('Application rejected');
    },
    onError: (error: Error) => {
      toast.error('Failed to reject application: ' + error.message);
    },
  });
};

export const useApplicationStats = (campaignId: string) => {
  return useQuery({
    queryKey: ['application-stats', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaign_applications')
        .select('status', { count: 'exact' })
        .eq('campaign_id', campaignId);

      if (error) throw error;

      const total = data.length;
      const pending = data.filter(app => app.status === 'pending').length;
      const accepted = data.filter(app => app.status === 'accepted').length;
      const rejected = data.filter(app => app.status === 'rejected').length;

      return { total, pending, accepted, rejected };
    },
    enabled: !!campaignId,
  });
};
