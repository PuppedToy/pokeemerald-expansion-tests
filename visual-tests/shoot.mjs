// Agent preview tool (T-040): screenshot every screen at every viewport, autonomously.
// Boots the backend itself (FAKE_BUILD, throwaway data dir), screenshots the app + the
// self-contained docs-viewer fixture, writes PNGs the agent can Read, and reports any
// horizontal overflow. NOT a test — a hands-free "look at every resolution" harness.
//
//   node shoot.mjs [--out DIR] [--full] [--only SUBSTR] [--vp NAME]
//
// Default out: visual-tests/.shots/  (gitignored). Overflow = documentElement.scrollWidth
// exceeding the viewport width (the #1 mobile smell).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { VIEWPORTS, APP_SCREENS, DOCS_SCREENS, DOCS_FIXTURE, gotoDocsSection } from './screens.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── args ────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const OUT = path.resolve(val('--out', path.join(__dirname, '.shots')));
const FULL = flag('--full');
const ONLY = val('--only', null);
const VP = val('--vp', null);
const PORT = Number(process.env.PORT || 3100);
const BASE_URL = `http://localhost:${PORT}`;

const viewports = VP ? VIEWPORTS.filter((v) => v.name === VP) : VIEWPORTS;
const keep = (n) => !ONLY || n.includes(ONLY);

// ── ensure the docs fixture exists ────────────────────────────────────────────────
if (!existsSync(DOCS_FIXTURE)) {
  console.log('[shoot] building docs fixture (one-off, ~25s)…');
  execFileSync('node', [path.join(__dirname, 'fixtures', 'build-doc-sample.cjs'), '42', DOCS_FIXTURE], { stdio: 'inherit' });
}

// ── boot the backend ────────────────────────────────────────────────────────────
function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => { res.resume(); resolve(); });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error('server did not start'));
        else setTimeout(tick, 250);
      });
    };
    tick();
  });
}

let server = null;
async function bootServer() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ec-visual-'));
  server = spawn('node', [path.join(ROOT, 'backend', 'server.js')], {
    env: { ...process.env, PORT: String(PORT), FAKE_BUILD: '1', DATA_DIR: dataDir, NODE_ENV: 'development' },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  await waitForServer(BASE_URL + '/');
}

// ── shoot ─────────────────────────────────────────────────────────────────────────
async function settle(page) {
  // fonts.ready can hang if a webfont host is unreachable → race it with a timeout.
  await page.evaluate(() => Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ])).catch(() => {});
  await page.waitForTimeout(200);
}
async function overflow(page, width) {
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  return { sw, over: sw > width + 1 };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await bootServer();
  const browser = await chromium.launch();
  const report = [];

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();

    for (const s of APP_SCREENS) {
      if (!keep(s.name)) continue;
      process.stdout.write(`[shoot] ${vp.name}/${s.name} … `);
      await page.goto(BASE_URL + s.path, { waitUntil: 'domcontentloaded' });
      if (s.setup) await s.setup(page);
      await settle(page);
      const file = path.join(OUT, `${vp.name}__${s.name}.png`);
      await page.screenshot({ path: file, fullPage: FULL });
      const { sw, over } = await overflow(page, vp.width);
      report.push({ vp: vp.name, screen: s.name, w: vp.width, sw, over });
      console.log('ok');
    }

    for (const d of DOCS_SCREENS) {
      if (!keep(d.name)) continue;
      await gotoDocsSection(page, d.target);
      await settle(page);
      const file = path.join(OUT, `${vp.name}__${d.name}.png`);
      await page.screenshot({ path: file, fullPage: FULL });
      const { sw, over } = await overflow(page, vp.width);
      report.push({ vp: vp.name, screen: d.name, w: vp.width, sw, over });
    }
    await ctx.close();
  }

  await browser.close();

  // ── report ──────────────────────────────────────────────────────────────────────
  const overflows = report.filter((r) => r.over);
  console.log(`\n[shoot] ${report.length} screenshots → ${OUT}`);
  if (overflows.length) {
    console.log(`\n⚠ horizontal overflow (${overflows.length}):`);
    for (const r of overflows) console.log(`   ${r.vp.padEnd(15)} ${r.screen.padEnd(18)} scrollWidth ${r.sw} > ${r.w}`);
  } else {
    console.log('✓ no horizontal overflow at any viewport');
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => { if (server) server.kill('SIGKILL'); });
