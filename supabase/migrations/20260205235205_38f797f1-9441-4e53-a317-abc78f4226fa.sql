-- Add admin access policy for applications table
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin access policy for collaboration_agreements table
CREATE POLICY "Admins can view all collaboration agreements"
ON public.collaboration_agreements
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));