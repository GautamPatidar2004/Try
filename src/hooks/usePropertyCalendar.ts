import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  property_id: string;
  event_uid: string;
  title: string | null;
  start_date: string;
  end_date: string;
  is_blocked: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyCalendarData {
  ical_url: string | null;
  ical_last_synced_at: string | null;
  ical_sync_enabled: boolean;
}

export const usePropertyCalendar = (propertyId: string | null) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchCalendarData = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch property calendar settings
      // NOTE: ical_url column was dropped in a prior security migration.
      // Until iCal is re-enabled, we only read the remaining sync flags.
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('ical_last_synced_at, ical_sync_enabled')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      setPropertyData({
        ical_url: null,
        ical_last_synced_at: (property as any)?.ical_last_synced_at ?? null,
        ical_sync_enabled: (property as any)?.ical_sync_enabled ?? false,
      });

      // Fetch calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('property_calendar_events')
        .select('*')
        .eq('property_id', propertyId)
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;
      
      setEvents((eventsData || []) as CalendarEvent[]);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const updateIcalUrl = async (icalUrl: string, syncEnabled: boolean = true) => {
    if (!propertyId) return false;

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          ical_sync_enabled: syncEnabled,
        })
        .eq('id', propertyId);

      if (error) throw error;

      setPropertyData(prev => prev ? {
        ...prev,
        ical_url: icalUrl || null,
        ical_sync_enabled: syncEnabled
      } : null);

      toast({
        title: "Success",
        description: "Calendar settings updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating iCal URL:', error);
      toast({
        title: "Error",
        description: "Failed to update calendar settings",
        variant: "destructive",
      });
      return false;
    }
  };

  const syncCalendar = async (forceRefresh: boolean = false) => {
    if (!propertyId || !propertyData?.ical_url) {
      toast({
        title: "Error",
        description: "Please add an iCal URL first",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSyncing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to sync calendar",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('sync-property-calendar', {
        body: { property_id: propertyId, force_refresh: forceRefresh },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Calendar Synced",
          description: `${data.events_synced} events synced from ${data.source || 'calendar'}`,
        });
        
        // Refresh data
        await fetchCalendarData();
        return true;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync calendar. Please check your iCal URL.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const getBlockedDates = useCallback((): Date[] => {
    const blockedDates: Date[] = [];
    
    events.forEach(event => {
      if (!event.is_blocked) return;
      
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      
      // Add all dates in the range
      const current = new Date(start);
      while (current < end) {
        blockedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    
    return blockedDates;
  }, [events]);

  const isDateBlocked = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    
    return events.some(event => {
      if (!event.is_blocked) return false;
      return dateStr >= event.start_date && dateStr < event.end_date;
    });
  }, [events]);

  return {
    events,
    propertyData,
    loading,
    syncing,
    updateIcalUrl,
    syncCalendar,
    getBlockedDates,
    isDateBlocked,
    refetch: fetchCalendarData,
  };
};
