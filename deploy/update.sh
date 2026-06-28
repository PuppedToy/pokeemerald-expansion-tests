#!/usr/bin/env bash
# Redeploy the current working tree to the box via rsync (T-019/T-031). Run from YOUR machine.
# Target host + your SSH key come from deploy/.env.local (gitignored) — env vars override it.
# No secret ever goes in the repo.
#
# Why rsync (not git pull): the box runs the bind-mounted working tree, which includes gitignored
# runtime assets (frontend/data, randomizer.bundle.js). rsync mirrors exactly what you have while
# PRESERVING the box's .git, backend/data (SQLite), roms/ and the warm build/ cache (all excluded).
#
# Usage:  deploy/update.sh            # rsync + recreate the app
#         deploy/update.sh --dry-run  # show what would sync; no changes on the box
set -euo pipefail
cd "$(dirname "$0")/.."

# Env vars take precedence; fall back to deploy/.env.local for anything still unset.
if [ -f deploy/.env.local ]; then set -a; . deploy/.env.local; set +a; fi

: "${DEPLOY_HOST:?set DEPLOY_HOST in deploy/.env.local (box IP or pokemon-emerald-cut.com)}"
DEPLOY_USER="${DEPLOY_USER:-root}"           # Hetzner Ubuntu default; Oracle uses 'ubuntu'
DEPLOY_PATH="${DEPLOY_PATH:-/opt/emerald}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/emerald_box}"; KEY="${KEY/#\~/$HOME}"
SSH="ssh -i ${KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
DRY=""; [ "${1:-}" = "--dry-run" ] && DRY="--dry-run"

echo "==> rsync working tree -> ${TARGET}:${DEPLOY_PATH} ${DRY}"
# /build/ is anchored (a bare build/ would also drop the app's backend/build/ source — B-003).
# Tool binaries rebuild fine on an incremental update (the box already built tools/ for its arch).
rsync -az --delete ${DRY} -e "${SSH}" \
  --exclude '.git/' --exclude 'node_modules/' --exclude '/build/' \
  --exclude 'backend/data/' --exclude 'roms/' --exclude 'debug/' \
  --exclude 'deploy/.env' --exclude 'deploy/.env.local' --exclude '.oci/' \
  --exclude '*.pem' --exclude '*.key' --exclude '.DS_Store' --exclude 'frontend/aseprite/' \
  ./ "${TARGET}:${DEPLOY_PATH}/"

if [ -n "${DRY}" ]; then echo "==> dry-run only; skipped ownership + recreate"; exit 0; fi

echo "==> fix ownership, refresh backend deps, recreate the app, health-check"
# shellcheck disable=SC2029
${SSH} "${TARGET}" "cd ${DEPLOY_PATH} \
  && chown -R 1000:1000 . \
  && docker compose -f deploy/docker-compose.yml run --rm app sh -lc 'cd backend && npm ci --omit=dev' >/dev/null 2>&1 \
  && docker compose -f deploy/docker-compose.yml up -d --force-recreate app \
  && sleep 5 \
  && docker compose -f deploy/docker-compose.yml exec -T app node -e \"fetch('http://localhost:3000/api/me').then(r=>console.log('health /api/me:',r.status)).catch(e=>console.log('ERR',e.message))\" </dev/null"
echo "==> done"
