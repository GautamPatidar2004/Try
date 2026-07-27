
-- Create content_posts table for influencer social media content
CREATE TABLE public.content_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  collaboration_id UUID REFERENCES public.applications(id) ON DELETE SET NULL
);

-- Add RLS policies for content_posts
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

-- Policy for influencers to manage their own content
CREATE POLICY "Influencers can manage their own content" 
  ON public.content_posts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'influencer'
      AND influencer_id IN (
        SELECT id FROM public.influencers WHERE id = p.id
      )
    )
  );

-- Policy for hosts to view content related to their properties
CREATE POLICY "Hosts can view content for their properties" 
  ON public.content_posts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.hosts h ON h.id = p.id
      JOIN public.properties pr ON pr.host_id = h.id
      WHERE p.id = auth.uid() 
      AND p.user_type = 'host'
      AND pr.id = content_posts.property_id
    )
  );

-- Policy for public viewing (all users can see all content)
CREATE POLICY "All users can view content posts" 
  ON public.content_posts 
  FOR SELECT 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_content_posts_influencer_id ON public.content_posts(influencer_id);
CREATE INDEX idx_content_posts_property_id ON public.content_posts(property_id);
CREATE INDEX idx_content_posts_created_at ON public.content_posts(created_at DESC);
