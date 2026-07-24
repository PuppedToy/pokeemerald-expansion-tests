/**
 * Presets HTTP handlers (T-192, ADR-021). Thin and dependency-injected so they unit-test without a
 * server; wiring + auth gates + rate limits live in routes.js. Ownership/admin authorization, input
 * validation, response shaping and the Community date window live here. Tags are derived in the repo.
 */

import { isAdminEmail } from '../auth/admin.js';

export const NAME_MAX = 80;
export const DESC_MAX = 500;

// Fixed id of the built-in "Balanced" recommended preset (kind='official'). Seeded/refreshed from the
// frontend DEFAULTS by an admin (see handleSeedBalanced) so it's a real row with real likes/views,
// while its config still tracks the DEFAULTS SSOT.
export const BALANCED_ID = 'official-balanced';
const BALANCED_NAME = 'Balanced';
const BALANCED_DESC = 'The default, carefully-tuned settings. A great starting point for any run.';

// Community date window (on updated_at). Default 1 year (spec). 'all' = no lower bound.
const WINDOW_MS = {
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
  all: null,
};

function reqIsAdmin(req, users, adminEmails) {
  const u = req.userId ? users.get(req.userId) : null;
  return isAdminEmail(u?.email, adminEmails);
}

function parseConfig(config_json) {
  try { return JSON.parse(config_json); } catch { return {}; }
}

/** Shape a DB row for the API. config is included only for detail (includeConfig). */
function toPublic(row, { viewerId = null, includeConfig = false, likedByMe = false } = {}) {
  const item = {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    kind: row.kind,
    published: !!row.published,
    likes: row.likes,
    views: row.views,
    tags: { format: row.tag_format, mode: row.tag_mode, wild: row.tag_wild },
    isOwner: viewerId != null && row.user_id === viewerId,
    likedByMe: !!likedByMe,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includeConfig) item.config = parseConfig(row.config_json);
  return item;
}

function validName(name) {
  if (typeof name !== 'string') return null;
  const t = name.trim();
  if (!t || t.length > NAME_MAX) return null;
  return t;
}
function validDescription(description) {
  if (description == null) return '';
  if (typeof description !== 'string') return null;
  const t = description.trim();
  return t.length > DESC_MAX ? null : t;
}
function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

// ── GET /api/presets?scope=… (optionalAuth) ─────────────────────────────────────
export function handleList({ presets, presetLikes, users, adminEmails, now = () => Date.now() }) {
  return (req, res) => {
    const scope = req.query?.scope || 'mine';
    const page = Math.max(1, parseInt(req.query?.page, 10) || 1);
    const viewerId = req.userId ?? null;

    if (scope === 'mine') {
      if (!viewerId) return res.status(401).json({ error: 'login required' });
      const r = presets.listMine(viewerId, page);
      return res.json({ ...r, items: r.items.map((row) => toPublic(row, { viewerId })) });
    }

    if (scope === 'official') {
      const r = presets.listOfficial(page);
      const likedSet = viewerId ? presetLikes.likedSet(r.items.map((i) => i.id), viewerId) : new Set();
      return res.json({
        ...r,
        items: r.items.map((row) => toPublic(row, { viewerId, likedByMe: likedSet.has(row.id) })),
      });
    }

    if (scope === 'community') {
      const windowKey = Object.prototype.hasOwnProperty.call(WINDOW_MS, req.query?.since) ? req.query.since : 'year';
      const winMs = WINDOW_MS[windowKey];
      const sinceTs = winMs == null ? null : now() - winMs;
      const r = presets.listCommunity({
        q: req.query?.q,
        format: req.query?.format,
        mode: req.query?.mode,
        wild: req.query?.wild,
        sort: req.query?.sort,
        sinceTs,
        page,
      });
      const likedSet = viewerId ? presetLikes.likedSet(r.items.map((i) => i.id), viewerId) : new Set();
      return res.json({
        ...r,
        since: windowKey,
        items: r.items.map((row) => toPublic(row, { viewerId, likedByMe: likedSet.has(row.id) })),
      });
    }

    return res.status(400).json({ error: 'unknown scope' });
  };
}

// ── GET /api/presets/:id (optionalAuth) — detail + record a unique view ──────────
export function handleGet({ presets, presetLikes, presetViews, users, adminEmails, now = () => Date.now() }) {
  return (req, res) => {
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    const viewerId = req.userId ?? null;
    const isOwner = viewerId != null && row.user_id === viewerId;
    const admin = reqIsAdmin(req, users, adminEmails);
    const visible = row.published || row.kind === 'official' || isOwner || admin;
    if (!visible) return res.status(404).json({ error: 'not found' });

    // Count a unique lifetime view only for a logged-in non-owner viewing a discoverable preset.
    if (viewerId && !isOwner && (row.published || row.kind === 'official')) {
      presetViews.record(row.id, viewerId, now());
    }
    const fresh = presets.get(row.id); // re-read so the returned view count reflects the record above
    const likedByMe = viewerId ? presetLikes.likedBy(fresh.id, viewerId) : false;
    res.json({ item: toPublic(fresh, { viewerId, includeConfig: true, likedByMe }) });
  };
}

// ── POST /api/presets (requireAuth) ─────────────────────────────────────────────
export function handleCreate({ presets, users, adminEmails, idGen, now = () => Date.now() }) {
  return (req, res) => {
    const { name, description, config, official } = req.body ?? {};
    const cleanName = validName(name);
    if (!cleanName) return res.status(400).json({ error: 'name required (1–80 chars)' });
    const cleanDesc = validDescription(description);
    if (cleanDesc === null) return res.status(400).json({ error: 'description too long (max 500)' });
    if (!isPlainObject(config)) return res.status(400).json({ error: 'config object required' });

    const kind = official && reqIsAdmin(req, users, adminEmails) ? 'official' : 'user';
    const row = presets.create({
      id: idGen(), userId: req.userId, name: cleanName, description: cleanDesc, config, kind, now: now(),
    });
    res.status(201).json({ item: toPublic(row, { viewerId: req.userId, includeConfig: true }) });
  };
}

// ── PUT /api/presets/:id (requireAuth + owner) ──────────────────────────────────
export function handleUpdate({ presets, now = () => Date.now() }) {
  return (req, res) => {
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    if (row.user_id !== req.userId) return res.status(403).json({ error: 'not your preset' });

    const patch = {};
    const { name, description, config } = req.body ?? {};
    if (name !== undefined) {
      const cleanName = validName(name);
      if (!cleanName) return res.status(400).json({ error: 'name required (1–80 chars)' });
      patch.name = cleanName;
    }
    if (description !== undefined) {
      const cleanDesc = validDescription(description);
      if (cleanDesc === null) return res.status(400).json({ error: 'description too long (max 500)' });
      patch.description = cleanDesc;
    }
    if (config !== undefined) {
      if (!isPlainObject(config)) return res.status(400).json({ error: 'config must be an object' });
      patch.config = config;
    }
    const updated = presets.update(row.id, patch, now());
    res.json({ item: toPublic(updated, { viewerId: req.userId, includeConfig: true }) });
  };
}

// ── POST /api/presets/:id/publish (requireAuth + requireVerified + owner) ────────
export function handlePublish({ presets, now = () => Date.now() }) {
  return (req, res) => {
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    if (row.user_id !== req.userId) return res.status(403).json({ error: 'not your preset' });
    const updated = presets.setPublished(row.id, true, now());
    res.json({ item: toPublic(updated, { viewerId: req.userId }) });
  };
}

// ── POST /api/presets/:id/unpublish (requireAuth + owner OR admin) ──────────────
export function handleUnpublish({ presets, users, adminEmails, now = () => Date.now() }) {
  return (req, res) => {
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    if (row.user_id !== req.userId && !reqIsAdmin(req, users, adminEmails)) {
      return res.status(403).json({ error: 'not allowed' });
    }
    const updated = presets.setPublished(row.id, false, now());
    res.json({ item: toPublic(updated, { viewerId: req.userId }) });
  };
}

// ── DELETE /api/presets/:id (requireAuth + owner OR admin) ───────────────────────
export function handleDelete({ presets, users, adminEmails }) {
  return (req, res) => {
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    if (row.user_id !== req.userId && !reqIsAdmin(req, users, adminEmails)) {
      return res.status(403).json({ error: 'not allowed' });
    }
    presets.remove(row.id);
    res.json({ ok: true });
  };
}

// ── POST /api/presets/:id/like (requireAuth) — toggle ───────────────────────────
export function handleLike({ presets, presetLikes, now = () => Date.now() }) {
  return (req, res) => {
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    // Likeable when discoverable: published (Community) OR a recommended/official preset.
    if (!row.published && row.kind !== 'official') return res.status(400).json({ error: 'preset is not published' });
    if (row.user_id === req.userId) return res.status(400).json({ error: 'cannot like your own preset' });
    const result = presetLikes.toggle(row.id, req.userId, now());
    res.json(result);
  };
}

// ── POST /api/presets/:id/recommend | /unrecommend (requireAuth + admin) ─────────
// Admin curation: promote/demote ANY preset between Recommended (kind='official') and a normal user
// preset, without recreating it. Ownership is unchanged.
function setKindHandler(kind, { presets, users, adminEmails, now = () => Date.now() }) {
  return (req, res) => {
    if (!reqIsAdmin(req, users, adminEmails)) return res.status(403).json({ error: 'admin only' });
    const row = presets.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    const updated = presets.setKind(row.id, kind, now());
    res.json({ item: toPublic(updated, { viewerId: req.userId }) });
  };
}
export const handleRecommend = (deps) => setKindHandler('official', deps);
export const handleUnrecommend = (deps) => setKindHandler('user', deps);

// ── POST /api/presets/official/balanced (requireAuth + admin) ────────────────────
// Idempotent seed of the built-in "Balanced" recommended preset. Creates it (owned by the admin) on
// first call; on later calls only refreshes its config/tags when DEFAULTS actually changed (so admin
// name/description edits and its likes/views are preserved). Keeps DEFAULTS as the config SSOT while
// giving Balanced a real row that can accumulate likes/views like any other preset.
export function handleSeedBalanced({ presets, users, adminEmails, now = () => Date.now() }) {
  return (req, res) => {
    if (!reqIsAdmin(req, users, adminEmails)) return res.status(403).json({ error: 'admin only' });
    const { config } = req.body ?? {};
    if (!isPlainObject(config)) return res.status(400).json({ error: 'config object required' });
    let row = presets.get(BALANCED_ID);
    if (row) {
      if (row.config_json !== JSON.stringify(config)) row = presets.update(BALANCED_ID, { config }, now());
    } else {
      row = presets.create({
        id: BALANCED_ID, userId: req.userId, name: BALANCED_NAME, description: BALANCED_DESC,
        config, kind: 'official', now: now(),
      });
    }
    res.json({ item: toPublic(row, { viewerId: req.userId }) });
  };
}
