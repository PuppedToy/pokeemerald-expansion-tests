#!/usr/bin/env bash
# Redeploy the latest pushed code to the running box — T-019. Run from YOUR machine.
# Target host + your SSH key come from deploy/.env.local (gitignored). No secret in the repo.
#
# Flow: ssh in → git pull (fast-forward) → rebuild image → restart the stack.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f deploy/.env.local ] || { echo "Create deploy/.env.local from deploy/.env.local.example"; exit 1; }
# shellcheck disable=SC1091
source deploy/.env.local

: "${DEPLOY_HOST:?set DEPLOY_HOST in deploy/.env.local}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
REPO_DIR="${REPO_DIR:-~/emerald}"
KEY_OPT=""
[ -n "${DEPLOY_KEY:-}" ] && KEY_OPT="-i ${DEPLOY_KEY/#\~/$HOME}"

echo "==> redeploying to ${DEPLOY_USER}@${DEPLOY_HOST}:${REPO_DIR}"
# shellcheck disable=SC2029
ssh $KEY_OPT "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "cd ${REPO_DIR} && GIT_SSH_COMMAND='ssh -i ~/.ssh/emerald_deploy -o IdentitiesOnly=yes' git pull --ff-only && docker compose -f deploy/docker-compose.yml up -d --build"
echo "==> done"
