/**
 * B-075 regression: the committed event scripts must assemble.
 *
 * `data/event_scripts.s` pulls every map's `scripts.inc` and every `data/scripts/*.inc` into ONE translation
 * unit, where a global label (`Label::`) may be defined only once. Define one twice and `make` dies at the
 * assembler — no base ROM, no user ROM, nothing. That is what the 15-trader rework did in the single map
 * where the derived name `<Map>_EventScript_Trader` was already taken by vanilla (Mauville's Pokémon Center
 * also hosts the Mauville Man's decoration trader).
 *
 * There is no GBA toolchain on a dev machine and `make check` only runs in CI or on the builder, so the
 * cheapest honest guard is to read what the assembler would read. This test needs nothing but the tree, so
 * it runs in the fast suite and in `deploy/update.sh`'s preflight — the next collision is caught in a second
 * instead of 20 minutes into a base build.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENTRY = path.join('data', 'event_scripts.s');

/** The files the assembler sees: `.include` closure from the entry point, in include order. */
function includedFiles(entry) {
  const seen = new Set();
  const order = [];
  const walk = (rel) => {
    if (seen.has(rel)) return;
    seen.add(rel);
    const abs = path.join(REPO_ROOT, rel);
    let text;
    try { text = fs.readFileSync(abs, 'utf8'); } catch { return; } // generated-at-build-time includes
    order.push({ file: rel, text });
    for (const m of text.matchAll(/^\s*\.include\s+"([^"]+)"/gm)) walk(m[1]);
  };
  walk(entry);
  return order;
}

/**
 * Global labels (`Label::`) per file, each tagged with the assembler-conditional branch it sits in.
 * Local labels (single colon) are file-scoped and cannot collide.
 *
 * The branch matters: upstream legitimately defines the same label in both arms of an
 * `.if OW_SHOW_ITEM_DESCRIPTIONS / .else / .endif` (data/maps/MtChimney/scripts.inc), and only one arm is
 * ever assembled. Each occurrence therefore carries the path of `<conditional id>:<arm>` it is nested in, so
 * two occurrences can be told apart from a real redefinition.
 */
function globalLabels(text, fileIndex) {
  const labels = [];
  const stack = [];
  let nextId = 0;
  for (const line of text.split('\n')) {
    const directive = /^\s*\.(if\w*|else\w*|endif)\b/.exec(line);
    if (directive) {
      const d = directive[1];
      if (d.startsWith('if')) stack.push({ id: `${fileIndex}.${nextId++}`, arm: 0 });
      else if (d.startsWith('else')) { if (stack.length) stack[stack.length - 1].arm += 1; }
      else stack.pop();
      continue;
    }
    const m = /^([A-Za-z_][A-Za-z0-9_]*)::/.exec(line);
    if (m) labels.push({ name: m[1], path: stack.map((f) => `${f.id}:${f.arm}`) });
  }
  return labels;
}

/** Two occurrences never coexist when some conditional they share puts them in different arms. */
function mutuallyExclusive(a, b) {
  for (let i = 0; i < Math.min(a.path.length, b.path.length); i += 1) {
    const [idA, armA] = a.path[i].split(':');
    const [idB, armB] = b.path[i].split(':');
    if (idA !== idB) return false;
    if (armA !== armB) return true;
  }
  return false;
}

test('B-075: no global event-script label is defined twice in the assembled set', () => {
  const files = includedFiles(ENTRY);
  assert.ok(files.length > 100, `expected the whole include tree, got ${files.length} file(s)`);

  const where = new Map();
  files.forEach(({ file, text }, i) => {
    for (const label of globalLabels(text, i)) {
      if (!where.has(label.name)) where.set(label.name, []);
      where.get(label.name).push({ ...label, file });
    }
  });

  // A label is redefined when two of its occurrences can be assembled together.
  const dupes = [];
  for (const [label, occurrences] of where) {
    const clashing = occurrences.filter((a, i) =>
      occurrences.some((b, j) => i !== j && !mutuallyExclusive(a, b)));
    if (clashing.length > 1) dupes.push([label, clashing.map((o) => o.file)]);
  }
  const detail = dupes
    .map(([label, files_]) => `  ${label}\n${files_.map((f) => `    ${f}`).join('\n')}`)
    .join('\n');
  assert.equal(
    dupes.length, 0,
    `${dupes.length} duplicated global label(s) — the assembler refuses this tree, so no ROM can be built:\n${detail}`,
  );
});

test('B-075: the Mauville Pokémon Center still has both traders, under distinct names', () => {
  const mapScripts = fs.readFileSync(
    path.join(REPO_ROOT, 'data/maps/MauvilleCity_PokemonCenter_1F/scripts.inc'), 'utf8');
  const vanilla = fs.readFileSync(path.join(REPO_ROOT, 'data/scripts/mauville_man.inc'), 'utf8');
  const map = JSON.parse(fs.readFileSync(
    path.join(REPO_ROOT, 'data/maps/MauvilleCity_PokemonCenter_1F/map.json'), 'utf8'));

  // Vanilla's decoration trader keeps the name its variant dispatch refers to.
  assert.match(vanilla, /^MauvilleCity_PokemonCenter_1F_EventScript_Trader::/m);
  assert.match(vanilla, /case MAUVILLE_MAN_TRADER, MauvilleCity_PokemonCenter_1F_EventScript_Trader/);

  // The town trader (T-269) is a different NPC and must not reuse it.
  assert.ok(
    !/^MauvilleCity_PokemonCenter_1F_EventScript_Trader::/m.test(mapScripts),
    'the map script must not redefine vanilla\'s decoration-trader label',
  );
  const townTrader = /^(MauvilleCity_PokemonCenter_1F_EventScript_\w*Trader\w*)::/m.exec(mapScripts);
  assert.ok(townTrader, 'the Mauville town trader script is missing');
  assert.ok(
    map.object_events.some((o) => o.script === townTrader[1]),
    `no object in the map points at ${townTrader?.[1]} — the trader would be unreachable`,
  );
});
