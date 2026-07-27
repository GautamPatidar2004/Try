-- Phase 4: Database & API Optimization (CORRECTED)
-- Performance indexes, database views, and RLS optimization

-- ============================================================================
-- PART 1: PERFORMANCE INDEXES
-- ============================================================================

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_applications_property_id ON applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_influencer_property ON applications(influencer_id, property_id);

-- Content posts indexes
CREATE INDEX IF NOT EXISTS idx_content_posts_influencer_id ON content_posts(influencer_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_property_id ON content_posts(property_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_delivery_status ON content_posts(delivery_status);
CREATE INDEX IF NOT EXISTS idx_content_posts_host_approval ON content_posts(host_approval_status);
CREATE INDEX IF NOT EXISTS idx_content_posts_posting_date ON content_posts(posting_date);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);

-- Collaboration agreements indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_agreements_host_id ON collaboration_agreements(host_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_agreements_influencer_id ON collaboration_agreements(influencer_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_agreements_status ON collaboration_agreements(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_agreements_application_id ON collaboration_agreements(application_id);

-- AI match scores indexes
CREATE INDEX IF NOT EXISTS idx_ai_match_scores_influencer_id ON ai_match_scores(influencer_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_scores_property_id ON ai_match_scores(property_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_scores_match_score ON ai_match_scores(match_score DESC);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Earnings indexes
CREATE INDEX IF NOT EXISTS idx_earnings_influencer_id ON earnings(influencer_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_earned_at ON earnings(earned_at DESC);

-- Brand campaigns indexes
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_status ON brand_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_expires_at ON brand_campaigns(expires_at);

-- User follows indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- ============================================================================
-- PART 2: DATABASE VIEWS FOR COMMON QUERY PATTERNS
-- ============================================================================

-- View: Collaboration agreements with all related details
CREATE OR REPLACE VIEW collaboration_agreements_with_details AS
SELECT 
  ca.id,
  ca.host_id,
  ca.influencer_id,
  ca.application_id,
  ca.status,
  ca.agreed_rate,
  ca.currency,
  ca.deliverable_count,
  ca.deadline,
  ca.agreed_at,
  ca.created_at,
  ca.updated_at,
  
  -- Host profile info
  hp.first_name as host_first_name,
  hp.last_name as host_last_name,
  hp.username as host_username,
  
  -- Influencer profile info
  ip.first_name as influencer_first_name,
  ip.last_name as influencer_last_name,
  ip.username as influencer_username,
  
  -- Property info
  p.id as property_id,
  p.title as property_title,
  p.property_type,
  
  -- Application info
  app.id as application_id_full,
  app.proposed_dates_start,
  app.proposed_dates_end
  
FROM collaboration_agreements ca
LEFT JOIN profiles hp ON ca.host_id = hp.id
LEFT JOIN profiles ip ON ca.influencer_id = ip.id
LEFT JOIN applications app ON ca.application_id = app.id
LEFT JOIN properties p ON app.property_id = p.id;

-- View: User metrics summary (reduces sequential queries)
CREATE OR REPLACE VIEW user_metrics_summary AS
SELECT 
  p.id,
  p.user_type,
  p.created_at,
  p.last_login_at,
  
  -- Influencer metrics (using actual column names)
  i.total_followers,
  i.engagement_rate,
  i.content_niches,
  
  -- Host metrics  
  h.business_name,
  h.verification_status,
  
  -- Application count
  (SELECT COUNT(*) FROM applications WHERE influencer_id = p.id) as application_count,
  
  -- Content post count
  (SELECT COUNT(*) FROM content_posts WHERE influencer_id = p.id) as content_post_count,
  
  -- Active collaboration count
  (SELECT COUNT(*) FROM collaboration_agreements 
   WHERE (host_id = p.id OR influencer_id = p.id) AND status = 'active') as active_collaboration_count

FROM profiles p
LEFT JOIN influencers i ON p.id = i.id
LEFT JOIN hosts h ON p.id = h.id;

-- ============================================================================
-- PART 3: RLS HELPER FUNCTIONS (Security Definer)
-- ============================================================================

-- Function: Check if user is property host
CREATE OR REPLACE FUNCTION public.is_property_host(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM properties
    WHERE id = _property_id
    AND host_id = _user_id
  )
$$;

-- Function: Check if user is content creator
CREATE OR REPLACE FUNCTION public.is_content_creator(_user_id uuid, _post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM content_posts
    WHERE id = _post_id
    AND influencer_id = _user_id
  )
$$;

-- Function: Check if user is involved in application
CREATE OR REPLACE FUNCTION public.is_application_party(_user_id uuid, _application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM applications a
    LEFT JOIN properties p ON a.property_id = p.id
    WHERE a.id = _application_id
    AND (a.influencer_id = _user_id OR p.host_id = _user_id)
  )
$$;

COMMENT ON FUNCTION public.is_property_host IS 'Optimized RLS helper: Check if user owns a property';
COMMENT ON FUNCTION public.is_content_creator IS 'Optimized RLS helper: Check if user created a content post';
COMMENT ON FUNCTION public.is_application_party IS 'Optimized RLS helper: Check if user is involved in application';

-- ============================================================================
-- PART 4: RLS POLICY CONSOLIDATION & OPTIMIZATION
-- ============================================================================

-- Drop redundant content_posts policies and create consolidated ones
DROP POLICY IF EXISTS "Creators view their own content" ON content_posts;
DROP POLICY IF EXISTS "Influencers can insert their own content" ON content_posts;
DROP POLICY IF EXISTS "Influencers can update their own content" ON content_posts;
DROP POLICY IF EXISTS "Influencers can delete their own content" ON content_posts;
DROP POLICY IF EXISTS "Hosts view content for their properties" ON content_posts;
DROP POLICY IF EXISTS "Hosts can view content for their properties" ON content_posts;

-- Consolidated content_posts policies (using helper functions)
CREATE POLICY "content_posts_select_own_or_host"
ON content_posts FOR SELECT
USING (
  influencer_id = auth.uid() OR
  public.is_property_host(auth.uid(), property_id) OR
  (delivery_status = 'published' AND host_approval_status = 'approved')
);

CREATE POLICY "content_posts_insert_own"
ON content_posts FOR INSERT
WITH CHECK (
  influencer_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'influencer')
);

CREATE POLICY "content_posts_update_own"
ON content_posts FOR UPDATE
USING (
  influencer_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'influencer')
);

CREATE POLICY "content_posts_delete_own"
ON content_posts FOR DELETE
USING (
  influencer_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'influencer')
);

-- Optimize applications policies
DROP POLICY IF EXISTS "Users can view applications they're involved in" ON applications;

CREATE POLICY "applications_select_involved_parties"
ON applications FOR SELECT
USING (
  influencer_id = auth.uid() OR
  public.is_property_host(auth.uid(), property_id)
);