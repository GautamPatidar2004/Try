-- First delete user badges that reference the badges we want to remove
DELETE FROM user_badges 
WHERE badge_id IN (
  SELECT id FROM badge_definitions 
  WHERE name IN ('Subscriber', 'Social Star', 'Content Master')
);

-- Now delete the badge definitions
DELETE FROM badge_definitions WHERE name IN ('Subscriber', 'Social Star', 'Content Master');

-- Update onboarding progress to use 3 steps instead of 6
UPDATE onboarding_progress SET total_steps = 3 WHERE total_steps = 6;

-- Update the badge descriptions to match the new 3-step flow
UPDATE badge_definitions 
SET description = 'Completed the welcome and profile setup step' 
WHERE name = 'Welcome Aboard';

UPDATE badge_definitions 
SET description = 'Connected social accounts and chose a plan' 
WHERE name = 'Profile Builder';

UPDATE badge_definitions 
SET description = 'Completed all onboarding steps and ready to collaborate' 
WHERE name = 'Collaboration Ready';

-- Update the onboarding function to use 3 steps and correct badge awarding
CREATE OR REPLACE FUNCTION public.update_onboarding_progress(p_user_id uuid, p_step integer, p_step_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_completed_steps JSONB;
  v_completion_percentage INTEGER;
  v_total_steps INTEGER := 3; -- Changed to 3 steps
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
  
  -- Award badges based on step completion (streamlined to 3 steps)
  CASE p_step
    WHEN 1 THEN PERFORM award_badge(p_user_id, 'Welcome Aboard');
    WHEN 2 THEN PERFORM award_badge(p_user_id, 'Profile Builder');
    WHEN 3 THEN 
      PERFORM award_badge(p_user_id, 'Collaboration Ready');
      -- Check if completed within 24 hours for Early Bird badge (if it exists)
      IF EXISTS (
        SELECT 1 FROM onboarding_progress 
        WHERE user_id = p_user_id 
        AND started_at > now() - INTERVAL '24 hours'
      ) THEN
        -- Only award if the badge exists
        IF EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Early Bird' AND is_active = true) THEN
          PERFORM award_badge(p_user_id, 'Early Bird');
        END IF;
      END IF;
  END CASE;
END;
$function$;