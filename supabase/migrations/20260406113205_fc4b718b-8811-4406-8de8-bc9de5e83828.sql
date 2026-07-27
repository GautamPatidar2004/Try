ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS campaign_rate integer,
  ADD COLUMN IF NOT EXISTS platform_fee integer,
  ADD COLUMN IF NOT EXISTS creator_payout integer,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;