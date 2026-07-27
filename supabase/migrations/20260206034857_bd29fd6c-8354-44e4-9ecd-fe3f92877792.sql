-- Drop ALL existing policies on waitlist table to start fresh
DROP POLICY IF EXISTS "Admins can update waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Public can join waitlist" ON public.waitlist;

-- Recreate all secure policies
-- Policy for public INSERT (anyone can join the waitlist)
CREATE POLICY "Public can join waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy for admin-only SELECT (only admins can view waitlist entries)
CREATE POLICY "Admins can view all waitlist entries"
ON public.waitlist
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Policy for admin-only UPDATE (only admins can update waitlist status)
CREATE POLICY "Admins can update waitlist entries"
ON public.waitlist
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Policy for admin-only DELETE
CREATE POLICY "Admins can delete waitlist entries"
ON public.waitlist
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add comment explaining the security model
COMMENT ON TABLE public.waitlist IS 'Waitlist signups. Public can INSERT to join, but only admins can read/update/delete entries to protect customer PII (emails, names).';