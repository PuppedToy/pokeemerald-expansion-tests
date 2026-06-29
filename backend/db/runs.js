/**
 * Run-history repository (T-023). Minimal, durable record of a generated run —
 * seed + params only, NEVER ROM bytes — so a user can re-generate from a seed
 * after the ROM files are gone. Survives request purge.
 */

export function createRunsRepo(db) {
  const insert = db.prepare(
    'INSERT INTO runs (user_id, seed, params_json, created_at) VALUES (?,?,?,?)'
  );
  const forUser = db.prepare('SELECT * FROM runs WHERE user_id = ? ORDER BY created_at DESC');

  return {
    record({ userId, seed, params, now = Date.now() }) {
      insert.run(userId, String(seed), JSON.stringify(params ?? {}), now);
    },
    listForUser(userId) {
      return forUser.all(userId);
    },
    deleteForUser(userId) {
      db.prepare('DELETE FROM runs WHERE user_id = ?').run(userId);
    },
  };
}
