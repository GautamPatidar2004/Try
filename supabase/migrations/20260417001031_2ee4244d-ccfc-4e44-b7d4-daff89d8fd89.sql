DROP POLICY IF EXISTS "Anyone can view open brand campaigns" ON public.brand_campaigns;

CREATE POLICY "Anyone can view open brand campaigns"
ON public.brand_campaigns
FOR SELECT
TO anon, authenticated
USING (
  status = 'open'
  AND (expires_at IS NULL OR expires_at > now())
);