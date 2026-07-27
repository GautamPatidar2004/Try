import { useState, useMemo } from 'react';
import {
  getGeneration,
  GENERATION_LABELS,
  GENDER_LABELS,
  LIFESTYLE_LABELS,
  type Generation,
} from '@/lib/demographics';

interface Creator {
  id: string;
  name: string;
  location: string;
  followers: number;
  rating: number;
  specialties: string[];
  verified?: boolean;
  engagementRate: number;
  rateRangeMin?: number;
  rateRangeMax?: number;
  collaborationPreferences: string[];
  accountTier?: string;
  platforms: string[];
  dateOfBirth?: string | null;
  generation?: Generation | null;
  gender?: string | null;
  lifestyleTags?: string[];
  [key: string]: any;
}

export interface CreatorFilterOptions {
  followerRange: [number, number];
  engagementRate: [number, number];
  contentNiches: string[];
  platforms: string[];
  location: string;
  collaborationTypes: string[];
  rateRange: [number, number];
  minRating: number;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  generations: string[];
  genders: string[];
  lifestyleTags: string[];
}

export interface FilterBadge {
  type: keyof CreatorFilterOptions;
  value: string;
  label: string;
}

const DEFAULT_FILTERS: CreatorFilterOptions = {
  followerRange: [0, 10000000],
  engagementRate: [0, 20],
  contentNiches: [],
  platforms: [],
  location: '',
  collaborationTypes: [],
  rateRange: [0, 10000],
  minRating: 0,
  verifiedOnly: false,
  premiumOnly: false,
  generations: [],
  genders: [],
  lifestyleTags: [],
};

export const useCreatorMarketplace = (creators: Creator[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('followers');
  const [filters, setFilters] = useState<CreatorFilterOptions>(DEFAULT_FILTERS);

  // Filter creators based on all criteria
  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          creator.name.toLowerCase().includes(query) ||
          creator.location.toLowerCase().includes(query) ||
          creator.specialties.some(s => s.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Quick filters (for backward compatibility)
      if (activeQuickFilters.length > 0) {
        const hasMatchingFilter = activeQuickFilters.some(filter => {
          if (filter === 'Top Rated') return creator.rating >= 4.5;
          if (filter === 'High Following') return creator.followers >= 100000;
          return creator.specialties.includes(filter);
        });
        if (!hasMatchingFilter) return false;
      }

      // Follower range filter
      if (creator.followers < filters.followerRange[0] || 
          creator.followers > filters.followerRange[1]) {
        return false;
      }

      // Engagement rate filter
      if (creator.engagementRate < filters.engagementRate[0] || 
          creator.engagementRate > filters.engagementRate[1]) {
        return false;
      }

      // Content niches filter
      if (filters.contentNiches.length > 0) {
        const hasMatchingNiche = filters.contentNiches.some(niche =>
          creator.specialties.some(s => s.toLowerCase() === niche.toLowerCase())
        );
        if (!hasMatchingNiche) return false;
      }

      // Platforms filter
      if (filters.platforms.length > 0) {
        const hasMatchingPlatform = filters.platforms.some(platform =>
          creator.platforms.some(p => p.toLowerCase() === platform.toLowerCase())
        );
        if (!hasMatchingPlatform) return false;
      }

      // Location filter
      if (filters.location) {
        const locationQuery = filters.location.toLowerCase();
        if (!creator.location.toLowerCase().includes(locationQuery)) {
          return false;
        }
      }

      // Collaboration types filter
      if (filters.collaborationTypes.length > 0) {
        const hasMatchingType = filters.collaborationTypes.some(type =>
          creator.collaborationPreferences.some(pref => pref.toLowerCase() === type.toLowerCase())
        );
        if (!hasMatchingType) return false;
      }

      // Rate range filter
      if (creator.rateRangeMin !== undefined && creator.rateRangeMax !== undefined) {
        const creatorMinRate = creator.rateRangeMin;
        const creatorMaxRate = creator.rateRangeMax;
        
        // Check if creator's rate range overlaps with filter range
        if (creatorMaxRate < filters.rateRange[0] || 
            creatorMinRate > filters.rateRange[1]) {
          return false;
        }
      }

      // Minimum rating filter
      if (filters.minRating > 0 && creator.rating < filters.minRating) {
        return false;
      }

      // Verified only filter
      if (filters.verifiedOnly && !creator.verified) {
        return false;
      }

      // Premium only filter
      if (filters.premiumOnly && creator.accountTier !== 'premium') {
        return false;
      }

      // Generation filter
      if (filters.generations.length > 0) {
        const gen = creator.generation ?? getGeneration(creator.dateOfBirth);
        if (!gen || !filters.generations.includes(gen)) return false;
      }

      // Gender filter
      if (filters.genders.length > 0) {
        if (!creator.gender || !filters.genders.includes(creator.gender)) return false;
      }

      // Lifestyle tags filter (creator must have ALL selected tags? — using ANY for broader matches)
      if (filters.lifestyleTags.length > 0) {
        const tags = creator.lifestyleTags || [];
        const hasAny = filters.lifestyleTags.some(t => tags.includes(t));
        if (!hasAny) return false;
      }

      return true;
    });
  }, [creators, searchQuery, activeQuickFilters, filters]);

  // Sort filtered creators
  const sortedCreators = useMemo(() => {
    const sorted = [...filteredCreators];
    
    switch (sortBy) {
      case 'followers':
        return sorted.sort((a, b) => b.followers - a.followers);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'engagement':
        return sorted.sort((a, b) => b.engagementRate - a.engagementRate);
      default:
        return sorted;
    }
  }, [filteredCreators, sortBy]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.followerRange[0] !== DEFAULT_FILTERS.followerRange[0] ||
        filters.followerRange[1] !== DEFAULT_FILTERS.followerRange[1]) count++;
    if (filters.engagementRate[0] !== DEFAULT_FILTERS.engagementRate[0] ||
        filters.engagementRate[1] !== DEFAULT_FILTERS.engagementRate[1]) count++;
    if (filters.contentNiches.length > 0) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.location) count++;
    if (filters.collaborationTypes.length > 0) count++;
    if (filters.rateRange[0] !== DEFAULT_FILTERS.rateRange[0] ||
        filters.rateRange[1] !== DEFAULT_FILTERS.rateRange[1]) count++;
    if (filters.minRating > 0) count++;
    if (filters.verifiedOnly) count++;
    if (filters.premiumOnly) count++;
    if (filters.generations.length > 0) count++;
    if (filters.genders.length > 0) count++;
    if (filters.lifestyleTags.length > 0) count++;
    
    return count;
  }, [filters]);

  const handleQuickFilterToggle = (filter: string) => {
    setActiveQuickFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const updateFilters = (newFilters: Partial<CreatorFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveQuickFilters([]);
    setFilters(DEFAULT_FILTERS);
  };

  // Remove a specific filter value
  const removeFilter = (filterType: keyof CreatorFilterOptions, value?: string) => {
    switch (filterType) {
      case 'platforms':
        if (value) {
          setFilters(prev => ({
            ...prev,
            platforms: prev.platforms.filter(p => p !== value)
          }));
        }
        break;
      case 'contentNiches':
        if (value) {
          setFilters(prev => ({
            ...prev,
            contentNiches: prev.contentNiches.filter(n => n !== value)
          }));
        }
        break;
      case 'collaborationTypes':
        if (value) {
          setFilters(prev => ({
            ...prev,
            collaborationTypes: prev.collaborationTypes.filter(t => t !== value)
          }));
        }
        break;
      case 'location':
        setFilters(prev => ({ ...prev, location: '' }));
        break;
      case 'verifiedOnly':
        setFilters(prev => ({ ...prev, verifiedOnly: false }));
        break;
      case 'premiumOnly':
        setFilters(prev => ({ ...prev, premiumOnly: false }));
        break;
      case 'minRating':
        setFilters(prev => ({ ...prev, minRating: 0 }));
        break;
      case 'followerRange':
        setFilters(prev => ({ ...prev, followerRange: DEFAULT_FILTERS.followerRange }));
        break;
      case 'engagementRate':
        setFilters(prev => ({ ...prev, engagementRate: DEFAULT_FILTERS.engagementRate }));
        break;
      case 'rateRange':
        setFilters(prev => ({ ...prev, rateRange: DEFAULT_FILTERS.rateRange }));
        break;
      case 'generations':
        if (value) {
          setFilters(prev => ({
            ...prev,
            generations: prev.generations.filter(g => g !== value),
          }));
        }
        break;
      case 'genders':
        if (value) {
          setFilters(prev => ({
            ...prev,
            genders: prev.genders.filter(g => g !== value),
          }));
        }
        break;
      case 'lifestyleTags':
        if (value) {
          setFilters(prev => ({
            ...prev,
            lifestyleTags: prev.lifestyleTags.filter(t => t !== value),
          }));
        }
        break;
    }
  };

  // Get active filter badges for display
  const getActiveFilterBadges = (): FilterBadge[] => {
    const badges: FilterBadge[] = [];

    // Platforms
    filters.platforms.forEach(p => badges.push({
      type: 'platforms',
      value: p,
      label: p
    }));

    // Content niches
    filters.contentNiches.forEach(n => badges.push({
      type: 'contentNiches',
      value: n,
      label: n
    }));

    // Collaboration types
    filters.collaborationTypes.forEach(t => badges.push({
      type: 'collaborationTypes',
      value: t,
      label: t
    }));

    // Location
    if (filters.location) {
      badges.push({
        type: 'location',
        value: filters.location,
        label: `📍 ${filters.location}`
      });
    }

    // Verified only
    if (filters.verifiedOnly) {
      badges.push({
        type: 'verifiedOnly',
        value: 'true',
        label: 'Verified Only'
      });
    }

    // Premium only
    if (filters.premiumOnly) {
      badges.push({
        type: 'premiumOnly',
        value: 'true',
        label: 'Premium Only'
      });
    }

    // Min rating
    if (filters.minRating > 0) {
      badges.push({
        type: 'minRating',
        value: String(filters.minRating),
        label: `${filters.minRating}+ Stars`
      });
    }

    // Follower range (only if modified)
    if (filters.followerRange[0] !== DEFAULT_FILTERS.followerRange[0] ||
        filters.followerRange[1] !== DEFAULT_FILTERS.followerRange[1]) {
      const formatFollowers = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return String(n);
      };
      badges.push({
        type: 'followerRange',
        value: `${filters.followerRange[0]}-${filters.followerRange[1]}`,
        label: `${formatFollowers(filters.followerRange[0])} - ${formatFollowers(filters.followerRange[1])} followers`
      });
    }

    // Engagement rate (only if modified)
    if (filters.engagementRate[0] !== DEFAULT_FILTERS.engagementRate[0] ||
        filters.engagementRate[1] !== DEFAULT_FILTERS.engagementRate[1]) {
      badges.push({
        type: 'engagementRate',
        value: `${filters.engagementRate[0]}-${filters.engagementRate[1]}`,
        label: `${filters.engagementRate[0]}% - ${filters.engagementRate[1]}% engagement`
      });
    }

    // Rate range (only if modified)
    if (filters.rateRange[0] !== DEFAULT_FILTERS.rateRange[0] ||
        filters.rateRange[1] !== DEFAULT_FILTERS.rateRange[1]) {
      badges.push({
        type: 'rateRange',
        value: `${filters.rateRange[0]}-${filters.rateRange[1]}`,
        label: `$${filters.rateRange[0]} - $${filters.rateRange[1]}`
      });
    }

    filters.generations.forEach(g => badges.push({
      type: 'generations',
      value: g,
      label: GENERATION_LABELS[g as Generation] || g,
    }));

    filters.genders.forEach(g => badges.push({
      type: 'genders',
      value: g,
      label: GENDER_LABELS[g] || g,
    }));

    filters.lifestyleTags.forEach(t => badges.push({
      type: 'lifestyleTags',
      value: t,
      label: LIFESTYLE_LABELS[t] || t,
    }));

    return badges;
  };

  return {
    searchQuery,
    setSearchQuery,
    activeQuickFilters,
    handleQuickFilterToggle,
    sortBy,
    setSortBy,
    filteredCreators: sortedCreators,
    filters,
    setFilters: updateFilters,
    activeFilterCount,
    clearAllFilters,
    removeFilter,
    getActiveFilterBadges
  };
};
