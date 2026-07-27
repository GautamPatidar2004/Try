
-- 1) Properties: drop unused ical_url column (leaked secret tokens publicly)
ALTER TABLE public.properties DROP COLUMN IF EXISTS ical_url;

-- 2) Waitlist: remove public SELECT (exposed temp_password + emails)
DROP POLICY IF EXISTS "Anyone can view waitlist entries" ON public.waitlist;

-- 3) Social accounts: remove public SELECT (exposed OAuth tokens)
DROP POLICY IF EXISTS "Anyone can view social accounts" ON public.social_accounts;

-- 4) Brands: replace public SELECT with authenticated-only SELECT
DROP POLICY IF EXISTS "Anyone can view verified brand basic info" ON public.brands;
CREATE POLICY "Authenticated users can view verified brands"
ON public.brands
FOR SELECT
TO authenticated
USING (verified = true);

-- 5) Storage: property-images ownership checks
DROP POLICY IF EXISTS "Hosts can delete their property images" ON storage.objects;
DROP POLICY IF EXISTS "Hosts can update their property images" ON storage.objects;

CREATE POLICY "Hosts can delete their property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.uid() IN (
    SELECT host_id FROM public.properties
    WHERE id = ((storage.foldername(name))[1])::uuid
  )
);

CREATE POLICY "Hosts can update their property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.uid() IN (
    SELECT host_id FROM public.properties
    WHERE id = ((storage.foldername(name))[1])::uuid
  )
);

-- 6) Storage: collaboration-content ownership checks
DROP POLICY IF EXISTS "Users can update own collaboration content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own collaboration content" ON storage.objects;

CREATE POLICY "Users can update own collaboration content"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'collaboration-content'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own collaboration content"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'collaboration-content'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 7) Badge progress: restrict system-manage policy to service_role
DROP POLICY IF EXISTS "System can manage badge progress" ON public.badge_progress;
CREATE POLICY "Service role manages badge progress"
ON public.badge_progress
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
