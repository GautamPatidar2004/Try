-- Update Pro plan pricing to $9.99/month
UPDATE subscription_plans
SET 
  price_monthly = 999,
  price_yearly = 9990,
  updated_at = now()
WHERE name = 'Pro' 
  AND is_active = true;

-- Update Elite plan pricing to $29.99/month
UPDATE subscription_plans
SET 
  price_monthly = 2999,
  price_yearly = 29990,
  updated_at = now()
WHERE name = 'Elite'
  AND is_active = true;