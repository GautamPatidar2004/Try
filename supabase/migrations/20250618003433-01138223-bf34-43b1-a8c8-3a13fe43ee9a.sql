
-- Create waitlist table to store user signups
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT CHECK (user_type IN ('host', 'creator', 'both')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public signup)
CREATE POLICY "Anyone can signup to waitlist" 
  ON public.waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow reading waitlist entries (for admin dashboard)
CREATE POLICY "Anyone can view waitlist entries" 
  ON public.waitlist 
  FOR SELECT 
  USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Create index on created_at for faster sorting
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);
