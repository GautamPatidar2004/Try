-- Create function to generate ambassador notifications
CREATE OR REPLACE FUNCTION create_ambassador_notification()
RETURNS TRIGGER AS $$
DECLARE
  ambassador_user_id UUID;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  referral_count INTEGER;
BEGIN
  -- Get the user_id from ambassador_members
  SELECT user_id INTO ambassador_user_id
  FROM ambassador_members WHERE id = NEW.ambassador_id;

  IF ambassador_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'ambassador_referrals' THEN
    IF TG_OP = 'INSERT' THEN
      notification_type := 'ambassador_new_referral';
      notification_title := 'New Referral Click!';
      notification_message := 'Someone used your referral link. Keep sharing to convert them!';
      
      -- Check for milestone achievements
      SELECT COUNT(*) INTO referral_count
      FROM ambassador_referrals WHERE ambassador_id = NEW.ambassador_id;
      
      IF referral_count IN (5, 10, 25, 50, 100, 250, 500) THEN
        INSERT INTO notifications (user_id, type, title, message, related_id)
        VALUES (ambassador_user_id, 'ambassador_milestone', 'Milestone Reached!', 
                'You have referred ' || referral_count || ' creators! Keep up the great work!', NEW.id);
      END IF;
      
    ELSIF TG_OP = 'UPDATE' AND NEW.conversion_stage IS DISTINCT FROM OLD.conversion_stage THEN
      CASE NEW.conversion_stage
        WHEN 'signup' THEN
          notification_type := 'ambassador_signup';
          notification_title := 'New Signup!';
          notification_message := 'A new creator signed up through your link!';
        WHEN 'subscribed' THEN
          notification_type := 'ambassador_subscription';
          notification_title := 'You Earned Commission!';
          notification_message := 'Your referral just subscribed! Check your earnings.';
        ELSE
          RETURN NEW;
      END CASE;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  IF notification_type IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (ambassador_user_id, notification_type, notification_title, notification_message, NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function for tier change notifications
CREATE OR REPLACE FUNCTION notify_ambassador_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_tier IS DISTINCT FROM OLD.current_tier THEN
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (NEW.user_id, 'ambassador_tier_change', 'Tier Update!', 
            'Congratulations! You have been promoted to ' || NEW.current_tier || ' tier!', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function for requirement update notifications
CREATE OR REPLACE FUNCTION notify_ambassador_requirement_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.monthly_requirements_met IS DISTINCT FROM OLD.monthly_requirements_met THEN
    IF NEW.monthly_requirements_met = true THEN
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES (NEW.user_id, 'ambassador_requirement_update', 'Requirements Met!', 
              'You have met this month''s posting requirements! Great job!', NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS ambassador_referral_notification ON ambassador_referrals;
CREATE TRIGGER ambassador_referral_notification
AFTER INSERT OR UPDATE ON ambassador_referrals
FOR EACH ROW EXECUTE FUNCTION create_ambassador_notification();

DROP TRIGGER IF EXISTS ambassador_tier_change_notification ON ambassador_members;
CREATE TRIGGER ambassador_tier_change_notification
AFTER UPDATE ON ambassador_members
FOR EACH ROW EXECUTE FUNCTION notify_ambassador_tier_change();

DROP TRIGGER IF EXISTS ambassador_requirement_notification ON ambassador_members;
CREATE TRIGGER ambassador_requirement_notification
AFTER UPDATE ON ambassador_members
FOR EACH ROW EXECUTE FUNCTION notify_ambassador_requirement_update();