/**
 * Build completion (T-023). Atomically mark a request `ready` and record its
 * run history (seed + params, no bytes), so history is written exactly once at
 * the moment a build finishes and survives the later request purge.
 *
 * email-on-ready (T-031): if the request opted in, fire the "ready" mail AFTER the
 * commit — fire-and-forget and graceful (the mailer never throws), so a mail hiccup
 * never affects the build outcome. `mailer`/`users`/`baseUrl` are optional (tests and
 * the FAKE path can omit them).
 */

export function finishBuild({ db, requests, runs, mailer, users, baseUrl }, id, now = Date.now()) {
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

  if (row.email_on_ready && mailer && users) {
    const user = users.get(row.user_id);
    if (user?.email) {
      Promise.resolve(mailer.sendMail('ready', user.email, { link: `${baseUrl || ''}/` })).catch(() => {});
    }
  }
}
