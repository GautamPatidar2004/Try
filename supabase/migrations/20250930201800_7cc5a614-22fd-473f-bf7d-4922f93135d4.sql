-- Fix security linter warning: Set search_path for the trigger function
CREATE OR REPLACE FUNCTION public.update_badge_progress_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;