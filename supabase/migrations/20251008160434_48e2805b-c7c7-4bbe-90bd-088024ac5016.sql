-- Add status tracking columns to waitlist table
ALTER TABLE public.waitlist 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'invited', 'activated', 'declined')),
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- Function to track waitlist user activation
CREATE OR REPLACE FUNCTION public.track_waitlist_activation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update waitlist entry to activated when user creates their first session
  UPDATE public.waitlist
  SET 
    status = 'activated',
    activated_at = NOW()
  WHERE email = (
    SELECT email 
    FROM auth.users 
    WHERE id = NEW.user_id
  )
  AND status = 'invited'
  AND activated_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.sessions table when user logs in
DROP TRIGGER IF EXISTS on_user_session_created ON auth.sessions;
CREATE TRIGGER on_user_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.track_waitlist_activation();