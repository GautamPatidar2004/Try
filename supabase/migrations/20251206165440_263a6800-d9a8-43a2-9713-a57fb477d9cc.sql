-- Phase 4: Content & Education Hub Database Schema

-- Table for content templates (captions, scripts, prompts)
CREATE TABLE public.ambassador_content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('caption', 'script', 'prompt', 'hook')),
  content_type text NOT NULL CHECK (content_type IN ('instagram', 'tiktok', 'youtube', 'general')),
  content text NOT NULL,
  month integer CHECK (month IS NULL OR (month >= 1 AND month <= 12)),
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for training video progress
CREATE TABLE public.ambassador_training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid REFERENCES ambassador_members(id) ON DELETE CASCADE NOT NULL,
  video_id text NOT NULL,
  video_title text NOT NULL,
  video_category text NOT NULL CHECK (video_category IN ('getting-started', 'advanced', 'best-practices')),
  watched_at timestamptz DEFAULT now(),
  completion_percentage integer DEFAULT 100 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(ambassador_id, video_id)
);

-- Indexes for performance
CREATE INDEX idx_content_templates_category ON ambassador_content_templates(category);
CREATE INDEX idx_content_templates_content_type ON ambassador_content_templates(content_type);
CREATE INDEX idx_content_templates_month ON ambassador_content_templates(month);
CREATE INDEX idx_content_templates_featured ON ambassador_content_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_training_progress_ambassador ON ambassador_training_progress(ambassador_id);

-- Enable RLS
ALTER TABLE ambassador_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_training_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_templates (public read)
CREATE POLICY "Anyone can view content templates"
  ON ambassador_content_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage content templates"
  ON ambassador_content_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for training_progress
CREATE POLICY "Ambassadors can view their own training progress"
  ON ambassador_training_progress FOR SELECT
  USING (ambassador_id IN (
    SELECT id FROM ambassador_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Ambassadors can insert their own training progress"
  ON ambassador_training_progress FOR INSERT
  WITH CHECK (ambassador_id IN (
    SELECT id FROM ambassador_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Ambassadors can update their own training progress"
  ON ambassador_training_progress FOR UPDATE
  USING (ambassador_id IN (
    SELECT id FROM ambassador_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all training progress"
  ON ambassador_training_progress FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed some initial content templates
INSERT INTO ambassador_content_templates (title, category, content_type, content, is_featured, tags) VALUES
('Instagram Story Hook', 'caption', 'instagram', 'Looking to monetize your influence? 👀 Join me on Hostfluencer and start earning from authentic property collaborations! Link in bio 🔗 #Hostfluencer #CreatorEconomy', true, ARRAY['story', 'hook', 'cta']),
('TikTok Trend Hook', 'hook', 'tiktok', 'POV: You just discovered how creators are earning $500+ per property match on Hostfluencer... 🏠✨', true, ARRAY['pov', 'trend', 'earnings']),
('YouTube Description CTA', 'caption', 'youtube', 'If you''re a content creator looking for authentic brand and property collaborations, check out Hostfluencer! I''ve been using it to connect with amazing properties. Sign up with my link: [YOUR LINK]', false, ARRAY['description', 'cta']),
('Property Tour Script', 'script', 'general', 'Hey everyone! Today I''m taking you inside this amazing [PROPERTY TYPE] that I discovered through Hostfluencer. Let me show you around...\n\n[TOUR CONTENT]\n\nIf you want to find properties like this for your content, check out my link in bio to join Hostfluencer!', true, ARRAY['tour', 'walkthrough']),
('Success Story Template', 'prompt', 'general', 'Share your Hostfluencer success story! Talk about:\n• How you discovered the platform\n• Your first successful collaboration\n• What you''ve earned so far\n• Tips for other creators', false, ARRAY['testimonial', 'story']),
('Monthly Challenge - December', 'prompt', 'general', '🎄 December Challenge: Share your "Year in Review" featuring your best Hostfluencer moments! Use #HostfluencerWrapped', false, ARRAY['challenge', 'monthly']),
('Reel Transition Hook', 'hook', 'instagram', '*snap* Before Hostfluencer vs After Hostfluencer 💰', true, ARRAY['reel', 'transition', 'before-after']),
('Brand Intro Caption', 'caption', 'general', 'Excited to share that I''ve partnered with some amazing properties through @Hostfluencer! If you''re a creator looking for authentic collaborations, this platform is a game-changer 🙌', false, ARRAY['partnership', 'announcement'])
ON CONFLICT DO NOTHING;