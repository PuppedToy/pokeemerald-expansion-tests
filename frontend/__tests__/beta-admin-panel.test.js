/**
 * T-217 — beta admin panel (frontend). The panel HTML is built by pure functions (overviewHtml,
 * inviteSummary, searchResultsHtml, fmtEta) → unit-tested directly. The admin-only wiring (tab hidden
 * until isAdmin, endpoints) is guarded structurally against the source (ADR-009), like the rest of the UI.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { overviewHtml, inviteSummary, searchResultsHtml, fmtEta } from '../js/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');

const SAMPLE = {
  counts: { pending: 5, accepted: 12, pendingVerified: 3, heldRoms: 2 },
  queue: { building: 1, queued: 4, outstandingRoms: 10, etaSecs: 5400 },
  pending: [
    { userId: 1, email: 'a@x.test', waitingSince: Date.UTC(2026, 6, 20), hasRom: true, romsTotal: 2 },
    { userId: 2, email: 'b@x.test', waitingSince: Date.UTC(2026, 6, 21), hasRom: false, romsTotal: 0 },
  ],
  accepted: [{ userId: 9, email: 'in@x.test', since: Date.UTC(2026, 6, 1) }],
  audit: [{ created_at: Date.UTC(2026, 6, 22), kind: 'batch', granted: 10, with_rom: 3, admin_email: 'boss@x' }],
};

test('fmtEta renders seconds as a short human string', () => {
  assert.equal(fmtEta(0), '< 1 min');
  assert.equal(fmtEta(30), '< 1 min');
  assert.equal(fmtEta(600), '~10 min');
  assert.equal(fmtEta(5400), '~1h 30m');
  assert.equal(fmtEta(7200), '~2h');
});

test('overviewHtml renders the counts, ETA, the waiting table with the has-ROM flag, and the accepted list', () => {
  const html = overviewHtml(SAMPLE);
  assert.match(html, /3<\/strong> waiting/);
  assert.match(html, /2<\/strong> prepared runs/);
  assert.match(html, /12<\/strong> accepted/);
  assert.match(html, /ETA ~1h 30m/);
  // waiting rows
  assert.match(html, /a@x\.test/);
  assert.match(html, /2026-07-20/, 'waited-since is a plain date from the timestamp (no Date.now)');
  assert.match(html, /✓ \(2\)/, 'a@x has a prepared ROM with 2 ROMs');
  assert.match(html, /data-accept-user="1"/, 'per-row Accept action carries the user id');
  // accepted "already in" list + audit
  assert.match(html, /in@x\.test/);
  assert.match(html, /batch: 10 in \(3 w\/ROM\)/);
  // the batch-invite control
  assert.match(html, /id="admin-invite-btn"/);
  assert.match(html, /id="admin-invite-count"/);
});

test('overviewHtml escapes user-supplied emails', () => {
  const html = overviewHtml({ ...SAMPLE, pending: [{ userId: 3, email: '<script>@x', waitingSince: 0, hasRom: false }] });
  assert.doesNotMatch(html, /<script>@x/);
  assert.match(html, /&lt;script&gt;@x/);
});

test('inviteSummary describes the batch outcome incl. budget cap + shortfall', () => {
  assert.equal(
    inviteSummary({ invited: 4, withRom: 2, withoutRom: 2, cappedByBudget: false, shortfall: 0 }),
    '4 invited · 2 with a prepared run · 2 emailed to start',
  );
  const capped = inviteSummary({ invited: 3, withRom: 2, withoutRom: 1, cappedByBudget: true, shortfall: 2 });
  assert.match(capped, /capped by the ~1h build budget/);
  assert.match(capped, /2 short \(pool exhausted\)/);
});

test('searchResultsHtml shows an Accept action only for not-yet-accepted users', () => {
  const html = searchResultsHtml([
    { userId: 1, email: 'p@x', inviteState: 'pending', verified: true, hasRom: true, romsTotal: 1 },
    { userId: 2, email: 'a@x', inviteState: 'accepted', verified: true, hasRom: false },
  ]);
  assert.match(html, /data-accept-user="1"/, 'pending user is acceptable');
  assert.doesNotMatch(html, /data-accept-user="2"/, 'already-accepted user has no Accept button');
  assert.match(html, /run ✓ \(1\)/);
  assert.equal(searchResultsHtml([]), '<p class="settings-note">No matches.</p>');
});

// ── structural wiring (source-inspection, ADR-009) ──
test('the Admin tab + section ship hidden and are admin-gated', () => {
  const html = read('index.html');
  assert.match(html, /id="admin-tab"[^>]*hidden/, 'Admin tab present + hidden until isAdmin');
  assert.match(html, /id="tab-admin"/, 'the Admin section exists');
  assert.match(html, /id="admin-content"/, 'admin.js fills #admin-content');

  const adminSrc = read('js', 'admin.js');
  assert.match(adminSrc, /state\?\.isAdmin/, 'the panel is gated on the isAdmin flag');
  assert.match(adminSrc, /\/api\/admin\/beta\/overview/, 'talks to the admin overview endpoint');
  assert.match(adminSrc, /\/api\/admin\/beta\/invite/);
  assert.match(adminSrc, /\/api\/admin\/beta\/accept/);
  assert.match(adminSrc, /\/api\/admin\/beta\/search/);

  const appSrc = read('js', 'app.js');
  assert.match(appSrc, /initAdmin\(\)/, 'app.js wires the admin panel');
});
