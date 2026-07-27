-- Add moderation fields to reviews_and_ratings table
ALTER TABLE public.reviews_and_ratings
ADD COLUMN admin_notes text,
ADD COLUMN is_flagged boolean DEFAULT false,
ADD COLUMN flag_reason text,
ADD COLUMN flagged_by uuid REFERENCES auth.users(id),
ADD COLUMN flagged_at timestamp with time zone,
ADD COLUMN admin_reviewed_at timestamp with time zone,
ADD COLUMN admin_reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN is_hidden boolean DEFAULT false;

-- Create index for flagged reviews
CREATE INDEX idx_reviews_flagged ON public.reviews_and_ratings(is_flagged, flagged_at DESC) WHERE is_flagged = true;

-- Create index for public reviews
CREATE INDEX idx_reviews_public ON public.reviews_and_ratings(is_public, created_at DESC) WHERE is_public = true;

-- Add RLS policy for admin access
CREATE POLICY "Admins can manage all reviews"
ON public.reviews_and_ratings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update existing policy to exclude hidden reviews from public view
DROP POLICY IF EXISTS "Involved parties can view reviews" ON public.reviews_and_ratings;

CREATE POLICY "Involved parties can view reviews"
ON public.reviews_and_ratings
FOR SELECT
TO authenticated
USING (
  (is_hidden = false) AND (
    (auth.uid() = reviewer_id) OR 
    (auth.uid() = reviewee_id) OR 
    (EXISTS (
      SELECT 1 FROM collaboration_agreements ca
      WHERE ca.id = reviews_and_ratings.agreement_id 
        AND (ca.host_id = auth.uid() OR ca.influencer_id = auth.uid())
    ))
  )
);