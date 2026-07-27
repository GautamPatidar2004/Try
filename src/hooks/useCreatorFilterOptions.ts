import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreatorFilterOptions {
  contentNiches: string[];
  platforms: string[];
  collaborationTypes: string[];
  loading: boolean;
}

// Niche categories for organized display
export const NICHE_CATEGORIES: Record<string, string[]> = {
  popular: ['Travel', 'Lifestyle', 'Fashion', 'Food & Drink', 'Beauty'],
  creative: ['Photography', 'Art', 'Design'],
  active: ['Fitness', 'Sports', 'Outdoor'],
  tech: ['Technology', 'Gaming', 'Business'],
  home: ['Parenting', 'Pets', 'Home & Garden'],
};

// Fallback options in case DB fetch fails
const FALLBACK_NICHES = [
  "Travel", "Lifestyle", "Fashion", "Food & Drink", "Beauty", "Fitness",
  "Technology", "Gaming", "Business", "Photography", "Art", "Home & Garden",
  "Parenting", "Pets", "Sports"
];

const FALLBACK_PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter"];

const FALLBACK_COLLABORATION_TYPES = [
  "Free Stay", "Paid Partnership", "Product Exchange", "Hybrid"
];

export const useCreatorFilterOptions = (): CreatorFilterOptions => {
  const [contentNiches, setContentNiches] = useState<string[]>(FALLBACK_NICHES);
  const [platforms, setPlatforms] = useState<string[]>(FALLBACK_PLATFORMS);
  const [collaborationTypes, setCollaborationTypes] = useState<string[]>(FALLBACK_COLLABORATION_TYPES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch unique niches from influencers
        const { data: influencers } = await supabase
          .from('influencers')
          .select('content_niches, collaboration_preferences');

        // Extract unique niches
        const allNiches = new Set<string>();
        const allCollabTypes = new Set<string>();
        
        influencers?.forEach(inf => {
          if (inf.content_niches && Array.isArray(inf.content_niches)) {
            inf.content_niches.forEach((niche: string) => allNiches.add(niche));
          }
          if (inf.collaboration_preferences && Array.isArray(inf.collaboration_preferences)) {
            inf.collaboration_preferences.forEach((pref: string) => allCollabTypes.add(pref));
          }
        });

        // Fetch unique platforms from social_accounts
        const { data: socialAccounts } = await supabase
          .from('social_accounts')
          .select('platform');

        const allPlatforms = new Set<string>();
        socialAccounts?.forEach(acc => {
          if (acc.platform) allPlatforms.add(acc.platform);
        });

        // Update state with fetched data (or keep fallbacks if empty)
        if (allNiches.size > 0) {
          setContentNiches(Array.from(allNiches).sort());
        }
        if (allPlatforms.size > 0) {
          setPlatforms(Array.from(allPlatforms).sort());
        }
        if (allCollabTypes.size > 0) {
          setCollaborationTypes(Array.from(allCollabTypes).sort());
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Keep fallback values on error
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  return {
    contentNiches,
    platforms,
    collaborationTypes,
    loading,
  };
};

// Helper to categorize niches for display
export const categorizeNiches = (niches: string[]): Record<string, string[]> => {
  const categorized: Record<string, string[]> = {
    popular: [],
    creative: [],
    active: [],
    tech: [],
    home: [],
    other: [],
  };

  niches.forEach(niche => {
    let found = false;
    for (const [category, categoryNiches] of Object.entries(NICHE_CATEGORIES)) {
      if (categoryNiches.some(n => n.toLowerCase() === niche.toLowerCase())) {
        categorized[category].push(niche);
        found = true;
        break;
      }
    }
    if (!found) {
      categorized.other.push(niche);
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categorized).filter(([_, niches]) => niches.length > 0)
  );
};

