import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ICalEvent {
  uid: string;
  summary: string;
  startDate: string;
  endDate: string;
}

// Parse iCal date format (YYYYMMDD or YYYYMMDDTHHMMSSZ)
function parseICalDate(dateStr: string): string {
  // Remove any VALUE=DATE: prefix
  dateStr = dateStr.replace(/^VALUE=DATE:/, '').replace(/^TZID=[^:]+:/, '');
  
  // Handle date-only format: YYYYMMDD
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  
  // Handle datetime format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  if (dateStr.includes('T')) {
    const datePart = dateStr.split('T')[0];
    return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
  }
  
  return dateStr;
}

// Parse iCal content and extract events
function parseICalContent(icalContent: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalContent.split(/\r?\n/);
  
  let currentEvent: Partial<ICalEvent> | null = null;
  let currentKey = '';
  let currentValue = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle line folding (continuation lines start with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i].slice(1);
    }
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);
    
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.uid && currentEvent.startDate && currentEvent.endDate) {
        events.push({
          uid: currentEvent.uid,
          summary: currentEvent.summary || 'Blocked',
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
        });
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (key === 'UID') {
        currentEvent.uid = value;
      } else if (key.startsWith('DTSTART')) {
        currentEvent.startDate = parseICalDate(value);
      } else if (key.startsWith('DTEND')) {
        currentEvent.endDate = parseICalDate(value);
      } else if (key === 'SUMMARY') {
        currentEvent.summary = value;
      }
    }
  }
  
  return events;
}

// Determine source from URL
function determineSource(url: string): string {
  if (url.includes('airbnb.com')) return 'airbnb';
  if (url.includes('vrbo.com') || url.includes('homeaway.com')) return 'vrbo';
  if (url.includes('booking.com')) return 'booking';
  return 'other';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { property_id, force_refresh = false } = await req.json();

    if (!property_id) {
      return new Response(
        JSON.stringify({ error: 'property_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing calendar for property: ${property_id}`);

    // Fetch property and verify ownership
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, host_id, ical_url, ical_last_synced_at')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      console.error('Property fetch error:', propertyError);
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns this property
    if (property.host_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to sync this property calendar' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!property.ical_url) {
      return new Response(
        JSON.stringify({ error: 'No iCal URL configured for this property' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Don't sync more than once per 5 minutes unless forced
    if (!force_refresh && property.ical_last_synced_at) {
      const lastSync = new Date(property.ical_last_synced_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastSync > fiveMinutesAgo) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Calendar was synced recently, skipping refresh',
            events_synced: 0,
            last_synced: property.ical_last_synced_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch iCal data
    console.log(`Fetching iCal from: ${property.ical_url}`);
    
    let icalContent: string;
    try {
      const icalResponse = await fetch(property.ical_url, {
        headers: {
          'User-Agent': 'Hostfluencer-Calendar-Sync/1.0',
        },
      });
      
      if (!icalResponse.ok) {
        throw new Error(`Failed to fetch iCal: ${icalResponse.status} ${icalResponse.statusText}`);
      }
      
      icalContent = await icalResponse.text();
    } catch (fetchError) {
      console.error('iCal fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch calendar data: ${fetchError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse iCal content
    const events = parseICalContent(icalContent);
    console.log(`Parsed ${events.length} events from iCal`);

    const source = determineSource(property.ical_url);

    // Delete existing events from this source for this property
    const { error: deleteError } = await supabase
      .from('property_calendar_events')
      .delete()
      .eq('property_id', property_id)
      .eq('source', source);

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }

    // Insert new events
    if (events.length > 0) {
      const eventsToInsert = events.map(event => ({
        property_id,
        event_uid: event.uid,
        title: event.summary,
        start_date: event.startDate,
        end_date: event.endDate,
        is_blocked: true,
        source,
      }));

      const { error: insertError } = await supabase
        .from('property_calendar_events')
        .upsert(eventsToInsert, { 
          onConflict: 'property_id,event_uid',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: `Failed to save calendar events: ${insertError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update last synced timestamp
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('properties')
      .update({ ical_last_synced_at: now })
      .eq('id', property_id);

    if (updateError) {
      console.error('Update timestamp error:', updateError);
    }

    console.log(`Successfully synced ${events.length} events`);

    return new Response(
      JSON.stringify({
        success: true,
        events_synced: events.length,
        last_synced: now,
        source,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
