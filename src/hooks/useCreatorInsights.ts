 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 export interface NicheData {
   niche: string;
   count: number;
   percentage: number;
 }
 
 export interface PlatformData {
   platform: string;
   count: number;
   percentage: number;
 }
 
 export interface FollowerBucket {
   bucket: string;
   range: string;
   count: number;
   percentage: number;
 }
 
 export interface EngagementTier {
   tier: string;
   count: number;
   percentage: number;
 }
 
 export interface CreatorInsights {
   totalCreators: number;
   avgNichesPerCreator: number;
   instagramConnected: number;
   avgFollowers: number;
   niches: NicheData[];
   platforms: PlatformData[];
   followerBuckets: FollowerBucket[];
   engagementTiers: EngagementTier[];
   multiNicheDistribution: { count: number; creators: number }[];
 }
 
 export const useCreatorInsights = () => {
   return useQuery({
     queryKey: ['creator-insights'],
     queryFn: async (): Promise<CreatorInsights> => {
       // Fetch all influencers
       const { data: influencers, error } = await supabase
         .from('influencers')
         .select('id, content_niches, instagram_url, tiktok_url, youtube_url, twitter_url, total_followers, engagement_rate');
 
       if (error) throw error;
 
       const creators = influencers || [];
       const totalCreators = creators.length;
 
       // Calculate niche distribution
       const nicheMap = new Map<string, number>();
       let totalNiches = 0;
       const nicheCountPerCreator: number[] = [];
 
       creators.forEach(creator => {
         const niches = creator.content_niches || [];
         nicheCountPerCreator.push(niches.length);
         totalNiches += niches.length;
         niches.forEach((niche: string) => {
           nicheMap.set(niche, (nicheMap.get(niche) || 0) + 1);
         });
       });
 
       const niches: NicheData[] = Array.from(nicheMap.entries())
         .map(([niche, count]) => ({
           niche,
           count,
           percentage: totalCreators > 0 ? Math.round((count / totalCreators) * 100) : 0
         }))
         .sort((a, b) => b.count - a.count)
         .slice(0, 10);
 
       // Calculate multi-niche distribution
       const nicheCountMap = new Map<number, number>();
       nicheCountPerCreator.forEach(count => {
         nicheCountMap.set(count, (nicheCountMap.get(count) || 0) + 1);
       });
       const multiNicheDistribution = Array.from(nicheCountMap.entries())
         .map(([count, creators]) => ({ count, creators }))
         .sort((a, b) => a.count - b.count);
 
       // Calculate platform distribution
       const platformCounts = {
         Instagram: creators.filter(c => c.instagram_url).length,
         TikTok: creators.filter(c => c.tiktok_url).length,
         YouTube: creators.filter(c => c.youtube_url).length,
         Twitter: creators.filter(c => c.twitter_url).length
       };
 
       const platforms: PlatformData[] = Object.entries(platformCounts)
         .map(([platform, count]) => ({
           platform,
           count,
           percentage: totalCreators > 0 ? Math.round((count / totalCreators) * 100) : 0
         }))
         .sort((a, b) => b.count - a.count);
 
       // Calculate follower buckets
       const bucketRanges = [
         { bucket: 'nano', range: '<1K', min: 0, max: 1000 },
         { bucket: 'micro', range: '1K-10K', min: 1000, max: 10000 },
         { bucket: 'mid', range: '10K-100K', min: 10000, max: 100000 },
         { bucket: 'macro', range: '100K-1M', min: 100000, max: 1000000 },
         { bucket: 'mega', range: '1M+', min: 1000000, max: Infinity }
       ];
 
       const followerBuckets: FollowerBucket[] = bucketRanges.map(({ bucket, range, min, max }) => {
         const count = creators.filter(c => {
           const followers = c.total_followers || 0;
           return followers >= min && followers < max;
         }).length;
         return {
           bucket,
           range,
           count,
           percentage: totalCreators > 0 ? Math.round((count / totalCreators) * 100) : 0
         };
       });
 
       // Calculate engagement tiers
       const engagementRanges = [
         { tier: 'Low', min: 0, max: 2 },
         { tier: 'Medium', min: 2, max: 5 },
         { tier: 'High', min: 5, max: 10 },
         { tier: 'Elite', min: 10, max: 100 }
       ];
 
       const engagementTiers: EngagementTier[] = engagementRanges.map(({ tier, min, max }) => {
         const count = creators.filter(c => {
           const rate = c.engagement_rate || 0;
           return rate >= min && rate < max;
         }).length;
         return {
           tier,
           count,
           percentage: totalCreators > 0 ? Math.round((count / totalCreators) * 100) : 0
         };
       });
 
       // Calculate averages
       const avgNichesPerCreator = totalCreators > 0 ? 
         Math.round((totalNiches / totalCreators) * 10) / 10 : 0;
       
       const totalFollowers = creators.reduce((sum, c) => sum + (c.total_followers || 0), 0);
       const avgFollowers = totalCreators > 0 ? Math.round(totalFollowers / totalCreators) : 0;
 
       return {
         totalCreators,
         avgNichesPerCreator,
         instagramConnected: Math.round((platformCounts.Instagram / (totalCreators || 1)) * 100),
         avgFollowers,
         niches,
         platforms,
         followerBuckets,
         engagementTiers,
         multiNicheDistribution
       };
     },
   });
 };