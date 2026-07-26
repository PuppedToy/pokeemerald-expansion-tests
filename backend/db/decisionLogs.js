/**
 * Team-building decision-log repository (T-117/T-210). One row per completed browser generation:
 * the readable decision trace (renderTeamAuditText) the front POSTs to /api/decision-log after each
 * run. It is server-only — never shown to the end user; the owner pulls a specific run's log with the
 * /decision-log skill (backend/scripts/get-decision-log.mjs). user_id is nullable (generation needs
 * no login). Rows are time-expired 48h after created_at by the retention sweeper (lifecycle/sweeper.js),
 * matching diagnostics/bundle retention.
 *
 * DB-only and dependency-free (unit-tests against an in-memory database) — same shape as db/diagnostics.js.
 */

export function createDecisionLogsRepo(db) {
  // INSERT OR REPLACE so a re-report of the same runId (client retry) is idempotent.
  const insert = db.prepare(
    `INSERT OR REPLACE INTO decision_logs
       (id, user_id, created_at, generated_at, seed, run_type, app_version, user_agent, text)
     VALUES (?,?,?,?,?,?,?,?,?)`
  );
  const byId = db.prepare('SELECT * FROM decision_logs WHERE id = ?');
  const bySeedStmt = db.prepare(
    'SELECT * FROM decision_logs WHERE seed = ? ORDER BY created_at DESC, id DESC'
  );
  const listAll = db.prepare(
    `SELECT d.*, u.email
       FROM decision_logs d LEFT JOIN users u ON u.id = d.user_id
      ORDER BY d.created_at DESC, d.id DESC`
  );
  const purge = db.prepare('DELETE FROM decision_logs WHERE created_at <= ?');
  const delForUser = db.prepare('DELETE FROM decision_logs WHERE user_id = ?');

  return {
    create({ id, userId = null, createdAt = Date.now(), generatedAt = null, seed = null,
             runType = null, appVersion = null, userAgent = null, text = '' }) {
      insert.run(
        id, userId, createdAt, generatedAt, seed, runType, appVersion, userAgent,
        String(text ?? ''),
      );
      return this.get(id);
    },
    get(id) { return byId.get(id) ?? null; },
    /** All rows for a seed, newest first (a seed can be re-run). */
    bySeed(seed) { return bySeedStmt.all(String(seed)); },
    all() { return listAll.all(); },
    /** Time-based retention: delete everything at/older than the cutoff. Returns rows removed. */
    purgeExpired(cutoff) { return purge.run(cutoff).changes; },
    /** Account deletion (FK is not ON DELETE CASCADE): clear a user's decision logs first. */
    deleteForUser(userId) { delForUser.run(userId); },
  };
}
