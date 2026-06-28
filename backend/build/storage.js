/**
 * Filesystem storage for the build pipeline (server integration, T-025/T-023).
 * Bundles and output ROMs live under DATA_DIR (gitignored); the request row holds
 * the paths and `purge` deletes them. Output ROM(s) are packaged with the zero-dep
 * STORE zip on download.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createZip } from './zip.js';

export function createStorage({ dataDir }) {
  const bundlesDir = path.join(dataDir, 'bundles');
  const outputsDir = path.join(dataDir, 'outputs');
  const logsDir = path.join(dataDir, 'logs');
  fs.mkdirSync(bundlesDir, { recursive: true });
  fs.mkdirSync(outputsDir, { recursive: true });
  fs.mkdirSync(logsDir, { recursive: true });

  return {
    bundlesDir,
    outputsDir,
    logsDir,

    persistBundle(id, bundle) {
      const p = path.join(bundlesDir, `${id}.json`);
      fs.writeFileSync(p, JSON.stringify(bundle));
      return p;
    },

    outputDirFor(id) {
      return path.join(outputsDir, id);
    },

    /**
     * Persistent per-ROM build-log path (T-033). Lives under DATA_DIR/logs (bind-mounted,
     * rsync-excluded) so a failed build's output survives the container recreate that `docker
     * logs` does not. Kept OUT of the output dir so it never ends up in the user's download zip.
     */
    logPathFor(id, romIndex) {
      return path.join(logsDir, `${id}-rom${romIndex}.log`);
    },

    /** Zip every produced ROM in the request's output dir into one downloadable buffer. */
    readOutput(request) {
      const dir = request.output_path || this.outputDirFor(request.id);
      const files = fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
      const entries = files.map((name) => ({ name, data: fs.readFileSync(path.join(dir, name)) }));
      return createZip(entries.length ? entries : [{ name: 'README.txt', data: Buffer.from('no ROMs produced') }]);
    },

    removeFile(p) {
      if (p) { try { fs.rmSync(p, { recursive: true, force: true }); } catch { /* best effort */ } }
    },
  };
}
