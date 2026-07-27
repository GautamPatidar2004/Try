-- Phase 1: Update Subscription Plans

-- Deactivate all existing plans
UPDATE subscription_plans 
SET is_active = false, 
    updated_at = now()
WHERE is_active = true;

-- Insert new subscription plans
INSERT INTO subscription_plans (
  name,
  description,
  price_monthly,
  price_yearly,
  max_applications_per_month,
  max_brand_partnerships,
  trial_days,
  features,
  display_order,
  is_active
) VALUES 
(
  'Starter',
  'Perfect for getting started',
  0,
  0,
  NULL,
  NULL,
  0,
  '["Profile listing", "Host discovery", "Basic analytics (reach, engagement, growth)", "Apply to campaigns"]'::jsonb,
  1,
  true
),
(
  'Pro',
  'For professional creators',
  4999,
  49990,
  100,
  10,
  14,
  '["Everything in Starter", "Advanced analytics (demographics, conversions, ROI)", "Affiliate link monetization", "Priority access to premium campaigns", "Verified Pro badge", "100 applications per month"]'::jsonb,
  2,
  true
),
(
  'Elite',
  'For elite creators',
  9999,
  99990,
  NULL,
  NULL,
  14,
  '["Everything in Pro", "Full analytics suite + benchmarking", "Higher affiliate commission rates", "Early invites to high-value campaigns", "Content licensing opportunities", "Unlimited applications"]'::jsonb,
  3,
  true
);