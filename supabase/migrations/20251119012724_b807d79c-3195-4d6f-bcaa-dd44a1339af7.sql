-- Add admin policy for brands table to allow admins to view and manage all brands
CREATE POLICY "Admins can manage all brands"
ON brands
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role));