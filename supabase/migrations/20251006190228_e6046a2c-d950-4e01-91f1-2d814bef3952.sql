-- Create mutual_matches table to store matched user pairs
CREATE TABLE mutual_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  match_score INTEGER,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  conversation_started BOOLEAN DEFAULT false,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  match_context JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user1_id, user2_id, property_id),
  CHECK (user1_id < user2_id)
);

-- Enable RLS
ALTER TABLE mutual_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own mutual matches"
  ON mutual_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create mutual matches"
  ON mutual_matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their match interactions"
  ON mutual_matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Indexes for performance
CREATE INDEX idx_mutual_matches_user1 ON mutual_matches(user1_id);
CREATE INDEX idx_mutual_matches_user2 ON mutual_matches(user2_id);
CREATE INDEX idx_mutual_matches_conversation ON mutual_matches(conversation_started);

-- Drop and recreate check_mutual_match function to return match details
DROP FUNCTION IF EXISTS public.check_mutual_match(uuid, uuid, uuid);

CREATE FUNCTION public.check_mutual_match(
  p_user_id uuid,
  p_other_user_id uuid,
  p_property_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_liked BOOLEAN;
  v_other_liked BOOLEAN;
  v_match_result JSONB;
  v_user1_id UUID;
  v_user2_id UUID;
  v_match_score INTEGER;
BEGIN
  -- Check if current user liked
  SELECT EXISTS(
    SELECT 1 FROM match_interactions
    WHERE user_id = p_user_id
    AND (property_id = p_property_id OR influencer_id = p_other_user_id)
    AND action = 'like'
  ) INTO v_user_liked;
  
  -- Check if other user liked
  SELECT EXISTS(
    SELECT 1 FROM match_interactions
    WHERE user_id = p_other_user_id
    AND (property_id = p_property_id OR influencer_id = p_user_id)
    AND action = 'like'
  ) INTO v_other_liked;
  
  -- If mutual match, get details and store it
  IF v_user_liked AND v_other_liked THEN
    -- Order user IDs alphabetically for uniqueness
    IF p_user_id < p_other_user_id THEN
      v_user1_id := p_user_id;
      v_user2_id := p_other_user_id;
    ELSE
      v_user1_id := p_other_user_id;
      v_user2_id := p_user_id;
    END IF;
    
    -- Get match score if available
    SELECT match_score INTO v_match_score
    FROM ai_match_scores
    WHERE (influencer_id = p_user_id AND property_id = p_property_id)
       OR (influencer_id = p_other_user_id AND property_id = p_property_id)
    LIMIT 1;
    
    -- Insert mutual match (or update if exists)
    INSERT INTO mutual_matches (user1_id, user2_id, property_id, match_score)
    VALUES (v_user1_id, v_user2_id, p_property_id, v_match_score)
    ON CONFLICT (user1_id, user2_id, property_id) 
    DO UPDATE SET last_interaction_at = now();
    
    -- Return match details
    v_match_result := jsonb_build_object(
      'is_match', true,
      'match_score', v_match_score,
      'matched_user_id', p_other_user_id,
      'property_id', p_property_id
    );
  ELSE
    v_match_result := jsonb_build_object('is_match', false);
  END IF;
  
  RETURN v_match_result;
END;
$$;