-- Create referral codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral commissions table
CREATE TABLE public.referral_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  commission_amount INTEGER NOT NULL DEFAULT 0,
  commission_percentage DECIMAL NOT NULL DEFAULT 10.0,
  subscription_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  subscription_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'::text,
  paid_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can manage their own referral codes" 
ON public.referral_codes 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active referral codes for validation" 
ON public.referral_codes 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for referrals
CREATE POLICY "Referrers can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "System can manage referrals" 
ON public.referrals 
FOR ALL 
USING (true);

-- RLS Policies for referral_commissions
CREATE POLICY "Referrers can view their own commissions" 
ON public.referral_commissions 
FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all commissions" 
ON public.referral_commissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create commissions" 
ON public.referral_commissions 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX idx_referral_commissions_referrer_id ON public.referral_commissions(referrer_id);
CREATE INDEX idx_referral_commissions_status ON public.referral_commissions(status);

-- Add trigger for updated_at columns
CREATE TRIGGER update_referral_codes_updated_at
BEFORE UPDATE ON public.referral_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_commissions_updated_at
BEFORE UPDATE ON public.referral_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_username TEXT;
  v_first_name TEXT;
  v_code TEXT;
  v_counter INTEGER := 0;
  v_exists BOOLEAN;
BEGIN
  -- Get user details
  SELECT username, first_name INTO v_username, v_first_name
  FROM profiles
  WHERE id = p_user_id;
  
  -- Try username-based code first
  IF v_username IS NOT NULL THEN
    v_code := UPPER(v_username) || DATE_PART('year', now())::TEXT;
  ELSIF v_first_name IS NOT NULL THEN
    v_code := UPPER(v_first_name) || DATE_PART('year', now())::TEXT;
  ELSE
    v_code := 'USER' || DATE_PART('year', now())::TEXT;
  END IF;
  
  -- Ensure uniqueness
  LOOP
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    
    IF NOT v_exists THEN
      EXIT;
    END IF;
    
    v_counter := v_counter + 1;
    IF v_username IS NOT NULL THEN
      v_code := UPPER(v_username) || DATE_PART('year', now())::TEXT || v_counter::TEXT;
    ELSIF v_first_name IS NOT NULL THEN
      v_code := UPPER(v_first_name) || DATE_PART('year', now())::TEXT || v_counter::TEXT;
    ELSE
      v_code := 'USER' || DATE_PART('year', now())::TEXT || v_counter::TEXT;
    END IF;
    
    -- Safety check to prevent infinite loop
    IF v_counter > 999 THEN
      v_code := 'REF' || gen_random_uuid()::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_code;
END;
$$;