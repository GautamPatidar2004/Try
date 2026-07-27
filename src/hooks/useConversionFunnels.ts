import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays } from "date-fns";

export interface FunnelData {
  name: string;
  steps: {
    name: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
  }[];
}

export const useConversionFunnels = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['conversion-funnels', startDate, endDate],
    queryFn: async () => {
      const end = endDate || new Date();
      const start = startDate || startOfDay(subDays(end, 30));

      // Parallelize all queries for better performance
      const [
        { count: signups },
        { count: profilesComplete },
        { count: firstApplication },
        { count: freeUsers },
        { count: premiumUsers },
        { count: applications },
        { count: collaborations }
      ] = await Promise.all([
        // Funnel 1: Signup → Profile Complete → First Application
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .not('first_name', 'is', null)
          .not('user_type', 'is', null),
        
        supabase
          .from('applications')
          .select('influencer_id', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        
        // Funnel 2: Free User → Premium Subscription
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('account_tier', 'free')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        
        // Funnel 3: Application → Collaboration
        supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        
        supabase
          .from('collaboration_agreements')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .eq('status', 'active')
      ]);

      const signupFunnel: FunnelData = {
        name: 'User Activation',
        steps: [
          {
            name: 'Signup',
            users: signups || 0,
            conversionRate: 100,
            dropoffRate: 0,
          },
          {
            name: 'Profile Complete',
            users: profilesComplete || 0,
            conversionRate: signups ? ((profilesComplete || 0) / signups) * 100 : 0,
            dropoffRate: signups ? (1 - ((profilesComplete || 0) / signups)) * 100 : 0,
          },
          {
            name: 'First Application',
            users: firstApplication || 0,
            conversionRate: profilesComplete ? ((firstApplication || 0) / profilesComplete) * 100 : 0,
            dropoffRate: profilesComplete ? (1 - ((firstApplication || 0) / profilesComplete)) * 100 : 0,
          },
        ],
      };

      const subscriptionFunnel: FunnelData = {
        name: 'Subscription Conversion',
        steps: [
          {
            name: 'Free User',
            users: freeUsers || 0,
            conversionRate: 100,
            dropoffRate: 0,
          },
          {
            name: 'Premium Subscriber',
            users: premiumUsers || 0,
            conversionRate: freeUsers ? ((premiumUsers || 0) / freeUsers) * 100 : 0,
            dropoffRate: freeUsers ? (1 - ((premiumUsers || 0) / freeUsers)) * 100 : 0,
          },
        ],
      };

      const collaborationFunnel: FunnelData = {
        name: 'Application to Collaboration',
        steps: [
          {
            name: 'Application Submitted',
            users: applications || 0,
            conversionRate: 100,
            dropoffRate: 0,
          },
          {
            name: 'Collaboration Started',
            users: collaborations || 0,
            conversionRate: applications ? ((collaborations || 0) / applications) * 100 : 0,
            dropoffRate: applications ? (1 - ((collaborations || 0) / applications)) * 100 : 0,
          },
        ],
      };

      return [signupFunnel, subscriptionFunnel, collaborationFunnel];
    },
  });
};
