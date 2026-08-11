---
id: B-074
title: The login modal opens behind the presets modal, so you cannot log in from there
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.9.0
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: visual-tests/interaction.spec.mjs   # describe: "B-074: login summoned from the presets modal" (+ frontend/__tests__/modal-stacking.test.js)
links: [T-192]
---

# B-074 — The login modal opens behind the presets modal, so you cannot log in from there

## Symptom

Logged out (or right after logging out): Randomizer → **Load Preset** → the presets modal opens on
**My Presets**, which correctly shows `You must be logged in to see your presets. Log in / Register`.
Clicking that link opens the auth modal **behind** the presets modal.

The presets overlay covers the whole viewport, so the login form is not merely half-hidden — it is
unreachable: every click on the email/password fields or on the Register tab lands on the presets
overlay instead, which just closes the presets modal. The only way to log in is to guess that closing
the presets modal first will reveal the login form that is already open underneath.

Expected: the auth modal stacks **in front** of the presets modal, the presets modal **stays open**
underneath, and once logged in the auth modal closes and the presets modal re-renders with the user's
own presets.

Reproduce: `/randomizer` logged out → `#btn-load-preset` → `#preset-login-link` → try to type in
`#login-email`.

## Root cause

Pure stacking order. Both overlays share one class in `frontend/css/components.css`:

```css
.modal-overlay { position: fixed; inset: 0; z-index: 1000; ... }
```

With equal `z-index`, DOM order decides, and `#presets-modal` is declared after `#auth-modal` in
`frontend/index.html` — so the presets overlay always paints (and receives pointer events) on top of
the auth modal. Nothing in JS is wrong: `openModal()` does un-hide the auth modal, and the presets
controller already re-renders itself on every auth transition
(`onAuthChange` → `render()` in `frontend/js/presets.js`), so the "reload with the user's data" half of
the flow was already implemented and only ever looked broken because the login could not be completed.

Second, smaller defect exposed by the same flow: both modules register their own `Escape` handler on
`document`, so with the two modals open one `Escape` closed **both** — dismissing the login form also
threw away the presets modal the user was working in.

## Fix

**Stacking** — one rule next to the shared overlay in `frontend/css/components.css`:

```css
#auth-modal { z-index: 1100; }
```

An ID beats the `.modal-overlay` class, so it holds regardless of source order, and 1100 keeps the auth
modal below nothing else it has to compete with: the mobile drawer's `z-index: 1200` lives *inside*
`.topnav`'s own stacking context (`z-index: 1000`), so it never outranks a root-level 1100 — the auth
modal already sat above the open drawer before this change and still does.

**Escape** — the auth modal is the topmost layer whenever it is open, so it now claims the key in the
**capture** phase and stops the event there (`frontend/js/account.js`); the presets modal's bubble-phase
handler additionally refuses to act while the auth modal is open (`frontend/js/presets.js`). Capture-vs-
bubble is what makes it deterministic: the first attempt only guarded on the presets side, and account.js
— whose listener happens to be registered first — had already hidden the auth modal by the time that
guard ran, so both modals still closed. The browser test caught it; the unit test could not.

Nothing else was needed for the "reload with the user's data" half: `initPresets` already re-renders on
every auth transition (`onAuthChange` → `render()`), which the login now actually reaches.

**Tests** (all written first; the first two verified failing before the fix):

- `visual-tests/interaction.spec.mjs` — "B-074: login summoned from the presets modal": the honest
  reproduction in a real browser. Opens the presets modal logged out, follows its login CTA and **really
  clicks** the auth form — pre-fix Playwright fails with `<div id="presets-modal"> intercepts pointer
  events` — then registers (which logs straight in, T-225) and asserts the auth modal closed, the presets
  modal stayed open and its login CTA gave way to the user's own (empty) preset list. A second test
  presses Escape twice and asserts one modal closes per press.
- `frontend/__tests__/modal-stacking.test.js` — the enforceable gate in the zero-dep suite: a structural
  CSS guard on the two z-indexes, plus the presets-side Escape rule and the re-render-on-login behaviour
  against the DOM stub (which grew an `emitDocument()` seam so document-level handlers can be fired).
