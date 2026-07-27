-- Fix Malibu Retreat by setting the first image as primary
UPDATE property_images 
SET is_primary = true 
WHERE property_id = '2aaea7bc-6e67-4449-a736-b222f61148dc' 
AND display_order = 0 
AND id = '7ad3bd45-19f2-4fc1-b8c2-4fc0478418e9';

-- Create a function to auto-assign primary images for properties that have images but no primary
CREATE OR REPLACE FUNCTION public.ensure_primary_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Run the function to fix existing properties
SELECT public.ensure_primary_images();