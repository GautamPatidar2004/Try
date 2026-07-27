-- Brand campaign RLS hardening: honor visibility='private'
-- =================================================================
-- The public SELECT policy on brand_campaigns (last redefined in 20260417001031)
-- only checks `status = 'open'` and IGNORES the `visibility` column, so a campaign
-- marked `visibility = 'private'` is world-readable (anon + all authenticated) as
-- long as its status is 'open'. Owners (created_by) and admins have their own
-- SELECT policies, so scoping the public policy to public campaigns hides nothing
-- from the people who should see it — it only stops non-owners from reading
-- private campaigns.

DROP POLICY IF EXISTS "Anyone can view open brand campaigns" ON public.brand_campaigns;

CREATE POLICY "Anyone can view open brand campaigns"
ON public.brand_campaigns
FOR SELECT
TO anon, authenticated
USING (
  status = 'open'
  AND (expires_at IS NULL OR expires_at > now())
  AND (visibility = 'public' OR visibility IS NULL)
);
