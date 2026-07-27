-- Update Pro plan features to remove duplicate and add restaurant access
UPDATE subscription_plans
SET 
  features = jsonb_build_array(
    'Everything in Starter',
    'Advanced analytics (demographics, conversions, ROI)',
    'Affiliate link monetization',
    'Priority access to premium campaigns',
    'Verified Pro badge',
    'Access to restaurants with max of 10 applications per month'
  ),
  updated_at = now()
WHERE name = 'Pro' AND is_active = true;