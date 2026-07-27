-- Create giveaway_entries table
CREATE TABLE IF NOT EXISTS public.giveaway_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  age_verified BOOLEAN NOT NULL DEFAULT false,
  us_resident BOOLEAN NOT NULL DEFAULT false,
  instagram_username TEXT,
  entry_source TEXT NOT NULL DEFAULT 'website',
  referral_count INTEGER DEFAULT 0,
  shared_to_story BOOLEAN DEFAULT false,
  terms_agreed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_email UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit giveaway entry (public giveaway, no auth required)
CREATE POLICY "Anyone can submit giveaway entry"
  ON public.giveaway_entries 
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all entries
CREATE POLICY "Admins can view all giveaway entries"
  ON public.giveaway_entries
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Policy: Admins can update entries
CREATE POLICY "Admins can update giveaway entries"
  ON public.giveaway_entries
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create index for faster email lookups
CREATE INDEX idx_giveaway_entries_email ON public.giveaway_entries(email);
CREATE INDEX idx_giveaway_entries_created_at ON public.giveaway_entries(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_giveaway_entries_updated_at
  BEFORE UPDATE ON public.giveaway_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();