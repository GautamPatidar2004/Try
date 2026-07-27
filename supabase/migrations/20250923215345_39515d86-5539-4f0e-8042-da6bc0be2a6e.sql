-- Create badge definitions table
CREATE TABLE public.badge_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badge_definitions(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

-- Create onboarding progress table
CREATE TABLE public.onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_step INTEGER DEFAULT 1,
  completed_steps JSONB DEFAULT '[]',
  total_steps INTEGER DEFAULT 6,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_percentage INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Badge definitions policies
CREATE POLICY "Anyone can view active badge definitions"
ON public.badge_definitions FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage badge definitions"
ON public.badge_definitions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- User badges policies
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can award badges"
ON public.user_badges FOR INSERT
WITH CHECK (true);

-- Onboarding progress policies
CREATE POLICY "Users can manage their own onboarding progress"
ON public.onboarding_progress FOR ALL
USING (auth.uid() = user_id);

-- Insert default badge definitions
INSERT INTO public.badge_definitions (name, description, icon, criteria, display_order) VALUES
('Welcome Aboard', 'Started your journey with us!', '🎉', '{"step": "welcome"}', 1),
('Subscriber', 'Upgraded to a premium plan!', '⭐', '{"step": "subscription"}', 2),
('Profile Builder', 'Completed your basic profile!', '👤', '{"step": "profile"}', 3),
('Social Star', 'Connected your social accounts!', '📱', '{"step": "social"}', 4),
('Content Master', 'Set up your content preferences!', '🎯', '{"step": "preferences"}', 5),
('Collaboration Ready', 'Completed the full onboarding!', '🚀', '{"step": "complete"}', 6),
('Early Bird', 'Completed onboarding in first 24 hours!', '⚡', '{"step": "speed_bonus"}', 7);

-- Create function to award badges
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id UUID,
  p_badge_name TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id UUID;
  v_user_badge_id UUID;
BEGIN
  -- Get badge ID
  SELECT id INTO v_badge_id
  FROM badge_definitions
  WHERE name = p_badge_name AND is_active = true;
  
  IF v_badge_id IS NULL THEN
    RAISE EXCEPTION 'Badge not found: %', p_badge_name;
  END IF;
  
  -- Insert user badge (will fail if already exists due to unique constraint)
  INSERT INTO user_badges (user_id, badge_id, metadata)
  VALUES (p_user_id, v_badge_id, p_metadata)
  ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING id INTO v_user_badge_id;
  
  RETURN v_user_badge_id;
END;
$$;

-- Create function to update onboarding progress
CREATE OR REPLACE FUNCTION public.update_onboarding_progress(
  p_user_id UUID,
  p_step INTEGER,
  p_step_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed_steps JSONB;
  v_completion_percentage INTEGER;
  v_total_steps INTEGER := 6;
BEGIN
  -- Upsert onboarding progress
  INSERT INTO onboarding_progress (user_id, current_step, completed_steps, total_steps, last_activity_at)
  VALUES (p_user_id, p_step, jsonb_build_array(p_step), v_total_steps, now())
  ON CONFLICT (user_id) DO UPDATE SET
    current_step = GREATEST(onboarding_progress.current_step, p_step),
    completed_steps = (
      SELECT jsonb_agg(DISTINCT value)
      FROM (
        SELECT jsonb_array_elements(onboarding_progress.completed_steps) as value
        UNION
        SELECT to_jsonb(p_step) as value
      ) as combined
    ),
    last_activity_at = now(),
    metadata = onboarding_progress.metadata || p_step_data;
    
  -- Calculate completion percentage
  SELECT completed_steps INTO v_completed_steps
  FROM onboarding_progress
  WHERE user_id = p_user_id;
  
  v_completion_percentage := (jsonb_array_length(v_completed_steps) * 100) / v_total_steps;
  
  -- Update completion percentage and completed_at if finished
  UPDATE onboarding_progress
  SET 
    completion_percentage = v_completion_percentage,
    completed_at = CASE WHEN v_completion_percentage = 100 THEN now() ELSE completed_at END
  WHERE user_id = p_user_id;
  
  -- Award badges based on step completion
  CASE p_step
    WHEN 1 THEN PERFORM award_badge(p_user_id, 'Welcome Aboard');
    WHEN 2 THEN PERFORM award_badge(p_user_id, 'Subscriber');
    WHEN 3 THEN PERFORM award_badge(p_user_id, 'Profile Builder');
    WHEN 4 THEN PERFORM award_badge(p_user_id, 'Social Star');
    WHEN 5 THEN PERFORM award_badge(p_user_id, 'Content Master');
    WHEN 6 THEN 
      PERFORM award_badge(p_user_id, 'Collaboration Ready');
      -- Check if completed within 24 hours for Early Bird badge
      IF EXISTS (
        SELECT 1 FROM onboarding_progress 
        WHERE user_id = p_user_id 
        AND started_at > now() - INTERVAL '24 hours'
      ) THEN
        PERFORM award_badge(p_user_id, 'Early Bird');
      END IF;
  END CASE;
END;
$$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_badge_definitions_updated_at
    BEFORE UPDATE ON public.badge_definitions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();