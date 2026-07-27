-- Add verified column to profiles table
ALTER TABLE profiles ADD COLUMN verified BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX idx_profiles_verified ON profiles(verified);

-- Add comment for documentation
COMMENT ON COLUMN profiles.verified IS 'Manual admin verification badge (Instagram-style checkmark)';