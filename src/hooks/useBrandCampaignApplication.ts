import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ApplicationData {
  campaign_id: string;
  influencer_id: string;
  cover_letter?: string;
  proposed_content_ideas?: string;
  portfolio_urls?: string[];
  previous_brand_work?: string[];
  follower_count_snapshot?: number;
  engagement_rate_snapshot?: number;
}

export const useBrandCampaignApplication = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitApplication = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const { data: result, error } = await supabase
        .from('brand_campaign_applications')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    },
  });

  const withdrawApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('brand_campaign_applications')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId)
        .eq('status', 'pending');

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Application Withdrawn',
        description: 'Your application has been withdrawn',
      });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  return {
    submitApplication: submitApplication.mutate,
    submitApplicationAsync: submitApplication.mutateAsync,
    withdrawApplication: withdrawApplication.mutate,
    isSubmitting: submitApplication.isPending,
  };
};

export const useMyApplications = (influencerId: string) => {
  return useQuery({
    queryKey: ['my-applications', influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaign_applications')
        .select('*, brand_campaigns(*)')
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!influencerId,
  });
};

export const useApplicationStatus = (campaignId: string, influencerId: string) => {
  return useQuery({
    queryKey: ['application-status', campaignId, influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaign_applications')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId && !!influencerId,
  });
};
