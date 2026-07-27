-- Add columns to track creator confirmation emails for property applications
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS creator_confirmation_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_confirmation_sent_at TIMESTAMPTZ;

-- Add columns to track creator confirmation emails for brand campaign applications
ALTER TABLE brand_campaign_applications
ADD COLUMN IF NOT EXISTS creator_confirmation_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_confirmation_sent_at TIMESTAMPTZ;