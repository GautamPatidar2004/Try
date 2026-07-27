-- Remove free trial from all paid subscription plans
-- Since we have a free tier, paid plans should charge immediately

UPDATE subscription_plans 
SET trial_days = 0 
WHERE trial_days > 0;