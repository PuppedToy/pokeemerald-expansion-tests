#!/usr/bin/env bash
# Build and install the prebuilt BASE ROM on the box (T-246). Run from YOUR machine.
#
#   deploy/build-base.sh [--dry-run] [--fetch]
#
# Since T-244 every delivered ROM is injected into base/pokeemerald.{gba,map,sym}. Those are build
# artifacts, not source: gitignored, ~42 MB together, and produced by one `make && make syms` from a CLEAN
# tree. `update.sh` deliberately does NOT carry them (it excludes base/), so they live on the box like
# backend/data does and survive every deploy. This script is how they get there.
#
# What it does, inside the app container on the box:
#   1. `git checkout src/ include/ data/maps/` — the base must come from a clean tree, never a randomized
#      one (a randomized base would bake one run's data into everyone's ROM).
#   2. `make -j$(nproc)` + `make syms`.
#   3. install pokeemerald.gba/.map/.sym into <DEPLOY_PATH>/base/ — all three from THAT build, which is the
#      one invariant injection cannot recover from getting wrong (the .map names addresses inside that
#      exact ROM).
#   4. `buildOffsetMap.js` — prints the 32 MB budget (GATE-1) and the per-module readiness table: which
#      claimed symbols the base actually exports. A missing symbol here is the T-234/T-237 LTO trap, and
#      it is far cheaper to see now than in a play-test.
#   5. restart the app so its boot-time base check passes and the worker starts.
#
# Re-run it after ANY change to the C sources, include/, data/maps/ or the injectable tables — otherwise
# injection reads sources that disagree with the base and refuses (loudly) at build time.
#
# Config: the same deploy/.env.local as update.sh (DEPLOY_HOST required).
#   --fetch    also copy the three artifacts DOWN into ./base/ (local injection, e.g. running a gate)
#   --dry-run  print what would run, change nothing
set -euo pipefail
cd "$(dirname "$0")/.."

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
COMPOSE="docker compose -f deploy/docker-compose.yml"

DRY=""; FETCH=""
for a in "$@"; do case "$a" in
  --dry-run) DRY=1 ;;
  --fetch)   FETCH=1 ;;
  *) echo "unknown flag: $a (use --dry-run / --fetch)"; exit 2 ;;
esac; done

REMOTE_SCRIPT=$(cat <<'EOS'
set -euo pipefail
cd "$DEPLOY_PATH_IN"
echo "==> clean tree (the base must never carry a run's data)"
$COMPOSE_IN run --rm app sh -lc 'git checkout -- src/ include/ data/maps/ || true'
echo "==> make (this is the slow part: ~4 min warm, ~20 min cold on 2 cores)"
$COMPOSE_IN run --rm app sh -lc 'make -j"$(nproc)" && make syms'
echo "==> install base/ (all three artifacts from THIS build)"
$COMPOSE_IN run --rm app sh -lc '
  set -e
  mkdir -p base
  for f in pokeemerald.gba pokeemerald.map pokeemerald.sym; do
    test -s "$f" || { echo "   ✗ $f missing or empty after make — aborting"; exit 1; }
    cp -f "$f" "base/$f"
  done
  ls -l base/
  sha256sum base/pokeemerald.gba
'
echo "==> offset map + readiness table (GATE-1 budget, exported symbols per module)"
$COMPOSE_IN run --rm app sh -lc 'node randomizer/injector/buildOffsetMap.js \
  --map=base/pokeemerald.map --sym=base/pokeemerald.sym --rom=base/pokeemerald.gba \
  --out=base/base-offsets.json'
echo "==> restart app (its boot check now finds the base and starts the worker)"
$COMPOSE_IN up -d --force-recreate app
sleep 5
$COMPOSE_IN logs --tail=20 app | grep -iE "base|build:" || true
EOS
)

if [ -n "$DRY" ]; then
  echo "would run on ${TARGET}:${DEPLOY_PATH}:"
  echo "$REMOTE_SCRIPT"
  exit 0
fi

echo "==> building the base on ${TARGET}:${DEPLOY_PATH}"
# shellcheck disable=SC2029
${SSH} "${TARGET}" "DEPLOY_PATH_IN='${DEPLOY_PATH}' COMPOSE_IN='${COMPOSE}' bash -s" <<< "$REMOTE_SCRIPT"

if [ -n "$FETCH" ]; then
  echo "==> fetching base/ into the local working tree"
  mkdir -p base
  for f in pokeemerald.gba pokeemerald.map pokeemerald.sym base-offsets.json; do
    scp -i "${KEY}" -o IdentitiesOnly=yes "${TARGET}:${DEPLOY_PATH}/base/${f}" "base/${f}" || true
  done
  ls -l base/
fi

echo "==> base installed ✓  (re-run this after any C source / include / data-maps change)"
