import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// B-004: Docker Compose's env_file does NOT strip inline comments — everything after
// `=` becomes the value. A line like `BREVO_API_KEY=  # ...` makes the key non-empty
// garbage (and the `→` in that comment crashed email sending). Guard against it.
test('deploy/.env.example has no inline comments on KEY=value lines (B-004)', () => {
  const txt = fs.readFileSync(path.join(root, 'deploy', '.env.example'), 'utf8');
  const offenders = txt
    .split('\n')
    .filter((l) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(l)) // KEY=... lines (not pure comments)
    .filter((l) => l.includes('#'));                   // ...carrying an inline comment
  assert.deepEqual(offenders, [], `inline comments leak into env_file values:\n${offenders.join('\n')}`);
});

// B-009: update.sh rsyncs the working tree, which includes HOST-compiled decomp tool binaries
// (tools/*/). On the Linux box those are not executable -> `make` dies with "Exec format error"
// and every ROM build fails. The deploy MUST rebuild the Linux tools after the rsync, before the
// app is recreated. Guard the step so a future refactor can't silently drop it.
test('update.sh rebuilds the Linux decomp tools after rsync, before recreate (B-009)', () => {
  const sh = fs.readFileSync(path.join(root, 'deploy', 'update.sh'), 'utf8');
  assert.match(sh, /make clean-tools/, 'must clean the rsynced host tool binaries first (mtime trap)');
  assert.match(sh, /make tools/, 'must rebuild the tools for Linux');
  const toolsIdx = sh.indexOf('make tools');
  const recreateIdx = sh.indexOf('up -d --force-recreate');
  assert.ok(toolsIdx > -1 && recreateIdx > -1 && toolsIdx < recreateIdx,
    'tools must be rebuilt before the app container is recreated');
});

// T-056: update.sh rsyncs the working tree but EXCLUDES .git, so the box's git HEAD lags the rsynced
// files. The first change to a tracked data/maps (or src) file therefore leaves the working tree ahead
// of HEAD, and make.js `checkDataClean` (git status --porcelain data/) aborts every ROM build. The
// deploy MUST snapshot the tracked base into the in-container git so data/ stays clean. Guard it.
test('update.sh snapshots the tracked base into git so make.js checkDataClean stays clean (T-056)', () => {
  const sh = fs.readFileSync(path.join(root, 'deploy', 'update.sh'), 'utf8');
  assert.match(sh, /git add -A data\/ src\/ include\//, 'must stage the tracked base (data/ src/ include/)');
  assert.match(sh, /commit -q -m deploy-snapshot/, 'must commit the snapshot');
  const snapIdx = sh.indexOf('deploy-snapshot');
  const recreateIdx = sh.indexOf('up -d --force-recreate');
  assert.ok(snapIdx > -1 && recreateIdx > -1 && snapIdx < recreateIdx,
    'the snapshot must happen before the app is recreated (before any user build can run checkDataClean)');
});
