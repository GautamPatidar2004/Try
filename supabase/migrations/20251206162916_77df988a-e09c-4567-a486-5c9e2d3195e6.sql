-- Create ambassador_tiers table for tier definitions
CREATE TABLE public.ambassador_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  min_referrals INTEGER NOT NULL DEFAULT 0,
  min_earnings NUMERIC NOT NULL DEFAULT 0,
  commission_bonus NUMERIC NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ambassador_streaks table for tracking user streaks
CREATE TABLE public.ambassador_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID NOT NULL REFERENCES public.ambassador_members(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ambassador_id, streak_type)
);

-- Add tier columns to ambassador_members
ALTER TABLE public.ambassador_members 
ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS tier_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.ambassador_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for ambassador_tiers (everyone can view, admins can manage)
CREATE POLICY "Anyone can view ambassador tiers" 
ON public.ambassador_tiers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage ambassador tiers" 
ON public.ambassador_tiers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ambassador_streaks
CREATE POLICY "Ambassadors can view their own streaks" 
ON public.ambassador_streaks 
FOR SELECT 
USING (ambassador_id IN (
  SELECT id FROM ambassador_members WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage streaks" 
ON public.ambassador_streaks 
FOR ALL 
USING (true);

-- Insert default tier definitions
INSERT INTO public.ambassador_tiers (name, icon, color, min_referrals, min_earnings, commission_bonus, display_order, benefits)
VALUES 
  ('Standard', '🥉', '#CD7F32', 0, 0, 0, 1, '["20% base commission", "Access to marketing assets", "Monthly content prompts"]'::jsonb),
  ('Elite', '🥈', '#C0C0C0', 15, 500, 5, 2, '["25% commission (+5% bonus)", "Priority support", "Early access to campaigns", "Featured ambassador spotlight"]'::jsonb),
  ('Pro Partner', '🥇', '#FFD700', 50, 2000, 10, 3, '["30% commission (+10% bonus)", "Dedicated account manager", "Custom referral landing page", "Quarterly bonus opportunities", "VIP events access"]'::jsonb);

-- Insert ambassador-specific badge definitions
INSERT INTO public.badge_definitions (name, description, icon, category, tier, criteria, points_reward, is_active)
VALUES 
  ('First 10 Creators', 'Refer 10 content creators to the platform', '🎯', 'ambassador', 'bronze', '{"type": "referral_count", "target": 10, "referral_type": "creator"}'::jsonb, 100, true),
  ('Property Pioneer', 'Refer 5 property owners to list their spaces', '🏠', 'ambassador', 'silver', '{"type": "referral_count", "target": 5, "referral_type": "property_owner"}'::jsonb, 150, true),
  ('Premium Recruiter', 'Get 3 referrals to upgrade to Premium tier', '⭐', 'ambassador', 'gold', '{"type": "premium_signups", "target": 3}'::jsonb, 200, true),
  ('Streak Master', 'Maintain a 7-day posting streak', '🔥', 'ambassador', 'bronze', '{"type": "streak", "streak_type": "posting", "target": 7}'::jsonb, 75, true),
  ('$500 Club', 'Earn $500 in lifetime commissions', '💵', 'ambassador', 'bronze', '{"type": "earnings", "target": 500}'::jsonb, 100, true),
  ('$1000 Club', 'Earn $1,000 in lifetime commissions', '💰', 'ambassador', 'silver', '{"type": "earnings", "target": 1000}'::jsonb, 200, true),
  ('$5000 Club', 'Earn $5,000 in lifetime commissions', '🏆', 'ambassador', 'gold', '{"type": "earnings", "target": 5000}'::jsonb, 500, true),
  ('Weekly Warrior', 'Have at least one referral signup every week for 4 weeks', '📈', 'ambassador', 'silver', '{"type": "streak", "streak_type": "referral", "target": 4}'::jsonb, 150, true);