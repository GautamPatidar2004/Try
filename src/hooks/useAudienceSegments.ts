 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { subDays } from "date-fns";
 
 export interface AudienceSegment {
   id: string;
   name: string;
   description: string;
   count: number;
   icon: string;
   color: string;
   criteria: Record<string, any>;
 }
 
 export const useAudienceSegments = () => {
   return useQuery({
     queryKey: ['audience-segments'],
     queryFn: async (): Promise<AudienceSegment[]> => {
       const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
       const sixtyDaysAgo = subDays(new Date(), 60).toISOString();
 
       // New Users (registered in last 30 days)
       const { count: newUsersCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .gte('created_at', thirtyDaysAgo);
 
       // Inactive Users (no login in 60+ days)
       const { count: inactiveCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .lt('last_login_at', sixtyDaysAgo);
 
       // High-Value Creators (10k+ followers, 5%+ engagement)
       const { count: highValueCount } = await supabase
         .from('influencers')
         .select('*', { count: 'exact', head: true })
         .gte('total_followers', 10000)
         .gte('engagement_rate', 5);
 
       // Active Collaborators (2+ completed collaborations)
       const { data: activeCollaborators } = await supabase
         .from('collaboration_agreements')
         .select('influencer_id, host_id')
         .eq('status', 'active');
 
       const collabCounts = new Map<string, number>();
       activeCollaborators?.forEach(collab => {
         if (collab.influencer_id) {
           collabCounts.set(collab.influencer_id, (collabCounts.get(collab.influencer_id) || 0) + 1);
         }
         if (collab.host_id) {
           collabCounts.set(collab.host_id, (collabCounts.get(collab.host_id) || 0) + 1);
         }
       });
       const activeCollabCount = Array.from(collabCounts.values()).filter(c => c >= 2).length;
 
       // Travel Niche creators
       const { count: travelNicheCount } = await supabase
         .from('influencers')
         .select('*', { count: 'exact', head: true })
         .contains('content_niches', ['Travel']);
 
       // Unverified High Potential (high followers but not verified)
       const { data: allInfluencers } = await supabase
         .from('influencers')
         .select('id, total_followers')
         .gte('total_followers', 10000);
       
       const influencerIds = allInfluencers?.map(i => i.id) || [];
       
       let unverifiedHighPotential = 0;
       if (influencerIds.length > 0) {
         const { count } = await supabase
           .from('profiles')
           .select('*', { count: 'exact', head: true })
           .in('id', influencerIds)
           .eq('verified', false);
         unverifiedHighPotential = count || 0;
       }
 
       // Premium Users
       const { count: premiumCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .eq('premium_override', true);
 
       // Hosts
       const { count: hostsCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .eq('user_type', 'host');
 
       return [
         {
           id: 'new-users',
           name: 'New Users (30d)',
           description: 'Registered in the last 30 days',
           count: newUsersCount || 0,
           icon: 'UserPlus',
           color: 'bg-green-100 text-green-800',
           criteria: { registered_after: thirtyDaysAgo }
         },
         {
           id: 'high-value',
           name: 'High-Value Creators',
           description: '10k+ followers, 5%+ engagement',
           count: highValueCount || 0,
           icon: 'Star',
           color: 'bg-yellow-100 text-yellow-800',
           criteria: { min_followers: 10000, min_engagement: 5 }
         },
         {
           id: 'inactive',
           name: 'Inactive (60d+)',
           description: 'No login in 60+ days',
           count: inactiveCount || 0,
           icon: 'Clock',
           color: 'bg-red-100 text-red-800',
           criteria: { last_login_before: sixtyDaysAgo }
         },
         {
           id: 'active-collaborators',
           name: 'Active Collaborators',
           description: '2+ completed collaborations',
           count: activeCollabCount,
           icon: 'Handshake',
           color: 'bg-blue-100 text-blue-800',
           criteria: { min_collaborations: 2 }
         },
         {
           id: 'travel-niche',
           name: 'Travel Niche',
           description: 'Content niche includes Travel',
           count: travelNicheCount || 0,
           icon: 'Plane',
           color: 'bg-purple-100 text-purple-800',
           criteria: { niche: 'Travel' }
         },
         {
           id: 'unverified-potential',
           name: 'Unverified Potential',
           description: 'High followers but not verified',
           count: unverifiedHighPotential,
           icon: 'AlertCircle',
           color: 'bg-orange-100 text-orange-800',
           criteria: { min_followers: 10000, verified: false }
         },
         {
           id: 'premium-users',
           name: 'Premium Users',
           description: 'Users with premium access',
           count: premiumCount || 0,
           icon: 'Crown',
           color: 'bg-amber-100 text-amber-800',
           criteria: { premium: true }
         },
         {
           id: 'hosts',
           name: 'Hosts',
           description: 'Property/venue hosts',
           count: hostsCount || 0,
           icon: 'Home',
           color: 'bg-teal-100 text-teal-800',
           criteria: { user_type: 'host' }
         }
       ];
     },
   });
 };