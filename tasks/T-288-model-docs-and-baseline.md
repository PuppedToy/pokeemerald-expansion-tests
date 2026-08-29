---
id: T-288
title: Document the shipped family model and capture a fresh golden-master baseline
status: in-progress
type: docs
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md, randomizer/docs/families-and-forms.md]
blocked-by: []
---

# T-288 — Document the shipped family model and capture a fresh golden-master baseline

## Context

Closing task of the T-277 epic. `randomizer/docs/families-and-forms.md` held the owner's *ruleset*;
it now also has to say where each rule ended up living, or the next person reads a decision document
and has to go find the code themselves.

The baseline is the other half: every task in the epic changes the RNG stream or the ROM bytes on
purpose, so the golden-master corpus has to be re-captured. Until it is, `/verify-corpus` has nothing
true to compare against.

## Plan

- Add a "where each concern lives now" section to the model doc: the module that owns each concern,
  the things that stopped existing, and the premium-item rules as built.
- Capture a fresh baseline on the build box once the owner has pushed and greenlit.

Acceptance criteria:
- [x] The model doc names the owner of every concern in ADR-026.
- [x] It records what was deleted (`EVOLUTION_TARGET_ALIASES`, `invalidMegas`,
      `COSMETIC_FORM_SUFFIXES`) so nobody reintroduces it.
- [x] It explains why `componentFamilyOf` keys on the base form — the reason Burmy needs no special
      case.
- [ ] Base ROM rebuilt (T-283, T-286, T-287 change sources the injector cannot express).
- [ ] Fresh golden-master baseline captured.
- [ ] Owner manually tests a built ROM and confirms.

## Progress log

- **2026-08-14** — Doc section written. Worth recording: **ADR-026 anticipated a curated "keep separate
  despite convergence" list with Burmy as its only member, and the shipped model needs no entries at
  all.** Naming a family after its component's *base form* rather than the component root makes the
  three cloaks keep their own families for free, because each cloak is its own base. The ADR's
  consequence section is therefore stricter than what was built — noted here rather than amending an
  accepted ADR.
- **2026-08-14** — Baseline blocked on the owner: no push permission, and the rebuild needs the build
  box. Sequence agreed with the owner: owner pushes → greenlights → base rebuild → `/verify-corpus` →
  manual test → close the epic's 14 tasks.

## Outcome
