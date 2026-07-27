
-- Create saved_segments table
CREATE TABLE public.saved_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  filter_json JSONB NOT NULL DEFAULT '{}',
  is_smart BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage saved_segments"
  ON public.saved_segments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_saved_segments_updated_at
  BEFORE UPDATE ON public.saved_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create automation_flows table
CREATE TABLE public.automation_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'user_signup', 'profile_incomplete', 'inactive_days', 'manual'
  trigger_config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive'
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation_flows"
  ON public.automation_flows FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_automation_flows_updated_at
  BEFORE UPDATE ON public.automation_flows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create automation_steps table
CREATE TABLE public.automation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.automation_flows(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL, -- 'send_email', 'send_notification', 'wait', 'condition'
  step_config JSONB NOT NULL DEFAULT '{}',
  delay_hours INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation_steps"
  ON public.automation_steps FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create automation_enrollments table
CREATE TABLE public.automation_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES public.automation_flows(id) ON DELETE CASCADE,
  current_step_id UUID REFERENCES public.automation_steps(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'exited'
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_step_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, flow_id)
);

ALTER TABLE public.automation_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation_enrollments"
  ON public.automation_enrollments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add category column to communication_templates
ALTER TABLE public.communication_templates
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'custom';
