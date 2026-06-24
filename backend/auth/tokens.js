/**
 * Single-use auth tokens (T-021, ADR-004) for email verification and password
 * reset. The raw token is emailed; only its SHA-256 hash is stored, so a DB leak
 * exposes no live tokens. Consuming a token always deletes it (single-use) and
 * checks the optional expiry.
 */

import { randomBytes, createHash } from 'node:crypto';

const sha256hex = (s) => createHash('sha256').update(s).digest('hex');

export function createTokensRepo(db) {
  const insert = db.prepare(
    'INSERT INTO auth_tokens (token_hash, user_id, kind, expires_at, created_at) VALUES (?,?,?,?,?)'
  );
  const byHash = db.prepare('SELECT * FROM auth_tokens WHERE token_hash = ? AND kind = ?');
  const del = db.prepare('DELETE FROM auth_tokens WHERE token_hash = ?');

  return {
    issue(userId, kind, { ttlMs = null, now = Date.now() } = {}) {
      const raw = randomBytes(32).toString('hex');
      const expiresAt = ttlMs == null ? null : now + ttlMs;
      insert.run(sha256hex(raw), userId, kind, expiresAt, now);
      return raw;
    },

    consume(raw, kind, { now = Date.now() } = {}) {
      const row = byHash.get(sha256hex(raw), kind);
      if (!row) return null;
      del.run(row.token_hash); // single-use: remove on lookup, valid or not
      if (row.expires_at != null && now >= row.expires_at) return null;
      return row.user_id;
    },
  };
}
