-- Add publishing columns to social_accounts
ALTER TABLE social_accounts 
ADD COLUMN IF NOT EXISTS page_id TEXT,
ADD COLUMN IF NOT EXISTS page_name TEXT,
ADD COLUMN IF NOT EXISTS instagram_business_account_id TEXT,
ADD COLUMN IF NOT EXISTS can_publish BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS publishing_scopes TEXT[],
ADD COLUMN IF NOT EXISTS page_access_token TEXT;

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook')),
  post_type TEXT NOT NULL CHECK (post_type IN ('feed', 'story', 'reel')),
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'carousel')),
  caption TEXT,
  media_urls TEXT[],
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  platform_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create post_media table
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  container_id TEXT,
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_post_media_scheduled_post ON post_media(scheduled_post_id);

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_posts
CREATE POLICY "Users can view own scheduled posts" ON scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled posts" ON scheduled_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts" ON scheduled_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts" ON scheduled_posts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_media
CREATE POLICY "Users can view own post media" ON post_media
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own post media" ON post_media
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post media" ON post_media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own post media" ON post_media
  FOR DELETE USING (auth.uid() = user_id);