---
id: T-125
title: Gimmick-conditional item selection + bag provisioning
status: proposed
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-124]
blocked-by: [T-124]
priority: medium
---

# T-125 — Gimmick-conditional items + bag provisioning

## Context

Owner: item choice must be **conditional on the crystallised gimmick**, and it happens later in
teambuilding. *"Si el equipo tiene un Drizzle pero no es weather gimmick, no metemos el item. Pero si
es weather gimmick querremos la piedra que aumenta los turnos del weather (habrá que meterla en la bag
a partir de los museum grunts)."*

## Plan

- **Gimmick-aware item selection.** When the team's identity is a gimmick, prefer the item that enables
  it; when a gimmick piece is present but the team is NOT that gimmick (T-123 evidence bar), do NOT add
  the gimmick item:
  - **weather** → the weather-extending rock (Damp / Heat / Smooth / Icy Rock) on the setter.
  - **trick_room** → Room Service (ties to T-124); **screens** → Light Clay; etc.
- **Bag provisioning by progression.** Make the gimmick items available in the trainer's bag from the
  right point — the **weather rock from the Museum grunts onward** (the first weather-seeded trainers,
  T-126) — reusing the existing item/bag pipeline (`randomizer/itemRandomizer.js` + docs `items.md`).
- Item selection already runs after moves in the resolver; this layer reads the crystallised identity.
- Format-agnostic (singles + doubles).

> **Meta-analysis validation (owner-gated).** Which item per gimmick and from which progression point
> are owner-gated decisions (weather rock from the Museum grunts is validated; others to confirm).

Acceptance criteria:
- [ ] A weather-gimmick trainer gets the weather-extending rock; a non-gimmick weather-setter does not.
- [ ] The weather rock (and other gimmick items) is provisioned into bags from the right progression point.
- [ ] Determinism gate green; `cd randomizer && npm test` green.

## Progress log

- **2026-07-11** — Created from the owner's problem-2 reflections (gimmick-conditional items + weather
  rock from the Museum grunts). Blocked on T-124 (gimmick completion).

## Outcome
