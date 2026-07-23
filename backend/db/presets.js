/**
 * Presets repository (T-192, ADR-021). One row per named per-user config snapshot. Tags are derived
 * here on every write (create/update) from the config so presets.tag_* can never drift from
 * config_json. Pagination/search/filter/sort for the Community scope is done in SQL (LIMIT/OFFSET +
 * a dynamic WHERE built with positional `?`, like requests.findByStates). DB-only and dependency-free
 * so it unit-tests against an in-memory database.
 */

import { deriveTags, TAG_FORMATS, TAG_MODES, TAG_WILDS } from '../presets/tags.js';

export const PAGE_SIZE = 5; // presets are paginated 5 per page everywhere (spec)

// Light column list for list endpoints — config_json is fetched only for get()/detail (it's large).
const LIST_COLUMNS =
  'id,user_id,name,description,kind,published,likes,views,tag_format,tag_mode,tag_wild,created_at,updated_at';

const SORTS = {
  relevance: 'relevance DESC, updated_at DESC, id DESC',
  likes: 'likes DESC, updated_at DESC, id DESC',
  views: 'views DESC, updated_at DESC, id DESC',
};

function pageInfo(total, page) {
  return { total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function createPresetsRepo(db) {
  const insert = db.prepare(
    `INSERT INTO presets (id,user_id,name,description,config_json,kind,tag_format,tag_mode,tag_wild,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  );
  const byId = db.prepare('SELECT * FROM presets WHERE id = ?');
  const updateStmt = db.prepare(
    `UPDATE presets SET name=?, description=?, config_json=?, tag_format=?, tag_mode=?, tag_wild=?, updated_at=? WHERE id=?`
  );
  const setPublishedStmt = db.prepare('UPDATE presets SET published=?, updated_at=? WHERE id=?');
  const setKindStmt = db.prepare('UPDATE presets SET kind=?, updated_at=? WHERE id=?');
  const delLikesForPreset = db.prepare('DELETE FROM preset_likes WHERE preset_id = ?');
  const delViewsForPreset = db.prepare('DELETE FROM preset_views WHERE preset_id = ?');
  const delPreset = db.prepare('DELETE FROM presets WHERE id = ?');

  const mineCount = db.prepare('SELECT COUNT(*) n FROM presets WHERE user_id = ?');
  const minePage = db.prepare(
    `SELECT ${LIST_COLUMNS} FROM presets WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ?`
  );
  const officialCount = db.prepare("SELECT COUNT(*) n FROM presets WHERE kind = 'official'");
  const officialPage = db.prepare(
    `SELECT ${LIST_COLUMNS} FROM presets WHERE kind = 'official' ORDER BY updated_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ?`
  );

  return {
    create({ id, userId, name, description = '', config, kind = 'user', now = Date.now() }) {
      const { tag_format, tag_mode, tag_wild } = deriveTags(config);
      insert.run(
        id, userId, name, description, JSON.stringify(config ?? {}),
        kind === 'official' ? 'official' : 'user', tag_format, tag_mode, tag_wild, now, now
      );
      return this.get(id);
    },

    get(id) { return byId.get(id) ?? null; },

    /** Partial update: only the provided fields change; config (if given) re-derives tags. Always
     *  bumps updated_at. Returns the updated row, or null if it doesn't exist. */
    update(id, { name, description, config } = {}, now = Date.now()) {
      const row = this.get(id);
      if (!row) return null;
      const newName = name !== undefined ? name : row.name;
      const newDesc = description !== undefined ? description : row.description;
      let configJson = row.config_json;
      let tags = { tag_format: row.tag_format, tag_mode: row.tag_mode, tag_wild: row.tag_wild };
      if (config !== undefined) { configJson = JSON.stringify(config ?? {}); tags = deriveTags(config); }
      updateStmt.run(newName, newDesc, configJson, tags.tag_format, tags.tag_mode, tags.tag_wild, now, id);
      return this.get(id);
    },

    /** Publish/unpublish. Bumps updated_at so a newly-shared preset surfaces in the Community date
     *  window (which filters on updated_at). Returns the updated row, or null. */
    setPublished(id, published, now = Date.now()) {
      const row = this.get(id);
      if (!row) return null;
      setPublishedStmt.run(published ? 1 : 0, now, id);
      return this.get(id);
    },

    /** Promote/demote a preset between 'official' (Recommended) and 'user' — admin curation (T-192).
     *  Bumps updated_at. Returns the updated row, or null if it doesn't exist. */
    setKind(id, kind, now = Date.now()) {
      const row = this.get(id);
      if (!row) return null;
      setKindStmt.run(kind === 'official' ? 'official' : 'user', now, id);
      return this.get(id);
    },

    /** Delete a preset and its like/view rows (FK isn't ON DELETE CASCADE — join rows go first). */
    remove(id) {
      delLikesForPreset.run(id);
      delViewsForPreset.run(id);
      delPreset.run(id);
    },

    listMine(userId, page = 1) {
      const p = Math.max(1, Math.floor(page) || 1);
      const total = mineCount.get(userId).n;
      const items = minePage.all(userId, (p - 1) * PAGE_SIZE);
      return { items, ...pageInfo(total, p) };
    },

    listOfficial(page = 1) {
      const p = Math.max(1, Math.floor(page) || 1);
      const total = officialCount.get().n;
      const items = officialPage.all((p - 1) * PAGE_SIZE);
      return { items, ...pageInfo(total, p) };
    },

    /**
     * Published presets, filtered/searched/sorted, paginated 5/page. `q` is a substring match on
     * name+description; format/mode/wild are exact tag filters (ignored when falsy or 'any'); sinceTs
     * is an updated_at lower bound (null = all time); sort ∈ {relevance,views,likes} (default relevance).
     */
    listCommunity({ q, format, mode, wild, sort = 'relevance', sinceTs = null, page = 1 } = {}) {
      const p = Math.max(1, Math.floor(page) || 1);
      const where = ['published = 1'];
      const params = [];
      if (TAG_FORMATS.includes(format)) { where.push('tag_format = ?'); params.push(format); }
      if (TAG_MODES.includes(mode)) { where.push('tag_mode = ?'); params.push(mode); }
      if (TAG_WILDS.includes(wild)) { where.push('tag_wild = ?'); params.push(wild); }
      if (typeof q === 'string' && q.trim()) {
        const like = `%${q.trim().replace(/[%_\\]/g, (c) => '\\' + c)}%`;
        where.push("(name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')");
        params.push(like, like);
      }
      if (Number.isFinite(sinceTs)) { where.push('updated_at >= ?'); params.push(sinceTs); }
      const whereSql = where.join(' AND ');
      const order = SORTS[sort] || SORTS.relevance;

      const total = db.prepare(`SELECT COUNT(*) n FROM presets WHERE ${whereSql}`).get(...params).n;
      const items = db
        .prepare(`SELECT ${LIST_COLUMNS} FROM presets WHERE ${whereSql} ORDER BY ${order} LIMIT ${PAGE_SIZE} OFFSET ?`)
        .all(...params, (p - 1) * PAGE_SIZE);
      return { items, ...pageInfo(total, p) };
    },

    /**
     * Account deletion (T-035 pattern): drop every preset owned by userId plus any like/view rows
     * pointing at them (which may belong to other users). The owner's OWN likes/views on other
     * people's presets are cleared separately by presetLikes/presetViews.deleteForUser (which also
     * decrement those presets' counters). FKs aren't ON DELETE CASCADE, hence the manual order.
     */
    deleteForUser(userId) {
      db.prepare('DELETE FROM preset_likes WHERE preset_id IN (SELECT id FROM presets WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM preset_views WHERE preset_id IN (SELECT id FROM presets WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM presets WHERE user_id = ?').run(userId);
    },
  };
}
