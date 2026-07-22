/**
 * T-052 Step 1 — the config form is organized into collapsible CATEGORIES (an accordion), the
 * single generic "Advanced" block is gone, and its contents (seed + show-exact-positions) now live
 * in a dedicated "General" category. Mutations keeps its OWN scoped Advanced sub-panel.
 *
 * Structural guards only (zero-dep, `node --test`, per ADR-009): the DOM stub does not parse
 * innerHTML, so ConfigForm's querySelector logic can't be exercised here — we assert against the
 * built template string + the CSS. Behavioural config round-trip of the pure defaults/normalization
 * helpers is covered separately as those land.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAndBunE4Split } from '../js/config-form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FE = path.join(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(FE, ...p), 'utf8');

const src = read('js', 'config-form.js');
const componentsCss = read('css', 'components.css');

test('settings are grouped into an accordion of categories', () => {
  assert.match(src, /class="config-accordion"/, 'config form must render a .config-accordion wrapper');
  for (const cat of ['run-type', 'difficulty', 'mutations', 'general']) {
    assert.match(src, new RegExp(`data-cat="${cat}"`), `missing category section data-cat="${cat}"`);
  }
});

test('the generic "Advanced" block is removed (only a scoped Mutations Advanced remains)', () => {
  assert.ok(!src.includes('id="advanced-toggle"'), 'the old generic #advanced-toggle must be gone');
  assert.ok(!src.includes('id="advanced-body"'), 'the old generic #advanced-body must be gone');
  assert.match(src, /id="mutations-advanced-toggle"/, 'Mutations must keep a scoped Advanced toggle');
  assert.match(src, /id="mutations-advanced-body"/, 'Mutations must keep a scoped Advanced body');
});

test('T-055: a "reset to defaults" control exists and resets from the canonical DEFAULTS', () => {
  assert.match(src, /id="btn-reset-config"/, 'the config actions must include a reset button');
  assert.match(src, /resetToDefaults\s*\(\)\s*\{/, 'ConfigForm exposes a resetToDefaults() method');
  const body = src.slice(src.indexOf('resetToDefaults'), src.indexOf('resetToDefaults') + 200);
  assert.match(body, /setConfig\(DEFAULTS\)/, 'resetToDefaults applies the DEFAULTS object (not ad-hoc values)');
  assert.match(src, /#btn-reset-config'\)\?\.addEventListener/, 'the reset button is wired');
});

test('seed stays in General; show-exact-positions moved to Docs visibility (T-163)', () => {
  const generalIdx = src.indexOf('data-cat="general"');
  const dvIdx = src.indexOf('data-cat="docs-visibility"');
  assert.ok(generalIdx > 0, 'General category must exist');
  assert.ok(dvIdx > 0 && dvIdx < generalIdx, 'Docs visibility category must exist before General');
  const generalTail = src.slice(generalIdx);
  assert.match(generalTail, /id="seed"/, 'seed input must live in the General category');
  assert.ok(!generalTail.includes('id="show-exact-positions"'), 'show-exact-positions must no longer be in General');
  const dvBlock = src.slice(dvIdx, generalIdx);
  assert.match(dvBlock, /id="show-exact-positions"/, 'show-exact-positions now lives in Docs visibility');
});

test('ordered insertion anchors exist for the categories added in later steps', () => {
  // All categories have now landed — no anchors should remain.
  for (const anchor of ['@cat:evolution', '@cat:trainers', '@cat:rewards', '@cat:starters']) {
    assert.ok(!src.includes(anchor), `insertion anchor ${anchor} should be consumed`);
  }
});

test('Starters category is a dynamic add/remove list (Step 10)', () => {
  assert.match(src, /data-cat="starters"/, 'Starters category must exist');
  assert.match(src, /id="starter-list"/, 'a container for the dynamic rows');
  assert.match(src, /id="add-starter"/, 'an add-row button');
  assert.match(src, /function starterRowHtml/, 'rows are generated (tier / kind / length / remove)');
  assert.match(src, /_renderStarterList/, 'list re-renders from the in-memory specs');
  assert.match(src, /extraStarters:\s*EXTRA_STARTER_DEFAULT_PRESET/, 'DEFAULTS carries the 9-slot preset');
  assert.match(src, /EXTRA_STARTER_TIER_OPTIONS\s*=\s*\['LEGEND', 'UBERS', 'OU', 'UU', 'RU', 'NU', 'PU'\]/, 'expanded tier vocabulary');
});

test('T-072: Starters category has a quality selector (default UU) and a live extra-starter count', () => {
  assert.match(src, /id="starter-quality"/, 'a single quality selector for the 3 main starters');
  assert.match(src, /starterQuality:\s*'UU'/, 'DEFAULTS carries starterQuality defaulting to UU');
  assert.match(src, /id="starter-count"/, 'a live count of extra starters is shown');
  // The quality selector reuses the extra-starter tier vocabulary.
  const startersIdx = src.indexOf('data-cat="starters"');
  const tail = src.slice(startersIdx, startersIdx + 1200);
  assert.match(tail, /starter-quality[\s\S]*EXTRA_STARTER_TIER_OPTIONS/, 'quality options reuse the tier vocabulary');
});

test('T-070: location nicknames live INSIDE the Nicknames section, sharing its pools (no separate category)', () => {
  assert.ok(!src.includes('data-cat="location-nicknames"'), 'the separate location-nicknames category must be gone');
  assert.ok(!src.includes('LOCATION_NICKNAMES_DEFAULT'), 'no separate location defaults object');
  assert.ok(!src.includes('locationNicknames'), 'no separate locationNicknames config key');
  // The two switches live in the shared nicknames box.
  assert.match(src, /id="nickname-auto-location"/, 'auto-location switch inside nicknames');
  assert.match(src, /id="nickname-lock-gender-route"/, 'lock-gender-per-route switch inside nicknames');
  assert.match(src, /autoLocation:\s*false/, 'NICKNAMES_DEFAULT carries autoLocation');
  assert.match(src, /lockGenderPerRoute:\s*false/, 'NICKNAMES_DEFAULT carries lockGenderPerRoute');
  // Lock-gender is enabled only when auto-location AND different-per-gender are both on.
  assert.match(src, /const lockAllowed = !!\(autoLoc && diffGender\)/, 'lock-gender gated on autoLocation + differentPerGender');
  assert.match(src, /lockGenderEl\.disabled = !lockAllowed/, 'lock-gender checkbox disabled when not allowed');
});

test('T-068: Starter nicknames category with master toggle, switches and gendered pools', () => {
  assert.match(src, /data-cat="nicknames"/, 'Nicknames category must exist');
  for (const id of ['nickname-enabled', 'nickname-include-starter', 'nickname-same-across-runs',
    'nickname-share-soullink', 'nickname-different-per-gender']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing nickname control #${id}`);
  }
  for (const id of ['nickname-pool-both', 'nickname-pool-female', 'nickname-pool-male', 'nickname-pool-single']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing pool textarea #${id}`);
  }
  // Master toggle default OFF; share-soul-link + different-per-gender default ON in DEFAULTS.
  assert.match(src, /nicknames:\s*NICKNAMES_DEFAULT/, 'DEFAULTS carries nicknames');
  assert.match(src, /enabled:\s*false/, 'nicknames default OFF');
  // Gendered pool tabs use scoped classes (not the document-wide .subtab).
  assert.match(src, /class="nick-tab active"[^>]*data-nick-tab="both"/, 'Both tab active by default');
  assert.match(src, /data-nick-panel="male"/, 'male pool panel present');
  // Visibility wiring: box + run-type-gated rows + gendered/single swap.
  assert.match(src, /#nickname-box/, 'master toggle shows/hides the box');
  assert.match(src, /#nickname-same-runs-row/, 'same-across-runs row is run-type gated');
  assert.match(src, /#nickname-share-soullink-row/, 'share-soul-link row is soul-link gated');
});

test('category headers are wired for accordion toggling', () => {
  assert.match(src, /querySelectorAll\('\.config-cat-header'\)/, 'headers must be wired to toggle their body');
});

test('Trainers & bosses category exposes gym / E4 type-change counts (Step 2)', () => {
  assert.match(src, /data-cat="trainers"/, 'Trainers & bosses category must exist');
  assert.match(src, /id="gyms-type-changed"[^>]*min="0"[^>]*max="8"/, 'gyms count input 0–8');
  assert.match(src, /id="e4-type-changed"[^>]*min="0"[^>]*max="4"/, 'E4 count input 0–4');
});

test('Trainers & bosses category exposes the champion type-change chance (T-076)', () => {
  // Percentage input 0–100; the form converts it to a 0..1 probability (championTypeChangeChance).
  assert.match(src, /id="champion-type-change-pct"[^>]*min="0"[^>]*max="100"/, 'champion percent input 0–100');
  assert.match(src, /championTypeChangeChance/, 'read into championTypeChangeChance');
  assert.match(src, /#champion-type-change-pct'[^)]*\)\s*\/\s*100/, 'percent is divided by 100 into a 0..1 probability');
});

test('Team Aqua / Magma expose 5 type selectors each (Steps 3–4)', () => {
  assert.match(src, /Team Aqua types/, 'Team Aqua block must exist');
  assert.match(src, /Team Magma types/, 'Team Magma block must exist');
  // A reusable 5-slot selector generator (main, secondary, other 1..3).
  assert.match(src, /function teamTypeSelectors/, 'reusable selector component must exist');
  assert.match(src, /teamTypeSelectors\('aqua'/, 'Aqua uses the selector component');
  assert.match(src, /teamTypeSelectors\('magma'/, 'Magma uses the selector component');
  assert.match(src, /TEAM_TYPE_SLOTS\s*=\s*\['Main type', 'Secondary type', 'Other type 1', 'Other type 2', 'Other type 3'\]/, '5 named slots');
  // The RANDOM token is offered by the option generator.
  assert.match(src, /\['RANDOM', 'Random'\]/, 'a Random option must be offered');
  assert.match(src, /aquaTypes:\s*\['WATER', 'DARK', 'POISON', 'ICE', 'RANDOM'\]/, 'Aqua default incl. Random 5th slot');
  assert.match(src, /magmaTypes:\s*\['FIRE', 'GROUND', 'ROCK', 'GRASS', 'RANDOM'\]/, 'Magma default incl. Random 5th slot');
});

test('Pokémon mutations expose four category toggles (Step 5)', () => {
  for (const id of ['mutate-stats', 'mutate-abilities', 'mutate-types', 'mutate-learnsets']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing toggle #${id}`);
  }
  // Toggles are hidden with the rest of the mutation controls when rebalance is off.
  assert.match(src, /#mutation-categories/, 'toggles must be grouped for show/hide with rebalance');
});

test('Evolution levels category: enable + scalars + Advanced tier tables (Steps 7–8)', () => {
  assert.match(src, /data-cat="evolution"/, 'Evolution category must exist');
  for (const id of ['evo-enabled', 'evo-min', 'evo-max', 'evo-deviation', 'evo-stage-lcOf2', 'evo-stage-lcOf3', 'evo-stage-nfeOf3']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing evolution control #${id}`);
  }
  assert.match(src, /id="evolution-advanced-body"/, 'Evolution must have a scoped Advanced panel');
  assert.match(src, /evoTierRows\('evo-base', EVO_BASE_RANGE_TIERS/, 'base-range table generated in Advanced');
  assert.match(src, /evoTierRows\('evo-mod', EVO_PREEVO_MOD_TIERS/, 'pre-evo modifier table generated in Advanced');
  assert.match(src, /evoLevels:\s*EVO_LEVELS_DEFAULT/, 'DEFAULTS carries evoLevels');
});

test('Rewards category exposes normal/boss/gym money (Step 9)', () => {
  assert.match(src, /data-cat="rewards"/, 'Rewards category must exist');
  for (const id of ['reward-normal', 'reward-boss', 'reward-gym']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing money input #${id}`);
  }
  assert.match(src, /money:\s*\{ normal: 250, boss: 3000, gym: 5000 \}/, 'DEFAULTS carries money with real defaults');
});

test('T-073: Rewards exposes a Shop prices block (balls, 20 mints, ability items, TM pools)', () => {
  // The block container id is literal; the per-item field ids are GENERATED (templated / arg-driven),
  // so we assert the generator inputs, not literal id="price-..." strings.
  assert.match(src, /id="shop-prices"/, 'a Shop prices container');
  assert.match(src, /function shopPricesBlock\(\)/, 'a generator builds the price block');
  // Balls + ability items pass their id as a literal string arg to priceCell(...).
  for (const id of ['price-ball-ultra', 'price-ball-quick', 'price-ball-timer',
    'price-ability-capsule', 'price-ability-patch']) {
    assert.match(src, new RegExp(`priceCell\\('${id}'`), `missing priceCell for ${id}`);
  }
  // Mint + TM fields are generated per key (one templated id each, not literals).
  assert.match(src, /`price-mint-\$\{n\}`/, 'mint fields generated as price-mint-<NAME>');
  assert.match(src, /`price-tm-\$\{k\}`/, 'TM fields generated as price-tm-<pool>');
  // The 20 shop mints and the 10 TM pools are enumerated.
  const mintsBlock = src.slice(src.indexOf('MINT_PRICE_NAMES ='), src.indexOf('MINT_PRICE_NAMES =') + 400);
  for (const n of ['LONELY', 'BOLD', 'ADAMANT', 'JOLLY', 'SASSY', 'NAIVE']) {
    assert.ok(mintsBlock.includes(`'${n}'`), `MINT_PRICE_NAMES must include ${n}`);
  }
  const tmBlock = src.slice(src.indexOf('TM_POOL_LABELS ='), src.indexOf('TM_POOL_LABELS =') + 700);
  for (const k of ['avgDmg', 'strongDmg', 'weather', 'godlikeStatus']) {
    assert.ok(tmBlock.includes(`'${k}'`), `TM_POOL_LABELS must include ${k}`);
  }
  assert.match(src, /prices:\s*PRICE_DEFAULTS/, 'DEFAULTS carries prices');
  // Round-trip plumbing: read + restore helpers exist and are called + wired.
  assert.match(src, /_readPrices\s*\(\)\s*\{/, 'getConfig reads prices via _readPrices');
  assert.match(src, /_setPrices\s*\(prices\)\s*\{/, 'setConfig restores prices via _setPrices');
  assert.match(src, /prices\s*=\s*this\._readPrices\(\)/, 'prices are read into the config');
  assert.match(src, /#shop-prices'\)\?\.addEventListener/, 'the price block is wired for live save');
});

test('Mutations Advanced panel exposes every probability knob (Step 6)', () => {
  const keys = [
    'statBalanceChance', 'buffStatChance', 'repeatStatChance', 'typeBalanceChance',
    'monotypeBalanceChance', 'abilityBalanceChance', 'learnsetBalanceChance',
    'changeTypeMoveFromOldChance', 'changeTypeMoveFromOtherChance', 'moveInsertChance', 'moveRatingDeviation',
  ];
  for (const k of keys) {
    assert.ok(src.includes(`key: '${k}'`) || src.includes(`'${k}'`), `MUTATION_PROB_FIELDS must include ${k}`);
  }
  // Rendered into the scoped Mutations Advanced body via a generator.
  assert.match(src, /function mutationProbInputs/, 'a generator renders the advanced inputs');
  assert.match(src, /mutations-advanced-body[\s\S]*mutationProbInputs\(\)/, 'inputs render inside the Mutations Advanced body');
  assert.match(src, /mutationProbs:\s*MUTATION_PROB_DEFAULTS/, 'DEFAULTS carries mutationProbs');
});

test('new option keys round-trip through DEFAULTS, getConfig and setConfig', () => {
  const workerSrc = fs.readFileSync(path.join(FE, 'js', 'randomizer-worker.cjs'), 'utf8');
  for (const key of ['gymsTypeChanged', 'e4TypeChanged', 'championTypeChangeChance', 'mutateStats', 'mutateAbilities', 'mutateTypes',
    'mutateLearnsets', 'mutationProbs', 'evoLevels', 'extraStarters', 'starterQuality', 'aquaTypes', 'magmaTypes', 'disableStevenTagBattle', 'nicknames']) {
    // defaults block + read (getConfig base) + restore (setConfig) + worker forwarding
    const occurrences = (src.match(new RegExp(key, 'g')) || []).length;
    assert.ok(occurrences >= 3, `${key} must appear in DEFAULTS, getConfig and setConfig (found ${occurrences})`);
    assert.match(workerSrc, new RegExp(key), `worker toModuleConfig must forward ${key}`);
  }
});

test('accordion has a responsive layer with finger-sized headers', () => {
  assert.match(componentsCss, /\.config-cat-header/, 'components.css must style the accordion header');
  const mobile = componentsCss.slice(componentsCss.search(/@media[^{]*max-width:\s*600px/));
  assert.match(mobile, /\.config-cat-header\s*\{\s*min-height:\s*44px/, 'mobile layer must give headers a 44px tap target');
});

// ── T-085 — Battle format (singles / doubles / mixed) + Run & Bun (ADR-014) ──────────────────

test('T-085: Battle format category renders three big boxes (singles default)', () => {
  assert.match(src, /data-cat="battle-format"/, 'Battle format category must exist');
  assert.match(src, /name="battle-format"[^>]*value="singles"[^>]*checked/, 'singles big box, checked by default');
  assert.match(src, /name="battle-format"[^>]*value="doubles"/, 'doubles big box');
  assert.match(src, /name="battle-format"[^>]*value="mixed"/, 'mixed big box');
  assert.match(src, /radio-card-group-3/, 'reuses the 3-up big-box layout');
});

test('T-085: Mixed reveals a run-panel box (like nuzlocke/soul-link) with % + Run & Bun', () => {
  // The % and Run & Bun controls live together in a single #mixed-panel box, shown only for the
  // 'mixed' format and styled like the nuzlocke / soul-link run-panels.
  assert.match(src, /id="mixed-panel"[^>]*class="run-panel/, '#mixed-panel is a run-panel box');
  assert.match(src, /id="singles-percent"[^>]*min="0"[^>]*max="100"/, 'singles-percent input 0–100 inside the box');
  assert.match(src, /id="league-runandbun"/, 'Run & Bun checkbox inside the box');
  assert.match(src, /id="league-runandbun-desc"/, 'a dynamic description span');
  // The whole box toggles on the 'mixed' format (not two loose rows).
  assert.match(src, /#mixed-panel'\)[^\n]*classList\.toggle\('hidden'/, 'the box is shown only for the mixed format');
});

test('T-146: Mixed has a "first half singles / second half doubles" checkbox (off by default) with help text', () => {
  assert.match(src, /id="mixed-sequential-split"/, 'the sequential-split checkbox is inside the mixed box');
  assert.match(src, /First half singles, second half doubles/, 'a clear label');
  assert.match(src, /single and double battles are mixed throughout/i, 'help text explains the off (default) behaviour');
  assert.match(src, /mixedSequentialSplit:\s*false/, 'default OFF');
});

test('T-085: battle-format keys round-trip through DEFAULTS/getConfig/setConfig and both engines', () => {
  const workerSrc = fs.readFileSync(path.join(FE, 'js', 'randomizer-worker.cjs'), 'utf8');
  const backendSrc = fs.readFileSync(path.join(FE, '..', 'backend', 'generator.js'), 'utf8');
  for (const key of ['battleFormat', 'singlesPercent', 'leagueRunAndBun', 'mixedSequentialSplit']) {
    const occurrences = (src.match(new RegExp(key, 'g')) || []).length;
    assert.ok(occurrences >= 3, `${key} must appear in DEFAULTS, getConfig and setConfig (found ${occurrences})`);
    assert.match(workerSrc, new RegExp(key), `browser worker toModuleConfig must forward ${key}`);
    assert.match(backendSrc, new RegExp(key), `backend generator toModuleConfig must forward ${key}`);
  }
  assert.match(src, /battleFormat:\s*'singles'/, 'default battle format is singles');
  assert.match(src, /singlesPercent:\s*60/, 'default singles percent is 60');
  assert.match(src, /leagueRunAndBun:\s*false/, 'run & bun default off');
});

test('T-085: runAndBunE4Split rounds %singles×4 and clamps to 1–3 (always one of each)', () => {
  assert.deepEqual(runAndBunE4Split(50),  { singles: 2, doubles: 2 });
  assert.deepEqual(runAndBunE4Split(60),  { singles: 2, doubles: 2 });   // round(2.4)=2
  assert.deepEqual(runAndBunE4Split(90),  { singles: 3, doubles: 1 });   // round(3.6)=4 → clamp 3
  assert.deepEqual(runAndBunE4Split(100), { singles: 3, doubles: 1 });   // clamped, never 4/0
  assert.deepEqual(runAndBunE4Split(0),   { singles: 1, doubles: 3 });   // clamped, never 0/4
  assert.deepEqual(runAndBunE4Split(75),  { singles: 3, doubles: 1 });   // round(3.0)=3
  assert.deepEqual(runAndBunE4Split(40),  { singles: 2, doubles: 2 });   // round(1.6)=2
});

// ── T-162 — Wild encounters (deterministic / classic) ───────────────────────────

test('T-162: Wild encounters category renders two boxes (deterministic default)', () => {
  assert.match(src, /data-cat="wild-encounters"/, 'Wild encounters category must exist');
  assert.match(src, /name="wild-encounter-type"[^>]*value="deterministic"[^>]*checked/, 'deterministic box, checked by default');
  assert.match(src, /name="wild-encounter-type"[^>]*value="classic"/, 'classic box');
  // Two-up layout: the base radio-card-group (not the -3 modifier) is a left/right pair.
  const idx = src.indexOf('data-cat="wild-encounters"');
  assert.match(src.slice(idx, idx + 900), /class="radio-card-group"/, 'two-box (2-up) layout for wild type');
});

test('T-162: Classic reveals a run-panel with the "Pokémon per zone" input (default 5, 1–12)', () => {
  assert.match(src, /id="wild-classic-panel"[^>]*class="run-panel/, '#wild-classic-panel is a run-panel box');
  // min 2: classic with 1 species/zone would just be Deterministic; max 12 = the land encounter-slot count.
  assert.match(src, /id="pokemon-per-zone"[^>]*value="5"[^>]*min="2"[^>]*max="12"/, 'pokemon-per-zone input default 5, range 2-12');
  assert.match(src, /#wild-classic-panel'\)[^\n]*classList\.toggle\('hidden'/, 'the box is shown only for the classic type');
});

test('T-162: wild-encounter keys round-trip through DEFAULTS/getConfig/setConfig and both engines', () => {
  const workerSrc = fs.readFileSync(path.join(FE, 'js', 'randomizer-worker.cjs'), 'utf8');
  const backendSrc = fs.readFileSync(path.join(FE, '..', 'backend', 'generator.js'), 'utf8');
  for (const key of ['wildEncounterType', 'pokemonPerZone']) {
    const occurrences = (src.match(new RegExp(key, 'g')) || []).length;
    assert.ok(occurrences >= 3, `${key} must appear in DEFAULTS, getConfig and setConfig (found ${occurrences})`);
    assert.match(workerSrc, new RegExp(key), `browser worker toModuleConfig must forward ${key}`);
    assert.match(backendSrc, new RegExp(key), `backend generator toModuleConfig must forward ${key}`);
  }
  assert.match(src, /wildEncounterType:\s*'deterministic'/, 'default deterministic');
  assert.match(src, /pokemonPerZone:\s*5/, 'default 5');
});

// ── T-163 — Docs visibility (per-element redaction of the generated docs) ─────────

test('T-163: Docs visibility category exists', () => {
  assert.match(src, /data-cat="docs-visibility"/, 'Docs visibility category must exist');
});

test('T-163: all trainer-visibility toggles present (incl. a 1–5 hide-count input)', () => {
  for (const id of ['show-trainers', 'show-bosses', 'show-non-bosses', 'show-held-items',
    'show-natures', 'show-moves', 'show-ability', 'show-rewards', 'show-ivs',
    'show-exact-positions', 'hide-pokemon', 'hide-pokemon-count']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing toggle #${id}`);
  }
  assert.match(src, /id="hide-pokemon-count"[^>]*min="1"[^>]*max="5"/, 'hide-pokemon-count input 1–5');
});

test('T-163: all wild-visibility toggles present', () => {
  for (const id of ['show-wild-encounters', 'show-legendary-static', 'show-non-legendary-static',
    'show-super-rod', 'show-dive', 'show-surf', 'show-good-rod', 'show-old-rod', 'show-grass']) {
    assert.match(src, new RegExp(`id="${id}"`), `missing toggle #${id}`);
  }
});

test('T-163: DEFAULTS carry a DOCS_VISIBILITY_DEFAULT with the documented defaults', () => {
  assert.match(src, /docsVisibility:\s*DOCS_VISIBILITY_DEFAULT/, 'DEFAULTS references DOCS_VISIBILITY_DEFAULT');
  const i = src.indexOf('DOCS_VISIBILITY_DEFAULT =');
  assert.ok(i > 0, 'the defaults constant must exist');
  const dvDef = src.slice(i, i + 900);
  for (const on of ['showTrainers', 'showBosses', 'showNonBosses', 'showHeldItems', 'showNatures',
    'showMoves', 'showAbility', 'showRewards', 'showWildEncounters', 'showLegendaryStatic',
    'showNonLegendaryStatic', 'showSuperRod', 'showDive', 'showSurf', 'showGoodRod', 'showOldRod', 'showGrass']) {
    assert.match(dvDef, new RegExp(`${on}:\\s*true`), `${on} must default true`);
  }
  assert.match(dvDef, /showIVs:\s*false/, 'showIVs defaults false');
  assert.match(dvDef, /showExactPositions:\s*false/, 'showExactPositions defaults false');
  assert.match(dvDef, /hidePokemon:\s*false/, 'hidePokemon defaults false');
  assert.match(dvDef, /hidePokemonCount:\s*1/, 'hidePokemonCount defaults 1');
});

test('T-163: docsVisibility round-trips via _read/_setDocsVisibility, migrates the legacy key, and forwards to both engines', () => {
  const workerSrc = fs.readFileSync(path.join(FE, 'js', 'randomizer-worker.cjs'), 'utf8');
  const backendSrc = fs.readFileSync(path.join(FE, '..', 'backend', 'generator.js'), 'utf8');
  assert.match(src, /_readDocsVisibility\s*\(\)\s*\{/, 'getConfig reads via _readDocsVisibility');
  assert.match(src, /_setDocsVisibility\s*\(/, 'setConfig restores via _setDocsVisibility');
  assert.match(src, /docsVisibility\s*=\s*this\._readDocsVisibility\(\)/, 'docsVisibility is read into the config');
  // Legacy top-level showExactPositions still honoured when a saved config predates the section.
  assert.match(src, /docsVisibility\?\.showExactPositions\s*\?\?\s*cfg\.showExactPositions/, 'legacy showExactPositions migrates');
  assert.match(workerSrc, /docsVisibility/, 'browser worker toModuleConfig must forward docsVisibility');
  assert.match(backendSrc, /docsVisibility/, 'backend generator toModuleConfig must forward docsVisibility');
});

// ── T-186 — Difficulty settings (non-boss quality, boss/non-boss team size & level modifiers) ──

test('T-186: Difficulty category exposes the non-boss quality slider + Advanced size/level controls', () => {
  const idx = src.indexOf('data-cat="difficulty"');
  assert.ok(idx > 0, 'Difficulty category must exist');
  const block = src.slice(idx, idx + 5000);
  assert.match(block, /id="difficultySlider"/, 'the general quality slider stays');
  assert.match(block, /id="nonBossQualitySlider"[^>]*min="-6"[^>]*max="0"[^>]*value="-2"/, 'non-boss quality slider -6..0 default -2');
  assert.match(block, /id="difficulty-advanced-toggle"/, 'Difficulty has a scoped Advanced toggle');
  assert.match(block, /id="difficulty-advanced-body"/, 'Difficulty has a scoped Advanced body');
  assert.match(block, /id="boss-team-size"[^>]*min="1"[^>]*max="6"/, 'boss team-size slider 1-6');
  assert.match(block, /id="non-boss-team-size"[^>]*min="1"[^>]*max="6"/, 'non-boss team-size slider 1-6');
  assert.match(block, /id="boss-level-modifier"/, 'boss level modifier input');
  assert.match(block, /id="non-boss-level-modifier"/, 'non-boss level modifier input');
});

test('T-186: difficulty-settings keys round-trip through DEFAULTS/getConfig/setConfig and both engines', () => {
  const workerSrc = fs.readFileSync(path.join(FE, 'js', 'randomizer-worker.cjs'), 'utf8');
  const backendSrc = fs.readFileSync(path.join(FE, '..', 'backend', 'generator.js'), 'utf8');
  for (const key of ['nonBossQuality', 'bossTeamSize', 'nonBossTeamSize', 'bossLevelModifier', 'nonBossLevelModifier']) {
    const occurrences = (src.match(new RegExp(key, 'g')) || []).length;
    assert.ok(occurrences >= 3, `${key} must appear in DEFAULTS, getConfig and setConfig (found ${occurrences})`);
    assert.match(workerSrc, new RegExp(key), `browser worker toModuleConfig must forward ${key}`);
    assert.match(backendSrc, new RegExp(key), `backend generator toModuleConfig must forward ${key}`);
  }
  assert.match(src, /nonBossQuality:\s*-2/, 'default non-boss quality -2');
  assert.match(src, /bossTeamSize:\s*6/, 'default boss team size 6');
  assert.match(src, /nonBossTeamSize:\s*6/, 'default non-boss team size 6');
  assert.match(src, /bossLevelModifier:\s*0/, 'default boss level modifier 0');
  assert.match(src, /nonBossLevelModifier:\s*0/, 'default non-boss level modifier 0');
});
