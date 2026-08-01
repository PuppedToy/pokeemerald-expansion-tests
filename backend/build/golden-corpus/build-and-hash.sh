#!/usr/bin/env bash
# Build each FROZEN corpus bundle and record its full-ROM sha256 → the golden-master manifest (T-230).
# Runs on the build box (PRO), from the repo root, inside the app container. `build(frozen_bundle)` is
# byte-deterministic (T-231), so a stored sha256 is the golden master for that bundle.
#
#   backend/build/golden-corpus/build-and-hash.sh [CORPUS_DIR] > manifest.txt
#
# checkDataClean aborts a build if data/maps/** is dirty, and a prior build/generation can leave it dirty,
# so we `git checkout` the mutated trees before every build.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../.." && pwd)"
corpus="${1:-$root/backend/data/golden-corpus}"
cd "$root"

shopt -s nullglob
for f in "$corpus"/*.bundle.json; do
  name="$(basename "$f" .bundle.json)"
  git checkout -- src/ include/ data/maps/ 2>/dev/null || true
  if node make.js --bundle="$f" --full-rom >"/tmp/corpus-$name.log" 2>&1; then
    # make.js writes to roms/<bundle.sessionId>/ (a STABLE dir per bundle). Derive it from the bundle's
    # own sessionId — NOT `ls -td` (dir mtime isn't bumped on a REBUILD, so newest-dir picks the wrong ROM
    # and yields false mismatches when the verification skill re-builds an existing bundle).
    sid="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).sessionId)' "$f")"
    dir="roms/$sid/"
    for rom in "$dir"rom-*.gba; do
      printf '%s\t%s\t%s\n' "$name" "$(basename "$rom")" "$(sha256sum "$rom" | cut -d' ' -f1)"
    done
  else
    printf '%s\tBUILD_FAILED\t(see /tmp/corpus-%s.log)\n' "$name" "$name"
  fi
done
git checkout -- src/ include/ data/maps/ 2>/dev/null || true
