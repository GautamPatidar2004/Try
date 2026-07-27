-- Extend ambassador_referrals table with segment tracking columns
ALTER TABLE ambassador_referrals 
ADD COLUMN IF NOT EXISTS referral_type text DEFAULT 'creator';

ALTER TABLE ambassador_referrals 
ADD COLUMN IF NOT EXISTS conversion_stage text DEFAULT 'signup';

ALTER TABLE ambassador_referrals 
ADD COLUMN IF NOT EXISTS click_count integer DEFAULT 0;

ALTER TABLE ambassador_referrals 
ADD COLUMN IF NOT EXISTS first_click_at timestamptz;

ALTER TABLE ambassador_referrals 
ADD COLUMN IF NOT EXISTS last_click_at timestamptz;

ALTER TABLE ambassador_referrals 
ADD COLUMN IF NOT EXISTS lifetime_value numeric DEFAULT 0;

-- Add check constraints for valid values
ALTER TABLE ambassador_referrals 
ADD CONSTRAINT valid_referral_type 
CHECK (referral_type IN ('creator', 'property_owner', 'brand', 'restaurant'));

ALTER TABLE ambassador_referrals 
ADD CONSTRAINT valid_conversion_stage 
CHECK (conversion_stage IN ('clicked', 'signup', 'listing', 'active', 'subscription'));

-- Create detailed click tracking table
CREATE TABLE ambassador_referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassador_members(id) ON DELETE CASCADE,
  referral_type text NOT NULL DEFAULT 'creator',
  referral_code text NOT NULL,
  user_agent text,
  ip_hash text,
  referrer_url text,
  landing_page text,
  converted boolean DEFAULT false,
  converted_user_id uuid REFERENCES profiles(id),
  clicked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_click_referral_type 
  CHECK (referral_type IN ('creator', 'property_owner', 'brand', 'restaurant'))
);

-- Enable RLS on the new table
ALTER TABLE ambassador_referral_clicks ENABLE ROW LEVEL SECURITY;

-- RLS policies for click tracking
CREATE POLICY "Ambassadors can view their own clicks"
ON ambassador_referral_clicks
FOR SELECT
USING (ambassador_id IN (
  SELECT id FROM ambassador_members WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert clicks"
ON ambassador_referral_clicks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all clicks"
ON ambassador_referral_clicks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_referral_clicks_ambassador ON ambassador_referral_clicks(ambassador_id);
CREATE INDEX idx_referral_clicks_type ON ambassador_referral_clicks(referral_type);
CREATE INDEX idx_ambassador_referrals_type ON ambassador_referrals(referral_type);
CREATE INDEX idx_ambassador_referrals_stage ON ambassador_referrals(conversion_stage);