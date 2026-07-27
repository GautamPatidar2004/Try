 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { subDays } from "date-fns";
 
 export interface SegmentUser {
   id: string;
   first_name: string | null;
   last_name: string | null;
   email: string | null;
   user_type: string | null;
   location: string | null;
   profile_photo_url: string | null;
   created_at: string;
   verified: boolean | null;
   total_followers?: number;
   engagement_rate?: number;
 }
 
 export interface UseSegmentUsersOptions {
   segmentId: string;
   page?: number;
   pageSize?: number;
   searchQuery?: string;
   enabled?: boolean;
 }
 
 export const useSegmentUsers = ({
   segmentId,
   page = 0,
   pageSize = 50,
   searchQuery = "",
   enabled = true,
 }: UseSegmentUsersOptions) => {
   return useQuery({
     queryKey: ['segment-users', segmentId, page, pageSize, searchQuery],
     queryFn: async (): Promise<{ users: SegmentUser[]; totalCount: number }> => {
       const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
       const sixtyDaysAgo = subDays(new Date(), 60).toISOString();
       const from = page * pageSize;
       const to = from + pageSize - 1;
 
       let users: SegmentUser[] = [];
       let totalCount = 0;
 
       // Fetch emails via edge function for admin
       const fetchWithEmails = async (profileIds: string[]) => {
         if (profileIds.length === 0) return new Map<string, string>();
         
         try {
           const { data } = await supabase.functions.invoke('admin-list-users', {
             body: { userIds: profileIds }
           });
           const emailMap = new Map<string, string>();
           data?.users?.forEach((u: any) => {
             emailMap.set(u.id, u.email);
           });
           return emailMap;
         } catch {
           return new Map<string, string>();
         }
       };
 
       switch (segmentId) {
         case 'new-users': {
           let query = supabase
             .from('profiles')
             .select('id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified', { count: 'exact' })
             .gte('created_at', thirtyDaysAgo);
           
           if (searchQuery) {
             query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
           }
           
           const { data, count } = await query.range(from, to).order('created_at', { ascending: false });
           const emailMap = await fetchWithEmails(data?.map(d => d.id) || []);
           
           users = (data || []).map(p => ({ ...p, email: emailMap.get(p.id) || null }));
           totalCount = count || 0;
           break;
         }
 
         case 'inactive': {
           let query = supabase
             .from('profiles')
             .select('id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified', { count: 'exact' })
             .lt('last_login_at', sixtyDaysAgo);
           
           if (searchQuery) {
             query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
           }
           
           const { data, count } = await query.range(from, to).order('created_at', { ascending: false });
           const emailMap = await fetchWithEmails(data?.map(d => d.id) || []);
           
           users = (data || []).map(p => ({ ...p, email: emailMap.get(p.id) || null }));
           totalCount = count || 0;
           break;
         }
 
         case 'high-value': {
           let query = supabase
             .from('influencers')
             .select('id, total_followers, engagement_rate, profiles!inner(id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified)', { count: 'exact' })
             .gte('total_followers', 10000)
             .gte('engagement_rate', 5);
           
           const { data, count } = await query.range(from, to).order('total_followers', { ascending: false });
           const profileIds = data?.map(d => (d.profiles as any).id) || [];
           const emailMap = await fetchWithEmails(profileIds);
           
           users = (data || []).map(inf => {
             const profile = inf.profiles as any;
             return {
               id: profile.id,
               first_name: profile.first_name,
               last_name: profile.last_name,
               user_type: profile.user_type,
               location: profile.location,
               profile_photo_url: profile.profile_photo_url,
               created_at: profile.created_at,
               verified: profile.verified,
               email: emailMap.get(profile.id) || null,
               total_followers: inf.total_followers,
               engagement_rate: inf.engagement_rate,
             };
           });
           totalCount = count || 0;
           break;
         }
 
         case 'active-collaborators': {
           // Get users with 2+ active collaborations
           const { data: collabs } = await supabase
             .from('collaboration_agreements')
             .select('influencer_id, host_id')
             .eq('status', 'active');
 
           const collabCounts = new Map<string, number>();
           collabs?.forEach(collab => {
             if (collab.influencer_id) {
               collabCounts.set(collab.influencer_id, (collabCounts.get(collab.influencer_id) || 0) + 1);
             }
             if (collab.host_id) {
               collabCounts.set(collab.host_id, (collabCounts.get(collab.host_id) || 0) + 1);
             }
           });
 
           const activeUserIds = Array.from(collabCounts.entries())
             .filter(([_, count]) => count >= 2)
             .map(([id]) => id);
 
           if (activeUserIds.length > 0) {
             const paginatedIds = activeUserIds.slice(from, to + 1);
             const { data } = await supabase
               .from('profiles')
               .select('id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified')
               .in('id', paginatedIds);
             
             const emailMap = await fetchWithEmails(data?.map(d => d.id) || []);
             users = (data || []).map(p => ({ ...p, email: emailMap.get(p.id) || null }));
             totalCount = activeUserIds.length;
           }
           break;
         }
 
         case 'travel-niche': {
           let query = supabase
             .from('influencers')
             .select('id, total_followers, engagement_rate, profiles!inner(id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified)', { count: 'exact' })
             .contains('content_niches', ['Travel']);
           
           const { data, count } = await query.range(from, to).order('total_followers', { ascending: false });
           const profileIds = data?.map(d => (d.profiles as any).id) || [];
           const emailMap = await fetchWithEmails(profileIds);
           
           users = (data || []).map(inf => {
             const profile = inf.profiles as any;
             return {
               id: profile.id,
               first_name: profile.first_name,
               last_name: profile.last_name,
               user_type: profile.user_type,
               location: profile.location,
               profile_photo_url: profile.profile_photo_url,
               created_at: profile.created_at,
               verified: profile.verified,
               email: emailMap.get(profile.id) || null,
               total_followers: inf.total_followers,
               engagement_rate: inf.engagement_rate,
             };
           });
           totalCount = count || 0;
           break;
         }
 
         case 'unverified-potential': {
           // High followers but not verified
           const { data: highFollowerInfluencers } = await supabase
             .from('influencers')
             .select('id, total_followers')
             .gte('total_followers', 10000);
           
           const influencerIds = highFollowerInfluencers?.map(i => i.id) || [];
           
           if (influencerIds.length > 0) {
             let query = supabase
               .from('profiles')
               .select('id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified', { count: 'exact' })
               .in('id', influencerIds)
               .eq('verified', false);
             
             if (searchQuery) {
               query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
             }
             
             const { data, count } = await query.range(from, to);
             const emailMap = await fetchWithEmails(data?.map(d => d.id) || []);
             
             users = (data || []).map(p => ({ ...p, email: emailMap.get(p.id) || null }));
             totalCount = count || 0;
           }
           break;
         }
 
         case 'premium-users': {
           let query = supabase
             .from('profiles')
             .select('id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified', { count: 'exact' })
             .eq('premium_override', true);
           
           if (searchQuery) {
             query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
           }
           
           const { data, count } = await query.range(from, to).order('created_at', { ascending: false });
           const emailMap = await fetchWithEmails(data?.map(d => d.id) || []);
           
           users = (data || []).map(p => ({ ...p, email: emailMap.get(p.id) || null }));
           totalCount = count || 0;
           break;
         }
 
         case 'hosts': {
           let query = supabase
             .from('profiles')
             .select('id, first_name, last_name, user_type, location, profile_photo_url, created_at, verified', { count: 'exact' })
             .eq('user_type', 'host');
           
           if (searchQuery) {
             query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
           }
           
           const { data, count } = await query.range(from, to).order('created_at', { ascending: false });
           const emailMap = await fetchWithEmails(data?.map(d => d.id) || []);
           
           users = (data || []).map(p => ({ ...p, email: emailMap.get(p.id) || null }));
           totalCount = count || 0;
           break;
         }
 
         default:
           break;
       }
 
       return { users, totalCount };
     },
     enabled,
   });
 };