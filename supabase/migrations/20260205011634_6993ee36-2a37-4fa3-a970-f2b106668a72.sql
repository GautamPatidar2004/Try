-- Add pricing columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS base_nightly_rate INTEGER DEFAULT NULL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add comments for documentation
COMMENT ON COLUMN public.properties.base_nightly_rate 
IS 'Base nightly rate in cents (e.g., 30000 = $300.00). Used to calculate creator discount pricing.';

COMMENT ON COLUMN public.properties.currency 
IS 'Currency code for the nightly rate (default USD)';