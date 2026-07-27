-- Add referral code tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- Add index for looking up referrals
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_code ON public.profiles(referred_by_code);

-- Create function to handle new user signup with referral code
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  ambassador_record RECORD;
BEGIN
  -- Only process if there's a referral code
  IF NEW.referred_by_code IS NOT NULL AND NEW.referred_by_code != '' THEN
    -- Find the ambassador with this referral code
    SELECT id, user_id INTO ambassador_record
    FROM public.ambassador_members
    WHERE referral_code = NEW.referred_by_code
    AND status = 'active';
    
    IF ambassador_record.id IS NOT NULL THEN
      -- Create the ambassador referral record
      INSERT INTO public.ambassador_referrals (
        ambassador_id,
        referred_user_id,
        referral_type,
        conversion_stage,
        signup_date,
        commission_rate,
        status
      ) VALUES (
        ambassador_record.id,
        NEW.id,
        'creator', -- Default type, can be updated based on user_type
        'signup',
        NOW(),
        0.20, -- 20% commission rate
        'active'
      );
      
      RAISE NOTICE 'Created referral for user % from ambassador %', NEW.id, ambassador_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new signups with referral code
DROP TRIGGER IF EXISTS on_profile_referral_signup ON public.profiles;
CREATE TRIGGER on_profile_referral_signup
  AFTER INSERT OR UPDATE OF referred_by_code ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_signup();

-- Create function to calculate and create commission on subscription payment
CREATE OR REPLACE FUNCTION public.create_ambassador_commission(
  p_user_id UUID,
  p_amount NUMERIC,
  p_subscription_tier TEXT,
  p_stripe_invoice_id TEXT
)
RETURNS UUID AS $$
DECLARE
  referral_record RECORD;
  commission_amount NUMERIC;
  earning_id UUID;
BEGIN
  -- Find if this user was referred by an ambassador
  SELECT ar.id, ar.ambassador_id, ar.commission_rate, am.user_id as ambassador_user_id
  INTO referral_record
  FROM public.ambassador_referrals ar
  JOIN public.ambassador_members am ON am.id = ar.ambassador_id
  WHERE ar.referred_user_id = p_user_id
  AND ar.status = 'active';
  
  IF referral_record.id IS NULL THEN
    RAISE NOTICE 'No active referral found for user %', p_user_id;
    RETURN NULL;
  END IF;
  
  -- Calculate commission (20% of subscription amount)
  commission_amount := p_amount * COALESCE(referral_record.commission_rate, 0.20);
  
  -- Create pending earning record
  INSERT INTO public.ambassador_earnings (
    ambassador_id,
    amount,
    earning_type,
    status,
    metadata
  ) VALUES (
    referral_record.ambassador_id,
    commission_amount,
    'referral_commission',
    'pending',
    jsonb_build_object(
      'referred_user_id', p_user_id,
      'subscription_tier', p_subscription_tier,
      'original_amount', p_amount,
      'stripe_invoice_id', p_stripe_invoice_id,
      'referral_id', referral_record.id
    )
  )
  RETURNING id INTO earning_id;
  
  -- Update the referral record with subscription info
  UPDATE public.ambassador_referrals
  SET 
    conversion_stage = 'subscription',
    subscription_tier = p_subscription_tier,
    total_earned = COALESCE(total_earned, 0) + commission_amount,
    lifetime_value = COALESCE(lifetime_value, 0) + p_amount,
    updated_at = NOW()
  WHERE id = referral_record.id;
  
  RAISE NOTICE 'Created commission of % for ambassador % from user %', 
    commission_amount, referral_record.ambassador_id, p_user_id;
  
  RETURN earning_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;