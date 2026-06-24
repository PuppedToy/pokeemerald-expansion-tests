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

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function createBuildRom({ requests, storage, fake = true, spawnFn = spawn, repoRoot = REPO_ROOT }) {
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

    // Real build: shell out to make.js for a single ROM (async — keeps the server
    // responsive; make.js bounds `make -j` to the box cores). Validated on the box (T-019).
    await new Promise((resolve, reject) => {
      const args = ['make.js', `--bundle=${req.bundle_path}`, `--rom=${romIndex}`, `--out=${dir}`];
      const child = spawnFn('node', args, { cwd: repoRoot, stdio: 'inherit' });
      child.on('error', reject);
      child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`make.js exited with code ${code}`))));
    });
  };
}
