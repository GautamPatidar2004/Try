-- Add index for faster admin role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Add granted_by column to track who granted admin access
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS granted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS granted_at timestamp with time zone DEFAULT now();

-- Update existing records to set granted_at
UPDATE public.user_roles 
SET granted_at = COALESCE(granted_at, now())
WHERE granted_at IS NULL;