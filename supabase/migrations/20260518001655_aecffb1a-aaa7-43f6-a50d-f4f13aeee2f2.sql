
-- ============================================================
-- Drop overly-permissive "System can ..." policies
-- (service_role bypasses RLS so no replacement is needed)
-- ============================================================

DROP POLICY IF EXISTS "System can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "System can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can manage earnings" ON public.earnings;
DROP POLICY IF EXISTS "System can update earnings" ON public.earnings;
DROP POLICY IF EXISTS "System can create commissions" ON public.referral_commissions;
DROP POLICY IF EXISTS "System can insert earnings" ON public.ambassador_earnings;
DROP POLICY IF EXISTS "System can insert contracts" ON public.ambassador_contracts;
DROP POLICY IF EXISTS "System can insert referrals" ON public.ambassador_referrals;
DROP POLICY IF EXISTS "System can insert collaborations" ON public.ambassador_collaborations;
DROP POLICY IF EXISTS "System can manage streaks" ON public.ambassador_streaks;
DROP POLICY IF EXISTS "System can insert clicks" ON public.ambassador_referral_clicks;
DROP POLICY IF EXISTS "System can create mutual matches" ON public.mutual_matches;
DROP POLICY IF EXISTS "System can create user notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create admin notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "System can award badges" ON public.user_badges;
DROP POLICY IF EXISTS "System can create achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "System can manage all match scores" ON public.ai_match_scores;
DROP POLICY IF EXISTS "System can manage referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can manage subscription usage" ON public.subscription_usage;
DROP POLICY IF EXISTS "System can insert ad insights" ON public.meta_ad_insights;
DROP POLICY IF EXISTS "System can create collaboration agreements" ON public.collaboration_agreements;
DROP POLICY IF EXISTS "System can insert recommendations" ON public.ai_recommendations;
DROP POLICY IF EXISTS "System can insert reports" ON public.content_intelligence_reports;
DROP POLICY IF EXISTS "System can insert funnel steps" ON public.conversion_funnel_steps;
DROP POLICY IF EXISTS "System can insert activity" ON public.user_activity_timeline;
DROP POLICY IF EXISTS "System can create transactions" ON public.point_transactions;

-- ============================================================
-- Privilege escalation: users cannot self-grant points
-- ============================================================
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can insert their own points" ON public.user_points;

-- ============================================================
-- referral_codes: restrict from anon, keep authenticated read
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active referral codes for validation" ON public.referral_codes;
CREATE POLICY "Authenticated users can view active referral codes"
  ON public.referral_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================
-- badge_progress realtime: remove from broadcast publication
-- ============================================================
ALTER PUBLICATION supabase_realtime DROP TABLE public.badge_progress;

-- ============================================================
-- Storage: enforce per-folder ownership on INSERT
-- ============================================================
DROP POLICY IF EXISTS "Hosts can upload property images" ON storage.objects;
CREATE POLICY "Hosts can upload property images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.uid() IN (
      SELECT host_id FROM public.properties
      WHERE id = ((storage.foldername(name))[1])::uuid
    )
  );

DROP POLICY IF EXISTS "Users can upload collaboration content" ON storage.objects;
CREATE POLICY "Users can upload collaboration content"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'collaboration-content'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
