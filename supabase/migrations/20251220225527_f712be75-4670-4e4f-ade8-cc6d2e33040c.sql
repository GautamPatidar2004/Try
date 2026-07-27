-- Add Stripe Connect columns to ambassador_members
ALTER TABLE ambassador_members ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
ALTER TABLE ambassador_members ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE ambassador_members ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;
ALTER TABLE ambassador_members ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT false;

-- Create ambassador_payouts table for tracking all payouts
CREATE TABLE IF NOT EXISTS ambassador_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassador_members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  failure_reason TEXT,
  earnings_ids UUID[],
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on ambassador_payouts
ALTER TABLE ambassador_payouts ENABLE ROW LEVEL SECURITY;

-- Ambassadors can view their own payouts
CREATE POLICY "Ambassadors can view their own payouts"
ON ambassador_payouts
FOR SELECT
USING (
  ambassador_id IN (
    SELECT id FROM ambassador_members WHERE user_id = auth.uid()
  )
);

-- Ambassadors can request payouts (insert)
CREATE POLICY "Ambassadors can request payouts"
ON ambassador_payouts
FOR INSERT
WITH CHECK (
  ambassador_id IN (
    SELECT id FROM ambassador_members WHERE user_id = auth.uid()
  )
);

-- Create updated_at trigger for ambassador_payouts
CREATE TRIGGER update_ambassador_payouts_updated_at
BEFORE UPDATE ON ambassador_payouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time on ambassador_earnings and ambassador_payouts
ALTER TABLE ambassador_earnings REPLICA IDENTITY FULL;
ALTER TABLE ambassador_payouts REPLICA IDENTITY FULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_ambassador_payouts_ambassador_id ON ambassador_payouts(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_payouts_status ON ambassador_payouts(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_earnings_status ON ambassador_earnings(status);