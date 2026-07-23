# ADR-021: Config presets are per-user DB rows with derived tags, denormalized like/view counters and an env-var admin

- **Status:** accepted
- **Date:** 2026-07-22
- **Task:** T-192

## Context

Config was browser-only: **Save** downloaded a `.json`, **Load** re-imported it (or a bundle's
`.config`), **Reset** repopulated `DEFAULTS`. Nothing was named, reusable across devices, or
shareable. T-192 adds named presets persisted per user with three scopes — **My**, **Official**
(owner-curated), **Community** (published, discoverable) — plus likes, views, search, filters,
sorting and pagination. This is the backend's first paginated/searchable per-user surface (no list
endpoint existed before), so it also sets the pattern.

Constraints: the backend is zero-dependency SQLite (`node:sqlite`) + the repo/router pattern
(template: `feedback`), auth is email+password+JWT (`req.userId`), and `DEFAULTS` already live in
the frontend (`config-form.js`) as the single home of the "Balanced" baseline.

## Decision

**Three tables** in the `MIGRATION` string of `backend/db/index.js` (epoch-ms `INTEGER`, FKs **not**
`ON DELETE CASCADE`, matching the codebase):

- `presets` — `id TEXT` (`randomUUID`), `user_id`, `name`, `description`, `config_json`, `kind`
  (`'user'|'official'`), `published`, denormalized `likes`/`views` counters, derived `tag_format` /
  `tag_mode` / `tag_wild` columns, a `relevance INTEGER GENERATED ALWAYS AS (views*likes) STORED`
  column, `created_at`, `updated_at`. Indexes on `(user_id, updated_at)` and on `published` paired
  with each sort key (`updated_at`, `relevance`, `likes`, `views`).
- `preset_likes` / `preset_views` — join tables `(preset_id, user_id)` PK.

**Tags are auto-derived** from the config, never user-entered: `tag_format = config.battleFormat`,
`tag_mode = runType` (`default→normal`), `tag_wild = config.wildEncounterType`. The server is the
authority (writes the `tag_*` columns and returns them); the frontend only re-derives them for the
synthetic Balanced card. Tags cannot drift from the actual config or be falsified.

**Likes and views are unique per user for life** — a `(preset_id, user_id)` join row exists at most
once; the `presets.likes`/`views` counters are maintained in the *same* transaction as the join
insert/delete (INSERT OR IGNORE for views; toggle for likes). Own presets don't self-count views.
Denormalized counters keep list queries `COUNT()`-free and let `relevance = views*likes` be a stored,
indexable column. Community list pagination is `LIMIT 5 OFFSET` with a stable tie-broken order
(`<sortkey> DESC, updated_at DESC, id DESC`).

**Admin is an env var**: `ADMIN_EMAILS` (comma-separated, like `JWT_SECRET`). It gates creating
`kind='official'` presets and moderating Community (an admin may unpublish/delete any preset). An
admin can also **promote/demote any preset to/from Recommended** in place (`POST /presets/:id/recommend`
| `/unrecommend` → `setKind`, ownership unchanged) — curation without recreating the preset.
`GET /api/me` returns an `isAdmin` flag so the frontend can show admin affordances.

**"Balanced" is a real seeded `kind='official'` row (not synthetic), so it has real likes/views like
any other preset.** It is created idempotently by an admin's browser: on load the frontend calls an
admin-only `POST /api/presets/official/balanced` with the live `DEFAULTS`, which creates the fixed-id
row on first run and thereafter only refreshes its config/tags when `DEFAULTS` actually changed
(preserving admin name/description edits and its likes/views). This keeps `DEFAULTS` the config SSOT —
the row's config is always sourced from it, never hand-copied on the server — while making every
`official` preset a first-class, likeable/viewable preset. The UI labels the `kind='official'` scope
**"Recommended"** (the internal token stays `official`).

> Amended in the same task (before first commit): an earlier draft made Balanced a *synthetic*,
> non-DB card (no likes/views). Requirement changed — recommended presets must accumulate likes/views
> like the rest — so Balanced became a real seeded row via the frontend-sourced upsert above.

## Alternatives considered

- **Manual tags** — rejected: they can drift from the config and be gamed; auto-derived is always true.
- **`is_admin` column on `users`** — rejected for v1: needs a manual DB edit to grant and there's no
  admin panel; an env var matches the existing zero-dep config style and is trivial to change.
- **Seeding "Balanced" from a *backend* copy of `DEFAULTS`** — rejected: duplicates the SSOT and
  drifts whenever `DEFAULTS` changes. The chosen frontend-sourced upsert avoids this — the server
  never holds a `DEFAULTS` copy; the admin's browser posts the live `DEFAULTS`.
- **Keeping Balanced synthetic (no likes/views)** — rejected: recommended presets must behave like the
  rest (likes/views), which a non-DB card can't. Trade-off accepted: Balanced only appears once an
  admin has loaded the app (seeds it); with no admin configured, the Recommended tab is empty.
- **`COUNT()` over join tables per list query** — rejected: no index on a product, slower lists;
  denormalized counters + a stored `relevance` column sort under an index.
- **Every-open view counting / report queue moderation** — rejected for v1 as inflatable / heavier
  than the need; unique-per-user views and admin-unpublish are the lean, sufficient choices.

## Consequences

- New per-user data → the account-deletion transaction in `backend/auth/routes.js` must clear
  `preset_likes` and `preset_views` (decrementing the affected presets' counters) and `presets`
  before `users.delete`; `backend/__tests__/db.test.js`'s expected-tables list gains the three tables.
- We commit to keeping the `tag_*` columns and `relevance` in sync on every config write (re-derive on
  create/update) — the price of denormalization, paid inside one transaction.
- Publishing exposes `name`/`description` publicly with no pre-moderation; the mitigation is admin
  unpublish/delete. If abuse grows, a user-facing report queue can be added later without schema churn
  to the core tables.
- The relevance sort buries presets with zero likes or views (product is 0); ties fall back to
  recency, so newly published presets remain reachable via the default 1-year window and other sorts.
