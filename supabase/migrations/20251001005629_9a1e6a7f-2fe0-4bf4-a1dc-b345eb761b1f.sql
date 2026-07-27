-- Create AI match scores table
CREATE TABLE public.ai_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB DEFAULT '[]'::jsonb,
  ai_recommendation TEXT,
  calculation_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(influencer_id, property_id)
);

-- Enable RLS
ALTER TABLE public.ai_match_scores ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own matches (influencers see their property matches)
CREATE POLICY "Influencers can view their own matches"
ON public.ai_match_scores
FOR SELECT
USING (auth.uid() = influencer_id);

-- Allow hosts to view matches for their properties
CREATE POLICY "Hosts can view matches for their properties"
ON public.ai_match_scores
FOR SELECT
USING (
  auth.uid() IN (
    SELECT host_id FROM public.properties WHERE id = property_id
  )
);

-- System can manage all match scores
CREATE POLICY "System can manage all match scores"
ON public.ai_match_scores
FOR ALL
USING (true);

-- Create index for faster queries
CREATE INDEX idx_ai_match_scores_influencer ON public.ai_match_scores(influencer_id);
CREATE INDEX idx_ai_match_scores_property ON public.ai_match_scores(property_id);
CREATE INDEX idx_ai_match_scores_score ON public.ai_match_scores(match_score DESC);

-- Create updated_at trigger
CREATE TRIGGER update_ai_match_scores_updated_at
BEFORE UPDATE ON public.ai_match_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();