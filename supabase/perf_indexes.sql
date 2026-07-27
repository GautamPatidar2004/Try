-- Performance indexes — Hostfluencer (project dkahqqmcmwfaxjxmfxne)
-- =============================================================================
-- ⚠️ NOT URGENT (validated 2026-06-25 against live row counts): these tables are
-- currently SMALL — subscriptions 654, influencers 536, automation_enrollments 123,
-- transactions 245, social_accounts 6. At <1k rows a sequential scan is microseconds,
-- so these indexes will NOT measurably speed up the app today. The one large table,
-- automation_execution_log (~37k rows), is ALREADY indexed and write-only.
-- Keep this file as FUTURE-PROOFING: apply it (and re-run EXPLAIN) once any of these
-- tables grows past ~10k rows. It is not the fix for current slowness — the frontend
-- bundle and edge-function round-trips were.
--
-- WHY (when scale arrives): subscriptions, automation_enrollments, and influencers
-- have NO indexes; transactions is missing an index on payer_id.
--
-- HOW TO APPLY (active users — must stay online):
--   * CREATE INDEX CONCURRENTLY is NON-LOCKING but CANNOT run inside a transaction,
--     so this file must NOT be applied via `supabase db push` (which wraps each
--     migration in a transaction). Run it instead with either:
--       - Supabase Studio → SQL Editor (paste & run), OR
--       - psql:  psql "$DB_URL" -f supabase/perf_indexes.sql
--   * Apply to the Supabase DEV BRANCH first, confirm with EXPLAIN, then PROD.
--   * Every statement is IF NOT EXISTS, so re-running is safe.
--
-- VALIDATION: column names verified against src/integrations/supabase/types.ts.
-- These are evidence-based candidates; confirm hot paths with EXPLAIN (ANALYZE,
-- BUFFERS) before/after on prod-representative data.
-- =============================================================================

-- subscriptions: status checks per influencer + Stripe webhook/portal lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_influencer_status
  ON public.subscriptions (influencer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON public.subscriptions (stripe_subscription_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_stripe_customer_id
  ON public.subscriptions (stripe_customer_id);

-- automation_enrollments: cron scans active enrollments by flow + per-user lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_enrollments_flow_status
  ON public.automation_enrollments (flow_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_enrollments_user_id
  ON public.automation_enrollments (user_id);
-- partial index for the "due to advance" cron query (active rows only)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_enrollments_active_laststep
  ON public.automation_enrollments (last_step_at)
  WHERE status = 'active';

-- influencers: discovery/matching — array niche/tag search (GIN) + follower sort
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_content_niches_gin
  ON public.influencers USING GIN (content_niches);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_lifestyle_tags_gin
  ON public.influencers USING GIN (lifestyle_tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencers_total_followers
  ON public.influencers (total_followers DESC);

-- transactions: payer history (payer_id is NOT indexed; recipient_id/status/type/
-- created_at already are) + Stripe idempotency lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_payer_created
  ON public.transactions (payer_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_stripe_payment_intent_id
  ON public.transactions (stripe_payment_intent_id);

-- social_accounts: scheduled-analytics-sync cron selects accounts due for sync
-- (influencer_id is already indexed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_accounts_platform_sync
  ON public.social_accounts (platform, last_sync_at)
  WHERE sync_enabled = true;
