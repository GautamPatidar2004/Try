-- Drop existing FK to auth.users
ALTER TABLE campaign_recipients 
DROP CONSTRAINT IF EXISTS campaign_recipients_user_id_fkey;

-- Add FK to profiles instead (profiles.id is already linked to auth.users.id)
ALTER TABLE campaign_recipients
ADD CONSTRAINT campaign_recipients_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add email column for audit trail
ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update RLS policy to restrict to admins only
DROP POLICY IF EXISTS "System can manage recipients" ON campaign_recipients;

CREATE POLICY "Admins can manage campaign recipients"
ON campaign_recipients
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);