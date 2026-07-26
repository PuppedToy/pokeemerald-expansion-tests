#!/usr/bin/env node
/**
 * Fetch a run's team-building decision log from the LIVE server (T-210) — read-only.
 * The decision log is server-only (never shown to users); this is how the owner reads one.
 *
 *   node scripts/get-decision-log.mjs --seed 12345          # latest run for that seed
 *   node scripts/get-decision-log.mjs --run-id <sessionId>  # an exact run
 *   node scripts/get-decision-log.mjs --list                # list stored runs (when, seed, run)
 *   node scripts/get-decision-log.mjs --local ./app.db --seed 12345   # a local DB copy (no SSH)
 *   node scripts/get-decision-log.mjs --keep                # keep the pulled DB copy
 *
 * Reaches the live data exactly like scan-diagnostics.mjs (rsync app.db over the deploy SSH key —
 * same trust boundary as deploy/update.sh, no new HTTP surface). The log text goes to stdout; the
 * one-line provenance header goes to stderr, so you can redirect just the log to a file.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pullLiveDb, REPO_ROOT } from './lib/pull-live-db.mjs';

async function main() {
  const argv = process.argv.slice(2);
  const has = (f) => argv.includes(f);
  const valOf = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };

  const localPath = valOf('--local');
  const seed = valOf('--seed');
  const runId = valOf('--run-id');
  const list = has('--list');
  const keep = has('--keep');

  if (!list && !seed && !runId) {
    process.stderr.write('usage: get-decision-log.mjs (--seed N | --run-id ID | --list) [--local app.db] [--keep]\n');
    process.exit(2);
  }

  let dbPath = localPath, source = 'local', tmpDir = null;
  if (!dbPath) {
    source = 'live';
    tmpDir = keep ? path.join(REPO_ROOT, '_live-decision-logs') : fs.mkdtempSync(path.join(os.tmpdir(), 'ec-declog-'));
    dbPath = pullLiveDb(tmpDir);
  }

  const { openDatabase } = await import('../db/index.js');
  const { createDecisionLogsRepo } = await import('../db/decisionLogs.js');
  const repo = createDecisionLogsRepo(openDatabase(dbPath));

  try {
    if (list) {
      const rows = repo.all();
      const lines = rows.map((r) =>
        `${new Date(r.created_at).toISOString()}  seed=${r.seed ?? '-'}  run=${r.id}  ${r.run_type ?? ''}  ${r.email ?? 'anon'}`);
      process.stdout.write(`${rows.length} decision log(s) stored (newest first):\n${lines.join('\n')}\n`);
    } else {
      const row = runId ? repo.get(runId) : (repo.bySeed(seed)[0] || null);
      if (!row) {
        process.stderr.write(`no decision log found for ${runId ? `run ${runId}` : `seed ${seed}`} (retention is 48h)\n`);
        process.exit(1);
      }
      process.stderr.write(`# decision log — run ${row.id}, seed ${row.seed ?? '-'}, `
        + `${new Date(row.created_at).toISOString()} (${row.email ?? 'anon'})\n`);
      process.stdout.write(row.text.endsWith('\n') ? row.text : row.text + '\n');
    }
  } finally {
    if (source === 'live' && keep) process.stderr.write(`\n[kept] live DB copy at ${tmpDir}\n`);
    else if (tmpDir) { try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best effort */ } }
  }
}

// Run only when invoked as a script (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => { process.stderr.write(`get-decision-log: ${err.message}\n`); process.exit(1); });
}
