-- Create storage bucket for collaboration content
INSERT INTO storage.buckets (id, name, public)
VALUES ('collaboration-content', 'collaboration-content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload collaboration content
CREATE POLICY "Users can upload collaboration content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'collaboration-content');

-- Allow public read access to collaboration content
CREATE POLICY "Public can view collaboration content"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'collaboration-content');

-- Allow users to update their own collaboration content
CREATE POLICY "Users can update own collaboration content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'collaboration-content');

-- Allow users to delete their own collaboration content
CREATE POLICY "Users can delete own collaboration content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'collaboration-content');