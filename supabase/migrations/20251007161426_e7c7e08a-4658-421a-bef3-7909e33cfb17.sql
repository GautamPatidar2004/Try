-- Create analytics_events table for tracking feature usage
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Create conversion_funnel_steps table
CREATE TABLE IF NOT EXISTS public.conversion_funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  time_spent_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_user_id ON public.conversion_funnel_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_step_name ON public.conversion_funnel_steps(step_name);

-- Create platform_metrics_snapshot table for daily aggregated metrics
CREATE TABLE IF NOT EXISTS public.platform_metrics_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  metrics_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON public.platform_metrics_snapshot(date DESC);

-- Enable RLS on all tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_metrics_snapshot ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for conversion_funnel_steps
CREATE POLICY "Admins can view all funnel steps"
  ON public.conversion_funnel_steps
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert funnel steps"
  ON public.conversion_funnel_steps
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for platform_metrics_snapshot
CREATE POLICY "Admins can manage metrics snapshots"
  ON public.platform_metrics_snapshot
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));