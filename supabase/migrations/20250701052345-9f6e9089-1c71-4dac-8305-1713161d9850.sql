
-- Add username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Add constraint to ensure username is lowercase and follows proper format
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    username = lower(username) AND
    username ~ '^[a-z0-9_]{3,30}$'
  )
);
