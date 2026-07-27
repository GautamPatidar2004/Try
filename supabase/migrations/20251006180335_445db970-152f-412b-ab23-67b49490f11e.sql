-- Create match_interactions table to track user swipes/likes
CREATE TABLE IF NOT EXISTS public.match_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.ai_match_scores(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, match_id)
);

-- Enable RLS
ALTER TABLE public.match_interactions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own interactions
CREATE POLICY "Users can manage their own interactions"
ON public.match_interactions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_match_interactions_user_id ON public.match_interactions(user_id);
CREATE INDEX idx_match_interactions_action ON public.match_interactions(action);
CREATE INDEX idx_match_interactions_created_at ON public.match_interactions(created_at DESC);

-- Function to detect mutual matches
CREATE OR REPLACE FUNCTION public.check_mutual_match(
  p_user_id UUID,
  p_other_user_id UUID,
  p_property_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_liked BOOLEAN;
  v_other_liked BOOLEAN;
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
  
  RETURN v_user_liked AND v_other_liked;
END;
$$;