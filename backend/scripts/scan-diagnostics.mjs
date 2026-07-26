#!/usr/bin/env node
/**
 * Scan randomization diagnostics from the LIVE server and classify them (T-075) — read-only.
 *
 *   node scripts/scan-diagnostics.mjs              # pull live app.db over SSH, print grouped JSON
 *   node scripts/scan-diagnostics.mjs --report     # human-readable table instead of JSON
 *   node scripts/scan-diagnostics.mjs --local ./app.db   # scan a local copy (no SSH) — for tests/offline
 *   node scripts/scan-diagnostics.mjs --since 24   # only runs received in the last 24h
 *   node scripts/scan-diagnostics.mjs --keep       # keep the pulled DB copy (prints its path)
 *
 * How it reaches the live data (same trust boundary as deploy/update.sh — no new HTTP surface):
 * it rsyncs the box's SQLite DB (backend/data/app.db*) to a temp dir via `ssh -i $DEPLOY_KEY`,
 * then reads the `diagnostics` table with node:sqlite. Deploy target comes from env vars, else
 * deploy/.env.local (DEPLOY_HOST/USER/KEY/PATH) — exactly like update.sh.
 *
 * The grouping is the deterministic half of the audit: events are bucketed by `code` + a
 * normalized message signature ("same error vs different"). The `/diagnostics-audit` skill runs
 * this and then proposes a fix per class using docs/randomizer-diagnostics.md.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pullLiveDb } from './lib/pull-live-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ── pure helpers (exported for tests) ────────────────────────────────────────────

/** Collapse the variable parts of a message so "same error, different ids" share a signature. */
export function normalizeMessage(msg) {
  return String(msg ?? '')
    .replace(/SPECIES_[A-Z0-9_]+/g, 'SPECIES_*')
    .replace(/TRAINER_[A-Z0-9_]+/g, 'TRAINER_*')
    .replace(/MOVE_[A-Z0-9_]+/g, 'MOVE_*')
    .replace(/ITEM_[A-Z0-9_]+/g, 'ITEM_*')
    .replace(/\b\d+\b/g, '#')
    .replace(/\s+/g, ' ')
    .trim();
}

const SEVERITY_RANK = { fatal: 3, error: 2, warning: 1 };

/** Flatten DB rows (each with events_json) into one record per event, carrying run metadata. */
export function flattenRows(rows) {
  const out = [];
  for (const row of rows) {
    let events = [];
    try { events = JSON.parse(row.events_json) || []; } catch { events = []; }
    for (const e of events) {
      out.push({
        code: e.code || 'UNKNOWN',
        severity: e.severity || 'warning',
        message: e.message || '',
        context: e.context ?? null,
        runId: row.id,
        userId: row.user_id ?? null,
        email: row.email ?? null,
        seed: row.seed ?? null,
        runType: row.run_type ?? null,
        createdAt: row.created_at,
      });
    }
  }
  return out;
}

/**
 * Group events by code + normalized signature. Returns groups sorted by event count desc.
 * Each group: the class of "same error", with impact metrics + sample contexts for triage.
 */
export function groupDiagnostics(rows) {
  const events = flattenRows(rows);
  const buckets = new Map();

  for (const ev of events) {
    const signature = normalizeMessage(ev.message);
    const key = `${ev.code}::${signature}`;
    let g = buckets.get(key);
    if (!g) {
      g = {
        code: ev.code, signature, severity: ev.severity,
        count: 0, runIds: new Set(), userIds: new Set(), anonRuns: new Set(),
        firstSeen: ev.createdAt, lastSeen: ev.createdAt,
        sampleMessage: ev.message, sampleContexts: [],
      };
      buckets.set(key, g);
    }
    g.count += 1;
    g.runIds.add(ev.runId);
    if (ev.userId != null) g.userIds.add(ev.userId); else g.anonRuns.add(ev.runId);
    if (SEVERITY_RANK[ev.severity] > SEVERITY_RANK[g.severity]) g.severity = ev.severity;
    if (ev.createdAt < g.firstSeen) g.firstSeen = ev.createdAt;
    if (ev.createdAt > g.lastSeen) g.lastSeen = ev.createdAt;
    if (g.sampleContexts.length < 5 && ev.context) {
      const s = JSON.stringify(ev.context);
      if (!g.sampleContexts.some((c) => JSON.stringify(c) === s)) g.sampleContexts.push(ev.context);
    }
  }

  const groups = [...buckets.values()].map((g) => ({
    code: g.code,
    signature: g.signature,
    severity: g.severity,
    events: g.count,
    runs: g.runIds.size,
    users: g.userIds.size,
    anonymousRuns: g.anonRuns.size,
    firstSeen: new Date(g.firstSeen).toISOString(),
    lastSeen: new Date(g.lastSeen).toISOString(),
    sampleMessage: g.sampleMessage,
    sampleContexts: g.sampleContexts,
  }));

  groups.sort((a, b) =>
    (SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]) || (b.events - a.events) || a.code.localeCompare(b.code));
  return groups;
}

/** Top-level summary consumed by the skill. */
export function summarize(rows) {
  const totalRuns = rows.length;
  const runsWithWarnings = rows.filter((r) => {
    try { return (JSON.parse(r.events_json) || []).length > 0; } catch { return false; }
  }).length;
  const groups = groupDiagnostics(rows);
  const events = groups.reduce((n, g) => n + g.events, 0);
  return { totalRuns, runsWithWarnings, events, distinctClasses: groups.length, groups };
}

// deploy-target resolution + live DB pull now live in scripts/lib/pull-live-db.mjs
// (shared with get-decision-log.mjs).

// ── main (only when run directly) ─────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const has = (f) => argv.includes(f);
  const valOf = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };

  const localPath = valOf('--local');
  const sinceHours = valOf('--since') ? Number(valOf('--since')) : null;
  const keep = has('--keep');

  let dbPath = localPath;
  let source = 'local';
  let tmpDir = null;
  if (!dbPath) {
    source = 'live';
    tmpDir = keep
      ? path.join(REPO_ROOT, '_live-diagnostics')
      : fs.mkdtempSync(path.join(os.tmpdir(), 'ec-diag-'));
    dbPath = pullLiveDb(tmpDir);
  }

  // Import DB helpers lazily so `--local` on an old Node still parses the pure helpers.
  const { openDatabase } = await import('../db/index.js');
  const { createDiagnosticsRepo } = await import('../db/diagnostics.js');
  const db = openDatabase(dbPath);
  let rows = createDiagnosticsRepo(db).all();
  if (sinceHours != null && Number.isFinite(sinceHours)) {
    const cutoff = Date.now() - sinceHours * 3600 * 1000;
    rows = rows.filter((r) => r.created_at >= cutoff);
  }

  const result = { scannedAt: new Date().toISOString(), source, dbPath, ...summarize(rows) };

  if (has('--report')) {
    const L = [];
    L.push(`Diagnostics scan (${source}) — ${result.totalRuns} runs, ${result.runsWithWarnings} with warnings, `
      + `${result.events} events across ${result.distinctClasses} classes`);
    L.push('');
    for (const g of result.groups) {
      L.push(`[${g.severity.toUpperCase()}] ${g.code}  ×${g.events}  (${g.runs} runs, ${g.users} users, ${g.anonymousRuns} anon)`);
      L.push(`    e.g. ${g.sampleMessage}`);
      L.push(`    seen ${g.firstSeen} → ${g.lastSeen}`);
      if (g.sampleContexts.length) L.push(`    ctx  ${JSON.stringify(g.sampleContexts[0])}`);
      L.push('');
    }
    process.stdout.write(L.join('\n') + '\n');
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }

  if (source === 'live' && keep) process.stderr.write(`\n[kept] live DB copy at ${tmpDir}\n`);
  else if (tmpDir) { try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best effort */ } }
}

// Run only when invoked as a script (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => { process.stderr.write(`scan-diagnostics: ${err.message}\n`); process.exit(1); });
}
