import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CampaignFilterOptions {
  platforms: string[];
  niches: string[];
  deliverables: string[];
  budgetRange: { min: number; max: number };
}

export const useCampaignFilterOptions = () => {
  return useQuery({
    queryKey: ['campaign-filter-options'],
    queryFn: async (): Promise<CampaignFilterOptions> => {
      // Fetch all open campaigns to extract unique values
      const { data: campaigns, error } = await supabase
        .from('brand_campaigns')
        .select('required_platforms, required_niches, deliverables, budget_min, budget_max')
        .eq('status', 'open');

      if (error) throw error;

      // Extract unique values
      const platformsSet = new Set<string>();
      const nichesSet = new Set<string>();
      const deliverablesSet = new Set<string>();
      let minBudget = Infinity;
      let maxBudget = 0;

      campaigns?.forEach((campaign) => {
        campaign.required_platforms?.forEach((p: string) => platformsSet.add(p));
        campaign.required_niches?.forEach((n: string) => nichesSet.add(n));
        campaign.deliverables?.forEach((d: string) => deliverablesSet.add(d));
        
        if (campaign.budget_min !== null && campaign.budget_min < minBudget) {
          minBudget = campaign.budget_min;
        }
        if (campaign.budget_max !== null && campaign.budget_max > maxBudget) {
          maxBudget = campaign.budget_max;
        }
      });

      return {
        platforms: Array.from(platformsSet).sort(),
        niches: Array.from(nichesSet).sort(),
        deliverables: Array.from(deliverablesSet).sort(),
        budgetRange: {
          min: minBudget === Infinity ? 0 : minBudget,
          max: maxBudget || 10000,
        },
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Platform display config
export const getPlatformConfig = (platform: string) => {
  const configs: Record<string, { icon: string; label: string }> = {
    instagram: { icon: '📷', label: 'Instagram' },
    tiktok: { icon: '🎵', label: 'TikTok' },
    youtube: { icon: '▶️', label: 'YouTube' },
    twitter: { icon: '🐦', label: 'Twitter' },
    facebook: { icon: '📘', label: 'Facebook' },
    linkedin: { icon: '💼', label: 'LinkedIn' },
    pinterest: { icon: '📌', label: 'Pinterest' },
    snapchat: { icon: '👻', label: 'Snapchat' },
  };
  return configs[platform.toLowerCase()] || { icon: '📱', label: platform };
};

// Compensation type config
export const compensationTypeConfig = [
  { value: 'paid', label: 'Paid', icon: '💰', color: 'from-emerald-500 to-emerald-600' },
  { value: 'product', label: 'Product', icon: '🎁', color: 'from-purple-500 to-purple-600' },
  { value: 'affiliate', label: 'Affiliate', icon: '🔗', color: 'from-amber-500 to-orange-500' },
  { value: 'hybrid', label: 'Hybrid', icon: '💎', color: 'from-pink-500 to-blue-500' },
];
