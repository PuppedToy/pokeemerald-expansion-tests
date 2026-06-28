import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createBuildRom } from '../build/buildRom.js';
import makejs from '../../make.js';

const TMP = path.join(os.tmpdir(), `ec-buildrom-${process.pid}`);
const clean = () => fs.rmSync(TMP, { recursive: true, force: true });

test('FAKE build writes a placeholder ROM into the output dir', async () => {
  clean();
  const dir = path.join(TMP, 'fake');
  const requests = { get: () => ({ seed: '7', output_path: null }), setOutputPath: () => {} };
  const storage = { outputDirFor: () => dir };
  await createBuildRom({ requests, storage, fake: true })('r1', 0);
  assert.ok(fs.existsSync(path.join(dir, 'rom-0.gba')));
  clean();
});

test('real build spawns make.js for the given ROM and sets output_path', async () => {
  clean();
  const dir = path.join(TMP, 'real');
  const setOut = [];
  const requests = {
    get: () => ({ bundle_path: '/bundles/x.json', output_path: null }),
    setOutputPath: (id, p) => setOut.push([id, p]),
  };
  const storage = { outputDirFor: () => dir };
  const calls = [];
  const spawnFn = (cmd, args, opts) => {
    calls.push({ cmd, args, opts });
    const ev = new EventEmitter();
    queueMicrotask(() => ev.emit('exit', 0));
    return ev;
  };
  await createBuildRom({ requests, storage, fake: false, spawnFn, repoRoot: '/repo' })('r1', 2);

  assert.equal(calls[0].cmd, 'node');
  assert.ok(calls[0].args.includes('make.js'));
  assert.ok(calls[0].args.includes('--rom=2'));
  assert.ok(calls[0].args.includes('--bundle=/bundles/x.json'));
  assert.ok(calls[0].args.some((a) => a.startsWith('--out=')));
  assert.equal(calls[0].opts.cwd, '/repo');
  assert.deepEqual(setOut, [['r1', dir]]);
  clean();
});

test('real build rejects when make.js exits non-zero', async () => {
  const dir = path.join(TMP, 'fail');
  const requests = { get: () => ({ bundle_path: '/b', output_path: dir }), setOutputPath: () => {} };
  const storage = { outputDirFor: () => dir };
  const spawnFn = () => {
    const ev = new EventEmitter();
    queueMicrotask(() => ev.emit('exit', 1));
    return ev;
  };
  await assert.rejects(
    () => createBuildRom({ requests, storage, fake: false, spawnFn })('r1', 0),
    /exited with code 1/,
  );
  clean();
});

test('real build tees make output to a persistent per-ROM log file (T-033)', async () => {
  clean();
  const dir = path.join(TMP, 'logged');
  const logPath = path.join(TMP, 'logs', 'r1-rom0.log');
  const requests = { get: () => ({ bundle_path: '/b', output_path: dir }), setOutputPath: () => {} };
  const storage = { outputDirFor: () => dir, logPathFor: () => logPath };
  // a real child so the stdout/stderr piping + exit are exercised end-to-end (no mock timing)
  const spawnFn = () => spawn('node', ['-e',
    "process.stdout.write('hello from make\\n');process.stderr.write('a warning\\n')"]);

  await createBuildRom({ requests, storage, fake: false, spawnFn })('r1', 0);

  const log = fs.readFileSync(logPath, 'utf8');
  assert.match(log, /build start: request=r1 rom=0/);
  assert.match(log, /hello from make/, 'child stdout is captured to the persistent log');
  assert.match(log, /a warning/, 'child stderr is captured to the persistent log');
  assert.match(log, /build end: code=0/);
  clean();
});

test('make.js is importable without running main; resolveJobs >= 1, builders exported', () => {
  assert.equal(typeof makejs.buildOneRom, 'function');
  assert.equal(typeof makejs.bundleMode, 'function');
  assert.ok(makejs.resolveJobs() >= 1);
});
