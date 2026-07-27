#!/usr/bin/env bash
# =============================================================================
# Phase 2A cutover — Vercel side ONLY. Promotes a production deploy and attaches
# the custom domain to the Vercel project, then PRINTS the DNS records to set and
# STOPS. It deliberately does NOT change DNS (that's the manual Namecheap step).
#
# Nothing here affects live traffic: the domain won't serve from Vercel until you
# change the A/CNAME at Namecheap. Until then hostfluencer.com still points to Lovable.
#
# Prereqs: run from the app dir; `vercel login` OR `export VERCEL_TOKEN=…`.
# Usage:   bash scripts/cutover-vercel.sh
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-hostfluencer.com}"
WWW="www.$DOMAIN"
PROJECT="${PROJECT:-hostfluencer}"

TOKEN_ARG=()
[[ -n "${VERCEL_TOKEN:-}" ]] && TOKEN_ARG=(--token "$VERCEL_TOKEN")

cd "$(dirname "$0")/.."

command -v vercel >/dev/null 2>&1 || { echo "Vercel CLI missing — npm i -g vercel"; exit 1; }

echo "==> Ensuring project is linked…"
vercel link --yes "${TOKEN_ARG[@]}"

echo "==> Production deploy (still served only on *.vercel.app until DNS changes)…"
vercel deploy --prod --yes "${TOKEN_ARG[@]}"

echo "==> Attaching custom domains to project '$PROJECT' (idempotent)…"
# Adds the domain to the project. Safe to re-run; tolerate 'already exists'.
vercel domains add "$DOMAIN" "$PROJECT" "${TOKEN_ARG[@]}" 2>&1 | tail -2 || true
vercel domains add "$WWW" "$PROJECT" "${TOKEN_ARG[@]}" 2>&1 | tail -2 || true

echo ""
echo "==> Required DNS configuration (per Vercel):"
vercel domains inspect "$DOMAIN" "${TOKEN_ARG[@]}" 2>&1 | sed -n '1,40p' || true

cat <<EOF

============================================================
 STOP — Vercel side is staged. DNS is NOT changed; traffic
 still flows to Lovable. The domain will show "pending /
 misconfigured" in Vercel until you do the manual step below.

 MANUAL CUTOVER (Namecheap → $DOMAIN → Advanced DNS):
   • A record    @   ->  76.76.21.21        (or the value shown above)
   • CNAME    www     ->  cname.vercel-dns.com
   • Leave MX / TXT records untouched.

 Vercel auto-issues SSL once DNS resolves (minutes). TTL is 300s.

 ROLLBACK: set A @ and www back to 185.158.133.1 (Lovable). Instant.

 VERIFY after the flip:
   dig +short $DOMAIN          # should return Vercel's IP
   vercel domains inspect $DOMAIN ${VERCEL_TOKEN:+--token \$VERCEL_TOKEN}
============================================================
EOF
