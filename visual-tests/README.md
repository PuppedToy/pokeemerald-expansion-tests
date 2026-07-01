# visual-tests — responsive visual regression + agent preview (T-040)

Isolated, **dev-only** harness. It is **not** part of the app runtime — the shipped
`frontend`/`backend` stay zero-dependency (see [ADR-009](../docs/adr/ADR-009-frontend-test-harness-zero-dep.md)).
The rationale for adding a browser toolchain here (and how it coexists with ADR-009) is
[ADR-010](../docs/adr/ADR-010-visual-regression-playwright-dev-tool.md).

## Setup (once)

```bash
cd visual-tests
npm install
npx playwright install chromium
```

## What it covers

- **App** (served by `backend/server.js` in `FAKE_BUILD` mode): home, features, randomizer,
  settings, auth modal, `reset.html`, `verify.html`.
- **Generated docs viewer**: a deterministic, self-contained sample built from `frontend/template.html`
  (fixture, seed 42) — every tab (Encounters, Trainers, PC, Pokédex, Moves, Abilities).
- **Viewports**: phone-sm 360, mobile 375, iPad portrait 768, iPad landscape 1024, desktop 1440.

## Commands

| Command | Purpose |
|---|---|
| `npm run fixture` | (re)build the docs-viewer sample `fixtures/docs-sample.html` (deterministic, ~25 s) |
| `npm run shoot` | screenshot every screen × viewport into `.shots/` + report horizontal overflow (agent's hands-free preview) |
| `npm run visual` | Playwright visual-regression suite: no-overflow assertion + pixel snapshot vs baseline |
| `npm run visual:update` | refresh baselines after an intentional, visually-reviewed change |

`shoot.mjs` flags: `--vp NAME` (one viewport), `--only SUBSTR` (filter screens), `--full` (full-page), `--out DIR`.

## The desktop lock

The **desktop** (1440) baselines are the "desktop must not change" guarantee (T-040): they are captured
from `master` before any CSS edit and must keep matching. Mobile/tablet baselines evolve during
implementation and are refreshed with `npm run visual:update` **after** visually reviewing the `.shots/`.
