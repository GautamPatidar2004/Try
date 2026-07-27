-- Create creator_goals table for goal tracking
CREATE TABLE IF NOT EXISTS creator_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'followers', 'engagement_rate', 'earnings', 'content_count'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create benchmark_data table for industry benchmarks
CREATE TABLE IF NOT EXISTS benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche TEXT NOT NULL,
  follower_range TEXT NOT NULL, -- '0-10k', '10k-50k', '50k-100k', '100k-500k', '500k+'
  platform TEXT NOT NULL,
  avg_engagement_rate NUMERIC(5,2),
  avg_post_frequency INTEGER,
  avg_story_views INTEGER,
  avg_reel_plays INTEGER,
  avg_collaboration_rate INTEGER, -- per month
  avg_rate_per_post INTEGER,
  data_points_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create media_kits table for generated media kits
CREATE TABLE IF NOT EXISTS media_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bio TEXT,
  stats_snapshot JSONB DEFAULT '{}',
  top_content JSONB DEFAULT '[]',
  rate_card JSONB DEFAULT '{}',
  collaboration_examples JSONB DEFAULT '[]',
  pdf_url TEXT,
  is_public BOOLEAN DEFAULT false,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_creator_goals_influencer ON creator_goals(influencer_id);
CREATE INDEX IF NOT EXISTS idx_creator_goals_status ON creator_goals(status);
CREATE INDEX IF NOT EXISTS idx_benchmark_data_niche ON benchmark_data(niche);
CREATE INDEX IF NOT EXISTS idx_benchmark_data_platform ON benchmark_data(platform);
CREATE INDEX IF NOT EXISTS idx_media_kits_influencer ON media_kits(influencer_id);

-- Enable RLS
ALTER TABLE creator_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_kits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_goals
CREATE POLICY "Users can manage their own goals"
  ON creator_goals FOR ALL
  USING (auth.uid() = influencer_id)
  WITH CHECK (auth.uid() = influencer_id);

-- RLS Policies for benchmark_data
CREATE POLICY "Anyone can view benchmark data"
  ON benchmark_data FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage benchmark data"
  ON benchmark_data FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for media_kits
CREATE POLICY "Users can manage their own media kits"
  ON media_kits FOR ALL
  USING (auth.uid() = influencer_id)
  WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Anyone can view public media kits"
  ON media_kits FOR SELECT
  USING (is_public = true);

-- Create update trigger for creator_goals
CREATE TRIGGER update_creator_goals_updated_at
  BEFORE UPDATE ON creator_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_kits_updated_at
  BEFORE UPDATE ON media_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();