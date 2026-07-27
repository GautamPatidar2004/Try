-- Remove free trial from Pro and Elite plans to enable immediate charging
UPDATE subscription_plans
SET trial_days = 0,
    updated_at = now()
WHERE name IN ('Pro', 'Elite')
  AND is_active = true;