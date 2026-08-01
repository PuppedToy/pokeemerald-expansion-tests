---
id: T-233
title: "Base+injection Phase 1 — PRO-build verification skill (autonomous golden-master diffing)"
status: done
type: feature
created: 2026-07-27
updated: 2026-07-28
target-version: 0.7.0
links: [T-229, T-230, T-231, docs/base-plus-injection-strategy.md, docs/rom-build-performance.md]
blocked-by: [T-230, T-231]
---

# T-233 — PRO-build verification skill

## Context
Autonomy for Phases 2–4: a repeatable harness that builds the corpus bundles and proves the output still
matches the golden master. **PRO is the only available build environment — CI has no capacity for full
ROM builds** (owner confirmed), and there are no users yet, so building on PRO is fine. The skill must
also **download the generated ROM to the owner's machine** so the owner can manually play-test it — the
INV-BEHAVIOR check (Phase 2, where bytes legitimately move) can only be closed by the owner playing the
affected feature, not by an automated diff. See [strategy](../docs/base-plus-injection-strategy.md).

## Plan
A skill that: SSHes to PRO (`root@pokemon-emerald-cut.com`, key `~/.ssh/emerald_box`), runs `make.js`
(bundle mode) on each corpus bundle inside `deploy-app-1`, and diffs each result against the golden master
using the T-231 canonical comparison (**whole-ROM sha256** — GATE-2 proved the build byte-reproducible, so
a hash match is sufficient; no region masking needed); reports pass/fail per bundle. It also
**downloads the built ROM back to the owner's machine for manual testing** — build with `--full-rom` (a
playable `.gba`, since a BPS isn't directly playable) for the bundle(s) the owner wants to try, and `scp`
it down. Read-mostly and non-disruptive to the web app.

Acceptance criteria:
- [x] Builds the whole corpus on PRO and diffs each ROM's sha256 vs the golden master →
      `backend/build/golden-corpus/verify.mjs` (whole-ROM hash; GATE-2 proved masking is unneeded).
- [x] Downloads a playable `.gba` (via `--full-rom`) for a chosen bundle to the owner's machine →
      SKILL.md step 3 (derive `sessionId`, `scp roms/<sid>/rom-N.gba`).
- [x] Green on the current pipeline: full-corpus `verify.mjs` = **ALL PASS (12/12)** — every frozen bundle
      rebuilds to its manifest hash.
- [x] Documented so the agent can run it autonomously → `.claude/skills/verify-corpus/SKILL.md`
      (verify, interpret MISMATCH Phase-2 vs Phase-3, fetch ROM, re-snapshot).

## Progress log
- **2026-07-27** — Created (Phase 1). Foundational harness for INV-BEHAVIOR/INV-BYTES.
- **2026-07-28** — Built the skill on top of T-230's corpus. `backend/build/golden-corpus/verify.mjs`
  rebuilds each frozen bundle on PRO and diffs its full-ROM sha256 vs `manifest.json` (whole-ROM hash —
  GATE-2 made region-masking unnecessary); hashes `roms/<bundle.sessionId>/` (stable dir, not `ls -td`).
  Registered `.claude/skills/verify-corpus/SKILL.md`: verify (single `--only`, or full detached+poll ~20
  min), MISMATCH semantics (Phase-3 = bug INV-BYTES / Phase-2 = expected → re-snapshot + owner play-test
  INV-BEHAVIOR), fetch a playable ROM for the owner (derive sessionId → scp), and re-snapshot via
  build-and-hash.sh. Validated `verify.mjs --only baseline` = PASS; full-corpus run launched for the
  definitive green.

## Outcome
Verification harness delivered. `backend/build/golden-corpus/verify.mjs` rebuilds each frozen corpus
bundle on PRO and diffs its full-ROM sha256 vs `manifest.json`; the `verify-corpus` skill
(`.claude/skills/verify-corpus/SKILL.md`) documents running it, interpreting a MISMATCH (Phase-3 = INV-BYTES
bug / Phase-2 = expected → re-snapshot + owner play-test), fetching a playable `.gba` for the owner, and
re-snapshotting the manifest. **Full-corpus run = ALL PASS (12/12)** — the safety net agrees the current
pipeline is unchanged. This completes Phase 1 (T-230/231/232/233): the base+injection refactor can now
proceed with byte-identical verification after every step. No changelog line (internal infrastructure).
