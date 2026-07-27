-- Create platform settings table
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('boolean', 'string', 'number', 'json')),
  category TEXT NOT NULL CHECK (category IN ('general', 'features', 'api', 'rate_limiting', 'maintenance')),
  description TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create feature flags table
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_user_types TEXT[] DEFAULT '{}',
  target_user_ids UUID[] DEFAULT '{}',
  environment TEXT DEFAULT 'production' CHECK (environment IN ('production', 'staging', 'development')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create A/B tests table
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_segment JSONB DEFAULT '{}',
  winner_variant TEXT,
  metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rate limits table
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT UNIQUE NOT NULL,
  limit_count INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  user_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_settings
CREATE POLICY "Admins can manage all settings"
  ON public.platform_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view public settings"
  ON public.platform_settings
  FOR SELECT
  USING (is_public = true);

-- RLS Policies for feature_flags
CREATE POLICY "Admins can manage all feature flags"
  ON public.feature_flags
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view feature flags"
  ON public.feature_flags
  FOR SELECT
  USING (true);

-- RLS Policies for ab_tests
CREATE POLICY "Admins can manage all A/B tests"
  ON public.ab_tests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active tests"
  ON public.ab_tests
  FOR SELECT
  USING (status = 'running');

-- RLS Policies for rate_limits
CREATE POLICY "Admins can manage all rate limits"
  ON public.rate_limits
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (is_active = true);

-- Create indexes
CREATE INDEX idx_platform_settings_key ON public.platform_settings(key);
CREATE INDEX idx_platform_settings_category ON public.platform_settings(category);
CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(is_enabled);
CREATE INDEX idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX idx_rate_limits_resource ON public.rate_limits(resource);

-- Add triggers for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();