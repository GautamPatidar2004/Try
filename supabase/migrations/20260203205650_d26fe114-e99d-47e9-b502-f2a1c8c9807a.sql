-- =====================================================
-- CREATOR AFFILIATE CODE SYSTEM - PHASE 1
-- =====================================================

-- 1. Create creator_affiliate_codes table
CREATE TABLE public.creator_affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID REFERENCES public.collaboration_agreements(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  host_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'flat_fee')),
  flat_fee_amount INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create affiliate_conversions table
CREATE TABLE public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code_id UUID NOT NULL REFERENCES public.creator_affiliate_codes(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  host_id UUID NOT NULL,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('booking', 'product_sale', 'restaurant_reservation', 'experience', 'other')),
  order_amount INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  external_reference TEXT,
  customer_email_hash TEXT,
  converted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create creator_payouts table
CREATE TABLE public.creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  conversion_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS on all tables
ALTER TABLE public.creator_affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for creator_affiliate_codes

-- Creators can view their own codes
CREATE POLICY "Creators can view their own affiliate codes"
ON public.creator_affiliate_codes
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Hosts can view codes for their properties
CREATE POLICY "Hosts can view affiliate codes for their properties"
ON public.creator_affiliate_codes
FOR SELECT
TO authenticated
USING (host_id = auth.uid());

-- Admins can view all codes
CREATE POLICY "Admins can view all affiliate codes"
ON public.creator_affiliate_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can manage all codes (for edge functions)
CREATE POLICY "Service role can manage affiliate codes"
ON public.creator_affiliate_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Hosts can update codes for their properties (activate/deactivate)
CREATE POLICY "Hosts can update their affiliate codes"
ON public.creator_affiliate_codes
FOR UPDATE
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- 6. RLS Policies for affiliate_conversions

-- Creators can view their own conversions
CREATE POLICY "Creators can view their own conversions"
ON public.affiliate_conversions
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Hosts can view conversions for their properties
CREATE POLICY "Hosts can view their conversions"
ON public.affiliate_conversions
FOR SELECT
TO authenticated
USING (host_id = auth.uid());

-- Hosts can insert conversions (log sales)
CREATE POLICY "Hosts can log conversions"
ON public.affiliate_conversions
FOR INSERT
TO authenticated
WITH CHECK (host_id = auth.uid());

-- Hosts can update conversions (confirm/cancel)
CREATE POLICY "Hosts can update their conversions"
ON public.affiliate_conversions
FOR UPDATE
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- Admins can view all conversions
CREATE POLICY "Admins can view all conversions"
ON public.affiliate_conversions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all conversions
CREATE POLICY "Admins can update all conversions"
ON public.affiliate_conversions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage all conversions
CREATE POLICY "Service role can manage conversions"
ON public.affiliate_conversions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. RLS Policies for creator_payouts

-- Creators can view their own payouts
CREATE POLICY "Creators can view their own payouts"
ON public.creator_payouts
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Creators can request payouts (insert)
CREATE POLICY "Creators can request payouts"
ON public.creator_payouts
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- Admins can view all payouts
CREATE POLICY "Admins can view all payouts"
ON public.creator_payouts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update payouts
CREATE POLICY "Admins can update payouts"
ON public.creator_payouts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can manage all payouts
CREATE POLICY "Service role can manage payouts"
ON public.creator_payouts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Create indexes for performance
CREATE INDEX idx_creator_affiliate_codes_creator_id ON public.creator_affiliate_codes(creator_id);
CREATE INDEX idx_creator_affiliate_codes_host_id ON public.creator_affiliate_codes(host_id);
CREATE INDEX idx_creator_affiliate_codes_code ON public.creator_affiliate_codes(code);
CREATE INDEX idx_creator_affiliate_codes_collaboration_id ON public.creator_affiliate_codes(collaboration_id);
CREATE INDEX idx_creator_affiliate_codes_is_active ON public.creator_affiliate_codes(is_active);

CREATE INDEX idx_affiliate_conversions_creator_id ON public.affiliate_conversions(creator_id);
CREATE INDEX idx_affiliate_conversions_host_id ON public.affiliate_conversions(host_id);
CREATE INDEX idx_affiliate_conversions_affiliate_code_id ON public.affiliate_conversions(affiliate_code_id);
CREATE INDEX idx_affiliate_conversions_status ON public.affiliate_conversions(status);
CREATE INDEX idx_affiliate_conversions_converted_at ON public.affiliate_conversions(converted_at);

CREATE INDEX idx_creator_payouts_creator_id ON public.creator_payouts(creator_id);
CREATE INDEX idx_creator_payouts_status ON public.creator_payouts(status);

-- 9. Create function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION public.generate_affiliate_code(
  p_creator_name TEXT,
  p_property_name TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_base_code TEXT;
  v_counter INTEGER := 0;
  v_year TEXT;
  v_exists BOOLEAN;
BEGIN
  v_year := EXTRACT(YEAR FROM now())::TEXT;
  v_year := RIGHT(v_year, 2);
  
  -- Create base code from creator name and property
  v_base_code := UPPER(
    REGEXP_REPLACE(
      LEFT(COALESCE(p_creator_name, 'CREATOR'), 10), 
      '[^A-Z0-9]', '', 'g'
    ) || '_' ||
    REGEXP_REPLACE(
      LEFT(COALESCE(p_property_name, 'PROP'), 8), 
      '[^A-Z0-9]', '', 'g'
    )
  );
  
  v_code := v_base_code || v_year;
  
  -- Check for uniqueness and add counter if needed
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM creator_affiliate_codes WHERE code = v_code
    ) INTO v_exists;
    
    IF NOT v_exists THEN
      EXIT;
    END IF;
    
    v_counter := v_counter + 1;
    v_code := v_base_code || v_year || v_counter::TEXT;
    
    -- Safety check
    IF v_counter > 999 THEN
      v_code := 'AFF' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- 10. Create trigger to update updated_at on creator_affiliate_codes
CREATE TRIGGER update_creator_affiliate_codes_updated_at
BEFORE UPDATE ON public.creator_affiliate_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Create trigger to increment current_uses when conversion is created
CREATE OR REPLACE FUNCTION public.increment_affiliate_code_uses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE creator_affiliate_codes
  SET current_uses = current_uses + 1
  WHERE id = NEW.affiliate_code_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_code_uses_on_conversion
AFTER INSERT ON public.affiliate_conversions
FOR EACH ROW
EXECUTE FUNCTION public.increment_affiliate_code_uses();