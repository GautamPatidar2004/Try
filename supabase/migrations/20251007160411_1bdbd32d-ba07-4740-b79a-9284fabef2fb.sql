-- Add new columns to profiles table for enhanced user management
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_by_admin_id UUID REFERENCES public.profiles(id);

-- Create user_activity_timeline table
CREATE TABLE IF NOT EXISTS public.user_activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_impersonation_sessions table
CREATE TABLE IF NOT EXISTS public.user_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  impersonated_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  session_data JSONB DEFAULT '{}'::jsonb
);

-- Create duplicate_account_groups table
CREATE TABLE IF NOT EXISTS public.duplicate_account_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ids UUID[] NOT NULL,
  similarity_score INTEGER NOT NULL,
  matching_fields JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, merged, dismissed
  reviewed_by_admin_id UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_activity_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_account_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_timeline
CREATE POLICY "Admins can view all activity"
ON public.user_activity_timeline
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity"
ON public.user_activity_timeline
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own activity"
ON public.user_activity_timeline
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for user_impersonation_sessions
CREATE POLICY "Admins can manage impersonation sessions"
ON public.user_impersonation_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for duplicate_account_groups
CREATE POLICY "Admins can manage duplicate groups"
ON public.duplicate_account_groups
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity_timeline(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity_timeline(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON public.user_impersonation_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_user ON public.user_impersonation_sessions(impersonated_user_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_status ON public.duplicate_account_groups(status);

-- Create trigger for updated_at on duplicate_account_groups
CREATE OR REPLACE FUNCTION update_duplicate_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_duplicate_groups_updated_at_trigger
BEFORE UPDATE ON public.duplicate_account_groups
FOR EACH ROW
EXECUTE FUNCTION update_duplicate_groups_updated_at();