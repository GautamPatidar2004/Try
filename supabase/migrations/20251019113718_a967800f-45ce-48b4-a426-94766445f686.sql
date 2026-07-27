-- Create AI recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  dismissed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Create content intelligence reports table
CREATE TABLE public.content_intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intelligence_data JSONB NOT NULL DEFAULT '{}',
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_intelligence_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.ai_recommendations
  FOR SELECT
  USING (auth.uid() = influencer_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.ai_recommendations
  FOR UPDATE
  USING (auth.uid() = influencer_id);

CREATE POLICY "System can insert recommendations"
  ON public.ai_recommendations
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for content_intelligence_reports
CREATE POLICY "Users can view their own reports"
  ON public.content_intelligence_reports
  FOR SELECT
  USING (auth.uid() = influencer_id);

CREATE POLICY "System can insert reports"
  ON public.content_intelligence_reports
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_ai_recommendations_influencer ON public.ai_recommendations(influencer_id);
CREATE INDEX idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_expires ON public.ai_recommendations(expires_at);
CREATE INDEX idx_intelligence_reports_influencer ON public.content_intelligence_reports(influencer_id);
CREATE INDEX idx_intelligence_reports_valid ON public.content_intelligence_reports(valid_until);