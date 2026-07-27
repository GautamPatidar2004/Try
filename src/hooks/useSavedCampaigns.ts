import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSavedCampaigns = (influencerId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const savedCampaigns = useQuery({
    queryKey: ['saved-campaigns', influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaign_saved')
        .select('campaign_id')
        .eq('influencer_id', influencerId);

      if (error) throw error;
      return data.map(item => item.campaign_id);
    },
    enabled: !!influencerId,
  });

  const saveCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('brand_campaign_saved')
        .insert({ campaign_id: campaignId, influencer_id: influencerId });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Campaign Saved',
        description: 'Campaign added to your saved list',
      });
      queryClient.invalidateQueries({ queryKey: ['saved-campaigns'] });
    },
  });

  const unsaveCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('brand_campaign_saved')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Campaign Removed',
        description: 'Campaign removed from your saved list',
      });
      queryClient.invalidateQueries({ queryKey: ['saved-campaigns'] });
    },
  });

  const isCampaignSaved = (campaignId: string) => {
    return savedCampaigns.data?.includes(campaignId) || false;
  };

  return {
    savedCampaignIds: savedCampaigns.data || [],
    isCampaignSaved,
    saveCampaign: saveCampaign.mutate,
    unsaveCampaign: unsaveCampaign.mutate,
    isLoading: savedCampaigns.isLoading,
  };
};
