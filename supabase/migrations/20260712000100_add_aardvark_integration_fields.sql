-- Aardvark cross-referral integration: flag on the user row
-- =================================================================
-- Marks whether a Hostfluencer user has connected/signed up with Aardvark
-- (joinaardvark.com). Set either by the inbound webhook `aardvark-signup-complete`
-- (user went Hostfluencer -> Aardvark) or by `aardvark-notify-signup` (user came
-- Aardvark -> Hostfluencer and completed our signup). See AARDVARK_INTEGRATION_PLAN.md.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_aardvark boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS aardvark_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS aardvark_external_id text,   -- Aardvark's id for this user, if they send it
  ADD COLUMN IF NOT EXISTS aardvark_ref text;           -- referral marker passed when Aardvark sent the user to us

CREATE INDEX IF NOT EXISTS profiles_has_aardvark_idx
  ON public.profiles (has_aardvark) WHERE has_aardvark = true;
