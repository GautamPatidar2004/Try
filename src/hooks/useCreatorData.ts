import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatSocialUrl } from '@/lib/socialUrlFormatter';
import { getGeneration, type Generation } from '@/lib/demographics';

interface Creator {
  id: string;
  name: string;
  avatar: string;
  location: string;
  followers: number;
  rating: number;
  specialties: string[];
  recentWork: string[];
  priceRange: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  userId: string;
  verified?: boolean;
  engagementRate: number;
  rateRangeMin?: number;
  rateRangeMax?: number;
  collaborationPreferences: string[];
  accountTier?: string;
  platforms: string[];
  searchPriority?: number;
  hasActiveBoost?: boolean;
  dateOfBirth?: string | null;
  generation?: Generation | null;
  gender?: string | null;
  lifestyleTags?: string[];
}

export const useCreatorData = (isDemoMode = false) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(!isDemoMode);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('influencers')
        .select(`
          id,
          content_niches,
          rate_range_min,
          rate_range_max,
          total_followers,
          engagement_rate,
          collaboration_preferences,
          instagram_url,
          tiktok_url,
          youtube_url,
          twitter_url,
          date_of_birth,
          gender,
          lifestyle_tags,
          profiles!inner(
            first_name,
            last_name,
            location,
            profile_photo_url,
            verified,
            account_tier
          ),
          social_accounts(
            platform,
            follower_count,
            username
          )
        `);

      if (error) throw error;

      // Fetch latest engagement data from external_analytics for each influencer
      const influencerIds = data?.map(i => i.id) || [];
      const [analyticsRes, subsRes, boostsRes] = await Promise.all([
        supabase
          .from('external_analytics')
          .select('influencer_id, metrics')
          .in('influencer_id', influencerIds)
          .order('metric_date', { ascending: false }),
        supabase
          .from('subscriptions')
          .select('influencer_id, status, current_period_end, subscription_plans!inner(search_priority)')
          .in('influencer_id', influencerIds)
          .eq('status', 'active'),
        supabase
          .from('creator_profile_boosts')
          .select('influencer_id, expires_at')
          .in('influencer_id', influencerIds)
          .gt('expires_at', new Date().toISOString()),
      ]);
      const analyticsData = analyticsRes.data;

      const priorityMap = new Map<string, number>();
      (subsRes.data || []).forEach((s: any) => {
        const periodOk = !s.current_period_end || new Date(s.current_period_end) > new Date();
        if (!periodOk) return;
        const p = s.subscription_plans?.search_priority ?? 1;
        const prev = priorityMap.get(s.influencer_id) ?? 1;
        if (p > prev) priorityMap.set(s.influencer_id, p);
      });

      const boostedSet = new Set<string>((boostsRes.data || []).map((b: any) => b.influencer_id));

      // Create a map of influencer_id to latest metrics
      const analyticsMap = new Map<string, any>();
      analyticsData?.forEach(record => {
        if (!analyticsMap.has(record.influencer_id)) {
          analyticsMap.set(record.influencer_id, record.metrics);
        }
      });

      const transformedCreators: Creator[] = data?.map(influencer => {
        const profile = influencer.profiles;
        const totalFollowers = influencer.social_accounts.reduce((sum, account) => sum + (account.follower_count || 0), 0);
        const platforms = influencer.social_accounts.map(account => account.platform);
        
        // Get engagement rate from influencers table, or calculate from external_analytics
        let engagementRate = Number(influencer.engagement_rate) || 0;
        if (engagementRate === 0) {
          const latestMetrics = analyticsMap.get(influencer.id);
          if (latestMetrics) {
            const followerCount =
         Number(latestMetrics.follower_count) ||
         Number(totalFollowers) ||
         Number(influencer.total_followers) ||
          0;
            const avgLikes = Number(latestMetrics.avg_likes) || 0;
            const avgComments = Number(latestMetrics.avg_comments )|| 0;
            if (
              followerCount > 0 &&
              (avgLikes > 0 || avgComments > 0)
            ) {
              const calculatedEngagement =
                ((avgLikes + avgComments) / followerCount) * 100;
            
              // cap unrealistic small account engagement
              engagementRate = Math.min(calculatedEngagement, 20);
            } else {
              engagementRate = 0;
            };
             
          }
        }
        
        return {
          id: influencer.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Creator',
          avatar: profile.profile_photo_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          location: profile.location || 'Location not specified',
          followers:
          Number(totalFollowers) ||
          Number(influencer.total_followers) ||
          0,
          rating: 5.0,
          specialties: influencer.content_niches || [],
          recentWork: [],
          priceRange: influencer.rate_range_min && influencer.rate_range_max 
            ? `$${influencer.rate_range_min} - $${influencer.rate_range_max}`
            : 'Contact for rates',
          instagramUrl: formatSocialUrl('instagram', influencer.instagram_url),
          tiktokUrl: formatSocialUrl('tiktok', influencer.tiktok_url),
          youtubeUrl: formatSocialUrl('youtube', influencer.youtube_url),
          twitterUrl: formatSocialUrl('twitter', influencer.twitter_url),
          userId: influencer.id,
          verified: profile.verified,
          engagementRate: engagementRate,
          rateRangeMin: influencer.rate_range_min,
          rateRangeMax: influencer.rate_range_max,
          collaborationPreferences: influencer.collaboration_preferences || [],
          accountTier: profile.account_tier,
          platforms: platforms,
          searchPriority: priorityMap.get(influencer.id) ?? 1,
          hasActiveBoost: boostedSet.has(influencer.id),
          dateOfBirth: (influencer as any).date_of_birth ?? null,
          generation: getGeneration((influencer as any).date_of_birth),
          gender: (influencer as any).gender ?? null,
          lifestyleTags: (influencer as any).lifestyle_tags ?? [],
        };
      }) || [];

      // Boosted first, then by plan search_priority, then by followers
      transformedCreators.sort((a, b) => {
        const boostDiff = Number(b.hasActiveBoost) - Number(a.hasActiveBoost);
        if (boostDiff !== 0) return boostDiff;
        const prioDiff = (b.searchPriority || 1) - (a.searchPriority || 1);
        if (prioDiff !== 0) return prioDiff;
        return (b.followers || 0) - (a.followers || 0);
      });

      setCreators(transformedCreators);
    } catch (error) {
      console.error('Error fetching creators:', error);
      // Fallback to demo data if fetch fails
      setCreators(getDemoCreators());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setCreators(getDemoCreators());
      setLoading(false);
      return;
    }
    fetchCreators();
  }, [isDemoMode]);

  const refetch = () => {
    fetchCreators();
  };

  return {
    creators,
    loading,
    refetch
  };
};

const getDemoCreators = (): Creator[] => [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    location: 'Los Angeles, CA',
    followers: 125000,
    rating: 5.0,
    specialties: ['Travel', 'Lifestyle', 'Food'],
    recentWork: [],
    priceRange: '$500 - $1,500',
    userId: '1',
    verified: true,
    engagementRate: 4.5,
    rateRangeMin: 500,
    rateRangeMax: 1500,
    collaborationPreferences: ['Paid Partnership', 'Free Stay'],
    platforms: ['Instagram', 'TikTok']
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'New York, NY',
    followers: 89000,
    rating: 5.0,
    specialties: ['Food', 'Travel'],
    recentWork: [],
    priceRange: '$300 - $1,000',
    userId: '2',
    engagementRate: 5.2,
    rateRangeMin: 300,
    rateRangeMax: 1000,
    collaborationPreferences: ['Paid Partnership', 'Content Creation'],
    platforms: ['Instagram', 'YouTube']
  },
  {
    id: '3',
    name: 'Aisha Patel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    location: 'Austin, TX',
    followers: 215000,
    rating: 5.0,
    specialties: ['Wellness', 'Lifestyle', 'Yoga'],
    recentWork: [],
    priceRange: '$600 - $2,000',
    userId: '3',
    verified: true,
    engagementRate: 6.8,
    rateRangeMin: 600,
    rateRangeMax: 2000,
    collaborationPreferences: ['Paid Partnership', 'Free Stay'],
    platforms: ['Instagram', 'YouTube', 'TikTok']
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Miami, FL',
    followers: 256000,
    rating: 5.0,
    specialties: ['Fashion', 'Beauty', 'Travel'],
    recentWork: [],
    priceRange: '$800 - $2,500',
    userId: '4',
    verified: true,
    engagementRate: 6.1,
    rateRangeMin: 800,
    rateRangeMax: 2500,
    collaborationPreferences: ['Paid Partnership', 'Affiliate'],
    platforms: ['Instagram', 'TikTok', 'YouTube']
  },
  {
    id: '5',
    name: 'Jordan Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: 'Denver, CO',
    followers: 47000,
    rating: 5.0,
    specialties: ['Adventure', 'Photography', 'Outdoors'],
    recentWork: [],
    priceRange: '$200 - $700',
    userId: '5',
    engagementRate: 7.3,
    rateRangeMin: 200,
    rateRangeMax: 700,
    collaborationPreferences: ['Free Stay', 'Content Creation'],
    platforms: ['Instagram', 'YouTube']
  },
  {
    id: '6',
    name: 'Chloe Kim',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    location: 'San Francisco, CA',
    followers: 178000,
    rating: 5.0,
    specialties: ['Tech', 'Design', 'Lifestyle'],
    recentWork: [],
    priceRange: '$500 - $1,800',
    userId: '6',
    verified: true,
    engagementRate: 4.2,
    rateRangeMin: 500,
    rateRangeMax: 1800,
    collaborationPreferences: ['Paid Partnership', 'Product Exchange'],
    platforms: ['YouTube', 'TikTok', 'Twitter']
  },
  {
    id: '7',
    name: 'Marcus Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Nashville, TN',
    followers: 92000,
    rating: 5.0,
    specialties: ['Food', 'Travel', 'Music'],
    recentWork: [],
    priceRange: '$400 - $1,200',
    userId: '7',
    engagementRate: 5.8,
    rateRangeMin: 400,
    rateRangeMax: 1200,
    collaborationPreferences: ['Paid Partnership', 'Free Stay'],
    platforms: ['Instagram', 'TikTok']
  },
  {
    id: '8',
    name: 'Olivia Santos',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
    location: 'Scottsdale, AZ',
    followers: 340000,
    rating: 5.0,
    specialties: ['Travel', 'Luxury', 'Photography'],
    recentWork: [],
    priceRange: '$1,000 - $3,500',
    userId: '8',
    verified: true,
    engagementRate: 3.9,
    rateRangeMin: 1000,
    rateRangeMax: 3500,
    collaborationPreferences: ['Paid Partnership', 'Affiliate'],
    platforms: ['Instagram', 'YouTube', 'TikTok']
  },
  {
    id: '9',
    name: 'Dylan Park',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    location: 'Portland, OR',
    followers: 31000,
    rating: 5.0,
    specialties: ['Sustainability', 'Travel', 'Food'],
    recentWork: [],
    priceRange: '$150 - $500',
    userId: '9',
    engagementRate: 8.4,
    rateRangeMin: 150,
    rateRangeMax: 500,
    collaborationPreferences: ['Free Stay', 'Content Creation'],
    platforms: ['Instagram', 'TikTok']
  }
];

export type { Creator };