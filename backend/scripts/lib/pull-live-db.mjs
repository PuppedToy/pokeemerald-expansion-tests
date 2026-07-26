/**
 * Shared deploy-target resolution + live SQLite pull for the read-only audit scripts
 * (scan-diagnostics.mjs, get-decision-log.mjs). Same trust boundary as deploy/update.sh —
 * it rsyncs the box's app.db over `ssh -i $DEPLOY_KEY`; no new public HTTP surface. Deploy
 * target comes from env vars, else deploy/.env.local (DEPLOY_HOST/USER/KEY/PATH).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..'); // backend/scripts/lib → repo root

export function parseEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, 'utf-8').split('\n')) {
    const line = raw.replace(/\s+#.*$/, '').trim();      // strip inline comments
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

export function resolveDeployTarget() {
  const env = parseEnvFile(path.join(REPO_ROOT, 'deploy', '.env.local'));
  const host = process.env.DEPLOY_HOST || env.DEPLOY_HOST;
  const user = process.env.DEPLOY_USER || env.DEPLOY_USER || 'root';
  const base = process.env.DEPLOY_PATH || env.DEPLOY_PATH || '/opt/emerald';
  let key = process.env.DEPLOY_KEY || env.DEPLOY_KEY || '~/.ssh/emerald_box';
  key = key.replace(/^~/, os.homedir());
  if (!host) throw new Error('DEPLOY_HOST not set (env or deploy/.env.local) — cannot reach the live box');
  return { host, user, base, key };
}

/** rsync the live SQLite DB (app.db + WAL/SHM if present) into destDir. Returns the local app.db path. */
export function pullLiveDb(destDir) {
  const { host, user, base, key } = resolveDeployTarget();
  fs.mkdirSync(destDir, { recursive: true });
  const remote = `${user}@${host}:${base}/backend/data/app.db*`;
  const ssh = `ssh -i ${key} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
  const res = spawnSync('rsync', ['-az', '-e', ssh, remote, destDir + '/'], { stdio: ['ignore', 'inherit', 'inherit'] });
  if (res.status !== 0) throw new Error(`rsync of live DB failed (exit ${res.status}). Check DEPLOY_* + SSH key.`);
  const local = path.join(destDir, 'app.db');
  if (!fs.existsSync(local)) throw new Error(`pulled tree has no app.db in ${destDir}`);
  return local;
}
