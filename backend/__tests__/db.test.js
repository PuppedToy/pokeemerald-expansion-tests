import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { openDatabase, migrate } from '../db/index.js';

test('openDatabase creates the parent directory if missing (B-002)', () => {
  const dir = path.join(os.tmpdir(), `ec-db-${process.pid}`, 'nested');
  fs.rmSync(path.join(os.tmpdir(), `ec-db-${process.pid}`), { recursive: true, force: true });
  const file = path.join(dir, 'app.db');
  try {
    assert.doesNotThrow(() => { openDatabase(file).close?.(); });
    assert.ok(fs.existsSync(file), 'db file created in the freshly-made directory');
  } finally {
    fs.rmSync(path.join(os.tmpdir(), `ec-db-${process.pid}`), { recursive: true, force: true });
  }
});

test('migration is idempotent (safe to run on every boot)', () => {
  const db = openDatabase(':memory:'); // migrates once
  assert.doesNotThrow(() => migrate(db)); // running again must be a no-op
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ).all().map((r) => r.name);
  assert.deepEqual(tables, [
    'auth_tokens', 'diagnostics', 'feedback',
    'preset_likes', 'preset_views', 'presets',
    'requests', 'runs', 'users',
  ]);
});

test('foreign keys are enforced', () => {
  const db = openDatabase(':memory:');
  // inserting a request for a non-existent user must fail the FK
  assert.throws(() => {
    db.prepare(
      `INSERT INTO requests (id,user_id,state,queue_class,roms_total,roms_done,bundle_path,output_path,email_on_ready,seed,params_json,created_at,started_at,ready_at,updated_at)
       VALUES ('r1',999,'queued_fast','fast',1,0,'/b',NULL,0,'1','{}',1,NULL,NULL,1)`
    ).run();
  }, /FOREIGN KEY|constraint/i);
});
