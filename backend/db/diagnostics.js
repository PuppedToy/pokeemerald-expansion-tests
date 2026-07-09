/**
 * Randomization diagnostics repository (T-075). One row per completed browser generation:
 * the run's warning/error events (code + severity + rich context) captured in the front and
 * POSTed to /api/diagnostics. user_id is nullable (generation needs no login). Rows are
 * time-expired 48 h after created_at by the retention sweeper (lifecycle/sweeper.js).
 *
 * DB-only and dependency-free, so it unit-tests against an in-memory database — same shape
 * as db/feedback.js. counts + events are stored as JSON text; the local audit tool
 * (scripts/scan-diagnostics.mjs) parses and classifies them.
 */

export function createDiagnosticsRepo(db) {
  // INSERT OR REPLACE so a re-report of the same runId (client retry) is idempotent.
  const insert = db.prepare(
    `INSERT OR REPLACE INTO diagnostics
       (id, user_id, created_at, generated_at, seed, run_type, app_version, user_agent, counts_json, events_json)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  );
  const byId = db.prepare('SELECT * FROM diagnostics WHERE id = ?');
  // Newest first, LEFT JOIN so anonymous runs (user_id NULL) still appear (email = NULL).
  const listAll = db.prepare(
    `SELECT d.*, u.email
       FROM diagnostics d LEFT JOIN users u ON u.id = d.user_id
      ORDER BY d.created_at DESC, d.id DESC`
  );
  const purge = db.prepare('DELETE FROM diagnostics WHERE created_at <= ?');
  const delForUser = db.prepare('DELETE FROM diagnostics WHERE user_id = ?');

  return {
    create({ id, userId = null, createdAt = Date.now(), generatedAt = null, seed = null,
             runType = null, appVersion = null, userAgent = null, counts = {}, events = [] }) {
      insert.run(
        id, userId, createdAt, generatedAt, seed, runType, appVersion, userAgent,
        JSON.stringify(counts ?? {}), JSON.stringify(events ?? []),
      );
      return this.get(id);
    },
    get(id) { return byId.get(id) ?? null; },
    all() { return listAll.all(); },
    /** Time-based retention: delete everything at/older than the cutoff. Returns rows removed. */
    purgeExpired(cutoff) { return purge.run(cutoff).changes; },
    /** Account deletion (FK is not ON DELETE CASCADE): clear a user's diagnostics first. */
    deleteForUser(userId) { delForUser.run(userId); },
  };
}
