-- Public read-only view exposing minimal creator data for the landing page rotator
CREATE OR REPLACE VIEW public.public_creator_directory
WITH (security_invoker = true) AS
SELECT
  i.id,
  p.first_name,
  p.last_name,
  p.profile_photo_url,
  p.location,
  i.total_followers,
  i.instagram_url,
  i.content_niches
FROM public.influencers i
JOIN public.profiles p ON p.id = i.id
WHERE p.profile_photo_url IS NOT NULL
  AND COALESCE(i.total_followers, 0) > 0;

-- Allow anonymous and authenticated users to read this view
GRANT SELECT ON public.public_creator_directory TO anon, authenticated;

-- The view uses security_invoker, so we need a policy permitting anon reads
-- on the underlying tables for ONLY these minimal columns. Since RLS is row-level
-- (not column-level), we instead expose via a SECURITY DEFINER function.
DROP VIEW IF EXISTS public.public_creator_directory;

CREATE OR REPLACE FUNCTION public.get_featured_creators(p_limit integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  profile_photo_url text,
  location text,
  total_followers integer,
  instagram_url text,
  content_niches text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,
    p.first_name,
    p.last_name,
    p.profile_photo_url,
    p.location,
    i.total_followers,
    i.instagram_url,
    i.content_niches
  FROM public.influencers i
  JOIN public.profiles p ON p.id = i.id
  WHERE p.profile_photo_url IS NOT NULL
    AND COALESCE(i.total_followers, 0) > 0
  ORDER BY i.total_followers DESC NULLS LAST
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_featured_creators(integer) TO anon, authenticated;