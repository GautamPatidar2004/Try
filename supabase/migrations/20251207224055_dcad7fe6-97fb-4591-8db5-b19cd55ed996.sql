-- Add new columns to subscription_plans for the revamped pricing system
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS user_type_category text DEFAULT 'supply' CHECK (user_type_category IN ('demand', 'supply')),
ADD COLUMN IF NOT EXISTS max_listings integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_campaigns integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_profile_views_per_month integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_outbound_invites_per_month integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_pitches_per_month integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS search_priority integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS has_verified_badge boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_ai_matching boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_media_kit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_advanced_analytics boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS team_seats integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS marketplace_boosts_per_month integer DEFAULT 0;

-- Add comment for the user_type_category column
COMMENT ON COLUMN public.subscription_plans.user_type_category IS 'demand = Brands/Stays/Restaurants, supply = Creators/Influencers';

-- Deactivate old plans
UPDATE public.subscription_plans SET is_active = false WHERE is_active = true;

-- Insert new DEMAND-SIDE plans (Brands/Stays/Restaurants)

-- Demand Starter (Free)
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, max_applications_per_month, 
  trial_days, is_active, display_order, features, user_type_category,
  max_listings, max_campaigns, max_profile_views_per_month, max_outbound_invites_per_month,
  search_priority, has_verified_badge, has_ai_matching, has_advanced_analytics, team_seats
) VALUES (
  'Starter',
  'Entry tier for new hosts, small restaurants, and emerging brands',
  0, 0, 5, 0, true, 1,
  '["1 Listing", "1 Active Campaign", "10 Influencer Profile Views/month", "5 Outbound Invites/month", "Manual Influencer Invites", "Basic Messaging", "Standard Support (72 hrs)"]',
  'demand',
  1, 1, 10, 5,
  1, false, false, false, 1
);

-- Demand Growth (Pro) - $49/month
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, max_applications_per_month, 
  trial_days, is_active, display_order, features, user_type_category,
  max_listings, max_campaigns, max_profile_views_per_month, max_outbound_invites_per_month,
  search_priority, has_verified_badge, has_ai_matching, has_advanced_analytics, team_seats
) VALUES (
  'Growth',
  'For active STR hosts, multi-location restaurants, and small-mid DTC brands',
  4900, 47000, 50, 7, true, 2,
  '["Up to 5 Listings", "Unlimited Influencer Browsing", "Verified Influencer Matching (AI)", "50 Outbound Invites/month", "Up to 5 Simultaneous Campaigns", "Content Tracking Dashboard", "Engagement + Benchmark Analytics", "Priority Support (24-48 hrs)"]',
  'demand',
  5, 5, NULL, 50,
  2, true, true, true, 1
);

-- Demand Scale (Premium) - $199/month
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, max_applications_per_month, 
  trial_days, is_active, display_order, features, user_type_category,
  max_listings, max_campaigns, max_profile_views_per_month, max_outbound_invites_per_month,
  search_priority, has_verified_badge, has_ai_matching, has_advanced_analytics, team_seats
) VALUES (
  'Scale',
  'For multi-property managers, restaurant chains, and established mid-market brands',
  19900, 190000, NULL, 7, true, 3,
  '["Unlimited Listings", "Priority Booking Visibility", "White-glove Campaign Management", "AI Content Recommendations + Brief Generator", "Advanced Analytics Suite", "Attribution Modeling", "ROI Forecasting", "Custom Branding", "5 Team Seats", "Dedicated Account Manager", "API Access (Add-on)"]',
  'demand',
  NULL, NULL, NULL, NULL,
  3, true, true, true, 5
);

-- Insert new SUPPLY-SIDE plans (Creators)

-- Creator Starter (Free)
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, max_applications_per_month, 
  trial_days, is_active, display_order, features, user_type_category,
  max_pitches_per_month, search_priority, has_verified_badge, has_media_kit, has_advanced_analytics, marketplace_boosts_per_month
) VALUES (
  'Creator Starter',
  'Free tier for creators to get started on the platform',
  0, 0, 10, 0, true, 4,
  '["Basic Creator Profile", "Limited Portfolio", "Up to 10 Pitches/month", "Basic Analytics (Monthly Views)", "Standard Support (72 hrs)"]',
  'supply',
  10, 1, false, false, false, 0
);

-- Creator Pro - $9.99/month
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, max_applications_per_month, 
  trial_days, is_active, display_order, features, user_type_category,
  max_pitches_per_month, search_priority, has_verified_badge, has_media_kit, has_advanced_analytics, marketplace_boosts_per_month
) VALUES (
  'Creator Pro',
  'The default tier for serious creators focused on deal flow',
  999, 9500, NULL, 7, true, 5,
  '["Verified Creator Badge", "Unlimited Pitches", "Priority Search Ranking", "Full Analytics Dashboard", "Media Kit Builder", "Access to Paid Brand Campaigns", "AI Content Value Calculator", "Direct Monetization Link"]',
  'supply',
  NULL, 2, true, true, true, 0
);

-- Creator Premium - $29.99/month
INSERT INTO public.subscription_plans (
  name, description, price_monthly, price_yearly, max_applications_per_month, 
  trial_days, is_active, display_order, features, user_type_category,
  max_pitches_per_month, search_priority, has_verified_badge, has_media_kit, has_advanced_analytics, marketplace_boosts_per_month
) VALUES (
  'Creator Premium',
  'For full-time creators, micro-influencer agencies, and high performers',
  2999, 28700, NULL, 7, true, 6,
  '["Top-tier Search Priority", "Featured Placement", "5 Marketplace Boosts/month", "Audience Demographics Analytics", "Brand Affinity Scoring", "AI Negotiation Assistant", "Unlimited Media Kits + Branding", "Creator Portfolio Website", "Collaboration Revenue Dashboard", "Priority Support (24 hrs)"]',
  'supply',
  NULL, 3, true, true, true, 5
);