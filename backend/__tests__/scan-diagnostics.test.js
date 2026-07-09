import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMessage, flattenRows, groupDiagnostics, summarize }
  from '../scripts/scan-diagnostics.mjs';

// One diagnostics-table row (events stored as JSON text, like the repo returns).
function row(id, createdAt, events, userId = null) {
  return { id, user_id: userId, email: userId ? 'u@x.test' : null, seed: '1', run_type: 'default',
    created_at: createdAt, events_json: JSON.stringify(events) };
}

test('normalizeMessage collapses ids and numbers so variants share a signature', () => {
  const a = normalizeMessage('No pokemon found for trainer TRAINER_BRAWLY_1 slot 4');
  const b = normalizeMessage('No pokemon found for trainer TRAINER_ROXANNE_1 slot 2');
  assert.equal(a, b);
  assert.equal(a, 'No pokemon found for trainer TRAINER_* slot #');
});

test('flattenRows expands each event and carries run metadata', () => {
  const rows = [row('r1', 1000, [
    { severity: 'error', code: 'TRAINER_SLOT_DROPPED', message: 'm', context: { trainerId: 'A' } },
    { severity: 'warning', code: 'TRAINER_TEAM_SHORT', message: 'm2', context: { trainerId: 'A' } },
  ])];
  const flat = flattenRows(rows);
  assert.equal(flat.length, 2);
  assert.equal(flat[0].runId, 'r1');
  assert.equal(flat[0].code, 'TRAINER_SLOT_DROPPED');
});

test('groupDiagnostics buckets same-code/same-signature events across runs into one class', () => {
  const rows = [
    row('r1', 1000, [{ severity: 'error', code: 'TRAINER_SLOT_DROPPED', message: 'slot for TRAINER_A_1 slot 4', context: { trainerId: 'A' } }]),
    row('r2', 2000, [{ severity: 'error', code: 'TRAINER_SLOT_DROPPED', message: 'slot for TRAINER_B_1 slot 2', context: { trainerId: 'B' } }]),
    row('r3', 3000, [{ severity: 'warning', code: 'MOVE_NOT_FOUND', message: 'Move MOVE_X not found', context: null }]),
  ];
  const groups = groupDiagnostics(rows);
  assert.equal(groups.length, 2, 'two distinct classes');
  const dropped = groups.find((g) => g.code === 'TRAINER_SLOT_DROPPED');
  assert.equal(dropped.events, 2, 'both runs collapse into one class');
  assert.equal(dropped.runs, 2);
  assert.equal(dropped.severity, 'error');
  assert.equal(dropped.sampleContexts.length, 2, 'distinct contexts kept as samples');
});

test('groupDiagnostics sorts by severity then event count', () => {
  const rows = [
    row('r1', 1, [{ severity: 'warning', code: 'W', message: 'w' }, { severity: 'warning', code: 'W', message: 'w' }]),
    row('r2', 2, [{ severity: 'error', code: 'E', message: 'e' }]),
  ];
  const groups = groupDiagnostics(rows);
  assert.equal(groups[0].code, 'E', 'errors rank above warnings even with fewer events');
});

test('summarize reports run totals and the denominator (runs with vs without warnings)', () => {
  const rows = [
    row('r1', 1, [{ severity: 'warning', code: 'W', message: 'w' }]),
    row('r2', 2, []), // a clean run — contributes to the denominator
  ];
  const s = summarize(rows);
  assert.equal(s.totalRuns, 2);
  assert.equal(s.runsWithWarnings, 1);
  assert.equal(s.events, 1);
  assert.equal(s.distinctClasses, 1);
});
