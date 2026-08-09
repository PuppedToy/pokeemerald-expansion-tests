---
id: B-063
title: A hidden top-nav entry is still shown in the mobile drawer
status: fixed           # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-07
updated: 2026-08-07
found-in: 0.8.0
fixed-in: 0.9.0
regression-test: frontend/__tests__/responsive.test.js
links: [T-259, visual-tests/interaction.spec.mjs]
---

# B-063 — A hidden top-nav entry is still shown in the mobile drawer

## Symptom

On a phone (≤600px), open the hamburger drawer while logged out: the nav lists **Admin** between
Settings and the Log in link. On desktop the same entry is correctly absent.

`#admin-tab` carries the `hidden` attribute in `frontend/index.html` and `admin.js`
(`applyAdminVisibility`) only clears it for a user whose `/api/me` reports `isAdmin`. So on every phone,
every visitor — signed out included — is shown a link to the beta admin panel.

Not an access-control hole: the panel renders empty without an admin token and every `/api/admin/beta/*`
endpoint answers 403 regardless. It leaks an internal surface into the public nav, and taps land on a
dead page.

Reproduce: 375×667 viewport → `/` → click `#nav-burger` → `#admin-tab` is visible.
Found while screenshotting the mobile drawer during T-259; confirmed present on `master` before any of
that task's changes, so it is not a regression from it.

## Root cause

CSS precedence, not JavaScript: `admin.js` sets `hidden` correctly the whole time.

`hidden` hides an element only through the UA stylesheet's `[hidden] { display: none }`, which any author
`display` rule outranks. The mobile drawer layer in `frontend/css/layout.css` sets one:

```css
@media (max-width: 600px) {
  .topnav-tab { display: flex; align-items: center; min-height: 44px; ... }
}
```

That rule made the nav entries stack as full-width rows in the drawer — and, as a side effect, un-hid
every `hidden` one. Desktop never showed the symptom because nothing there sets `display` on
`.topnav-tab`, so the UA rule stood.

Two details worth keeping in mind next time: the media query contributes nothing to specificity (it only
gates when the rule applies), and the rule that grew the mobile tap target is the one that broke the
hiding — the defect arrived with an unrelated, correct change.

## Fix

One rule next to the `.topnav-tab` definition in `frontend/css/layout.css`, from T-259:

```css
.topnav-tab[hidden] { display: none; }
```

`.topnav-tab[hidden]` (class + attribute) outranks the mobile layer's `.topnav-tab` (class), so it holds
at every viewport without `!important` and regardless of source order.

Both regression tests were written first and verified failing before the fix:

- `frontend/__tests__/responsive.test.js` — "a hidden nav entry stays hidden even where the mobile layer
  sets a display (B-063)": the enforceable gate in `npm test`, asserting the guard rule exists.
- `visual-tests/interaction.spec.mjs` — "a nav entry hidden by attribute is not listed in the drawer
  (B-063)": the honest reproduction. Opens the real drawer at 375×667 and 360×640 and asserts
  `#admin-tab` is not visible. A computed-visibility bug only a browser can catch, which is why the
  zero-dep suite could not have caught this on its own.
