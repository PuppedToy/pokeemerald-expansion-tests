/**
 * T-079 — transparent, patch-first delivery feedback. The action button and all delivery copy speak
 * of a PATCH applied to the user's own ROM (never "download a ROM", for legal reasons), and singular/
 * plural track the ROM count. Clicking it shows a live 3-step checklist (download patch → apply to my
 * ROM → generate zip), step 3 only for multi-ROM runs.
 *
 * `dlLabel` is a pure export → unit-tested. The DOM/JSZip-coupled delivery flow is guarded
 * structurally against the source (ADR-009), like the rest of the account UI.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDomEnv } from './helpers/dom-env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const accountSrc = read('js', 'account.js');
const indexHtml = read('index.html');

let caseId = 0;
const freshAccount = () => import(`../js/account.js?dl=${caseId++}`);

test('dlLabel is patch-first and singular/plural by ROM count', async () => {
  const env = installDomEnv();
  try {
    const { dlLabel } = await freshAccount();
    assert.equal(dlLabel(1), '⬇ Download patch & apply to my ROM');
    assert.equal(dlLabel(3), '⬇ Download patches & apply to my ROMs');
    // Never phrases it as downloading a ROM.
    assert.doesNotMatch(dlLabel(1), /Download ROM/);
    assert.doesNotMatch(dlLabel(3), /Download ROMs/);
  } finally { env.restore(); }
});

test('no delivery control is labelled "Download ROM(s)"', () => {
  assert.ok(!/⬇ Download ROMs?\b/.test(accountSrc), 'account.js must not label a button "Download ROM(s)"');
  assert.ok(!/>⬇ Download ROM</.test(indexHtml), 'index.html button must not say "Download ROM"');
  assert.match(indexHtml, /Download patch &amp; apply to my ROM/, 'the static button is patch-first');
});

test('the live 3-step checklist exists and step 3 (zip) is multi-ROM only', () => {
  assert.match(indexHtml, /id="dl-steps"/, 'the checklist container is present in the actions area');
  assert.match(accountSrc, /function startDlSteps\(count\)/, 'startDlSteps renders the checklist');
  // download + apply always; zip only pushed when plural.
  assert.match(accountSrc, /'download',\s*plural \? 'Downloading patches' : 'Downloading patch'/);
  assert.match(accountSrc, /'apply',\s*plural \? 'Applying patches to my ROMs' : 'Applying patch to my ROM'/);
  assert.match(accountSrc, /if \(plural\) steps\.push\(\['zip', 'Generating zip'\]\)/, 'zip step only for multi-ROM');
});

test('deliverPatch drives the steps and zips a multi-ROM run (single ROM downloads one .gba)', () => {
  assert.match(accountSrc, /async function deliverPatch\(onStep = \(\) => \{\}\)/, 'deliverPatch takes an onStep reporter');
  assert.match(accountSrc, /onStep\('download', 'active'\)[\s\S]*onStep\('download', 'done'\)/, 'reports the download step');
  assert.match(accountSrc, /onStep\('apply', 'active'\)[\s\S]*onStep\('apply', 'done'\)/, 'reports the apply step');
  assert.match(accountSrc, /if \(roms\.length > 1\)[\s\S]*onStep\('zip', 'active'\)[\s\S]*zipRoms\(roms\)/, 'multi-ROM → generate + download a zip');
  assert.match(accountSrc, /async function zipRoms\(roms\)/, 'zipRoms bundles the finished games');
});

test('delivery copy never claims a ROM was downloaded; it says the patch was applied', () => {
  assert.ok(!/your ROM has been downloaded/i.test(accountSrc), 'no "your ROM has been downloaded" copy');
  assert.ok(!/>ROM downloaded</.test(accountSrc), 'no "ROM downloaded" status title');
  assert.match(accountSrc, /Patch(es)? applied to your ROMs?/, 'delivered state reads "patch applied to your ROM"');
});
