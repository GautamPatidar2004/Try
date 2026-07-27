-- Add affiliate commission rate column to collaboration_agreements
ALTER TABLE public.collaboration_agreements 
ADD COLUMN IF NOT EXISTS affiliate_commission_rate DECIMAL(5,4) DEFAULT 0.10;

COMMENT ON COLUMN public.collaboration_agreements.affiliate_commission_rate 
IS 'Commission rate agreed upon by host and creator (0.10 = 10%, 0.20 = 20%, 0.25 = 25%)';