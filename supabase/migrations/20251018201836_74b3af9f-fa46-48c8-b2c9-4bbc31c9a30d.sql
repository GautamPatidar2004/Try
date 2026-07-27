-- Phase 1: Extend social_accounts table with OAuth and analytics columns
ALTER TABLE public.social_accounts 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS platform_user_id TEXT,
ADD COLUMN IF NOT EXISTS analytics_data JSONB DEFAULT '{}'::jsonb;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_token_expiry 
ON public.social_accounts(token_expires_at) 
WHERE sync_enabled = true;

CREATE INDEX IF NOT EXISTS idx_social_accounts_sync 
ON public.social_accounts(last_sync_at, sync_enabled) 
WHERE sync_enabled = true;

-- Drop existing policies and recreate with token protection
DROP POLICY IF EXISTS "Influencers can manage their own social accounts" ON public.social_accounts;

-- Policy for viewing (accessible to owners and service role for edge functions)
CREATE POLICY "Users can view social account data"
ON public.social_accounts
FOR SELECT
USING (
  auth.uid() = influencer_id OR
  current_setting('role', true) = 'service_role'
);

-- Policy for updates (owners only, prevents direct token updates from client)
CREATE POLICY "Influencers can update their social accounts"
ON public.social_accounts
FOR UPDATE
USING (auth.uid() = influencer_id);

-- Policy for insert
CREATE POLICY "Influencers can create their social accounts"
ON public.social_accounts
FOR INSERT
WITH CHECK (auth.uid() = influencer_id);

-- Policy for delete
CREATE POLICY "Influencers can delete their social accounts"
ON public.social_accounts
FOR DELETE
USING (auth.uid() = influencer_id);

-- Create external_analytics table for historical analytics data
CREATE TABLE IF NOT EXISTS public.external_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'youtube', 'twitter')),
  account_id TEXT NOT NULL,
  metric_date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(influencer_id, platform, account_id, metric_date)
);

-- Enable RLS on external_analytics
ALTER TABLE public.external_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_analytics
CREATE POLICY "Users can view their own analytics"
ON public.external_analytics
FOR SELECT
USING (auth.uid() = influencer_id);

CREATE POLICY "System can manage analytics"
ON public.external_analytics
FOR ALL
USING (current_setting('role', true) = 'service_role');

-- Indexes for external_analytics
CREATE INDEX idx_external_analytics_user_platform 
ON public.external_analytics(influencer_id, platform);

CREATE INDEX idx_external_analytics_date 
ON public.external_analytics(metric_date DESC);

-- Auto-update timestamp trigger for external_analytics
CREATE OR REPLACE FUNCTION update_external_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_external_analytics_timestamp
BEFORE UPDATE ON public.external_analytics
FOR EACH ROW
EXECUTE FUNCTION update_external_analytics_updated_at();

-- Create analytics summary view
CREATE OR REPLACE VIEW public.creator_analytics_summary AS
SELECT 
  sa.influencer_id,
  sa.platform,
  sa.username,
  sa.follower_count,
  sa.is_verified,
  sa.sync_enabled,
  sa.last_sync_at,
  sa.analytics_data as latest_analytics,
  (
    SELECT jsonb_object_agg(metric_date, metrics)
    FROM (
      SELECT metric_date, metrics
      FROM external_analytics ea
      WHERE ea.influencer_id = sa.influencer_id 
        AND ea.platform = sa.platform
      ORDER BY metric_date DESC
      LIMIT 30
    ) recent
  ) as historical_data
FROM social_accounts sa
WHERE sa.sync_enabled = true;