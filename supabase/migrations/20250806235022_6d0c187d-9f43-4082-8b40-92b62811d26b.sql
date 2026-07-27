-- Add trial and lifetime support to subscription plans
ALTER TABLE public.subscription_plans 
ADD COLUMN trial_days INTEGER DEFAULT 0,
ADD COLUMN is_one_time BOOLEAN DEFAULT false,
ADD COLUMN one_time_price INTEGER DEFAULT NULL;

-- Update existing plans to add 30-day trial for Premium and Enterprise
UPDATE public.subscription_plans 
SET trial_days = 30 
WHERE name IN ('Premium', 'Enterprise');

-- Insert new Lifetime plan
INSERT INTO public.subscription_plans (
  name,
  description,
  price_monthly,
  price_yearly,
  one_time_price,
  is_one_time,
  trial_days,
  features,
  max_applications_per_month,
  max_brand_partnerships,
  is_active,
  display_order
) VALUES (
  'Lifetime',
  'One-time payment for lifetime access to basic features',
  0, -- No monthly price for lifetime
  0, -- No yearly price for lifetime
  9900, -- $99 one-time price in cents
  true, -- This is a one-time payment
  0, -- No trial for lifetime plan
  '["Access to basic marketplace features", "Apply to up to 5 properties per month", "Basic profile customization", "Email support", "Lifetime access - no recurring fees"]'::jsonb,
  5, -- 5 applications per month
  1, -- 1 brand partnership per month
  true,
  0 -- Display first
);