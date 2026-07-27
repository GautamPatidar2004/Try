import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrandCampaign {
  id: string;
  brand_name: string;
  brand_logo_url: string | null;
  brand_website: string | null;
  brand_description: string | null;
  campaign_title: string;
  campaign_description: string;
  campaign_brief_url: string | null;
  campaign_image_url: string | null;
  required_niches: string[];
  min_followers: number;
  max_followers: number | null;
  required_platforms: string[];
  min_engagement_rate: number | null;
  deliverables: string[];
  content_requirements: string[];
  timeline_start: string | null;
  timeline_end: string | null;
  application_deadline: string | null;
  compensation_type: 'paid' | 'product' | 'hybrid' | 'affiliate';
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  product_value: number | null;
  status: string;
  spots_available: number;
  spots_filled: number;
  visibility: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  expires_at: string | null;
  affiliate_enabled: boolean;
  affiliate_percentage: number | null;
  campaign_type: string | null;
  target_destination: string | null;
  geo_focus: string | null;
  requirements: string | null;
}

export interface CampaignFilters {
  search?: string;
  compensation_type?: string[];
  budget_min?: number;
  budget_max?: number;
  platforms?: string[];
  niches?: string[];
  deliverables?: string[];
  min_followers?: number;
  max_followers?: number;
  show_saved_only?: boolean;
  has_open_spots?: boolean;
  deadline_within_days?: number;
  sort_by?: 'recent' | 'deadline' | 'budget_high' | 'spots';
}

export const useBrandCampaigns = (filters?: CampaignFilters) => {
  return useQuery({
    queryKey: ['brand-campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('brand_campaigns')
        .select(`
          id, brand_name, brand_logo_url, campaign_title, campaign_description,
          campaign_image_url, required_niches, min_followers, max_followers, required_platforms,
          deliverables, compensation_type, budget_min, budget_max, currency, product_value,
          timeline_start, timeline_end, application_deadline, spots_available,
          spots_filled, views_count, applications_count, created_at, expires_at,
          affiliate_enabled, affiliate_percentage, campaign_type, target_destination, geo_focus, requirements
        `)
        .eq('status', 'open');

      // Apply sorting
      switch (filters?.sort_by) {
        case 'deadline':
          query = query.order('application_deadline', { ascending: true, nullsFirst: false });
          break;
        case 'budget_high':
          query = query.order('budget_max', { ascending: false, nullsFirst: false });
          break;
        case 'spots':
          query = query.order('spots_available', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply filters
      if (filters?.search) {
        query = query.or(`campaign_title.ilike.%${filters.search}%,brand_name.ilike.%${filters.search}%,campaign_description.ilike.%${filters.search}%`);
      }

      // Compensation type filter is applied client-side to support legacy campaigns
      // where affiliate campaigns were stored as compensation_type='paid' with affiliate_enabled=true

      if (filters?.budget_min !== undefined) {
        query = query.gte('budget_min', filters.budget_min);
      }

      if (filters?.budget_max !== undefined) {
        query = query.lte('budget_max', filters.budget_max);
      }

      if (filters?.platforms && filters.platforms.length > 0) {
        query = query.overlaps('required_platforms', filters.platforms);
      }

      if (filters?.niches && filters.niches.length > 0) {
        query = query.overlaps('required_niches', filters.niches);
      }

      if (filters?.deliverables && filters.deliverables.length > 0) {
        query = query.overlaps('deliverables', filters.deliverables);
      }

      if (filters?.min_followers !== undefined) {
        query = query.lte('min_followers', filters.min_followers);
      }

      if (filters?.max_followers !== undefined) {
        query = query.gte('max_followers', filters.max_followers);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data as BrandCampaign[];

      // Client-side filters for complex conditions
      if (filters?.compensation_type && filters.compensation_type.length > 0) {
        filteredData = filteredData.filter(c => {
          // Derive effective type: detect affiliate campaigns stored as 'paid' with no budget
          const effectiveType = (
            c.compensation_type === 'paid' &&
            c.affiliate_enabled &&
            c.affiliate_percentage &&
            (!c.budget_min || c.budget_min === 0) &&
            (!c.budget_max || c.budget_max === 0)
          ) ? 'affiliate' : c.compensation_type;
          return filters.compensation_type!.includes(effectiveType);
        });
      }

      if (filters?.has_open_spots) {
        filteredData = filteredData.filter(c => c.spots_available > c.spots_filled);
      }

      if (filters?.deadline_within_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + filters.deadline_within_days);
        filteredData = filteredData.filter(c => {
          if (!c.application_deadline) return false;
          return new Date(c.application_deadline) <= cutoffDate;
        });
      }

      return filteredData;
    },
  });
};

export const useBrandCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: ['brand-campaign', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          id, brand_name, brand_logo_url, brand_website, brand_description,
          campaign_title, campaign_description, campaign_brief_url, campaign_image_url,
          required_niches, min_followers, max_followers, required_platforms,
          min_engagement_rate, deliverables, content_requirements,
          timeline_start, timeline_end, application_deadline,
          compensation_type, budget_min, budget_max, currency, product_value,
          status, spots_available, spots_filled, visibility, views_count,
          applications_count, created_at, expires_at,
          affiliate_enabled, affiliate_percentage, campaign_type, target_destination, geo_focus, requirements
        `)
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      
      // Increment view count
      await supabase.rpc('increment_campaign_views', { campaign_id: campaignId });
      
      return data as BrandCampaign;
    },
    enabled: !!campaignId,
  });
};
