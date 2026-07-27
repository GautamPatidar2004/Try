-- Remove lifetime subscription plans and cleanup
DELETE FROM subscriptions WHERE billing_interval = 'lifetime';
DELETE FROM subscription_plans WHERE is_one_time = true;

-- Remove lifetime-related columns from subscription_plans table
ALTER TABLE subscription_plans DROP COLUMN IF EXISTS is_one_time;
ALTER TABLE subscription_plans DROP COLUMN IF EXISTS one_time_price;