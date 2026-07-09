/**
 * SQLite persistence for the ROM-production service (T-023, ADR-003).
 *
 * Uses the built-in node:sqlite (synchronous DatabaseSync) — zero extra
 * dependency and no native build, which keeps the hardened build image (T-026)
 * lean. The schema, the request state machine and the "one active request per
 * user" guarantee all live here.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// States that occupy a user's single active slot (block a new request).
// Terminal states (downloaded, expired) are purged; `failed` is non-blocking
// so the user can retry.
export const ACTIVE_STATES = ['queued_fast', 'queued_slow', 'building', 'paused', 'ready'];

// Allowed state transitions. `building -> queued_*` exists for crash recovery
// (ADR-003): an interrupted build is re-queued, keeping roms_done.
export const TRANSITIONS = {
  queued_fast: ['building', 'failed'],
  queued_slow: ['building', 'failed'],
  building:    ['paused', 'ready', 'failed', 'queued_fast', 'queued_slow'],
  paused:      ['building', 'queued_fast', 'queued_slow', 'failed'],
  ready:       ['downloaded', 'expired'],
  failed:      ['expired'],
  downloaded:  [],
  expired:     [],
};

const ACTIVE_LIST = ACTIVE_STATES.map((s) => `'${s}'`).join(',');

const MIGRATION = `
CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  verified       INTEGER NOT NULL DEFAULT 0,
  owns_valid_rom INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS requests (
  id             TEXT PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  state          TEXT NOT NULL,
  queue_class    TEXT NOT NULL,
  roms_total     INTEGER NOT NULL,
  roms_done      INTEGER NOT NULL DEFAULT 0,
  bundle_path    TEXT NOT NULL,
  output_path    TEXT,
  email_on_ready INTEGER NOT NULL DEFAULT 0,
  seed           TEXT NOT NULL,
  params_json    TEXT NOT NULL,
  created_at     INTEGER NOT NULL,
  started_at     INTEGER,
  ready_at       INTEGER,
  updated_at     INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_per_user
  ON requests(user_id) WHERE state IN (${ACTIVE_LIST});
CREATE INDEX IF NOT EXISTS requests_by_state ON requests(state);

CREATE TABLE IF NOT EXISTS runs (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  seed        TEXT NOT NULL,
  params_json TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);

-- Single-use, optionally-expiring tokens for email verification and password reset (T-021).
-- The raw token is emailed; only its SHA-256 hash is stored, so a DB leak exposes no live tokens.
CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  kind       TEXT NOT NULL,          -- 'verify' | 'reset'
  expires_at INTEGER,                -- nullable (verify links need not expire)
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_tokens_by_user ON auth_tokens(user_id, kind);

-- User feedback (T-048): free-text messages categorised as feature/bug/other, kept with the
-- author and a timestamp. Curated into the on-site lists manually, off-line — nothing automatic.
CREATE TABLE IF NOT EXISTS feedback (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  category   TEXT NOT NULL,          -- 'feature' | 'bug' | 'other'
  message    TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS feedback_by_user ON feedback(user_id);

-- Randomization diagnostics (T-075): one row per completed browser generation. The front
-- reports every run's warnings/errors here so degraded outcomes (e.g. a trainer team of 5)
-- become auditable. user_id is nullable (generation does not require login); the sweeper
-- purges rows 48 h after created_at, matching the bundle/output retention window.
CREATE TABLE IF NOT EXISTS diagnostics (
  id           TEXT PRIMARY KEY,               -- runId (bundle sessionId)
  user_id      INTEGER REFERENCES users(id),   -- nullable → anonymous run
  created_at   INTEGER NOT NULL,               -- epoch ms, server receive time (TTL base)
  generated_at INTEGER,                        -- epoch ms, client generation time
  seed         TEXT,
  run_type     TEXT,
  app_version  TEXT,
  user_agent   TEXT,
  counts_json  TEXT NOT NULL,                  -- {fatal,error,warning}
  events_json  TEXT NOT NULL                   -- array of {seq,severity,code,message,context}
);
CREATE INDEX IF NOT EXISTS diagnostics_by_created ON diagnostics(created_at);
CREATE INDEX IF NOT EXISTS diagnostics_by_user ON diagnostics(user_id);
`;

export function migrate(db) {
  db.exec(MIGRATION);
}

export function openDatabase(filename = process.env.DB_PATH || 'data/app.db') {
  // node:sqlite won't create the parent dir; ensure it exists (B-002).
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys = ON');
  migrate(db);
  return db;
}
