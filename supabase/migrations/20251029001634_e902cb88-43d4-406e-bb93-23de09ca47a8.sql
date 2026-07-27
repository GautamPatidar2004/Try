-- Create brands table
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  website TEXT,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Brands can view their own profile"
  ON public.brands
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can insert their own profile"
  ON public.brands
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Brands can update their own profile"
  ON public.brands
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Public can view verified brands (for marketplace/campaigns)
CREATE POLICY "Anyone can view verified brand basic info"
  ON public.brands
  FOR SELECT
  USING (verified = true);

-- Trigger for updated_at
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;