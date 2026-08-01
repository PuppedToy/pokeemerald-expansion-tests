---
name: verify-corpus
description: Rebuild the golden-master corpus bundles on the PRO build box and diff each ROM's sha256 against manifest.json — the byte-identical safety net for the base+injection migration (Phase 2-4). Also fetches a playable full ROM for the owner to manually play-test. Use to prove a base/writer/injector change did NOT alter build output, or to capture a fresh baseline after an intended change.
---

# Verify the golden-master corpus (build byte-identical check)

The safety net for the base+injection migration ([docs/base-plus-injection-strategy.md](../../docs/base-plus-injection-strategy.md),
T-230/T-233). It rebuilds each **frozen** corpus bundle on the build box and compares its full-ROM
**sha256** to the committed `manifest.json`. `build(frozen_bundle)` is byte-deterministic (T-231), so a
hash match proves the build output is unchanged. **PRO is the only build environment — CI has no capacity
for full ROM builds.** Connecting to the box is an outward action; only run these steps when the user asked
for a verification (invoking this skill counts).

Layout: tooling in `backend/build/golden-corpus/` (`specs.mjs`, `generate.mjs`, `build-and-hash.sh`,
`verify.mjs`, `manifest.json`); the ~19 MB frozen bundles live on the box at
`/app/backend/data/golden-corpus/*.bundle.json` (gitignored, persist across deploys). Connection is the
same as `deploy/update.sh`: `ssh -i ~/.ssh/emerald_box root@pokemon-emerald-cut.com`, container
`deploy-app-1`, repo at `/app` (container) = `/opt/emerald` (host).

## 1. Verify

A full corpus verify is ~15-25 min (one build per bundle) — run it **detached + poll**. A single bundle
(`--only <name>`) is ~1-2 min and can run inline.

```sh
KEY=~/.ssh/emerald_box; H=root@pokemon-emerald-cut.com
SSH="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new $H"
# single bundle (inline):
$SSH 'docker exec deploy-app-1 bash -lc "cd /app && node backend/build/golden-corpus/verify.mjs --only baseline"'
# whole corpus (detached; then poll /tmp/verify.done):
$SSH 'docker exec -d deploy-app-1 bash -lc "cd /app && node backend/build/golden-corpus/verify.mjs >/tmp/verify.out 2>&1; echo done>/tmp/verify.done"'
```
`verify.mjs` prints `PASS`/`FAIL` per ROM and a final `ALL PASS` or `MISMATCH — N pass / M fail`; exit 0 =
all match. It `git checkout`s `src/ include/ data/maps/` before each build (the `checkDataClean` guard) and
hashes `roms/<bundle.sessionId>/rom-*.gba` (the stable per-bundle output dir — never `ls -td`).

## 2. Interpret a MISMATCH

- **Phase 3 (injection, base ROM unchanged): a BUG.** INV-BYTES says `inject(base,bundle)` must equal
  `compile(bundle)` byte-for-byte. Localize to the last-migrated module and fix.
- **Phase 2 (base refactor, bytes move by design): EXPECTED.** Data-driven rewards / settings struct /
  fixed-capacity tables legitimately change the ROM. Re-snapshot (step 4) and have the **owner play-test**
  the affected feature — the automated check can't judge behavioral equivalence (INV-BEHAVIOR).
- **MISS / ERR:** frozen bundle absent, or the build aborted (read the make.js output). If bundles are
  gone (box recreated), the exact bytes can't be reproduced (backend generation is non-reproducible) — run
  `generate.mjs` for fresh bundles, then re-snapshot the manifest (step 4). The specs preserve coverage.

## 3. Fetch a playable ROM for the owner (manual testing)

INV-BEHAVIOR (Phase 2) is closed by the **owner** playing the ROM, so hand them a `.gba`. Build the bundle
(verify `--only <name>` already did, or `make.js --bundle=… --full-rom`), read its `sessionId`, and `scp`
the ROM down:

```sh
name=steven-off
sid=$($SSH "docker exec deploy-app-1 node -e 'console.log(JSON.parse(require(\"fs\").readFileSync(\"/app/backend/data/golden-corpus/$name.bundle.json\",\"utf8\")).sessionId)'")
scp -i $KEY $H:/opt/emerald/roms/$sid/rom-0.gba ./$name.gba   # multi-ROM bundles: rom-0/1/2.gba
```
Tell the owner which feature to check (e.g. `steven-off` → the Mossdeep tag battle becomes a solo Tabitha).

## 4. Re-snapshot the manifest (after an intended change, e.g. end of Phase 2)

```sh
$SSH 'docker exec -d deploy-app-1 bash -lc "cd /app && backend/build/golden-corpus/build-and-hash.sh >/tmp/manifest.txt 2>/tmp/mf.err; echo done>/tmp/mf.done"'
# poll /tmp/mf.done, read /tmp/manifest.txt, then update backend/build/golden-corpus/manifest.json
```
Regenerate `manifest.json` from those `<name> <rom> <sha256>` lines (keep the metadata block; update
`baseRomSha256` if the base changed) and commit it. Note in the task WHY the bytes changed.

Notes:
- Read-mostly: builds mutate `src/`/`data/maps/` transiently but `git checkout`/`restore()` clean up; the
  web app is untouched. Owner-gated deploys are unaffected.
- The frozen bundles + `manifest.json` are the SSOT of "known-good output"; treat them as precious (the
  bytes aren't reproducible if lost).
