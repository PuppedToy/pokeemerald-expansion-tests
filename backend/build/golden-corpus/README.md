# Golden-master corpus (T-230)

The build-verification safety net for the base+injection migration
([strategy](../../../docs/base-plus-injection-strategy.md)). A fixed set of bundles that collectively
exercise every randomizer output; the reference is each bundle's full-ROM **sha256** (the build is
byte-deterministic — T-231/GATE-2).

## Files
- `specs.mjs` — the corpus specs (configs covering all 26 outputs + every build-time mode).
- `generate.mjs` — generates + **freezes** the bundles (the backend path is non-reproducible, so we pin
  the JSONs once). Writes to `backend/data/golden-corpus/` — container-writable and persisted across
  deploys, and gitignored via `backend/data/` (~19 MB each, they live on the box, not in git).
- `build-and-hash.sh` — builds each frozen bundle on the box and prints `<name> <rom> <sha256>`.
- `manifest.json` — the committed golden master: `{name → {rom → sha256}}` (the reference hashes).
- `verify.mjs` — rebuilds each bundle through the **compile** path and diffs against the manifest
  (INV-BEHAVIOR: did a base refactor change the output?).
- `parity.mjs` — **injects** each bundle into the base and diffs against the manifest
  (INV-BYTES / GATE-3: does `inject(base, bundle)` equal `compile(bundle)`? — T-239).

## Run (on the PRO build box, from repo root)
```sh
node backend/build/golden-corpus/generate.mjs                 # freeze bundles/
backend/build/golden-corpus/build-and-hash.sh > /tmp/manifest.txt   # build + hash each
node backend/build/golden-corpus/verify.mjs                   # compile vs manifest
INJECT_BASE_ROM=… INJECT_BASE_MAP=… INJECT_BASE_SYM=… \
  node backend/build/golden-corpus/parity.mjs --explain       # inject vs manifest
```
The T-233 skill rebuilds the frozen bundles and diffs the fresh sha256s against `manifest.json`.
CI has no capacity for full ROM builds, so this only runs on PRO.

While Phase 3 is unfinished, `parity.mjs` needs `--allow-pending`: the un-migrated outputs still carry
base data, so the run is read as "every differing region belongs to a module that is still pending"
rather than as a hash match.
