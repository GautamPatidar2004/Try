-- Add override columns to ambassador_members
ALTER TABLE ambassador_members 
ADD COLUMN IF NOT EXISTS commission_override numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tier_override text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT NULL;

-- Create ambassador_bonuses table
CREATE TABLE IF NOT EXISTS ambassador_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassador_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  reason text NOT NULL,
  awarded_by uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create ambassador_announcements table
CREATE TABLE IF NOT EXISTS ambassador_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal',
  target_tiers text[] DEFAULT '{}',
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE ambassador_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_announcements ENABLE ROW LEVEL SECURITY;

-- RLS policies for ambassador_bonuses
CREATE POLICY "Admins can manage all bonuses"
ON ambassador_bonuses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Ambassadors can view their own bonuses"
ON ambassador_bonuses FOR SELECT
USING (ambassador_id IN (
  SELECT id FROM ambassador_members WHERE user_id = auth.uid()
));

-- RLS policies for ambassador_announcements
CREATE POLICY "Admins can manage all announcements"
ON ambassador_announcements FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Ambassadors can view active announcements"
ON ambassador_announcements FOR SELECT
USING (
  is_active = true 
  AND (sent_at IS NOT NULL OR scheduled_for <= now())
  AND EXISTS (
    SELECT 1 FROM ambassador_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ambassador_bonuses_ambassador_id ON ambassador_bonuses(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_bonuses_status ON ambassador_bonuses(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_announcements_sent_at ON ambassador_announcements(sent_at);
CREATE INDEX IF NOT EXISTS idx_ambassador_announcements_is_active ON ambassador_announcements(is_active);