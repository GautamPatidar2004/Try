ALTER TABLE brand_campaigns
ADD COLUMN IF NOT EXISTS campaign_subject_type text NOT NULL DEFAULT 'platform_brand',
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES properties(id),


ALTER TABLE brand_campaigns
ADD COLUMN IF NOT EXISTS platform_source text NOT NULL DEFAULT 'hostfluencer',
ADD COLUMN IF NOT EXISTS hfx_brand_id text;

-- Add constraints separately
ALTER TABLE brand_campaigns
ADD CONSTRAINT valid_campaign_subject_type
  CHECK (campaign_subject_type IN ('platform_brand', 'property_stay'));

ALTER TABLE brand_campaigns
ADD CONSTRAINT valid_platform_source
  CHECK (platform_source IN ('hostfluencer', 'hostfluencerx'))
