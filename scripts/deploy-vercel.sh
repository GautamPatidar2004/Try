#!/usr/bin/env bash
# =============================================================================
# Phase 2A — automate the Lovable -> Vercel migration up to (but NOT including)
# the DNS cutover. Safe to run repeatedly; it only ever creates a Vercel project
# and a PREVIEW deploy unless you explicitly pass --prod.
#
# It does NOT touch DNS, does NOT change the live hostfluencer.com site, and does
# NOT push any secret (only client-side VITE_* vars, which are public by design).
#
# Prereqs:
#   - Run from the app dir (…/Project/hostfluencer/hostfluencer)
#   - A .env file with the VITE_* vars (already present)
#   - Auth: either run `vercel login` first, OR `export VERCEL_TOKEN=…`
#
# Usage:
#   bash scripts/deploy-vercel.sh            # link project + push env + PREVIEW deploy
#   bash scripts/deploy-vercel.sh --prod     # same, but a PRODUCTION deploy (still no DNS change)
# =============================================================================
set -euo pipefail

PROD=false
[[ "${1:-}" == "--prod" ]] && PROD=true

TOKEN_ARG=()
[[ -n "${VERCEL_TOKEN:-}" ]] && TOKEN_ARG=(--token "$VERCEL_TOKEN")

cd "$(dirname "$0")/.."   # repo/app root

# 1. Vercel CLI present?
if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Installing globally…"
  npm i -g vercel
fi

# 2. Link (or create) the Vercel project. --yes accepts defaults; idempotent.
echo "==> Linking Vercel project (creates it on first run)…"
vercel link --yes "${TOKEN_ARG[@]}"

# 3. Push ONLY the client-side VITE_* vars from .env to Vercel (production + preview).
#    Secrets (META_*, TIKTOK_*, HFX_*) are deliberately skipped — they belong to
#    edge functions / server-side, never the static frontend build.
echo "==> Syncing VITE_* environment variables…"
if [[ -f .env ]]; then
  while IFS='=' read -r key val || [[ -n "$key" ]]; do
    [[ "$key" =~ ^VITE_ ]] || continue
    # strip surrounding quotes and a trailing CR
    val="${val%$'\r'}"; val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    # SAFETY: VITE_* vars are bundled into the public browser build. Never push a
    # value that looks like a server secret, even if it's (mis)prefixed with VITE_.
    if [[ "$val" == sb_secret_* || "$val" == sk_* || "$val" == *_SECRET_* \
          || "$key" == *SERVICE_KEY* || "$key" == *SECRET* ]]; then
      echo "   SKIPPED $key — looks like a server secret; VITE_ vars are PUBLIC. Keep secrets in server/edge env only."
      continue
    fi
    for ENVNAME in production preview; do
      vercel env rm "$key" "$ENVNAME" --yes "${TOKEN_ARG[@]}" >/dev/null 2>&1 || true
      printf '%s' "$val" | vercel env add "$key" "$ENVNAME" "${TOKEN_ARG[@]}" >/dev/null
      echo "   set $key ($ENVNAME)"
    done
  done < .env
else
  echo "   WARNING: no .env found — set VITE_* vars in the Vercel dashboard manually."
fi

# 4. Deploy. Preview by default; production only with --prod. Neither changes DNS.
if $PROD; then
  echo "==> PRODUCTION deploy (no custom-domain change until you map it)…"
  URL=$(vercel deploy --prod --yes "${TOKEN_ARG[@]}")
else
  echo "==> PREVIEW deploy…"
  URL=$(vercel deploy --yes "${TOKEN_ARG[@]}")
fi

echo ""
echo "============================================================"
echo " Deploy URL: $URL"
echo " QA this URL thoroughly. The live hostfluencer.com is untouched."
echo " To go live, follow the DNS cutover section in PHASE2_VERCEL.md (project root)."
echo "============================================================"
