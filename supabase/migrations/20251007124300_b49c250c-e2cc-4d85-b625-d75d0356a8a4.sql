-- Step 1: Modify award_badge to also award points
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id uuid, 
  p_badge_name text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_badge_id UUID;
  v_user_badge_id UUID;
  v_points_reward INTEGER;
BEGIN
  -- Get badge ID and points reward
  SELECT id, points_reward INTO v_badge_id, v_points_reward
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
  
  -- Only award points if badge was just earned (not already owned)
  IF v_user_badge_id IS NOT NULL AND v_points_reward > 0 THEN
    PERFORM award_points(
      p_user_id,
      v_points_reward,
      'badge_earned',
      'Earned badge: ' || p_badge_name,
      v_user_badge_id,
      'badge'
    );
  END IF;
  
  RETURN v_user_badge_id;
END;
$function$;

-- Step 2: Create badge progress tracking function
CREATE OR REPLACE FUNCTION public.update_badge_progress()
RETURNS TRIGGER
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
  v_user_id := COALESCE(NEW.influencer_id, NEW.user_id, NEW.reviewer_id);
  
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
        
      -- Social connection badges
      WHEN v_badge_record.name = 'Social Connector' THEN
        SELECT COUNT(*) INTO v_current_count FROM social_accounts WHERE influencer_id = v_user_id;
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

-- Step 3: Create triggers on relevant tables
DROP TRIGGER IF EXISTS update_badge_progress_on_application ON applications;
CREATE TRIGGER update_badge_progress_on_application
AFTER INSERT OR UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

DROP TRIGGER IF EXISTS update_badge_progress_on_content ON content_posts;
CREATE TRIGGER update_badge_progress_on_content
AFTER INSERT OR UPDATE ON content_posts
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

DROP TRIGGER IF EXISTS update_badge_progress_on_social ON social_accounts;
CREATE TRIGGER update_badge_progress_on_social
AFTER INSERT OR UPDATE ON social_accounts
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

DROP TRIGGER IF EXISTS update_badge_progress_on_collaboration ON collaboration_agreements;
CREATE TRIGGER update_badge_progress_on_collaboration
AFTER INSERT OR UPDATE ON collaboration_agreements
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

DROP TRIGGER IF EXISTS update_badge_progress_on_review ON reviews_and_ratings;
CREATE TRIGGER update_badge_progress_on_review
AFTER INSERT OR UPDATE ON reviews_and_ratings
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

-- Step 4: Create retroactive badge checker function
CREATE OR REPLACE FUNCTION public.sync_user_badges(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_applications_count INTEGER;
  v_content_count INTEGER;
  v_social_count INTEGER;
  v_collaborations_count INTEGER;
  v_reviews_count INTEGER;
  v_badges_awarded INTEGER := 0;
  v_points_awarded INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Get current counts
  SELECT COUNT(*) INTO v_applications_count FROM applications WHERE influencer_id = p_user_id;
  SELECT COUNT(*) INTO v_content_count FROM content_posts WHERE influencer_id = p_user_id;
  SELECT COUNT(*) INTO v_social_count FROM social_accounts WHERE influencer_id = p_user_id;
  SELECT COUNT(*) INTO v_collaborations_count FROM collaboration_agreements 
    WHERE (host_id = p_user_id OR influencer_id = p_user_id) AND status = 'active';
  SELECT COUNT(*) INTO v_reviews_count FROM reviews_and_ratings WHERE reviewer_id = p_user_id;
  
  -- Award application badges
  IF v_applications_count >= 1 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'First Steps') THEN
      PERFORM award_badge(p_user_id, 'First Steps');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  IF v_applications_count >= 5 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'Application Streak') THEN
      PERFORM award_badge(p_user_id, 'Application Streak');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  -- Award content badges
  IF v_content_count >= 1 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'First Post') THEN
      PERFORM award_badge(p_user_id, 'First Post');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  IF v_content_count >= 10 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'Content Creator') THEN
      PERFORM award_badge(p_user_id, 'Content Creator');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  -- Award social badges
  IF v_social_count >= 3 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'Social Connector') THEN
      PERFORM award_badge(p_user_id, 'Social Connector');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  -- Award collaboration badges
  IF v_collaborations_count >= 1 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'First Partnership') THEN
      PERFORM award_badge(p_user_id, 'First Partnership');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  -- Award review badges
  IF v_reviews_count >= 1 THEN
    IF NOT EXISTS (SELECT 1 FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id 
                   WHERE ub.user_id = p_user_id AND bd.name = 'First Review') THEN
      PERFORM award_badge(p_user_id, 'First Review');
      v_badges_awarded := v_badges_awarded + 1;
    END IF;
  END IF;
  
  -- Update badge progress for all badges
  PERFORM update_badge_progress() FROM (
    SELECT p_user_id as user_id
  ) as trigger_row;
  
  -- Calculate total points awarded
  SELECT COALESCE(SUM(bd.points_reward), 0) INTO v_points_awarded
  FROM user_badges ub
  JOIN badge_definitions bd ON ub.badge_id = bd.id
  WHERE ub.user_id = p_user_id;
  
  -- Return summary
  v_result := jsonb_build_object(
    'badges_awarded', v_badges_awarded,
    'total_points', v_points_awarded,
    'applications', v_applications_count,
    'content_posts', v_content_count,
    'social_accounts', v_social_count,
    'collaborations', v_collaborations_count,
    'reviews', v_reviews_count
  );
  
  RETURN v_result;
END;
$function$;