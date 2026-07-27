ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type = ANY (ARRAY[
    'application', 'like', 'comment', 'collaboration',
    'ambassador_new_referral', 'ambassador_milestone', 'ambassador_signup',
    'ambassador_subscription', 'ambassador_tier_change', 'ambassador_requirement_update',
    'application_received', 'brand_application_received',
    'platform_announcement', 'new_creator_joined', 'new_host_joined',
    'new_brand_joined', 'platform_update',
    'campaign_invitation'
  ])
);