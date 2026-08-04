// T-246 — the boot check that decides whether this box can inject at all. The failure it exists to prevent
// is silent: a deploy carries no base/ (gitignored artifacts), so every user's build fails one at a time
// with the real cause buried in a per-ROM log.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { checkBaseReadiness, baseReadinessMessage, baseArtifactPaths } from '../build/baseReadiness.js';

const TMP = path.join(os.tmpdir(), `ec-basecheck-${process.pid}`);
const clean = () => fs.rmSync(TMP, { recursive: true, force: true });

function makeBase({ rom = 1, map = 1, sym = 1 } = {}) {
  clean();
  fs.mkdirSync(path.join(TMP, 'base'), { recursive: true });
  const write = (name, bytes) => {
    if (bytes === null) return;                            // absent
    fs.writeFileSync(path.join(TMP, 'base', name), Buffer.alloc(bytes));
  };
  write('pokeemerald.gba', rom);
  write('pokeemerald.map', map);
  write('pokeemerald.sym', sym);
  return TMP;
}

test('all three artifacts present → ready', () => {
  const root = makeBase();
  const result = checkBaseReadiness({ repoRoot: root, env: {} });
  assert.equal(result.ready, true);
  assert.deepEqual(result.missing, []);
  clean();
});

test('a missing artifact is named, with its resolved path', () => {
  const root = makeBase({ sym: null });
  const result = checkBaseReadiness({ repoRoot: root, env: {} });
  assert.equal(result.ready, false);
  assert.equal(result.missing.length, 1);
  assert.equal(result.missing[0].kind, 'sym');
  assert.equal(result.missing[0].reason, 'absent');
  assert.equal(result.missing[0].path, path.join(root, 'base', 'pokeemerald.sym'));
  clean();
});

// A zero-byte artifact is the shape of an interrupted copy/scp. Treating it as present would push the
// failure into the injector, where it reads as a corrupt base rather than an incomplete install.
test('a zero-byte artifact counts as missing, and says so', () => {
  const root = makeBase({ map: 0 });
  const result = checkBaseReadiness({ repoRoot: root, env: {} });
  assert.equal(result.ready, false);
  assert.equal(result.missing[0].kind, 'map');
  assert.equal(result.missing[0].reason, 'empty');
  clean();
});

test('an empty base dir reports all three, not just the first', () => {
  const root = makeBase({ rom: null, map: null, sym: null });
  const result = checkBaseReadiness({ repoRoot: root, env: {} });
  assert.equal(result.ready, false);
  assert.deepEqual(result.missing.map((m) => m.kind), ['rom', 'map', 'sym']);
  clean();
});

// The check must resolve paths exactly as make.js does, or it would pass on a box whose base lives
// somewhere else via the env (or, worse, pass while injection looks elsewhere).
test('INJECT_BASE_* overrides are honoured, same as make.js resolveBasePaths', () => {
  const root = makeBase();
  const env = {
    INJECT_BASE_ROM: path.join(root, 'base', 'pokeemerald.gba'),
    INJECT_BASE_MAP: path.join(root, 'base', 'pokeemerald.map'),
    INJECT_BASE_SYM: '/nowhere/absent.sym',
  };
  assert.deepEqual(baseArtifactPaths({ repoRoot: '/irrelevant', env }), {
    rom: env.INJECT_BASE_ROM, map: env.INJECT_BASE_MAP, sym: env.INJECT_BASE_SYM,
  });
  const result = checkBaseReadiness({ repoRoot: '/irrelevant', env });
  assert.equal(result.ready, false);
  assert.equal(result.missing[0].kind, 'sym', 'the two overridden-and-present ones pass');
  clean();
});

test('the boot message names the fix and the consequence, and is null when ready', () => {
  const root = makeBase({ rom: null });
  const msg = baseReadinessMessage(checkBaseReadiness({ repoRoot: root, env: {} }));
  assert.match(msg, /pokeemerald\.gba/);
  assert.match(msg, /will NOT start/, 'the operator must know why nothing is building');
  assert.match(msg, /build-base\.sh/, 'and how to fix it');
  assert.equal(baseReadinessMessage({ ready: true, missing: [] }), null);
  clean();
});
