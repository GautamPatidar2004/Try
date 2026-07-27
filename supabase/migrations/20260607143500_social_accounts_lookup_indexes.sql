-- Cross-app support: hostfluencerX matches its creators (by handle/platform) back
-- to hostfluencer social_accounts to reuse their connected Meta/TikTok logins.
-- social_accounts had indexes only on influencer_id, token expiry and sync flags,
-- so that reverse lookup was a full table scan. Add covering lookup indexes.
-- Purely additive (CREATE INDEX IF NOT EXISTS); no data or schema is altered.

create index if not exists idx_social_accounts_platform_username
  on public.social_accounts (platform, lower(username));

create index if not exists idx_social_accounts_platform_user_id
  on public.social_accounts (platform, platform_user_id)
  where platform_user_id is not null;
