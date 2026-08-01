// Generate + FREEZE the golden-master corpus bundles (T-230). Run on the build box (PRO) where the repo
// is complete: `node backend/build/golden-corpus/generate.mjs`. Writes one <name>.bundle.json per spec to
// CORPUS_OUT (default ./bundles, gitignored — bundles are ~19 MB each, they live on the box, not in git).
// The backend generation path is non-reproducible, so these frozen JSONs ARE the pinned golden-master
// inputs; build them with build-and-hash.sh to get the reference sha256s (manifest.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJob, runGeneration, getJob } from '../../generator.js';
import { SPECS } from './specs.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
// Default to backend/data/ — writable by the container (uid 1000) and persisted across deploys
// (rsync excludes backend/data/). The scripts dir itself may be root-owned on the box.
const outDir = process.env.CORPUS_OUT || path.resolve(dir, '../../data/golden-corpus');
fs.mkdirSync(outDir, { recursive: true });

// Optional: regenerate a single spec by name (e.g. `node generate.mjs nuzlocke-3`).
const only = process.argv[2];
const specs = only ? SPECS.filter((s) => s.name === only) : SPECS;
if (only && specs.length === 0) { console.error(`no spec named "${only}"`); process.exit(1); }

let ok = 0;
for (const spec of specs) {
  const id = createJob();
  await runGeneration(id, { ...spec.config });
  const job = getJob(id);
  if (job.status !== 'done' || !job.result) {
    console.error(`FAIL\t${spec.name}\t${job?.error || 'no result'}`);
    process.exitCode = 1;
    continue;
  }
  const file = path.join(outDir, `${spec.name}.bundle.json`);
  fs.writeFileSync(file, JSON.stringify(job.result));
  const mb = (fs.statSync(file).size / 1e6).toFixed(1);
  console.log(`OK\t${spec.name}\troms=${job.result.roms.length}\t${mb}MB\t${file}`);
  ok++;
}
console.log(`CORPUS_GENERATED ${ok}/${specs.length}`);
