-- 1. Align Pro/Premium creator plans with promised features
UPDATE public.subscription_plans
SET
  search_priority = 10,
  marketplace_boosts_per_month = 10,
  has_verified_badge = true,
  has_media_kit = true,
  has_advanced_analytics = true,
  max_pitches_per_month = NULL
WHERE user_type_category = 'supply'
  AND name IN ('Creator Pro', 'Creator Premium');

-- 2. Creator profile boosts table
CREATE TABLE IF NOT EXISTS public.creator_profile_boosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL,
  boosted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_profile_boosts_influencer_active
  ON public.creator_profile_boosts (influencer_id, expires_at DESC);

ALTER TABLE public.creator_profile_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators view their own boosts"
  ON public.creator_profile_boosts FOR SELECT
  USING (auth.uid() = influencer_id);

CREATE POLICY "Creators create their own boosts"
  ON public.creator_profile_boosts FOR INSERT
  WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Admins view all boosts"
  ON public.creator_profile_boosts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));