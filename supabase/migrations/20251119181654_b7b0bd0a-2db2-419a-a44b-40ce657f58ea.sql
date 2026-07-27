-- Create ambassador program tables

-- Ambassador membership
CREATE TABLE ambassador_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
  referral_code TEXT UNIQUE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  payment_method JSONB DEFAULT '{}',
  monthly_requirements_met BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Creator referral tracking
CREATE TABLE ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassador_members(id) NOT NULL,
  referred_user_id UUID REFERENCES profiles(id) NOT NULL,
  subscription_tier TEXT,
  signup_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  commission_rate DECIMAL DEFAULT 0.20,
  total_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Collaboration tracking (property and restaurant/experience)
CREATE TABLE ambassador_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassador_members(id) NOT NULL,
  collaboration_id UUID REFERENCES collaboration_agreements(id),
  type TEXT NOT NULL CHECK (type IN ('property', 'restaurant', 'experience')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid', 'disputed')),
  flat_fee_amount DECIMAL NOT NULL,
  payment_date TIMESTAMPTZ,
  net30_due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Earnings history
CREATE TABLE ambassador_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassador_members(id) NOT NULL,
  earning_type TEXT NOT NULL CHECK (earning_type IN ('recurring', 'collaboration')),
  amount DECIMAL NOT NULL,
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing assets library
CREATE TABLE ambassador_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('instagram_story', 'instagram_post', 'email_template', 'pitch_deck', 'video', 'badge', 'other')),
  file_url TEXT NOT NULL,
  preview_url TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly content requirements tracking
CREATE TABLE ambassador_content_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassador_members(id) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  stories_count INTEGER DEFAULT 0,
  feed_posts_count INTEGER DEFAULT 0,
  content_urls JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ambassador_id, month, year)
);

-- Enable RLS
ALTER TABLE ambassador_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_content_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ambassador_members
CREATE POLICY "Users can view their own ambassador profile"
  ON ambassador_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ambassador profile"
  ON ambassador_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ambassador profile"
  ON ambassador_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ambassador profiles"
  ON ambassador_members FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ambassador_referrals
CREATE POLICY "Ambassadors can view their own referrals"
  ON ambassador_referrals FOR SELECT
  USING (ambassador_id IN (SELECT id FROM ambassador_members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert referrals"
  ON ambassador_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all referrals"
  ON ambassador_referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ambassador_collaborations
CREATE POLICY "Ambassadors can view their own collaborations"
  ON ambassador_collaborations FOR SELECT
  USING (ambassador_id IN (SELECT id FROM ambassador_members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert collaborations"
  ON ambassador_collaborations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all collaborations"
  ON ambassador_collaborations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ambassador_earnings
CREATE POLICY "Ambassadors can view their own earnings"
  ON ambassador_earnings FOR SELECT
  USING (ambassador_id IN (SELECT id FROM ambassador_members WHERE user_id = auth.uid()));

CREATE POLICY "System can insert earnings"
  ON ambassador_earnings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all earnings"
  ON ambassador_earnings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ambassador_assets
CREATE POLICY "Ambassadors can view all assets"
  ON ambassador_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM ambassador_members WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Admins can manage all assets"
  ON ambassador_assets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ambassador_content_tracking
CREATE POLICY "Ambassadors can manage their own content tracking"
  ON ambassador_content_tracking FOR ALL
  USING (ambassador_id IN (SELECT id FROM ambassador_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all content tracking"
  ON ambassador_content_tracking FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_ambassador_members_user_id ON ambassador_members(user_id);
CREATE INDEX idx_ambassador_members_referral_code ON ambassador_members(referral_code);
CREATE INDEX idx_ambassador_referrals_ambassador_id ON ambassador_referrals(ambassador_id);
CREATE INDEX idx_ambassador_collaborations_ambassador_id ON ambassador_collaborations(ambassador_id);
CREATE INDEX idx_ambassador_earnings_ambassador_id ON ambassador_earnings(ambassador_id);
CREATE INDEX idx_ambassador_content_tracking_ambassador_month ON ambassador_content_tracking(ambassador_id, month, year);