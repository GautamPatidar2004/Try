import { useState, useMemo } from 'react';
import { ContentFilters } from '@/components/marketplace/portfolio/types';
import { ContentItem } from '@/data/mockPortfolioData';

export const usePortfolioFilters = (content: ContentItem[], platform?: 'instagram' | 'tiktok') => {
  const [filters, setFilters] = useState<ContentFilters>({
    dateRange: '30',
    type: 'all',
    sortBy: 'date'
  });

  const filteredContent = useMemo(() => {
    let filtered = [...content];

    // Filter by platform
    if (platform) {
      filtered = filtered.filter(item => item.platform === platform);
    }

    // Filter by date range
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
    filtered = filtered.filter(item => new Date(item.date) >= daysAgo);

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'reach':
          return (b.reach || 0) - (a.reach || 0);
        case 'impressions':
          return (b.impressions || 0) - (a.impressions || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'engagements':
          const aEngagement = a.likes + a.comments + (a.saves || 0) + (a.shares || 0);
          const bEngagement = b.likes + b.comments + (b.saves || 0) + (b.shares || 0);
          return bEngagement - aEngagement;
        case 'likes':
          return b.likes - a.likes;
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [content, platform, filters]);

  return {
    filters,
    setFilters,
    filteredContent
  };
};
