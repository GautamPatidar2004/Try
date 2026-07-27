-- Add social fields
ALTER TABLE public.content_posts
ADD COLUMN IF NOT EXISTS social_post_url TEXT,
ADD COLUMN IF NOT EXISTS social_platform TEXT,
ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- Add foreign key relation to brand_campaigns
ALTER TABLE public.content_posts
ADD CONSTRAINT content_posts_campaign_id_fkey
FOREIGN KEY (campaign_id)
REFERENCES public.brand_campaigns(id)
ON DELETE SET NULL;