#!/usr/bin/env node
/**
 * Export all user feedback (T-048) for manual analysis — read-only, nothing automatic.
 *
 *   node scripts/export-feedback.mjs            > feedback.json   (default: JSON, newest first)
 *   node scripts/export-feedback.mjs --csv      > feedback.csv    (spreadsheet-friendly)
 *
 * Reads the same DB the server uses (DB_PATH env, else data/app.db). Dates are emitted as ISO
 * strings alongside the raw epoch-ms so the dump is legible without post-processing.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../db/index.js';
import { createFeedbackRepo } from '../db/feedback.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');

const db = openDatabase(dbPath);
const rows = createFeedbackRepo(db).all().map((r) => ({
  id: r.id,
  category: r.category,
  message: r.message,
  email: r.email,
  created_at: r.created_at,
  created_iso: new Date(r.created_at).toISOString(),
}));

if (process.argv.includes('--csv')) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const cols = ['id', 'category', 'created_iso', 'email', 'message'];
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(','));
  process.stdout.write(lines.join('\n') + '\n');
} else {
  process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
}
