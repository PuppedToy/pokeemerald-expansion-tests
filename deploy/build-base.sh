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

DRY=""; FETCH=""; FORCE=""
for a in "$@"; do case "$a" in
  --dry-run) DRY=1 ;;
  --fetch)   FETCH=1 ;;
  --force)   FORCE=1 ;;
  *) echo "unknown flag: $a (use --dry-run / --fetch / --force)"; exit 2 ;;
esac; done

# --- provenance (T-273) ----------------------------------------------------------
# The base gets STAMPED with the fingerprint of the sources it was built from, which is what lets
# `scripts/base-state.mjs` (and the deploy skill) decide whether a later deploy needs a rebuild instead of
# the owner having to remember. The stamp must not lie, and it can only be honest if the box is compiling
# the tree we have here: `make` runs on the BOX, over whatever the last rsync left. `update.sh` records that
# with backend/data/deployed.json, so compare the two and refuse when they disagree.
FP=$(node scripts/base-state.mjs --print-fingerprint)
COMMIT=$(git rev-parse HEAD 2>/dev/null || echo unknown)
if [ -z "$DRY" ]; then
  BOX_FP=$(${SSH} "${TARGET}" "cd ${DEPLOY_PATH} 2>/dev/null && sed -n 's/.*\"fingerprint\"[: ]*\"\\([a-f0-9]*\\)\".*/\\1/p' backend/data/deployed.json 2>/dev/null | head -1" </dev/null || true)
  if [ "$BOX_FP" != "$FP" ]; then
    if [ -n "$FORCE" ]; then
      echo "⚠ the box's tree is not this one (box ${BOX_FP:-none} ≠ here ${FP:0:12}) — --force: stamping anyway"
    else
      echo "✗ the box is not holding the tree you have here:"
      echo "    here: ${FP:0:12}   box: ${BOX_FP:-'(no deploy marker)'}"
      echo "  The base would be compiled from the box's older sources and then stamped as if it were this"
      echo "  tree, which is exactly the drift this stamp exists to catch. Deploy first, then rebuild:"
      echo "      deploy/update.sh && deploy/build-base.sh"
      echo "  (--force overrides, e.g. a first bring-up whose deploy predates the stamp.)"
      exit 1
    fi
  fi
fi

REMOTE_SCRIPT=$(cat <<'EOS'
set -euo pipefail
cd "$DEPLOY_PATH_IN"
echo "==> clean tree (the base must never carry a run's data)"
$COMPOSE_IN run --rm -T app sh -lc 'git checkout -- src/ include/ data/maps/ || true' </dev/null
# A base build may NOT trust the warm build/ cache, and the reason is not obvious: `update.sh` rsyncs with
# -a, which preserves the mtimes from the developer's machine. Those are usually OLDER than the objects the
# box compiled days ago, so `make` sees an up-to-date object and silently reuses one compiled from a
# DIFFERENT revision. Measured 2026-08-04: src/randomizer_rewards.c (mtime Jul 29) against
# build/modern/src/randomizer_rewards.o (Aug 1) — the linked ROM carried the old gGymRewards data, and
# injection refused because the table did not match the committed initializer it was verified against.
# `tidy` drops the objects + ROM/ELF/MAP but keeps the converted graphics and tools, so this costs minutes,
# not the full cold build. Correctness is not optional here: every user's ROM is this artifact.
echo "==> tidy (drop every object — a warm cache silently mixes revisions, see the note above)"
$COMPOSE_IN run --rm -T app sh -lc 'make tidy' </dev/null
echo "==> make (this is the slow part: ~10-20 min on 2 cores after a tidy)"
# ONE invocation for both goals, and this is not a style preference — it is the whole ballgame.
# `make && make syms` links TWICE: the Makefile is not idempotent (generated prerequisites come back
# newer than the ELF), so the second invocation relinks, and then pokeemerald.gba is from link #1 while
# pokeemerald.map/.sym describe link #2. Every symbol offset is then subtly wrong — measured 2026-08-04:
# a 32-byte shift that put `gStatStageRatios` where the map claimed `gSpeciesInfo`. Injection cannot
# survive that (randomizer/docs/injection.md: all three MUST come from one build). With `all` and `syms`
# as goals of a single make, the ELF is linked once and the ROM and the symbols both derive from it.
$COMPOSE_IN run --rm -T app sh -lc 'make -j"$(nproc)" all syms' </dev/null
echo "==> install base/ (all three artifacts from THIS build)"
$COMPOSE_IN run --rm -T app sh -lc '
  set -e
  mkdir -p base
  # The ROM must not predate the ELF the symbols were read from: if it does, they are different links and
  # the base is unusable (see the note above). Cheap, and it catches the failure at its source.
  if [ pokeemerald.elf -nt pokeemerald.gba ]; then
    echo "   ✗ pokeemerald.elf is NEWER than pokeemerald.gba — the ROM and the symbols are from different"
    echo "     links, so every offset would be wrong. Not installing. Re-run: make -j all syms"
    exit 1
  fi
  for f in pokeemerald.gba pokeemerald.map pokeemerald.sym; do
    test -s "$f" || { echo "   ✗ $f missing or empty after make — aborting"; exit 1; }
    cp -f "$f" "base/$f"
  done
  ls -l base/
  sha256sum base/pokeemerald.gba
' </dev/null
echo "==> offset map + readiness table (GATE-1 budget, exported symbols per module)"
$COMPOSE_IN run --rm -T app sh -lc 'node randomizer/injector/buildOffsetMap.js \
  --map=base/pokeemerald.map --sym=base/pokeemerald.sym --rom=base/pokeemerald.gba \
  --out=base/base-offsets.json' </dev/null
# T-249 — the artifact set a browser needs to inject for itself: base.bps (vanilla→base, so the 32 MB base
# is never served), the injection-only offset map, the base's sources, and a manifest stamped with this
# base's sha256. Served at /client/. Skipped, not fatal, when the box has no vanilla ROM: the server-side
# inject path does not need them.
echo "==> client-side injection artifacts (T-249)"
$COMPOSE_IN run --rm -T app sh -lc '
  VANILLA="${VANILLA_ROM:-pokeemerald-vanilla.gba}"
  if [ ! -s "$VANILLA" ]; then
    echo "   ⚠ no vanilla ROM at $VANILLA — skipping base.bps (client-side injection stays unavailable)"
    exit 0
  fi
  node randomizer/injector/buildClientArtifacts.js --rom=base/pokeemerald.gba \
    --map=base/pokeemerald.map --sym=base/pokeemerald.sym --vanilla="$VANILLA" --out=base/client
' </dev/null
# The proof that matters. Symbol-existence checks pass happily on a base whose .map belongs to another
# link (they found every symbol — at the wrong address), so the only trustworthy check is to actually
# INJECT into it: that runs structLayout's anchors, which read Bulbasaur's stats back out of the ROM.
# A base that fails here is moved aside, so the app holds the queue instead of failing every request.
echo "==> smoke-test: inject one bundle into the new base"
BUNDLE=$(ls backend/data/golden-corpus/*.bundle.json 2>/dev/null | head -1)
if [ -z "$BUNDLE" ]; then
  echo "   ⚠ no golden-corpus bundle on this box — cannot verify the base is injectable."
  echo "     The app's boot check only proves the FILES exist, not that their offsets are right."
else
  if $COMPOSE_IN run --rm -T app sh -lc "node make.js --bundle=$BUNDLE --rom=0 --out=/tmp/base-smoke --full-rom --inject" </dev/null > /tmp/ec-base-smoke.log 2>&1; then
    echo "   ✓ injection works against this base"
    grep -E "Injected|·" /tmp/ec-base-smoke.log | tail -8
  else
    echo "   ✗ INJECTION FAILED against the freshly built base — not installing it:"
    tail -6 /tmp/ec-base-smoke.log | sed 's/^/     /'
    mv base "base-rejected-$(date +%Y%m%d-%H%M%S)"
    exit 1
  fi
fi
# T-273 — stamp the base with the sources it came from, now that it is proven injectable. This file is what
# `scripts/base-state.mjs` compares a later deploy against; base/ is rsync-excluded, so it persists.
echo "==> stamping base/BASE_BUILD.json (provenance for the deploy decision)"
cat > base/BASE_BUILD.json <<JSON
{
  "fingerprint": "${FP_IN}",
  "commit": "${COMMIT_IN}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "romSha256": "$(sha256sum base/pokeemerald.gba | cut -d' ' -f1)"
}
JSON
chown 1000:1000 base/BASE_BUILD.json 2>/dev/null || true
cat base/BASE_BUILD.json

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
# The script is COPIED to the box and run from a file, never piped into `bash -s`: `docker compose run`
# reads stdin, so with `bash -s` the first compose call swallows the rest of the script and every later step
# is silently skipped — the run then "succeeds" having built nothing (observed 2026-08-04).
# shellcheck disable=SC2029
printf '%s\n' "$REMOTE_SCRIPT" | ${SSH} "${TARGET}" "cat > /tmp/ec-build-base.sh"
# shellcheck disable=SC2029
${SSH} "${TARGET}" "DEPLOY_PATH_IN='${DEPLOY_PATH}' COMPOSE_IN='${COMPOSE}' FP_IN='${FP}' COMMIT_IN='${COMMIT}' bash /tmp/ec-build-base.sh" </dev/null

if [ -n "$FETCH" ]; then
  echo "==> fetching base/ into the local working tree"
  mkdir -p base
  for f in pokeemerald.gba pokeemerald.map pokeemerald.sym base-offsets.json; do
    scp -i "${KEY}" -o IdentitiesOnly=yes "${TARGET}:${DEPLOY_PATH}/base/${f}" "base/${f}" || true
  done
  ls -l base/
fi

# Never claim success without checking: the stdin bug above printed this line over a run that built nothing.
echo "==> verifying the box actually has all three artifacts"
if ! ${SSH} "${TARGET}" "cd ${DEPLOY_PATH} && for f in base/pokeemerald.gba base/pokeemerald.map base/pokeemerald.sym; do test -s \"\$f\" || exit 1; done" </dev/null; then
  echo "  ✗ the base is missing or incomplete on the box — read the output above; nothing was installed"
  exit 1
fi
echo "==> confirming the stamp the deploy decision reads"
node scripts/base-state.mjs || { echo "  ✗ the base is installed but base-state says it does not match this tree"; exit 1; }
echo "==> base installed ✓  (the stamp now proves which sources it came from — scripts/base-state.mjs)"
