/**
 * Preset likes repository (T-192, ADR-021). One row per (preset, user); a user likes a preset at
 * most once. The denormalized presets.likes counter is kept in sync inside the same transaction as
 * the join-row insert/delete, so the counter and the rows can never disagree. DB-only, testable
 * against :memory:.
 */

function tx(db, fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

export function createPresetLikesRepo(db) {
  const has = db.prepare('SELECT 1 FROM preset_likes WHERE preset_id = ? AND user_id = ?');
  const insert = db.prepare('INSERT INTO preset_likes (preset_id, user_id, created_at) VALUES (?,?,?)');
  const del = db.prepare('DELETE FROM preset_likes WHERE preset_id = ? AND user_id = ?');
  const inc = db.prepare('UPDATE presets SET likes = likes + 1 WHERE id = ?');
  const dec = db.prepare('UPDATE presets SET likes = likes - 1 WHERE id = ?');
  const likesOf = db.prepare('SELECT likes FROM presets WHERE id = ?');

  return {
    /** Toggle the current user's like on a preset. Returns { liked, likes } with the fresh count. */
    toggle(presetId, userId, now = Date.now()) {
      return tx(db, () => {
        const liked = !!has.get(presetId, userId);
        if (liked) { del.run(presetId, userId); dec.run(presetId); }
        else { insert.run(presetId, userId, now); inc.run(presetId); }
        return { liked: !liked, likes: likesOf.get(presetId)?.likes ?? 0 };
      });
    },

    likedBy(presetId, userId) { return !!has.get(presetId, userId); },

    /** For a list of preset ids, return the Set the given user has liked (marks likedByMe cheaply). */
    likedSet(presetIds, userId) {
      const ids = (presetIds || []).filter(Boolean);
      if (!ids.length || !userId) return new Set();
      const rows = db
        .prepare(`SELECT preset_id FROM preset_likes WHERE user_id = ? AND preset_id IN (${ids.map(() => '?').join(',')})`)
        .all(userId, ...ids);
      return new Set(rows.map((r) => r.preset_id));
    },

    /**
     * Account deletion: remove this user's likes on OTHER people's presets, decrementing those
     * presets' counters first so they stay accurate. (Likes ON this user's own presets are removed
     * wholesale by presetsRepo.deleteForUser, which deletes the presets too.)
     */
    deleteForUser(userId) {
      db.prepare('UPDATE presets SET likes = likes - 1 WHERE id IN (SELECT preset_id FROM preset_likes WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM preset_likes WHERE user_id = ?').run(userId);
    },
  };
}
