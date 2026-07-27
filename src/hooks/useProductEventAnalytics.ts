import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ANALYTICS_EVENTS, EVENT_TYPES } from '@/lib/analytics-events';
import type { DateRange } from '@/hooks/usePlatformAnalytics';

interface EventCount {
  event_name: string;
  count: number;
}

interface RoleFunnel {
  role: string;
  signupStart: number;
  signupComplete: number;
  conversionRate: number;
}

interface InviteFunnel {
  sent: number;
  accepted: number;
  declined: number;
  countered: number;
  acceptanceRate: number;
  declineRate: number;
  counterRate: number;
}

interface TopCta {
  cta_name: string;
  page: string;
  clicks: number;
  uniqueUsers: number;
}

interface ProductEventAnalytics {
  totalEvents: number;
  uniqueUsers: number;
  eventCounts: Record<string, number>;
  eventsByType: Record<string, number>;
  acquisitionFunnel: RoleFunnel[];
  inviteFunnel: InviteFunnel;
  topCtas: TopCta[];
  recentEvents: Array<{
    id: string;
    event_name: string;
    event_type: string;
    metadata: Record<string, any>;
    created_at: string;
    user_id: string | null;
  }>;
}

// Helper to get date range bounds
const getDateRange = (range: DateRange): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }
  
  return { start, end };
};

// Helper type for event data
type EventData = {
  id: string;
  event_name: string;
  event_type: string;
  metadata: Record<string, any> | null;
  created_at: string;
  user_id: string | null;
};

// Group events by a key in metadata
const groupByMetadataKey = (
  events: EventData[],
  eventName: string,
  key: string
): Record<string, number> => {
  return events
    .filter(e => e.event_name === eventName)
    .reduce((acc, event) => {
      const value = event.metadata?.[key] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
};

/**
 * Hook for fetching product event analytics data for admin dashboard
 */
export const useProductEventAnalytics = (dateRange: DateRange) => {
  return useQuery<ProductEventAnalytics>({
    queryKey: ['product-event-analytics', dateRange],
    queryFn: async () => {
      const { start, end } = getDateRange(dateRange);
      
      // Fetch all events in date range
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('id, event_name, event_type, metadata, created_at, user_id')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast events to proper type (metadata from DB is Json, we treat as Record)
      const allEvents: EventData[] = (events || []).map(e => ({
        ...e,
        metadata: (e.metadata && typeof e.metadata === 'object' && !Array.isArray(e.metadata)) 
          ? e.metadata as Record<string, any> 
          : null,
      }));
      
      // Calculate total events
      const totalEvents = allEvents.length;
      
      // Calculate unique users (excluding null)
      const uniqueUserIds = new Set(allEvents.filter(e => e.user_id).map(e => e.user_id));
      const uniqueUsers = uniqueUserIds.size;
      
      // Count events by name
      const eventCounts = allEvents.reduce((acc, event) => {
        acc[event.event_name] = (acc[event.event_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Count events by type
      const eventsByType = allEvents.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate acquisition funnel by role
      const signupStartByRole = groupByMetadataKey(allEvents, ANALYTICS_EVENTS.SIGNUP_START, 'role');
      const signupCompleteByRole = groupByMetadataKey(allEvents, ANALYTICS_EVENTS.SIGNUP_COMPLETE, 'role');
      
      const roles = ['host', 'influencer', 'brand', 'restaurant_owner'];
      const acquisitionFunnel: RoleFunnel[] = roles.map(role => {
        const startCount = signupStartByRole[role] || 0;
        const completeCount = signupCompleteByRole[role] || 0;
        return {
          role,
          signupStart: startCount,
          signupComplete: completeCount,
          conversionRate: startCount > 0 ? (completeCount / startCount) * 100 : 0,
        };
      }).filter(f => f.signupStart > 0 || f.signupComplete > 0);
      
      // Calculate invite funnel
      const inviteSent = eventCounts[ANALYTICS_EVENTS.INVITE_SENT] || 0;
      const inviteAccepted = eventCounts[ANALYTICS_EVENTS.INVITE_ACCEPTED] || 0;
      const inviteDeclined = eventCounts[ANALYTICS_EVENTS.INVITE_DECLINED] || 0;
      const inviteCountered = eventCounts[ANALYTICS_EVENTS.INVITE_COUNTERED] || 0;
      
      const inviteFunnel: InviteFunnel = {
        sent: inviteSent,
        accepted: inviteAccepted,
        declined: inviteDeclined,
        countered: inviteCountered,
        acceptanceRate: inviteSent > 0 ? (inviteAccepted / inviteSent) * 100 : 0,
        declineRate: inviteSent > 0 ? (inviteDeclined / inviteSent) * 100 : 0,
        counterRate: inviteSent > 0 ? (inviteCountered / inviteSent) * 100 : 0,
      };
      
      // Calculate top CTAs
      const ctaEvents = allEvents.filter(e => e.event_name === ANALYTICS_EVENTS.MARKETING_CTA_CLICK);
      const ctaGroups = ctaEvents.reduce((acc, event) => {
        const key = `${event.metadata?.cta_name || 'unknown'}|${event.metadata?.page || 'unknown'}`;
        if (!acc[key]) {
          acc[key] = { clicks: 0, users: new Set<string>() };
        }
        acc[key].clicks++;
        if (event.user_id) acc[key].users.add(event.user_id);
        return acc;
      }, {} as Record<string, { clicks: number; users: Set<string> }>);
      
      const topCtas: TopCta[] = Object.entries(ctaGroups)
        .map(([key, data]) => {
          const [cta_name, page] = key.split('|');
          return {
            cta_name,
            page,
            clicks: data.clicks,
            uniqueUsers: data.users.size,
          };
        })
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);
      
      // Get recent events (first 50)
      const recentEvents = allEvents.slice(0, 50).map(e => ({
        id: e.id,
        event_name: e.event_name,
        event_type: e.event_type,
        metadata: e.metadata as Record<string, any>,
        created_at: e.created_at,
        user_id: e.user_id,
      }));
      
      return {
        totalEvents,
        uniqueUsers,
        eventCounts,
        eventsByType,
        acquisitionFunnel,
        inviteFunnel,
        topCtas,
        recentEvents,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
