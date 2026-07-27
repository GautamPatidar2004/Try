import { useState, useMemo } from 'react';
import { useCreatorPosts } from './useCreatorPosts';

export type SortOption = 'newest' | 'most_likes' | 'most_views' | 'highest_engagement';

interface PortfolioFilters {
  platform?: string;
  dateRange?: { from: Date; to: Date };
  minEngagement?: number;
}

export const usePortfolio = (influencerId: string) => {
  const { posts: allPosts, stats, loading, refetch } = useCreatorPosts(influencerId);
  const [filters, setFilters] = useState<PortfolioFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const portfolioPosts = useMemo(() => {
    let posts = [...allPosts];

    // Apply platform filter
    if (filters.platform && filters.platform !== 'all') {
      posts = posts.filter(post => {
        const media = post.media_url?.toLowerCase() || '';
        return media.includes(filters.platform!.toLowerCase());
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      posts = posts.filter(post => {
        const postDate = new Date(post.created_at);
        return postDate >= filters.dateRange!.from && postDate <= filters.dateRange!.to;
      });
    }

    // Apply engagement filter
    if (filters.minEngagement) {
      posts = posts.filter(post => {
        const engagement = post.likes_count + (post.views_count * 0.1);
        return engagement >= filters.minEngagement!;
      });
    }

    // Sort posts
    switch (sortBy) {
      case 'newest':
        posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'most_likes':
        posts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'most_views':
        posts.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'highest_engagement':
        posts.sort((a, b) => {
          const engagementA = (a.likes_count || 0) + (a.views_count || 0) * 0.1;
          const engagementB = (b.likes_count || 0) + (b.views_count || 0) * 0.1;
          return engagementB - engagementA;
        });
        break;
    }

    return posts;
  }, [allPosts, filters, sortBy]);

  // Calculate performance percentiles
  const getPerformanceBadge = (post: any) => {
    const engagement = (post.likes_count || 0) + (post.views_count || 0) * 0.1;
    const allEngagements = allPosts.map(p =>
      (p.likes_count || 0) + (p.views_count || 0) * 0.1
    ).sort((a, b) => b - a);
    
    const percentile = (allEngagements.indexOf(engagement) / allEngagements.length) * 100;
    
    if (percentile <= 10) return { label: 'Top 10%', color: 'text-green-500' };
    if (percentile <= 25) return { label: 'Top 25%', color: 'text-blue-500' };
    if (percentile <= 50) return { label: 'Top 50%', color: 'text-yellow-500' };
    return null;
  };

  const portfolioStats = useMemo(() => {
    const avgEngagement = portfolioPosts.reduce((acc, post) => {
      const engagement = (post.likes_count || 0) + (post.views_count || 0) * 0.1;
      return acc + engagement;
    }, 0) / (portfolioPosts.length || 1);

    // Find best performing platform
    const platformCounts: Record<string, { count: number; engagement: number }> = {};
    portfolioPosts.forEach(post => {
      const media = post.media_url?.toLowerCase() || '';
      let platform = 'other';
      if (media.includes('instagram')) platform = 'Instagram';
      else if (media.includes('tiktok')) platform = 'TikTok';
      else if (media.includes('youtube')) platform = 'YouTube';
      else if (media.includes('twitter')) platform = 'Twitter';

      if (!platformCounts[platform]) {
        platformCounts[platform] = { count: 0, engagement: 0 };
      }
      platformCounts[platform].count++;
      platformCounts[platform].engagement += (post.likes_count || 0);
    });

    const bestPlatform = Object.entries(platformCounts).reduce((best, [platform, data]) => {
      if (data.count === 0) return best;
      const avgPlatformEngagement = data.engagement / data.count;
      if (!best || avgPlatformEngagement > best.engagement) {
        return { platform, engagement: avgPlatformEngagement };
      }
      return best;
    }, null as { platform: string; engagement: number } | null);

    return {
      totalPosts: portfolioPosts.length,
      avgEngagement: Math.round(avgEngagement),
      bestPlatform: bestPlatform?.platform || 'N/A',
    };
  }, [portfolioPosts]);

  return {
    posts: portfolioPosts,
    stats: portfolioStats,
    loading,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    getPerformanceBadge,
    refetch,
  };
};
