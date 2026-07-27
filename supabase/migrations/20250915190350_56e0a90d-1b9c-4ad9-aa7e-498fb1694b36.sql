-- Add admin management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_active boolean DEFAULT true,
ADD COLUMN admin_notes text,
ADD COLUMN premium_override boolean DEFAULT false,
ADD COLUMN premium_override_expires_at timestamp with time zone;

-- Create index for better performance on admin queries
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_profiles_premium_override ON public.profiles(premium_override);

-- Add admin management fields to properties table
ALTER TABLE public.properties 
ADD COLUMN admin_deactivated boolean DEFAULT false,
ADD COLUMN admin_notes text;

-- Update RLS policies to allow admins to manage all users
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies to allow admins to manage all properties
CREATE POLICY "Admins can manage all properties" 
ON public.properties 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check premium access including admin overrides
CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- Check for premium override that hasn't expired
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id 
      AND premium_override = true 
      AND (premium_override_expires_at IS NULL OR premium_override_expires_at > now())
  ) OR EXISTS (
    -- Check for active subscription
    SELECT 1 FROM public.subscriptions 
    WHERE influencer_id = _user_id 
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;