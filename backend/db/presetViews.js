/**
 * Preset views repository (T-192, ADR-021). Views are unique per (preset, user) for life
 * (INSERT OR IGNORE) — reloading the detail never inflates the count. The denormalized presets.views
 * counter is incremented only when a new join row is actually inserted, in the same transaction.
 * DB-only, testable against :memory:.
 */

function tx(db, fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

export function createPresetViewsRepo(db) {
  const insertIgnore = db.prepare('INSERT OR IGNORE INTO preset_views (preset_id, user_id, created_at) VALUES (?,?,?)');
  const inc = db.prepare('UPDATE presets SET views = views + 1 WHERE id = ?');
  const viewsOf = db.prepare('SELECT views FROM presets WHERE id = ?');

  return {
    /** Record one lifetime view of a preset by a user. Returns the fresh view count. No-op (count
     *  unchanged) if the user has already viewed it. */
    record(presetId, userId, now = Date.now()) {
      return tx(db, () => {
        const info = insertIgnore.run(presetId, userId, now);
        if (info.changes === 1) inc.run(presetId);
        return viewsOf.get(presetId)?.views ?? 0;
      });
    },

    /**
     * Account deletion: remove this user's views on OTHER people's presets, decrementing those
     * counters first. (Views ON this user's own presets are removed by presetsRepo.deleteForUser.)
     */
    deleteForUser(userId) {
      db.prepare('UPDATE presets SET views = views - 1 WHERE id IN (SELECT preset_id FROM preset_views WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM preset_views WHERE user_id = ?').run(userId);
    },
  };
}
