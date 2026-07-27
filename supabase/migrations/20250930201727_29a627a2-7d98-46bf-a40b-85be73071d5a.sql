-- Create user_points table for tracking points and levels
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'Seedling',
  level_progress INTEGER NOT NULL DEFAULT 0 CHECK (level_progress >= 0 AND level_progress <= 100),
  points_to_next_level INTEGER NOT NULL DEFAULT 500,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create point_transactions table for tracking point history
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badge_progress table for tracking progress toward badges
CREATE TABLE IF NOT EXISTS public.badge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  target_progress INTEGER NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_achievements table for tracking all achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to badge_definitions
ALTER TABLE public.badge_definitions 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS prerequisites UUID[];

-- Add new column to user_badges
ALTER TABLE public.user_badges
  ADD COLUMN IF NOT EXISTS tier_level INTEGER DEFAULT 1;

-- Enable RLS on new tables
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON public.user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for point_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.point_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON public.point_transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for badge_progress
CREATE POLICY "Users can view their own progress"
  ON public.badge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage badge progress"
  ON public.badge_progress FOR ALL
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

-- Function to calculate level based on points
CREATE OR REPLACE FUNCTION public.calculate_user_level(points INTEGER)
RETURNS TABLE(level TEXT, progress INTEGER, points_to_next INTEGER) 
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  current_level TEXT;
  level_progress_val INTEGER;
  points_needed INTEGER;
BEGIN
  IF points < 500 THEN
    current_level := 'Seedling';
    level_progress_val := (points * 100) / 500;
    points_needed := 500 - points;
  ELSIF points < 1500 THEN
    current_level := 'Sprout';
    level_progress_val := ((points - 500) * 100) / 1000;
    points_needed := 1500 - points;
  ELSIF points < 3500 THEN
    current_level := 'Growing';
    level_progress_val := ((points - 1500) * 100) / 2000;
    points_needed := 3500 - points;
  ELSIF points < 7500 THEN
    current_level := 'Rising Star';
    level_progress_val := ((points - 3500) * 100) / 4000;
    points_needed := 7500 - points;
  ELSIF points < 15000 THEN
    current_level := 'Influencer';
    level_progress_val := ((points - 7500) * 100) / 7500;
    points_needed := 15000 - points;
  ELSE
    current_level := 'Elite Creator';
    level_progress_val := 100;
    points_needed := 0;
  END IF;
  
  RETURN QUERY SELECT current_level, level_progress_val, points_needed;
END;
$$;

-- Function to award points
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_new_total INTEGER;
  v_level_info RECORD;
BEGIN
  -- Create point transaction
  INSERT INTO point_transactions (user_id, points, action_type, related_id, related_type, description)
  VALUES (p_user_id, p_points, p_action_type, p_related_id, p_related_type, p_description)
  RETURNING id INTO v_transaction_id;
  
  -- Update or insert user points
  INSERT INTO user_points (user_id, total_points, lifetime_points)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + p_points,
    lifetime_points = user_points.lifetime_points + p_points,
    updated_at = now()
  RETURNING total_points INTO v_new_total;
  
  -- Calculate and update level
  SELECT * INTO v_level_info FROM calculate_user_level(v_new_total);
  
  UPDATE user_points
  SET 
    current_level = v_level_info.level,
    level_progress = v_level_info.progress,
    points_to_next_level = v_level_info.points_to_next
  WHERE user_id = p_user_id;
  
  RETURN v_transaction_id;
END;
$$;

-- Trigger to update badge progress timestamp
CREATE OR REPLACE FUNCTION public.update_badge_progress_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_badge_progress_updated_at
  BEFORE UPDATE ON public.badge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_badge_progress_timestamp();

-- Trigger to update user_points timestamp
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial badge definitions (only if they don't exist)
DO $$
BEGIN
  -- Engagement Badges
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'First Steps') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('First Steps', 'Submit your first application', '🎯', 'engagement', 'bronze', 50, '{"action": "applications_submitted", "count": 1}'::jsonb, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Application Streak') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Application Streak', 'Submit 5 applications', '🔥', 'engagement', 'silver', 100, '{"action": "applications_submitted", "count": 5}'::jsonb, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Application Pro') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Application Pro', 'Submit 10 applications', '⚡', 'engagement', 'gold', 200, '{"action": "applications_submitted", "count": 10}'::jsonb, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Application Master') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Application Master', 'Submit 25 applications', '💎', 'engagement', 'platinum', 500, '{"action": "applications_submitted", "count": 25}'::jsonb, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Social Connector') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Social Connector', 'Link all your social accounts', '🔗', 'engagement', 'bronze', 100, '{"action": "social_accounts_linked", "count": 3}'::jsonb, true, 5);
  END IF;
  
  -- Collaboration Badges
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'First Partnership') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('First Partnership', 'Complete your first collaboration', '🤝', 'collaboration', 'bronze', 200, '{"action": "collaborations_completed", "count": 1}'::jsonb, true, 10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Seasoned Pro') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Seasoned Pro', 'Complete 10 collaborations', '🌟', 'collaboration', 'gold', 500, '{"action": "collaborations_completed", "count": 10}'::jsonb, true, 12);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Collaboration Master') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Collaboration Master', 'Complete 25 collaborations', '👑', 'collaboration', 'platinum', 1000, '{"action": "collaborations_completed", "count": 25}'::jsonb, true, 13);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Perfect Partner') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Perfect Partner', 'Receive a 5-star review', '💫', 'collaboration', 'gold', 250, '{"action": "five_star_reviews", "count": 1}'::jsonb, true, 14);
  END IF;
  
  -- Content Creation Badges
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'First Post') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('First Post', 'Share your first content', '📸', 'content', 'bronze', 50, '{"action": "content_posts_created", "count": 1}'::jsonb, true, 20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Content Creator') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Content Creator', 'Post 10 pieces of content', '📹', 'content', 'silver', 150, '{"action": "content_posts_created", "count": 10}'::jsonb, true, 21);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Storyteller') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Storyteller', 'Post 50 pieces of content', '📚', 'content', 'gold', 500, '{"action": "content_posts_created", "count": 50}'::jsonb, true, 22);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Viral Content') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Viral Content', 'Get 10,000+ views on a post', '🚀', 'content', 'platinum', 300, '{"action": "viral_post", "views": 10000}'::jsonb, true, 23);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Engagement King') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Engagement King', 'Get 1,000+ likes on a post', '👑', 'content', 'gold', 250, '{"action": "popular_post", "likes": 1000}'::jsonb, true, 24);
  END IF;
  
  -- Community Badges
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Helpful Creator') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Helpful Creator', 'Receive 10 likes on your posts', '❤️', 'community', 'bronze', 50, '{"action": "total_likes_received", "count": 10}'::jsonb, true, 30);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Conversation Starter') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Conversation Starter', 'Get 50 comments on your posts', '💬', 'community', 'silver', 100, '{"action": "total_comments_received", "count": 50}'::jsonb, true, 31);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Brand Ambassador') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Brand Ambassador', 'Refer 5 users to the platform', '🎁', 'community', 'gold', 500, '{"action": "referrals_completed", "count": 5}'::jsonb, true, 32);
  END IF;
  
  -- Quality Badges
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Five Star Creator') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Five Star Creator', 'Maintain a 5-star rating', '⭐', 'quality', 'platinum', 400, '{"action": "average_rating", "rating": 5}'::jsonb, true, 40);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Reliable Partner') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Reliable Partner', 'Complete 10 collaborations on time', '✅', 'quality', 'gold', 300, '{"action": "on_time_deliveries", "count": 10}'::jsonb, true, 41);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM badge_definitions WHERE name = 'Professional') THEN
    INSERT INTO badge_definitions (name, description, icon, category, tier, points_reward, criteria, is_active, display_order)
    VALUES ('Professional', 'Never miss a deadline (20+ collaborations)', '💼', 'quality', 'platinum', 600, '{"action": "perfect_delivery_record", "count": 20}'::jsonb, true, 42);
  END IF;
END $$;