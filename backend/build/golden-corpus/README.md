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

## Run (on the PRO build box, from repo root)
```sh
node backend/build/golden-corpus/generate.mjs                 # freeze bundles/
backend/build/golden-corpus/build-and-hash.sh > /tmp/manifest.txt   # build + hash each
```
The T-233 skill rebuilds the frozen bundles and diffs the fresh sha256s against `manifest.json`.
CI has no capacity for full ROM builds, so this only runs on PRO.
