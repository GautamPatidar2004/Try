-- Create badge_challenges table to track challenge acceptance and progress
CREATE TABLE IF NOT EXISTS badge_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  steps_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badge_challenges ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own challenges
CREATE POLICY "Users can view own challenges" ON badge_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenges" ON badge_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON badge_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to auto-award badge when progress reaches 100%
CREATE OR REPLACE FUNCTION check_and_award_badge()
RETURNS TRIGGER AS $$
BEGIN
  -- If progress reaches 100%
  IF NEW.progress_percentage >= 100 THEN
    -- Check if badge not already earned
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = NEW.user_id 
      AND badge_id = NEW.badge_id
    ) THEN
      -- Award the badge
      PERFORM award_badge(
        NEW.user_id,
        (SELECT name FROM badge_definitions WHERE id = NEW.badge_id),
        jsonb_build_object('auto_awarded', true)
      );
      
      -- Update challenge status
      UPDATE badge_challenges
      SET status = 'completed',
          completed_at = NOW()
      WHERE user_id = NEW.user_id
      AND badge_id = NEW.badge_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS auto_award_badge_on_progress ON badge_progress;
CREATE TRIGGER auto_award_badge_on_progress
  AFTER UPDATE ON badge_progress
  FOR EACH ROW
  WHEN (NEW.progress_percentage >= 100 AND OLD.progress_percentage < 100)
  EXECUTE FUNCTION check_and_award_badge();

-- Enable realtime for badge_progress
ALTER PUBLICATION supabase_realtime ADD TABLE badge_progress;