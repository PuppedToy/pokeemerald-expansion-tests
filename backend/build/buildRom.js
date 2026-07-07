/**
 * Per-ROM build adapter (server integration, T-024/T-025/ADR-005). The scheduler
 * calls `buildRom(requestId, romIndex)` once per ROM.
 *
 * FAKE_BUILD mode writes a placeholder .gba so the WHOLE flow (queue → ready →
 * download) is runnable locally without the devkitARM toolchain. The real build —
 * the per-ROM `make.js` adapter with bounded `make -j`, inside the T-026 sandbox —
 * runs only where the toolchain exists and is validated at deploy (T-019).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defaultRestoreTree } from '../lifecycle/recovery.js';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// The serial worker runs at most ONE build at a time; track it so a cancel / account-deletion can
// stop it immediately instead of waiting for the current ROM to finish (T-035).
let activeBuild = null; // { id, child }

/**
 * Kill the in-flight build for `id` (if it's the one running). Builds are spawned `detached`, so the
 * child is its own process-group leader and `process.kill(-pid)` takes down the whole tree
 * (node make.js → make → gcc/as/ld …), not just the node parent. Best-effort + idempotent.
 */
export function killActiveBuild(id) {
  if (!activeBuild || activeBuild.id !== id) return false;
  const { child } = activeBuild;
  if (typeof child.pid === 'number') {
    try { process.kill(-child.pid, 'SIGTERM'); } catch { /* group already gone / not a leader */ }
  }
  try { child.kill?.('SIGTERM'); } catch { /* already exited */ }
  return true;
}

export function createBuildRom({ requests, storage, fake = true, spawnFn = spawn, repoRoot = REPO_ROOT, restoreTree = defaultRestoreTree }) {
  return async (id, romIndex) => {
    const req = requests.get(id);
    const dir = storage.outputDirFor(id);
    fs.mkdirSync(dir, { recursive: true });
    if (req && !req.output_path) requests.setOutputPath(id, dir);

    if (fake) {
      const data = Buffer.from(`FAKE GBA  request=${id}  rom=${romIndex}  seed=${req?.seed ?? '?'}\n`);
      fs.writeFileSync(path.join(dir, `rom-${romIndex}.gba`), data);
      return;
    }

    // B-021: a SIGKILLed prior build (cancel, queue preemption, deploy-recreate, OOM) skips make.js's
    // `finally { restore() }`, leaving the tree dirty — and make.js's clean-data guard then ABORTS every
    // subsequent build until the backend restarts. Restore proactively before each REAL build so the box
    // self-heals. Scoped to real mode only: under FAKE_BUILD (local dev) we must never git-checkout over a
    // developer's uncommitted source — the same reason make.js aborts instead of auto-restoring locally.
    restoreTree();

    // Real build: shell out to make.js for a single ROM (async — keeps the server
    // responsive; make.js bounds `make -j` to the box cores). Validated on the box (T-019).
    //
    // T-033: tee the build output to a persistent per-ROM log file (survives the container recreate
    // that drops `docker logs`) AND still mirror it to the process stdio so live `docker logs` works.
    // When storage exposes no logPathFor (older callers/tests), fall back to plain inherited stdio.
    const logPath = storage.logPathFor ? storage.logPathFor(id, romIndex) : null;
    let logStream = null;
    if (logPath) {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      logStream = fs.createWriteStream(logPath, { flags: 'a' });
      logStream.write(`\n=== build start: request=${id} rom=${romIndex} @ ${new Date().toISOString()} ===\n`);
    }

    await new Promise((resolve, reject) => {
      const args = ['make.js', `--bundle=${req.bundle_path}`, `--rom=${romIndex}`, `--out=${dir}`];
      const child = spawnFn('node', args, {
        cwd: repoRoot,
        detached: true, // own process group, so killActiveBuild can take down the whole make tree
        stdio: logStream ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      });
      activeBuild = { id, child };
      if (logStream) {
        child.stdout?.on('data', (d) => { process.stdout.write(d); logStream.write(d); });
        child.stderr?.on('data', (d) => { process.stderr.write(d); logStream.write(d); });
      }
      const finish = (code, err) => {
        if (activeBuild && activeBuild.child === child) activeBuild = null;
        const done = () => (err ? reject(err) : resolve());
        if (!logStream) return done();
        logStream.end(`=== build end: ${err ? err.message : `code=${code}`} ===\n`);
        logStream.on('finish', done);
      };
      child.on('error', (err) => finish(null, err));
      child.on('exit', (code) => finish(code, code === 0 ? null : new Error(`make.js exited with code ${code}`)));
    });
  };
}
