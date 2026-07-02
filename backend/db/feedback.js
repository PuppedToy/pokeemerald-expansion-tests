/**
 * Feedback repository (T-048). One row per user submission; the author (user_id) and a timestamp
 * are recorded so the owner can export and curate the on-site lists by hand — nothing automatic.
 * DB-only and dependency-free, so it unit-tests against an in-memory database.
 */

// The closed set of allowed categories, shared by the handler (validation) and the frontend.
export const FEEDBACK_CATEGORIES = ['feature', 'bug', 'other'];

export function createFeedbackRepo(db) {
  const insert = db.prepare(
    'INSERT INTO feedback (user_id, category, message, created_at) VALUES (?,?,?,?)'
  );
  const byId = db.prepare('SELECT * FROM feedback WHERE id = ?');
  // Newest first, joined with the author's email so an export is analysable on its own.
  const listAll = db.prepare(
    `SELECT f.id, f.user_id, u.email, f.category, f.message, f.created_at
       FROM feedback f JOIN users u ON u.id = f.user_id
      ORDER BY f.created_at DESC, f.id DESC`
  );
  const delForUser = db.prepare('DELETE FROM feedback WHERE user_id = ?');

  return {
    create({ userId, category, message, now = Date.now() }) {
      const info = insert.run(userId, category, message, now);
      return this.get(Number(info.lastInsertRowid));
    },
    get(id) { return byId.get(id) ?? null; },
    all() { return listAll.all(); },
    /** Used by account deletion (FKs aren't ON DELETE CASCADE): clear a user's feedback first. */
    deleteForUser(userId) { delForUser.run(userId); },
  };
}
