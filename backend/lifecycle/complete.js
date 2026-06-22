/**
 * Build completion (T-023). Atomically mark a request `ready` and record its
 * run history (seed + params, no bytes), so history is written exactly once at
 * the moment a build finishes and survives the later request purge.
 */

export function finishBuild({ db, requests, runs }, id, now = Date.now()) {
  const row = requests.get(id);
  if (!row) throw new Error(`request not found: ${id}`);

  const apply = () => {
    requests.markReady(id, now);
    runs.record({ userId: row.user_id, seed: row.seed, params: JSON.parse(row.params_json || '{}'), now });
  };

  if (db) {
    db.exec('BEGIN');
    try {
      apply();
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  } else {
    apply();
  }
}
