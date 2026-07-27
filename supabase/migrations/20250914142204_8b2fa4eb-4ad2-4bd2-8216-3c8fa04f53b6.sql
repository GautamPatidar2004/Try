-- Fix the function security issue by setting proper search_path
CREATE OR REPLACE FUNCTION public.ensure_primary_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update properties that have images but no primary image set
  UPDATE property_images 
  SET is_primary = true
  WHERE id IN (
    SELECT DISTINCT ON (pi.property_id) pi.id
    FROM property_images pi
    WHERE pi.property_id NOT IN (
      SELECT DISTINCT property_id 
      FROM property_images 
      WHERE is_primary = true
    )
    ORDER BY pi.property_id, pi.display_order, pi.created_at
  );
END;
$$;