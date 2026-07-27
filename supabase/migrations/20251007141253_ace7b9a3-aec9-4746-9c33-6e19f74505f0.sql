-- Drop and recreate the update_badge_progress function with proper table-specific logic
DROP FUNCTION IF EXISTS public.update_badge_progress() CASCADE;

CREATE OR REPLACE FUNCTION public.update_badge_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_badge_record RECORD;
  v_current_count INTEGER;
  v_target_count INTEGER;
  v_progress_percentage INTEGER;
BEGIN
  -- Determine user_id based on the table being updated
  CASE TG_TABLE_NAME
    WHEN 'content_posts' THEN
      v_user_id := NEW.influencer_id;
    WHEN 'applications' THEN
      v_user_id := NEW.influencer_id;
    WHEN 'reviews_and_ratings' THEN
      v_user_id := NEW.reviewer_id;
    WHEN 'collaboration_agreements' THEN
      v_user_id := COALESCE(NEW.influencer_id, NEW.host_id);
    WHEN 'influencers' THEN
      v_user_id := NEW.id;
    WHEN 'profiles' THEN
      v_user_id := NEW.id;
    ELSE
      -- For any other table, try to get user_id if it exists
      v_user_id := NEW.id;
  END CASE;
  
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Loop through all active badges to check progress
  FOR v_badge_record IN 
    SELECT id, name, criteria, points_reward
    FROM badge_definitions
    WHERE is_active = true
  LOOP
    v_current_count := 0;
    v_target_count := 1;
    
    -- Check different badge types and calculate progress
    CASE 
      -- Application-based badges
      WHEN v_badge_record.name = 'First Steps' THEN
        SELECT COUNT(*) INTO v_current_count FROM applications WHERE influencer_id = v_user_id;
        v_target_count := 1;
        
      WHEN v_badge_record.name = 'Application Streak' THEN
        SELECT COUNT(*) INTO v_current_count FROM applications WHERE influencer_id = v_user_id;
        v_target_count := 5;
        
      -- Content-based badges
      WHEN v_badge_record.name = 'First Post' THEN
        SELECT COUNT(*) INTO v_current_count FROM content_posts WHERE influencer_id = v_user_id;
        v_target_count := 1;
        
      WHEN v_badge_record.name = 'Content Creator' THEN
        SELECT COUNT(*) INTO v_current_count FROM content_posts WHERE influencer_id = v_user_id;
        v_target_count := 10;
        
      -- Social connection badges - use influencers table
      WHEN v_badge_record.name = 'Social Connector' THEN
        SELECT 
          CASE WHEN instagram_url IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN tiktok_url IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN youtube_url IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN twitter_url IS NOT NULL THEN 1 ELSE 0 END
        INTO v_current_count
        FROM influencers 
        WHERE id = v_user_id;
        v_current_count := COALESCE(v_current_count, 0);
        v_target_count := 3;
        
      -- Collaboration badges
      WHEN v_badge_record.name = 'First Partnership' THEN
        SELECT COUNT(*) INTO v_current_count 
        FROM collaboration_agreements 
        WHERE (host_id = v_user_id OR influencer_id = v_user_id) AND status = 'active';
        v_target_count := 1;
        
      -- Review badges
      WHEN v_badge_record.name = 'First Review' THEN
        SELECT COUNT(*) INTO v_current_count FROM reviews_and_ratings WHERE reviewer_id = v_user_id;
        v_target_count := 1;
        
      ELSE
        CONTINUE;
    END CASE;
    
    -- Calculate progress percentage
    v_progress_percentage := LEAST((v_current_count * 100) / NULLIF(v_target_count, 0), 100);
    
    -- Update or insert badge progress
    INSERT INTO badge_progress (user_id, badge_id, current_progress, target_progress, progress_percentage)
    VALUES (v_user_id, v_badge_record.id, v_current_count, v_target_count, v_progress_percentage)
    ON CONFLICT (user_id, badge_id) DO UPDATE SET
      current_progress = v_current_count,
      progress_percentage = v_progress_percentage,
      last_updated = now();
    
    -- Award badge if progress is complete and not already earned
    IF v_progress_percentage >= 100 THEN
      IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = v_user_id AND badge_id = v_badge_record.id) THEN
        PERFORM award_badge(v_user_id, v_badge_record.name);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;