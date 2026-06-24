#!/usr/bin/env bash
# Bring up the Emerald Cut build server on a fresh Ubuntu (ARM) box — T-019.
# Idempotent: safe to re-run. NO secrets are stored in the repo; the read-only
# GitHub deploy key is generated here and stays on the box.
#
# Usage (on the box):  bash deploy/bootstrap.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/emerald}"
DEPLOY_KEY="$HOME/.ssh/emerald_deploy"
COMPOSE="docker compose -f deploy/docker-compose.yml"

echo "==> 1/6  Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker installed. Re-login (or run 'newgrp docker') and re-run this script."
  exit 0
fi

echo "==> 2/6  host firewall (Oracle Ubuntu blocks ports via iptables by default)"
# Oracle's *security list* must also allow 80/443 ingress (done in the web console).
for port in 80 443; do
  if ! sudo iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null; then
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport "$port" -j ACCEPT
  fi
done
sudo netfilter-persistent save 2>/dev/null || sudo bash -c 'iptables-save > /etc/iptables/rules.v4' 2>/dev/null || true

echo "==> 3/6  GitHub deploy key (read-only, for the private repo)"
if [ ! -f "$DEPLOY_KEY" ]; then
  ssh-keygen -t ed25519 -N "" -f "$DEPLOY_KEY" -C "emerald-deploy"
  echo
  echo "  Add this PUBLIC key as a READ-ONLY Deploy Key:"
  echo "  GitHub → repo → Settings → Deploy keys → Add deploy key"
  echo "  ---------------------------------------------------------------"
  cat "$DEPLOY_KEY.pub"
  echo "  ---------------------------------------------------------------"
  read -rp "  Press Enter once the deploy key is added on GitHub... "
fi
export GIT_SSH_COMMAND="ssh -i $DEPLOY_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

echo "==> 4/6  clone / update the repo"
if [ ! -d "$REPO_DIR/.git" ]; then
  read -rp "  Repo SSH URL [git@github.com:PuppedToy/pokeemerald-expansion-tests.git]: " URL
  git clone "${URL:-git@github.com:PuppedToy/pokeemerald-expansion-tests.git}" "$REPO_DIR"
fi
cd "$REPO_DIR"
git pull --ff-only || true

echo "==> 5/6  environment"
if [ ! -f deploy/.env ]; then
  cp deploy/.env.example deploy/.env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" deploy/.env
  echo "  Created deploy/.env with a generated JWT secret."
  echo "  → Set BREVO_API_KEY in deploy/.env (and review BASE_URL), then re-run."
  exit 1
fi

echo "==> 6/6  install backend deps (in container) + start the stack"
$COMPOSE run --rm app sh -lc "cd backend && npm ci --omit=dev"
$COMPOSE up -d --build

echo
echo "Up. Follow logs:  $COMPOSE logs -f"
echo "Verification mail (dev mode) prints in the logs until BREVO_API_KEY is set."
