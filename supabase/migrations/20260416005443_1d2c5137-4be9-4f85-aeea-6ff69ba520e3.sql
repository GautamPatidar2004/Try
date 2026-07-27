ALTER TABLE public.brand_campaigns
ADD COLUMN IF NOT EXISTS affiliate_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_percentage numeric CHECK (affiliate_percentage IS NULL OR (affiliate_percentage >= 1 AND affiliate_percentage <= 50));