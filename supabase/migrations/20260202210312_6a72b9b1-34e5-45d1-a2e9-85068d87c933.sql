-- Add iCal sync columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS ical_url text,
ADD COLUMN IF NOT EXISTS ical_last_synced_at timestamptz,
ADD COLUMN IF NOT EXISTS ical_sync_enabled boolean DEFAULT false;

-- Create property_calendar_events table for storing synced calendar data
CREATE TABLE public.property_calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  event_uid text NOT NULL,
  title text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_blocked boolean DEFAULT true,
  source text DEFAULT 'airbnb',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(property_id, event_uid)
);

-- Create index for efficient calendar queries
CREATE INDEX idx_property_calendar_events_property_dates 
ON public.property_calendar_events(property_id, start_date, end_date);

-- Enable RLS
ALTER TABLE public.property_calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view calendar events for active properties
CREATE POLICY "Anyone can view calendar events for active properties"
ON public.property_calendar_events
FOR SELECT
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE is_active = true
  )
);

-- Policy: Hosts can manage their own property calendar events
CREATE POLICY "Hosts can manage their property calendar events"
ON public.property_calendar_events
FOR ALL
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE host_id = auth.uid()
  )
)
WITH CHECK (
  property_id IN (
    SELECT id FROM public.properties WHERE host_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_property_calendar_events_updated_at
BEFORE UPDATE ON public.property_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();