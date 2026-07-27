#!/usr/bin/env bash
# =============================================================================
# Point the Vercel PREVIEW environment (the dev/staging deploys, e.g. the
# jean_develop branch) at the DEV Supabase branch. Production is NOT touched —
# it keeps pointing at the prod Supabase project.
#
# Run this once you've created the Supabase branch and have its API URL + keys.
#
# Auth: `vercel login` OR export VERCEL_TOKEN=…
# Provide the dev branch values via env:
#   DEV_SUPABASE_URL=https://<branch-ref>.supabase.co \
#   DEV_SUPABASE_ANON_KEY=<branch publishable/anon key> \
#   DEV_SUPABASE_PROJECT_ID=<branch-ref> \
#   bash scripts/set-vercel-dev-env.sh
# =============================================================================
set -euo pipefail

: "${DEV_SUPABASE_URL:?set DEV_SUPABASE_URL}"
: "${DEV_SUPABASE_ANON_KEY:?set DEV_SUPABASE_ANON_KEY}"
: "${DEV_SUPABASE_PROJECT_ID:?set DEV_SUPABASE_PROJECT_ID}"

TOKEN_ARG=()
[[ -n "${VERCEL_TOKEN:-}" ]] && TOKEN_ARG=(--token "$VERCEL_TOKEN")

cd "$(dirname "$0")/.."
vercel link --yes "${TOKEN_ARG[@]}" >/dev/null

# Guard: the anon/publishable key must NOT be a server secret.
if [[ "$DEV_SUPABASE_ANON_KEY" == sb_secret_* ]]; then
  echo "REFUSING: DEV_SUPABASE_ANON_KEY looks like a SECRET key. Use the dev branch's PUBLISHABLE/anon key (sb_publishable_… or the anon JWT)."
  exit 1
fi

set_preview() {  # name value
  vercel env rm "$1" preview --yes "${TOKEN_ARG[@]}" >/dev/null 2>&1 || true
  printf '%s' "$2" | vercel env add "$1" preview "${TOKEN_ARG[@]}" >/dev/null
  echo "   set $1 (preview)"
}

echo "==> Repointing PREVIEW env at the dev Supabase branch (production untouched)…"
set_preview VITE_SUPABASE_URL            "$DEV_SUPABASE_URL"
set_preview VITE_SUPABASE_PUBLISHABLE_KEY "$DEV_SUPABASE_ANON_KEY"
set_preview VITE_SUPABASE_PROJECT_ID     "$DEV_SUPABASE_PROJECT_ID"

echo ""
echo "Done. Now trigger a fresh PREVIEW build so it picks up the new env:"
echo "   git push origin jean_develop      # if git integration is on (recommended)"
echo "   # or: vercel deploy ${VERCEL_TOKEN:+--token \$VERCEL_TOKEN}   (CLI preview)"
echo ""
echo "Dev URL after build: https://hostfluencer-git-jean-develop-jacob-1445s-projects.vercel.app"
echo "Verify it talks to the DEV branch (DevTools → Network → requests go to $DEV_SUPABASE_URL)."
