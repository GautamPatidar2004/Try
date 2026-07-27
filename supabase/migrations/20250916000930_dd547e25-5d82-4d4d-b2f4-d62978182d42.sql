-- Add new fields to waitlist table for invitation tracking
ALTER TABLE public.waitlist 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'activated', 'declined')),
ADD COLUMN invited_at timestamp with time zone,
ADD COLUMN activated_at timestamp with time zone,
ADD COLUMN temp_password text;

-- Create index for better performance on status queries
CREATE INDEX idx_waitlist_status ON public.waitlist(status);

-- Update RLS policies to allow admins to update waitlist entries
CREATE POLICY "Admins can update waitlist entries" 
ON public.waitlist 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));