-- Fix RLS policies for content_posts to prevent INSERT from hanging

-- Drop the problematic ALL policy that causes INSERT to hang
DROP POLICY IF EXISTS "Influencers can manage their own content" ON content_posts;

-- Create separate INSERT policy with proper WITH CHECK clause
CREATE POLICY "Influencers can insert their own content"
ON content_posts
FOR INSERT
TO authenticated
WITH CHECK (
  influencer_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_type = 'influencer'
  )
);

-- Create UPDATE policy
CREATE POLICY "Influencers can update their own content"
ON content_posts
FOR UPDATE
TO authenticated
USING (
  influencer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_type = 'influencer'
  )
);

-- Create DELETE policy
CREATE POLICY "Influencers can delete their own content"
ON content_posts
FOR DELETE
TO authenticated
USING (
  influencer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_type = 'influencer'
  )
);