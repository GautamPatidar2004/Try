-- Fix ambassador_members → profiles
ALTER TABLE ambassador_members 
  DROP CONSTRAINT ambassador_members_user_id_fkey,
  ADD CONSTRAINT ambassador_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix ambassador_referrals → profiles
ALTER TABLE ambassador_referrals
  DROP CONSTRAINT ambassador_referrals_referred_user_id_fkey,
  ADD CONSTRAINT ambassador_referrals_referred_user_id_fkey
    FOREIGN KEY (referred_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix ambassador_referrals → ambassador_members
ALTER TABLE ambassador_referrals
  DROP CONSTRAINT ambassador_referrals_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_referrals_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_collaborations → ambassador_members
ALTER TABLE ambassador_collaborations
  DROP CONSTRAINT ambassador_collaborations_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_collaborations_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_earnings → ambassador_members
ALTER TABLE ambassador_earnings
  DROP CONSTRAINT ambassador_earnings_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_earnings_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_content_tracking → ambassador_members
ALTER TABLE ambassador_content_tracking
  DROP CONSTRAINT ambassador_content_tracking_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_content_tracking_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_bonuses → ambassador_members
ALTER TABLE ambassador_bonuses
  DROP CONSTRAINT ambassador_bonuses_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_bonuses_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_training_progress → ambassador_members
ALTER TABLE ambassador_training_progress
  DROP CONSTRAINT ambassador_training_progress_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_training_progress_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_streaks → ambassador_members
ALTER TABLE ambassador_streaks
  DROP CONSTRAINT ambassador_streaks_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_streaks_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_contracts → ambassador_members
ALTER TABLE ambassador_contracts
  DROP CONSTRAINT ambassador_contracts_ambassador_member_id_fkey,
  ADD CONSTRAINT ambassador_contracts_ambassador_member_id_fkey
    FOREIGN KEY (ambassador_member_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_payouts → ambassador_members
ALTER TABLE ambassador_payouts
  DROP CONSTRAINT ambassador_payouts_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_payouts_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_referral_clicks → ambassador_members
ALTER TABLE ambassador_referral_clicks
  DROP CONSTRAINT ambassador_referral_clicks_ambassador_id_fkey,
  ADD CONSTRAINT ambassador_referral_clicks_ambassador_id_fkey
    FOREIGN KEY (ambassador_id) REFERENCES ambassador_members(id) ON DELETE CASCADE;

-- Fix ambassador_referral_clicks → profiles (converted_user_id)
ALTER TABLE ambassador_referral_clicks
  DROP CONSTRAINT ambassador_referral_clicks_converted_user_id_fkey,
  ADD CONSTRAINT ambassador_referral_clicks_converted_user_id_fkey
    FOREIGN KEY (converted_user_id) REFERENCES profiles(id) ON DELETE SET NULL;