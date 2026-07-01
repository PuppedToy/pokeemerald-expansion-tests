---
id: B-016
title: Trainer cards over-expand on large monitors (team spreads to 3 columns)
status: fixed           # open | fixing | fixed | wont-fix
severity: minor
created: 2026-07-01
updated: 2026-07-01
found-in: 0.3.1
fixed-in: 0.3.1
regression-test: frontend/__tests__/trainer-card-width.test.js
links: [T-038]
---

# B-016 — Trainer cards over-expand on large monitors

## Symptom

On a normal-width monitor the Trainers tab looks great: each trainer card shows its team as two
columns of Pokémon cards. On a large monitor at full width the trainer card stretches edge-to-edge
and the team spreads to **three** columns, which looks sparse and over-expanded.

## Root cause

`.trainer-grid` is a single `1fr` column, so each `.trainer-card` fills the full content width. On a
wide viewport the card's team area gets wide enough to fit a third 640px Pokémon card per row. There
was no upper bound on the card width.

## Fix

Cap the trainer card and centre it: `.trainer-grid` uses
`repeat(auto-fit, minmax(min(1536px,100%), 1fr))` with `justify-items:center`, and `.trainer-card`
gets `width:100%; max-width:1536px`. 1536px is the width at which the team area fits exactly two
640px Pokémon columns (and not a third), so the layout matches the good "normal resolution" look; the
card is centred on wide screens, and only splits into two trainer columns on very wide (~3072px+)
displays. Encounters is untouched.

Regression test `frontend/__tests__/trainer-card-width.test.js` asserts `.trainer-card` carries a
`max-width` and the grid centres its items. Verified to FAIL before the fix (no cap) and PASS after.
(Structural/CSS guard — no headless-browser harness; column behaviour verified manually in the
deployed viewer.)
