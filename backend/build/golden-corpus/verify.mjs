// Verify the golden-master corpus (T-233): rebuild each FROZEN bundle on the build box and diff its
// full-ROM sha256 against manifest.json. Run ON the build box (PRO — the only build env), from the repo
// root, inside the app container:
//
//   node backend/build/golden-corpus/verify.mjs            # verify the whole corpus
//   node backend/build/golden-corpus/verify.mjs --only baseline
//
// Exit 0 = every ROM matches the manifest; 1 = any mismatch/failure. A MISMATCH means the build output
// changed vs the snapshot:
//   • Phase 3 (injection, base unchanged) → a BUG: INV-BYTES violated, `inject(base,bundle)` must equal
//     `compile(bundle)` byte-for-byte.
//   • Phase 2 (base refactor, bytes move by design) → EXPECTED: re-snapshot with build-and-hash.sh and
//     let the owner play-test the affected feature (INV-BEHAVIOR).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const corpus = process.env.CORPUS_OUT || path.resolve(dir, '../../data/golden-corpus');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
const argv = process.argv.slice(2);
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;

const run = (cmd, a) => execFileSync(cmd, a, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
// checkDataClean aborts a build if data/maps/** is dirty; a prior build/generation can leave it dirty.
const clean = () => { try { run('git', ['checkout', '--', 'src/', 'include/', 'data/maps/']); } catch { /* noop */ } };

let pass = 0, fail = 0;
for (const [name, roms] of Object.entries(manifest.bundles)) {
  if (only && name !== only) continue;
  const bundle = path.join(corpus, `${name}.bundle.json`);
  if (!fs.existsSync(bundle)) { console.log(`MISS  ${name}  (no frozen bundle — run generate.mjs)`); fail++; continue; }
  clean();
  try {
    run('node', ['make.js', `--bundle=${bundle}`, '--full-rom']);
  } catch {
    console.log(`ERR   ${name}  build failed (see make.js output)`); fail++; continue;
  }
  // make.js writes to roms/<bundle.sessionId>/ — a stable dir per bundle; never `ls -td` (dir mtime is
  // not bumped on a rebuild, so newest-dir picks the wrong ROM and yields false mismatches).
  const sid = JSON.parse(fs.readFileSync(bundle, 'utf8')).sessionId;
  for (const [rom, expected] of Object.entries(roms)) {
    const p = path.join(root, 'roms', sid, rom);
    if (!fs.existsSync(p)) { console.log(`ERR   ${name}  ${rom}  no output at roms/${sid}/`); fail++; continue; }
    const got = sha(p);
    if (got === expected) { console.log(`PASS  ${name}  ${rom}`); pass++; }
    else { console.log(`FAIL  ${name}  ${rom}  expected ${expected.slice(0, 12)}… got ${got.slice(0, 12)}…  (ROM: roms/${sid}/${rom})`); fail++; }
  }
}
clean();
console.log(`\n${fail === 0 ? 'ALL PASS' : 'MISMATCH'} — ${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
