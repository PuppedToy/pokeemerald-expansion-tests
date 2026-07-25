---
id: B-053
title: Docs viewer rival May/Brendan toggle is ignored until a starter is picked (all 6 rival cards shown)
status: fixed           # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-07-25
updated: 2026-07-25
found-in: 0.6.0         # T-197 shipped the toggle in the 0.6.0 dev cycle
fixed-in: 0.6.0
regression-test: visual-tests/interaction.spec.mjs   # "B-053: rival gender toggle filters without a starter"
links: [T-197, T-199]   # defect in T-197's feature; found while manually testing T-199
---

# B-053 — Rival May/Brendan toggle ignored until a starter is picked

## Symptom

In the docs viewer Trainers tab, the **Rival: May / Brendan** toggle (T-197) only takes effect once a
starter is selected. With NO starter picked, all **6** rival variant cards (May×3 + Brendan×3) are shown and
the toggle does nothing.

Expected: with no starter picked, show only the **3** variants of the chosen gender (May by default); toggling
May↔Brendan swaps which 3 show. Once a starter is picked, show the single matching gender+starter variant (this
part already works).

Reproduce: open the viewer → Trainers, pick no starter → all 6 Ever Grande rival cards visible; flipping the
Rival toggle changes nothing.

## Root cause

`frontend/template.html` `applyStarterRivals()` only hides cards when a starter is selected:
`c.style.display = (sel && (g !== rival || suffix !== s)) ? 'none' : ''`. The whole predicate is gated on
`sel`, so with `sel === null` nothing is hidden and the gender toggle is inert.

## Fix

Hide the wrong-gender card ALWAYS, and additionally hide the wrong-starter card only when a starter is picked:
`c.style.display = (g !== rival || (sel && suffix !== s)) ? 'none' : ''`. Regression test drives the toggle
with no starter (expects every chosen-gender card shown, none of the other) and after a starter pick (expects
only the matching variant). Verified RED before the one-line predicate change and GREEN after (fixture rebuilt).

Side effect (deliberate spec change): the existing `T-082` "Next boss" test assumed the shortcut targets the
FIRST-listed rival variant of the next boss. Since the wrong-gender variant is now hidden by default, the
shortcut correctly targets the first VISIBLE variant instead, so `T-082`'s `targetId` was updated to pick the
visible variant (mirroring the sibling test already covering the starter-picked case). The Next-boss logic
itself was not changed.
