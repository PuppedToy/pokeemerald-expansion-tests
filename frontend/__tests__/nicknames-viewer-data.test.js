/**
 * T-201 increment 1 — the auto-nickname assignments (starters / locations / trades) + trade info reach the
 * docs viewer as a `nicknamesData` blob. Both the browser path (app.js buildDocHtml) and the node/maker path
 * (writer.js) inject it from rom.artifacts, so no generation reorder is needed. Structural guards (per ADR-009).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readRepo = (p) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

test('template carries the nicknames.js placeholder among the data scripts', () => {
    assert.match(read('template.html'), /<script src="nicknames\.js"><\/script>/);
});

test('browser path (app.js) injects nicknamesData from rom.artifacts', () => {
    const app = read('js/app.js');
    assert.match(app, /const nicknamesData = \$\{JSON\.stringify\(\{/);
    assert.match(app, /starters: rom\.artifacts\.starterNaming/);
    assert.match(app, /locations: rom\.artifacts\.locationNaming/);
    assert.match(app, /trades: rom\.artifacts\.tradeNaming/);
    assert.match(app, /tradesInfo: rom\.artifacts\.trades/);
});

test('node/maker path (writer.js) injects the same nicknamesData (parity)', () => {
    const writer = readRepo('randomizer/writer.js');
    assert.match(writer, /const nicknamesData = \$\{JSON\.stringify\(nicknamesData\)\}/);
    assert.match(writer, /starters: starterNaming/);
    assert.match(writer, /locations: locationNaming/);
    assert.match(writer, /trades: tradeNaming/);
    assert.match(readRepo('randomizer/constants.js'), /TEMPLATE_NICKNAMES_REPLACEMENT/);
});
