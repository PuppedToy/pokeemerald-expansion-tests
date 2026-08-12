/**
 * T-273 — the deploy's base-ROM decision. These tests cover the two pure pieces the verdict rests on:
 * the path classifier (which files compile into the base ROM) and the verdict itself.
 *
 * The classifier decides by EXCLUSION on purpose: only paths known to be app-only are app-only, so a new
 * top-level source directory counts as base-relevant and the worst case is one unnecessary rebuild — never
 * a base that silently disagrees with the sources it is injected from.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyPaths, isBaseRelevant, verdictFor, parseBoxOutput } from '../base-state.mjs';

test('the C decomp, its data, graphics and the build system compile into the base ROM', () => {
  for (const p of [
    'src/battle_main.c',
    'src/data/trade.h',
    'include/constants/trade.h',
    'data/maps/RustboroCity_PokemonCenter_1F/scripts.inc',
    'data/maps/RustboroCity_PokemonCenter_1F/map.json',
    'graphics/pokemon/bulbasaur/front.png',
    'sound/songs/mus_route101.s',
    'asm/macros/event.inc',
    'Makefile',
    'audio_rules.mk',
    'ld_script_modern.ld',
    'charmap.txt',
    'constants/global.inc',
    'libagbsyscall/agbsyscall.s',
    'tools/trainerproc/main.c',
  ]) {
    assert.equal(isBaseRelevant(p), true, `${p} must count as base-relevant`);
  }
});

test('the Node pipeline, the web app, the harnesses and the paperwork do not', () => {
  for (const p of [
    'randomizer/trainers.js',
    'randomizer/docs/injection.md',
    'randomizer/__tests__/unit/trades.test.js',
    'backend/server.js',
    'frontend/js/presets.js',
    'frontend/css/components.css',
    'visual-tests/interaction.spec.mjs',
    'deploy/update.sh',
    'docs/dev-deploy-workflow.md',
    'tasks/T-273-deploy-base-rom-decision.md',
    'bugs/B-074-login-modal-behind-presets-modal.md',
    'scripts/base-state.mjs',
    'CHANGELOG.brooktec.md',
    'CLAUDE.md',
    '.claude/skills/deploy/SKILL.md',
    '.github/workflows/build.yml',
    'test/battle/move_effect/trick_room.c',
    'analyze.js',
    'make.js',
    'build.js',
    'package.json',
    '.gitignore',
  ]) {
    assert.equal(isBaseRelevant(p), false, `${p} must NOT count as base-relevant`);
  }
});

test('an unrecognised path is treated as base-relevant (fail safe, never silently app-only)', () => {
  assert.equal(isBaseRelevant('some_new_engine_dir/thing.c'), true);
  assert.equal(isBaseRelevant('gflib/malloc.c'), true, 'upstream could add a new source root');
});

test('classifyPaths splits a mixed change set and keeps the paths that decided it', () => {
  const out = classifyPaths([
    'frontend/js/presets.js',
    'data/maps/DewfordTown_PokemonCenter_1F/map.json',
    'backend/server.js',
    'include/constants/trade.h',
  ]);
  assert.deepEqual(out.baseRelevant, [
    'data/maps/DewfordTown_PokemonCenter_1F/map.json',
    'include/constants/trade.h',
  ]);
  assert.deepEqual(out.appOnly, ['frontend/js/presets.js', 'backend/server.js']);
});

// ── the verdict ────────────────────────────────────────────────────────────────────

const FP = 'a'.repeat(64);
const OTHER = 'b'.repeat(64);

test('matching fingerprints are in sync — path 1, app-only deploy', () => {
  const v = verdictFor({ local: FP, stamp: { fingerprint: FP, commit: 'abc1234' } });
  assert.equal(v.verdict, 'in-sync');
  assert.equal(v.exitCode, 0);
});

test('a different fingerprint requires a rebuild — path 2', () => {
  const v = verdictFor({ local: FP, stamp: { fingerprint: OTHER, commit: 'abc1234' } });
  assert.equal(v.verdict, 'rebuild-required');
  assert.equal(v.exitCode, 10);
  assert.match(v.reason, /base/i);
});

test('a base with no stamp requires a rebuild — it cannot be proven to match', () => {
  for (const stamp of [null, {}, { commit: 'abc1234' }, { fingerprint: '' }]) {
    const v = verdictFor({ local: FP, stamp });
    assert.equal(v.verdict, 'rebuild-required', `stamp ${JSON.stringify(stamp)} proves nothing`);
    assert.equal(v.exitCode, 10);
    assert.match(v.reason, /stamp/i);
  }
});

test('a dirty working tree in base-relevant paths requires a rebuild even when the stamp matches', () => {
  const v = verdictFor({ local: FP, stamp: { fingerprint: FP }, dirtyBasePaths: ['src/battle_main.c'] });
  assert.equal(v.verdict, 'rebuild-required');
  assert.equal(v.exitCode, 10);
  assert.match(v.reason, /uncommitted/i);
});

test('a dirty working tree in app-only paths does not force a rebuild', () => {
  const v = verdictFor({ local: FP, stamp: { fingerprint: FP }, dirtyBasePaths: [] });
  assert.equal(v.verdict, 'in-sync');
});

test('a missing base (no artifacts on the box) requires a rebuild whatever the stamp says', () => {
  const v = verdictFor({ local: FP, stamp: { fingerprint: FP }, baseInstalled: false });
  assert.equal(v.verdict, 'rebuild-required');
  assert.match(v.reason, /no base/i);
});

// ── the box's reply ────────────────────────────────────────────────────────────────
// A parse bug here fails "safe" (no stamp found → rebuild) but would ask for a 20-minute base rebuild on
// every deploy forever, so the real multi-line payload is worth pinning.

const boxReply = (installed, stampJson, deployedJson) => [
  `BASE_INSTALLED=${installed}`,
  'STAMP<<', stampJson, '>>',
  'DEPLOYED<<', deployedJson, '>>',
].join('\n') + '\n';

test('parseBoxOutput reads the installed flag and both multi-line JSON blocks', () => {
  const stamp = JSON.stringify({
    fingerprint: 'c'.repeat(64), commit: 'deadbeef', builtAt: '2026-08-12T07:40:00Z', romSha256: 'f'.repeat(64),
  }, null, 2);
  const deployed = JSON.stringify({ fingerprint: 'c'.repeat(64), commit: 'deadbeef', deployedAt: '2026-08-12T07:30:00Z' }, null, 2);
  const box = parseBoxOutput(boxReply(1, stamp, deployed));
  assert.equal(box.baseInstalled, true);
  assert.equal(box.stamp.fingerprint, 'c'.repeat(64));
  assert.equal(box.stamp.builtAt, '2026-08-12T07:40:00Z');
  assert.equal(box.deployed.fingerprint, 'c'.repeat(64));
});

test('parseBoxOutput reports a missing base and an absent stamp as null, not as a crash', () => {
  const box = parseBoxOutput(boxReply(0, '{}', '{}'));
  assert.equal(box.baseInstalled, false);
  assert.equal(box.stamp, null, 'an empty object is not a stamp');
  assert.equal(box.deployed, null);
});

test('parseBoxOutput survives a truncated or corrupt stamp (half-written file)', () => {
  const box = parseBoxOutput(boxReply(1, '{ "fingerprint": "abc', '{}'));
  assert.equal(box.baseInstalled, true);
  assert.equal(box.stamp, null, 'unparseable JSON proves nothing → treated as no stamp');
  assert.equal(verdictFor({ local: FP, stamp: box.stamp, baseInstalled: box.baseInstalled }).exitCode, 10);
});
