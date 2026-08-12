#!/usr/bin/env node
/**
 * base-state.mjs (T-273) — does the box's prebuilt base ROM correspond to the sources we are deploying?
 *
 * Since T-244 every delivered ROM is injected into `base/pokeemerald.{gba,map,sym}`, which `update.sh`
 * deliberately does not carry (see randomizer/docs/injection.md, docs/base-rom-provisioning.md). So the
 * sources on the box and the artifact they compile into can drift, and when they do the injector refuses
 * every build — or worse, the ROM simply lacks what the docs promise. Before T-273 the only evidence of
 * what a base was built from was its mtime, read by hand; this script makes it a comparison:
 *
 *   fingerprint  = sha256 over the git blob ids of every tracked path that `make` reads
 *   stamp        = base/BASE_BUILD.json on the box, written by deploy/build-base.sh from that same number
 *   verdict      = in-sync (exit 0)  |  rebuild-required (exit 10)  |  operational failure (exit 2)
 *
 * The classification is by EXCLUSION: only paths known to be app-only are app-only, so an unrecognised one
 * (a new source root, an upstream sync) counts as base-relevant. The worst case is one unnecessary base
 * rebuild; the alternative failure mode is a base that silently disagrees with its sources.
 *
 *   node scripts/base-state.mjs                 # verdict against the box (human summary)
 *   node scripts/base-state.mjs --json          # same, as JSON (what the deploy skill reads)
 *   node scripts/base-state.mjs --print-fingerprint   # local fingerprint only, no SSH
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Directories that never reach `make`: the Node pipeline, the web app, the dev harnesses and the
 * paperwork. Anything not listed here is assumed to compile into the ROM.
 */
export const APP_ONLY_PREFIXES = [
  '.claude/', '.github/', '.vscode/', '.oci/',
  'backend/', 'frontend/', 'randomizer/', 'visual-tests/', 'deploy/', 'scripts/',
  'docs/', 'tasks/', 'bugs/',
  'debug/', 'dev_scripts/', 'migration_scripts/', 'smogon_analysis/', 'obsidian-ui-kit/',
  'base/', 'build/', 'node_modules/', 'roms/',
  // C battle tests are linked into the TEST rom by `make check`, never into pokeemerald.gba.
  'test/',
];

/** Root files that are pipeline/tooling, not decomp input. */
export const APP_ONLY_FILES = new Set([
  'analyze.js', 'analyze-combos.js', 'make.js', 'build.js', 'check_tiers.js',
  'buildDocsTemplate.cjs', 'buildFrontendDist.cjs', 'buildWorker.cjs',
  'package.json', 'package-lock.json', '.gitignore', '.gitattributes', '.editorconfig',
  'asmdiff.sh', 'asmdiff.ps1', 'check_history.sh',
  'rom.sha1', 'pokeemerald-vanilla.gba', 'boss-dialogue.txt',
]);

/** True when a repo-relative path is compiled into the base ROM. */
export function isBaseRelevant(p) {
  const rel = String(p).replace(/^\.\//, '');
  if (!rel) return false;
  if (rel.endsWith('.md')) return false;                       // documentation never compiles
  if (APP_ONLY_FILES.has(rel)) return false;
  return !APP_ONLY_PREFIXES.some((dir) => rel.startsWith(dir));
}

/** Split a change set, keeping the paths that decided the verdict (they go in the report). */
export function classifyPaths(paths) {
  const baseRelevant = [];
  const appOnly = [];
  for (const p of paths) (isBaseRelevant(p) ? baseRelevant : appOnly).push(p);
  return { baseRelevant, appOnly };
}

/**
 * The verdict, pure. `stamp` is base/BASE_BUILD.json as parsed from the box (null when absent).
 * Every branch that cannot PROVE the base matches asks for a rebuild — an unprovable base is a stale base.
 */
export function verdictFor({ local, stamp, dirtyBasePaths = [], baseInstalled = true }) {
  const rebuild = (reason) => ({ verdict: 'rebuild-required', exitCode: 10, reason });
  if (!baseInstalled) return rebuild('the box has no base installed (missing or empty base/pokeemerald.*)');
  if (!stamp || !stamp.fingerprint) {
    return rebuild('the base carries no provenance stamp (base/BASE_BUILD.json), so it cannot be proven to match these sources');
  }
  if (stamp.fingerprint !== local) {
    return rebuild(`the base was built from different sources (stamp ${short(stamp.fingerprint)} ≠ tree ${short(local)})`);
  }
  if (dirtyBasePaths.length) {
    return rebuild(`uncommitted changes in ${dirtyBasePaths.length} base-relevant path(s) would be deployed on top of this base`);
  }
  return { verdict: 'in-sync', exitCode: 0, reason: 'the base was built from exactly these sources' };
}

const short = (h) => String(h || '').slice(0, 12);

// ── the tree side (git) ────────────────────────────────────────────────────────────

const git = (args, opts = {}) =>
  execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });

/**
 * sha256 over "<blob id> <path>" for every tracked base-relevant path. Content-addressed, so it is immune
 * to mtimes, rebases and merge churn: two trees with the same sources fingerprint the same.
 */
export function fingerprintOf(treeish = 'HEAD') {
  const raw = git(['ls-tree', '-r', '-z', treeish]);
  const lines = [];
  for (const rec of raw.split('\0')) {
    if (!rec) continue;
    const tab = rec.indexOf('\t');
    if (tab < 0) continue;
    const meta = rec.slice(0, tab).split(/\s+/);   // <mode> <type> <object>
    const file = rec.slice(tab + 1);
    if (!isBaseRelevant(file)) continue;
    lines.push(`${meta[2]} ${file}`);
  }
  lines.sort();
  return createHash('sha256').update(lines.join('\n')).digest('hex');
}

/** Working-tree changes (modified, staged, untracked) in base-relevant paths — they get rsynced too. */
export function dirtyBasePaths() {
  const out = git(['status', '--porcelain', '--untracked-files=all']);
  const paths = [];
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    let p = line.slice(3).trim();
    const arrow = p.indexOf(' -> ');                // renames report "old -> new"
    if (arrow >= 0) p = p.slice(arrow + 4);
    p = p.replace(/^"|"$/g, '');
    if (isBaseRelevant(p)) paths.push(p);
  }
  return paths;
}

/** The commits that touched base-relevant paths since `since`, for the report. Empty if unknown. */
export function commitsSince(since) {
  if (!since) return [];
  try {
    git(['cat-file', '-e', `${since}^{commit}`]);
  } catch { return []; }
  const exclude = [
    ...APP_ONLY_PREFIXES.map((d) => `:(exclude)${d}`),
    ...[...APP_ONLY_FILES].map((f) => `:(exclude)${f}`),
    ':(exclude)*.md',
  ];
  try {
    return git(['log', '--oneline', '--no-decorate', `${since}..HEAD`, '--', '.', ...exclude])
      .split('\n').filter(Boolean);
  } catch { return []; }
}

// ── the box side (ssh) ─────────────────────────────────────────────────────────────

/** deploy/.env.local, with env vars winning — the same resolution order as update.sh. */
export function deployConfig(env = process.env) {
  const cfg = {};
  const file = path.join(REPO_ROOT, 'deploy', '.env.local');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      cfg[m[1]] = m[2].replace(/\s+#.*$/, '').replace(/^['"]|['"]$/g, '').trim();
    }
  }
  for (const k of ['DEPLOY_HOST', 'DEPLOY_USER', 'DEPLOY_PATH', 'DEPLOY_KEY']) {
    if (env[k]) cfg[k] = env[k];
  }
  cfg.DEPLOY_USER ||= 'root';
  cfg.DEPLOY_PATH ||= '/opt/emerald';
  cfg.DEPLOY_KEY ||= '~/.ssh/emerald_box';
  cfg.DEPLOY_KEY = cfg.DEPLOY_KEY.replace(/^~/, process.env.HOME || '~');
  return cfg;
}

/**
 * The box's reply → { baseInstalled, stamp, deployed }. Unparseable or empty JSON becomes `null`: a stamp
 * that cannot be read proves nothing, and the verdict then asks for a rebuild (the safe direction).
 */
export function parseBoxOutput(out) {
  const block = (name) => {
    const m = new RegExp(`${name}<<\\n([\\s\\S]*?)\\n>>`).exec(out);
    if (!m) return null;
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch { return null; }
    return parsed && typeof parsed === 'object' && Object.keys(parsed).length ? parsed : null;
  };
  return {
    baseInstalled: /BASE_INSTALLED=1/.test(out),
    stamp: block('STAMP'),
    deployed: block('DEPLOYED'),
  };
}

/** Read the box's base state in one round trip: are the artifacts there, and what is the stamp? */
export function readBoxState(cfg = deployConfig()) {
  if (!cfg.DEPLOY_HOST) throw new Error('set DEPLOY_HOST in deploy/.env.local');
  const remote = [
    `cd ${cfg.DEPLOY_PATH} 2>/dev/null || exit 3`,
    'ok=1; for f in base/pokeemerald.gba base/pokeemerald.map base/pokeemerald.sym; do [ -s "$f" ] || ok=0; done',
    'echo "BASE_INSTALLED=$ok"',
    'echo "STAMP<<"; cat base/BASE_BUILD.json 2>/dev/null || echo "{}"; echo ">>"',
    'echo "DEPLOYED<<"; cat backend/data/deployed.json 2>/dev/null || echo "{}"; echo ">>"',
  ].join('; ');
  const out = execFileSync('ssh', [
    '-i', cfg.DEPLOY_KEY, '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'ConnectTimeout=15', '-o', 'BatchMode=yes',
    `${cfg.DEPLOY_USER}@${cfg.DEPLOY_HOST}`, remote,
  ], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });

  return parseBoxOutput(out);
}

// ── CLI ────────────────────────────────────────────────────────────────────────────

function main(argv) {
  const asJson = argv.includes('--json');

  if (argv.includes('--print-fingerprint')) {
    process.stdout.write(`${fingerprintOf('HEAD')}\n`);
    return 0;
  }

  const local = fingerprintOf('HEAD');
  const dirty = dirtyBasePaths();

  let box;
  try {
    box = readBoxState();
  } catch (err) {
    const msg = `cannot read the box's base state: ${err.message.trim().split('\n').pop()}`;
    if (asJson) process.stdout.write(`${JSON.stringify({ verdict: 'unknown', reason: msg }, null, 2)}\n`);
    else console.error(`✗ ${msg}`);
    return 2;
  }

  const v = verdictFor({ local, stamp: box.stamp, dirtyBasePaths: dirty, baseInstalled: box.baseInstalled });
  const commits = box.stamp?.commit ? commitsSince(box.stamp.commit) : [];
  const changed = box.stamp?.commit && commits.length
    ? classifyPaths(changedPathsSince(box.stamp.commit)).baseRelevant
    : [];

  const report = {
    verdict: v.verdict,
    reason: v.reason,
    fingerprint: { tree: local, base: box.stamp?.fingerprint ?? null },
    base: {
      installed: box.baseInstalled,
      builtAt: box.stamp?.builtAt ?? null,
      commit: box.stamp?.commit ?? null,
      romSha256: box.stamp?.romSha256 ?? null,
    },
    boxTreeFingerprint: box.deployed?.fingerprint ?? null,
    dirtyBasePaths: dirty,
    commitsSinceBase: commits,
    changedBasePaths: changed,
  };

  if (asJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return v.exitCode;
  }

  const mark = v.verdict === 'in-sync' ? '✓' : '⚠';
  console.log(`${mark} base ROM: ${v.verdict} — ${v.reason}`);
  console.log(`    tree fingerprint : ${short(local)}${dirty.length ? `  (+${dirty.length} uncommitted base path(s))` : ''}`);
  console.log(`    base fingerprint : ${box.stamp?.fingerprint ? short(box.stamp.fingerprint) : '(none)'}` +
    `${box.stamp?.builtAt ? `   built ${box.stamp.builtAt}` : ''}`);
  if (commits.length) {
    console.log(`    ${commits.length} commit(s) touched the base since it was built:`);
    for (const c of commits.slice(0, 10)) console.log(`      ${c}`);
    if (commits.length > 10) console.log(`      … ${commits.length - 10} more`);
  }
  if (changed.length) {
    console.log(`    ${changed.length} base-relevant file(s) changed, e.g.:`);
    for (const p of changed.slice(0, 8)) console.log(`      ${p}`);
  }
  if (dirty.length) {
    console.log(`    uncommitted base-relevant path(s): ${dirty.slice(0, 5).join(', ')}${dirty.length > 5 ? ', …' : ''}`);
  }
  console.log(v.verdict === 'in-sync'
    ? '    → deploy/update.sh is enough (path 1).'
    : '    → deploy/update.sh THEN deploy/build-base.sh (path 2): the ROMs users get come from the base.');
  return v.exitCode;
}

/** Files touched in base-relevant paths since a commit (report only). */
function changedPathsSince(since) {
  try {
    return git(['diff', '--name-only', `${since}..HEAD`]).split('\n').filter(Boolean);
  } catch { return []; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
