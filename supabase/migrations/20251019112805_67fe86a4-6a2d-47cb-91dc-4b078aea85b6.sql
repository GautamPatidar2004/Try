-- Create media-kits storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-kits', 'media-kits', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload to their own folder
CREATE POLICY "Users can upload their own media kits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-kits' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can view their own media kits
CREATE POLICY "Users can view their own media kits"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media-kits' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can delete their own media kits
CREATE POLICY "Users can delete their own media kits"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-kits' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Anyone can view public media kits
CREATE POLICY "Anyone can view public media kits"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-kits');