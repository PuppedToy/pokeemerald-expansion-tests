#!/usr/bin/env bash
# One-command dev → deploy (T-019/T-031). Run from YOUR machine.
#   preflight (all tests + tracker)  →  rsync the working tree  →  recreate the app  →  health-check
#
# It deploys YOUR working tree by rsync (mirrors exactly what you have, including gitignored runtime
# assets) while PRESERVING the box's .git, backend/data (SQLite), roms/ and the warm build/ cache.
# It refuses to deploy if any test or the tracker is red — so a broken build never reaches prod.
#
# Config: deploy/.env.local (gitignored) — env vars override it. Flags: --dry-run, --skip-tests.
#   DEPLOY_HOST (required) · DEPLOY_USER=root · DEPLOY_PATH=/opt/emerald · DEPLOY_KEY=~/.ssh/emerald_box
set -euo pipefail
cd "$(dirname "$0")/.."

# env vars win; deploy/.env.local fills the rest (shell sourcing handles its inline #comments).
_H=${DEPLOY_HOST:-}; _U=${DEPLOY_USER:-}; _P=${DEPLOY_PATH:-}; _K=${DEPLOY_KEY:-}
if [ -f deploy/.env.local ]; then set -a; . deploy/.env.local; set +a; fi
[ -n "$_H" ] && DEPLOY_HOST=$_H; [ -n "$_U" ] && DEPLOY_USER=$_U
[ -n "$_P" ] && DEPLOY_PATH=$_P; [ -n "$_K" ] && DEPLOY_KEY=$_K

: "${DEPLOY_HOST:?set DEPLOY_HOST in deploy/.env.local (box IP or pokemon-emerald-cut.com)}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/emerald}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/emerald_box}"; KEY="${KEY/#\~/$HOME}"
SSH="ssh -i ${KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

DRY=""; SKIP_TESTS=""
for a in "$@"; do case "$a" in
  --dry-run)    DRY=--dry-run ;;
  --skip-tests) SKIP_TESTS=1 ;;
  *) echo "unknown flag: $a (use --dry-run / --skip-tests)"; exit 2 ;;
esac; done

# --- preflight: never deploy red code -------------------------------------------
if [ -z "$SKIP_TESTS" ]; then
  echo "==> preflight: randomizer tests"
  (cd randomizer && npm test) >/tmp/ec-pre-rand.log 2>&1 || { echo "  ✗ randomizer tests FAILED — aborting"; tail -8 /tmp/ec-pre-rand.log; exit 1; }
  echo "==> preflight: backend tests"
  (cd backend && npm test) >/tmp/ec-pre-back.log 2>&1 || { echo "  ✗ backend tests FAILED — aborting"; tail -8 /tmp/ec-pre-back.log; exit 1; }
  echo "==> preflight: tracker consistency"
  node scripts/check-tracker.mjs >/dev/null || { echo "  ✗ tracker stale — run: node scripts/check-tracker.mjs --write"; exit 1; }
  echo "    preflight OK ✓"
fi

# --- sync ------------------------------------------------------------------------
echo "==> rsync working tree -> ${TARGET}:${DEPLOY_PATH} ${DRY}"
# /build/ is anchored (a bare build/ would also drop the app's backend/build/ source — B-003).
rsync -az --delete ${DRY} -e "${SSH}" \
  --exclude '.git/' --exclude 'node_modules/' --exclude '/build/' \
  --exclude 'backend/data/' --exclude 'roms/' --exclude 'debug/' \
  --exclude 'deploy/.env' --exclude 'deploy/.env.local' --exclude '.oci/' \
  --exclude '*.pem' --exclude '*.key' --exclude '.DS_Store' --exclude 'frontend/aseprite/' \
  ./ "${TARGET}:${DEPLOY_PATH}/"

if [ -n "$DRY" ]; then echo "==> dry-run only; skipped ownership + recreate"; exit 0; fi

# --- activate --------------------------------------------------------------------
echo "==> ownership + backend deps + recreate + health-check"
# shellcheck disable=SC2029
${SSH} "${TARGET}" "cd ${DEPLOY_PATH} \
  && chown -R 1000:1000 . \
  && docker compose -f deploy/docker-compose.yml run --rm app sh -lc 'cd backend && npm ci --omit=dev' >/dev/null 2>&1 \
  && docker compose -f deploy/docker-compose.yml up -d --force-recreate app \
  && sleep 5 \
  && docker compose -f deploy/docker-compose.yml exec -T app node -e \"fetch('http://localhost:3000/api/me').then(r=>console.log('   health /api/me:',r.status)).catch(e=>console.log('   ERR',e.message))\" </dev/null"
echo "==> deployed ✓  (https://pokemon-emerald-cut.com)"
