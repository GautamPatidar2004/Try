-- Add welcome email tracking to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_welcome_email_pending
ON profiles(welcome_email_sent)
WHERE welcome_email_sent = false AND user_type IS NOT NULL;