import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CreateBrandCampaignData {
  campaign_title: string;
  campaign_description: string;
  campaign_brief_url?: string;
  campaign_image_url?: string;
  campaign_type?: string;
  brand_name: string;
  brand_logo_url?: string;
  brand_website?: string;
  brand_description?: string;
  required_niches: string[];
  required_platforms: string[];
  min_followers: number;
  max_followers?: number;
  min_engagement_rate?: number;
  deliverables: string[];
  content_requirements: string[];
  timeline_start?: string;
  timeline_end?: string;
  application_deadline?: string;
  compensation_type: 'paid' | 'product' | 'hybrid' | 'affiliate';
  budget_min?: number;
  budget_max?: number;
  product_value?: number;
  currency: string;
  spots_available: number;
  visibility: 'public' | 'private';
  expires_at?: string;
  status?: 'draft' | 'open';
  geo_focus?: string;
  target_destination?: string;
  requirements?: string;
  affiliate_enabled?: boolean;
  affiliate_percentage?: number;
  platform_source?: "hostfluencer" | "hostfluencerx";
  hfx_brand_id?: string | null;
  campaign_subject_type?: "platform_brand" | "property_stay";
  property_id?: string | null;

}

export const useCreateBrandCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBrandCampaignData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: campaign, error } = await supabase
        .from('brand_campaigns')
        .insert({
          ...data,
          created_by: user.id,
          status: data.status || 'open',
        })
        .select()
        .single();

      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-brand-campaigns'] });
      toast({
        title: 'Campaign created',
        description: 'Your campaign has been published successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBrandCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBrandCampaignData> }) => {
      const { data: campaign, error } = await supabase
        .from('brand_campaigns')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaign'] });
      toast({
        title: 'Campaign updated',
        description: 'Your campaign has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update campaign',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleCampaignStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'open' | 'paused' | 'closed' }) => {
      const { data: campaign, error } = await supabase
        .from('brand_campaigns')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-brand-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaign'] });
      toast({
        title: 'Status updated',
        description: 'Campaign status has been changed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });
};
