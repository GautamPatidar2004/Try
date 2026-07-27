-- Create brand_campaigns table for browseable brand deals
CREATE TABLE brand_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Brand Information
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  brand_website TEXT,
  brand_description TEXT,
  
  -- Campaign Details
  campaign_title TEXT NOT NULL,
  campaign_description TEXT NOT NULL,
  campaign_brief_url TEXT,
  
  -- Requirements
  required_niches TEXT[] DEFAULT '{}',
  min_followers INTEGER DEFAULT 0,
  max_followers INTEGER,
  required_platforms TEXT[] DEFAULT '{}',
  min_engagement_rate NUMERIC(5,2),
  
  -- Deliverables & Timeline
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  content_requirements TEXT[] DEFAULT '{}',
  timeline_start DATE,
  timeline_end DATE,
  application_deadline DATE,
  
  -- Compensation
  compensation_type TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  currency TEXT DEFAULT 'usd',
  product_value INTEGER,
  
  -- Status & Metadata
  status TEXT DEFAULT 'open',
  spots_available INTEGER DEFAULT 1,
  spots_filled INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'public',
  
  -- Tracking
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_brand_campaigns_status ON brand_campaigns(status);
CREATE INDEX idx_brand_campaigns_niches ON brand_campaigns USING GIN(required_niches);
CREATE INDEX idx_brand_campaigns_platforms ON brand_campaigns USING GIN(required_platforms);
CREATE INDEX idx_brand_campaigns_deadline ON brand_campaigns(application_deadline);

-- Create brand_campaign_applications table
CREATE TABLE brand_campaign_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES brand_campaigns(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE NOT NULL,
  
  -- Application Details
  cover_letter TEXT,
  proposed_content_ideas TEXT,
  portfolio_urls TEXT[] DEFAULT '{}',
  previous_brand_work TEXT[],
  
  -- Metrics at time of application
  follower_count_snapshot INTEGER,
  engagement_rate_snapshot NUMERIC(5,2),
  
  -- Status
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX idx_campaign_applications_campaign ON brand_campaign_applications(campaign_id);
CREATE INDEX idx_campaign_applications_influencer ON brand_campaign_applications(influencer_id);
CREATE INDEX idx_campaign_applications_status ON brand_campaign_applications(status);

-- Create brand_campaign_saved table
CREATE TABLE brand_campaign_saved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES brand_campaigns(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, influencer_id)
);

-- RLS Policies for brand_campaigns
ALTER TABLE brand_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open brand campaigns"
ON brand_campaigns FOR SELECT
TO authenticated
USING (status = 'open' AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins can manage brand campaigns"
ON brand_campaigns FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for brand_campaign_applications
ALTER TABLE brand_campaign_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers can create applications"
ON brand_campaign_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Influencers can view own applications"
ON brand_campaign_applications FOR SELECT
TO authenticated
USING (auth.uid() = influencer_id);

CREATE POLICY "Influencers can update pending applications"
ON brand_campaign_applications FOR UPDATE
TO authenticated
USING (auth.uid() = influencer_id AND status = 'pending');

CREATE POLICY "Admins can manage all applications"
ON brand_campaign_applications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for brand_campaign_saved
ALTER TABLE brand_campaign_saved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved campaigns"
ON brand_campaign_saved FOR ALL
TO authenticated
USING (auth.uid() = influencer_id)
WITH CHECK (auth.uid() = influencer_id);

-- Function to increment campaign views
CREATE OR REPLACE FUNCTION increment_campaign_views(campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE brand_campaigns
  SET views_count = views_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update applications count
CREATE OR REPLACE FUNCTION update_campaign_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE brand_campaigns
    SET applications_count = applications_count + 1,
        spots_filled = CASE 
          WHEN NEW.status = 'accepted' THEN spots_filled + 1
          ELSE spots_filled
        END
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE brand_campaigns
    SET applications_count = applications_count - 1,
        spots_filled = CASE 
          WHEN OLD.status = 'accepted' THEN spots_filled - 1
          ELSE spots_filled
        END
    WHERE id = OLD.campaign_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    UPDATE brand_campaigns
    SET spots_filled = spots_filled + 
        CASE 
          WHEN NEW.status = 'accepted' AND OLD.status != 'accepted' THEN 1
          WHEN OLD.status = 'accepted' AND NEW.status != 'accepted' THEN -1
          ELSE 0
        END
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_applications_count_trigger
AFTER INSERT OR DELETE OR UPDATE ON brand_campaign_applications
FOR EACH ROW EXECUTE FUNCTION update_campaign_applications_count();

-- Insert sample brand campaigns
INSERT INTO brand_campaigns (
  brand_name, brand_logo_url, brand_description,
  campaign_title, campaign_description,
  required_niches, min_followers, required_platforms,
  deliverables, timeline_start, timeline_end, application_deadline,
  compensation_type, budget_min, budget_max,
  spots_available, status
) VALUES
(
  'Adventure Gear Co',
  'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=200&h=200&fit=crop',
  'Leading outdoor adventure equipment brand',
  'Summer Adventure Campaign',
  'We''re looking for travel and adventure influencers to showcase our new summer collection. Create engaging content featuring our gear in stunning outdoor locations.',
  ARRAY['travel', 'adventure', 'outdoors'],
  10000,
  ARRAY['instagram', 'tiktok'],
  ARRAY['1 Instagram Reel', '3 Instagram Stories', '1 TikTok Video'],
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '37 days',
  CURRENT_DATE + INTERVAL '14 days',
  'paid',
  500,
  1000,
  5,
  'open'
),
(
  'EcoStyle Fashion',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
  'Sustainable fashion for conscious consumers',
  'Sustainable Fashion Collaboration',
  'Join us in promoting sustainable fashion! We''re seeking fashion influencers who care about the environment to feature our eco-friendly clothing line.',
  ARRAY['fashion', 'sustainability', 'lifestyle'],
  25000,
  ARRAY['instagram', 'youtube'],
  ARRAY['2 Instagram Posts', '5 Stories', '1 YouTube Short'],
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '40 days',
  CURRENT_DATE + INTERVAL '7 days',
  'hybrid',
  300,
  500,
  3,
  'open'
),
(
  'FitLife Nutrition',
  'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=200&h=200&fit=crop',
  'Premium health supplements and nutrition',
  'Fitness Transformation Series',
  'Partner with us for a 30-day fitness transformation series. We''ll provide supplements and you create content documenting your journey and results.',
  ARRAY['fitness', 'health', 'wellness'],
  15000,
  ARRAY['instagram', 'tiktok', 'youtube'],
  ARRAY['8 Instagram Reels', '15 Stories', '3 TikTok Videos', '1 YouTube Video'],
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '10 days',
  'paid',
  1500,
  2000,
  2,
  'open'
),
(
  'TechNova',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=200&fit=crop',
  'Innovative consumer electronics',
  'Smart Home Device Review',
  'Review our latest smart home products and show how they integrate into daily life. Perfect for tech enthusiasts and lifestyle creators.',
  ARRAY['technology', 'lifestyle', 'smart home'],
  20000,
  ARRAY['youtube', 'instagram'],
  ARRAY['1 YouTube Review Video', '2 Instagram Reels', '5 Stories'],
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  CURRENT_DATE + INTERVAL '12 days',
  'product',
  NULL,
  NULL,
  4,
  'open'
),
(
  'Gourmet Bites',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
  'Premium meal delivery service',
  'Food Influencer Partnership',
  'Showcase our gourmet meal kits with beautiful food photography and cooking videos. Looking for food creators with aesthetic content style.',
  ARRAY['food', 'cooking', 'lifestyle'],
  30000,
  ARRAY['instagram', 'tiktok'],
  ARRAY['3 Instagram Feed Posts', '6 Stories', '2 TikTok Videos'],
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '50 days',
  CURRENT_DATE + INTERVAL '15 days',
  'paid',
  800,
  1200,
  6,
  'open'
);