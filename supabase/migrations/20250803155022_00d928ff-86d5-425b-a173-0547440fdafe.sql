-- Fix security warnings: Add SECURITY DEFINER and search_path settings to functions

-- Update check_subscription_status function
CREATE OR REPLACE FUNCTION public.check_subscription_status(influencer_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.influencer_id = influencer_user_id
      AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  );
$$;

-- Update calculate_platform_fee function
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(amount INTEGER, transaction_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  fee_percentage DECIMAL := 0.10; -- 10% default platform fee
BEGIN
  -- Different fee structures based on transaction type
  CASE transaction_type
    WHEN 'collaboration' THEN
      fee_percentage := 0.10; -- 10% for host-influencer collaborations
    WHEN 'brand_partnership' THEN
      fee_percentage := 0.15; -- 15% for brand partnerships
    ELSE
      fee_percentage := 0.10;
  END CASE;
  
  RETURN (amount * fee_percentage)::INTEGER;
END;
$$;

-- Update update_earnings function
CREATE OR REPLACE FUNCTION public.update_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  platform_fee INTEGER;
  net_amount INTEGER;
BEGIN
  -- Only process completed transactions
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate platform fee
    platform_fee := public.calculate_platform_fee(NEW.amount, NEW.type);
    net_amount := NEW.amount - platform_fee;
    
    -- Update transaction with calculated fees
    UPDATE public.transactions 
    SET platform_fee = platform_fee,
        net_amount = net_amount,
        updated_at = now()
    WHERE id = NEW.id;
    
    -- Create earnings record for recipient
    IF NEW.recipient_id IS NOT NULL AND NEW.type IN ('collaboration', 'brand_partnership') THEN
      INSERT INTO public.earnings (
        influencer_id,
        source_type,
        source_id,
        gross_amount,
        platform_fee,
        net_amount,
        currency,
        status,
        earned_at,
        available_at
      ) VALUES (
        NEW.recipient_id,
        NEW.type,
        NEW.related_id,
        NEW.amount,
        platform_fee,
        net_amount,
        NEW.currency,
        'available',
        NEW.processed_at,
        NEW.processed_at + INTERVAL '7 days' -- 7 day hold period
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, user_type)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    NULL  -- user_type will be set later in ProfileSetup
  );
  RETURN new;
END;
$$;

-- Update update_support_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_support_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;