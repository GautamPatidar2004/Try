-- Deactivate old demand plans
UPDATE public.subscription_plans 
SET is_active = false 
WHERE user_type_category = 'demand';

-- Insert brand subscription plans
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, is_active, display_order, features, user_type_category,
  max_listings, max_campaigns, max_outbound_invites_per_month, search_priority, 
  has_verified_badge, has_ai_matching, has_advanced_analytics, team_seats, marketplace_boosts_per_month
) VALUES 
(
  'Entry',
  'For growing brands starting with creator partnerships',
  19900, 190000, true, 1,
  '["5 active campaigns", "Access to vetted creators", "Standard creator matching", "Basic analytics", "1 team seat"]',
  'demand',
  NULL, 5, 10, 1,
  false, false, false, 1, 0
),
(
  'Growth',
  'For active brands scaling their campaigns',
  49900, 475000, true, 2,
  '["Unlimited active campaigns", "AI-powered creator matching", "Advanced analytics dashboard", "3 team seats", "Priority support"]',
  'demand',
  NULL, -1, 50, 2,
  false, true, true, 3, 0
),
(
  'Scale',
  'For large brands requiring dedicated support and advanced tooling',
  99900, 950000, true, 3,
  '["Everything in Growth", "Dedicated campaign manager", "Custom creator onboarding", "Unlimited team seats", "24/7 Premium support"]',
  'demand',
  NULL, -1, -1, 3,
  false, true, true, 999, 0
);

-- Insert host subscription plans
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, is_active, display_order, features, user_type_category,
  max_listings, max_campaigns, max_pitches_per_month, search_priority, 
  has_verified_badge, has_ai_matching, has_advanced_analytics, team_seats, marketplace_boosts_per_month
) VALUES 
(
  'Check-in',
  'For individual hosts getting started with content collaborations',
  29900, 287100, true, 4,
  '["1 property listing", "10 creator pitches/month", "Verified property badge", "Basic performance stats", "Standard support"]',
  'demand',
  1, NULL, 10, 1,
  true, false, false, 1, 0
),
(
  'Extended Stay',
  'For hosts looking to scale their content library across multiple spaces',
  59900, 575100, true, 5,
  '["Up to 5 property listings", "Unlimited creator pitches", "AI-powered matching priority", "Advanced analytics", "Priority support"]',
  'demand',
  5, NULL, -1, 2,
  true, true, true, 1, 0
),
(
  'Owner',
  'For professional hosts and property managers with larger portfolios',
  109900, 1055100, true, 6,
  '["Unlimited property listings", "Unlimited creator pitches", "Featured property placements", "Dedicated account manager", "Premium support"]',
  'demand',
  -1, NULL, -1, 3,
  true, true, true, 1, 0
);
