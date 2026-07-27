-- Phase 5: Analytics & Performance Insights
-- Extend ambassador_referral_clicks with UTM tracking and channel data

ALTER TABLE public.ambassador_referral_clicks 
ADD COLUMN IF NOT EXISTS source_channel text,
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS device_type text;

-- Extend ambassador_referrals with source tracking
ALTER TABLE public.ambassador_referrals 
ADD COLUMN IF NOT EXISTS source_channel text,
ADD COLUMN IF NOT EXISTS utm_params jsonb DEFAULT '{}'::jsonb;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_referral_clicks_source_channel 
ON public.ambassador_referral_clicks(source_channel);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_clicked_at 
ON public.ambassador_referral_clicks(clicked_at);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_ambassador_channel 
ON public.ambassador_referral_clicks(ambassador_id, source_channel);

CREATE INDEX IF NOT EXISTS idx_referrals_source_channel 
ON public.ambassador_referrals(source_channel);

-- Add comments for documentation
COMMENT ON COLUMN public.ambassador_referral_clicks.source_channel IS 'Traffic source: instagram, tiktok, email, twitter, youtube, direct';
COMMENT ON COLUMN public.ambassador_referral_clicks.device_type IS 'Device type: mobile, desktop, tablet';
COMMENT ON COLUMN public.ambassador_referrals.utm_params IS 'UTM parameters from the referral click';