
ALTER TABLE public.brand_campaigns
  ADD COLUMN IF NOT EXISTS campaign_type text,
  ADD COLUMN IF NOT EXISTS target_destination text,
  ADD COLUMN IF NOT EXISTS deliverables_count integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS creators_needed integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS geo_focus text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS total_budget integer,
  ADD COLUMN IF NOT EXISTS platform_fee integer,
  ADD COLUMN IF NOT EXISTS creator_payout integer,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
