import { storageGet, storageSet } from './storage.js';
import { downloadConfig, readJsonFile, extractConfig, isFullBundle } from './session.js';
import { STARTER_NAME_POOLS } from './data/starterNames.js';

const STORAGE_KEY = 'lastConfig';

// T-068 — starter-nickname feature defaults. The default pools come from the SSOT data module; the
// single pool (used when "different per gender" is off) is the union of all three. Pools are stored as
// arrays in the config and shown newline-joined in the textareas.
const NICKNAME_SINGLE_DEFAULT = [...STARTER_NAME_POOLS.both, ...STARTER_NAME_POOLS.female, ...STARTER_NAME_POOLS.male];
const NICKNAMES_DEFAULT = {
    enabled: false,
    includeStarter: false,
    // T-070 — location-based auto-nicknames share this same feature/pools. `autoLocation` turns them on;
    // `lockGenderPerRoute` (only usable when autoLocation + differentPerGender) forces a route's gender.
    autoLocation: false,
    lockGenderPerRoute: false,
    sameNamesAcrossRuns: false,
    shareAcrossSoullink: true,
    differentPerGender: true,
    pools: {
        both: STARTER_NAME_POOLS.both.slice(),
        female: STARTER_NAME_POOLS.female.slice(),
        male: STARTER_NAME_POOLS.male.slice(),
        single: NICKNAME_SINGLE_DEFAULT.slice(),
    },
};

// T-052 — every tunable probability in the Pokémon-mutation algorithm (rebalancer.js). Surfaced in
// the Mutations → Advanced panel; each falls back to `def` (its historical constant) in the engine.
const MUTATION_PROB_FIELDS = [
    { key: 'statBalanceChance',            label: 'Stat change chance',        def: 0.7,  group: 'Stats',     hint: 'Per-stat chance to shift (diminishes after each change).' },
    { key: 'buffStatChance',               label: 'Buff vs nerf',              def: 0.6,  group: 'Stats',     hint: 'Chance a stat change is a buff (+) rather than a nerf (−).' },
    { key: 'repeatStatChance',             label: 'Extra ±10 step chance',     def: 0.5,  group: 'Stats',     hint: 'Chance to stack another ±10 onto a stat change.' },
    { key: 'typeBalanceChance',            label: 'Type change chance',        def: 0.1,  group: 'Types',     hint: 'Chance a Pokémon’s typing is touched at all.' },
    { key: 'monotypeBalanceChance',        label: 'Mono-type replace chance',  def: 0.1,  group: 'Types',     hint: 'For single-type mons: replace the type (otherwise add a 2nd).' },
    { key: 'abilityBalanceChance',         label: 'Ability swap chance',       def: 0.1,  group: 'Abilities', hint: 'Chance to swap one ability for another.' },
    { key: 'learnsetBalanceChance',        label: 'Random learnset pass',      def: 0.2,  group: 'Learnsets', hint: 'Chance to run the independent random move-swap pass.' },
    { key: 'changeTypeMoveFromOldChance',  label: 'Replace old-type move',     def: 0.9,  group: 'Learnsets', hint: 'After a type change, chance each old-type move is swapped to the new type.' },
    { key: 'changeTypeMoveFromOtherChance',label: 'Swap other move',           def: 0.05, group: 'Learnsets', hint: 'Per-move swap chance (type-add case and the random pass).' },
    { key: 'moveInsertChance',             label: 'Move insertion decay',      def: 0.5,  group: 'Learnsets', hint: 'Controls how many extra moves get inserted (chance = 1 − N×this).' },
    { key: 'moveRatingDeviation',          label: 'Insert level spread',       def: 0.2,  group: 'Learnsets', max: 2, percent: false, hint: 'Randomness of the level at which inserted moves are learned (a spread factor, not a %).' },
];
const MUTATION_PROB_DEFAULTS = Object.fromEntries(MUTATION_PROB_FIELDS.map(f => [f.key, f.def]));

function mutationProbInputs() {
    let html = '';
    let lastGroup = null;
    for (const f of MUTATION_PROB_FIELDS) {
        if (f.group !== lastGroup) { html += `<div class="section-title" style="margin-top:8px">${f.group}</div>`; lastGroup = f.group; }
        // T-187 — probabilities are shown as whole percents (0–100) for consistency with the rest of the
        // form; the stored config value stays a 0..1 fraction (see _read/_setMutationProbs). Non-percent
        // fields (e.g. the spread factor) keep their raw 0..max scale.
        const isPercent = f.percent !== false;
        const max = isPercent ? 100 : (f.max || 1);
        const step = isPercent ? 1 : 0.05;
        const value = isPercent ? Math.round(f.def * 100) : f.def;
        const defLabel = isPercent ? `${Math.round(f.def * 100)}%` : f.def;
        html += `
      <div class="field">
        <label for="mutprob-${f.key}">${f.label}</label>
        <input type="number" id="mutprob-${f.key}" class="input" min="0" max="${max}" step="${step}" value="${value}" style="width:100px">
        <span class="field-hint">${f.hint} Default ${defLabel}.</span>
      </div>`;
    }
    return html;
}

// T-052 — Evolution-level tuning. Tier tables mirror randomizer/constants.js
// (EVO_LEVEL_BASE_RANGES / EVO_LEVEL_PRE_EVO_MODIFIERS); scalars mirror MIN/MAX/DEVIATION and the
// three stage adjustments. Whole tables live under the Evolution → Advanced panel.
const EVO_BASE_RANGE_TIERS = [
    ['MAGIKARP', 7, 9], ['ZU', 10, 11], ['PU', 12, 13], ['NU', 14, 19], ['RU', 20, 28],
    ['UU', 29, 35], ['OU', 39, 48], ['UBERS', 49, 56], ['LEGEND', 57, 62], ['AG', 63, 75],
];
const EVO_PREEVO_MOD_TIERS = [
    ['MAGIKARP', -0.20, -0.16], ['ZU', -0.15, -0.11], ['PU', -0.10, -0.06], ['NU', -0.05, 0.00],
    ['RU', 0.01, 0.05], ['UU', 0.06, 0.10], ['OU', 0.11, 0.20], ['UBERS', 0.21, 0.40], ['AG', 0.41, 0.60],
];
const EVO_LEVELS_DEFAULT = {
    enabled: true, min: 5, max: 65, deviation: 0.05,
    stageAdjustments: { lcOf2: 0, lcOf3: -0.10, nfeOf3: 0.10 },
    baseRanges: Object.fromEntries(EVO_BASE_RANGE_TIERS.map(([t, a, b]) => [t, [a, b]])),
    preEvoModifiers: Object.fromEntries(EVO_PREEVO_MOD_TIERS.map(([t, a, b]) => [t, [a, b]])),
};
function evoTierRows(prefix, tiers, step, min, max) {
    // T-081 — carry min/max onto every tier input so the generic number-field clamp validates them
    // (base ranges are levels ≥ 1; pre-evo modifiers are fractions in [-1, 1]).
    const bounds = (min !== undefined ? ` min="${min}"` : '') + (max !== undefined ? ` max="${max}"` : '');
    return tiers.map(([tier, lo, hi]) => `
        <div class="evo-tier-row">
          <span class="evo-tier-name">${tier}</span>
          <input type="number" id="${prefix}-${tier}-min" class="input" step="${step}"${bounds} value="${lo}">
          <input type="number" id="${prefix}-${tier}-max" class="input" step="${step}"${bounds} value="${hi}">
        </div>`).join('');
}

// T-052 — extra-starter categories. Each slot: { tier, kind:'line'|'solo', lineLength:'any'|'3'|'2' }.
// Mirrors randomizer/modules/wildModule.js DEFAULT_EXTRA_STARTER_PRESET (default = today's 9).
const EXTRA_STARTER_TIER_OPTIONS = ['LEGEND', 'UBERS', 'OU', 'UU', 'RU', 'NU', 'PU'];
const EXTRA_STARTER_DEFAULT_PRESET = [
    { tier: 'UBERS', kind: 'line', lineLength: '3' },
    { tier: 'OU', kind: 'line', lineLength: '3' },
    { tier: 'UU', kind: 'line', lineLength: 'any' },
    { tier: 'NU', kind: 'solo', lineLength: 'any' },
    { tier: 'RU', kind: 'line', lineLength: 'any' },
    { tier: 'RU', kind: 'line', lineLength: 'any' },
    { tier: 'RU', kind: 'line', lineLength: 'any' },
    { tier: 'RU', kind: 'line', lineLength: 'any' },
    { tier: 'RU', kind: 'line', lineLength: 'any' },
];
function normalizeStarterSpec(s) {
    s = s || {};
    return {
        tier: EXTRA_STARTER_TIER_OPTIONS.includes(s.tier) ? s.tier : 'RU',
        kind: s.kind === 'solo' ? 'solo' : 'line',
        lineLength: s.lineLength === '3' ? '3' : s.lineLength === '2' ? '2' : 'any',
    };
}
function starterRowHtml(spec, idx) {
    const tierOpts = EXTRA_STARTER_TIER_OPTIONS
        .map(t => `<option value="${t}"${t === spec.tier ? ' selected' : ''}>${t}</option>`).join('');
    const isSolo = spec.kind === 'solo';
    const lenOpts = [['any', 'Any length'], ['3', '3-stage'], ['2', '2-stage']]
        .map(([v, l]) => `<option value="${v}"${v === spec.lineLength ? ' selected' : ''}>${l}</option>`).join('');
    return `<div class="starter-row" data-idx="${idx}">
      <select class="input starter-tier" aria-label="Best-evolution tier">${tierOpts}</select>
      <select class="input starter-kind" aria-label="Category kind"><option value="line"${!isSolo ? ' selected' : ''}>Evolving line</option><option value="solo"${isSolo ? ' selected' : ''}>Standalone</option></select>
      <select class="input starter-length" aria-label="Line length"${isSolo ? ' disabled' : ''}>${lenOpts}</select>
      <button type="button" class="btn btn-ghost btn-sm starter-remove" aria-label="Remove this slot">✕</button>
    </div>`;
}

// T-073 — Shop item prices. Applied at ROM-build time (patches src/data/items.h). MIRRORS
// randomizer/itemPriceWriter.js ITEM_PRICE_DEFAULTS — keep the two in sync. TMs are priced by the
// randomizer's move POOL (power tier), not individually.
const PRICE_DEFAULTS = {
    balls: { ultra: 10, quick: 10, timer: 10 },
    mints: {
        LONELY: 250, NAUGHTY: 250, BRAVE: 250, LAX: 250, MILD: 250,
        RASH: 250, QUIET: 250, GENTLE: 250, HASTY: 250, NAIVE: 250,
        BOLD: 2000, IMPISH: 2000, CALM: 2000, CAREFUL: 2000, RELAXED: 2000, SASSY: 2000,
        ADAMANT: 3000, MODEST: 3000, TIMID: 3000, JOLLY: 3000,
    },
    abilityCapsule: 3000,
    abilityPatch: 5000,
    tms: {
        avgDmg: 2500, avgStatus: 2500, goodDmg: 5000, goodStatus: 5000,
        niche: 3000, weather: 3000, barriers: 3000,
        strongDmg: 10000, godlikeDmg: 15000, godlikeStatus: 15000,
    },
};
// Display order for the 20 shop mints (grouped by current price).
const MINT_PRICE_NAMES = [
    'LONELY', 'NAUGHTY', 'BRAVE', 'LAX', 'MILD', 'RASH', 'QUIET', 'GENTLE', 'HASTY', 'NAIVE',
    'BOLD', 'IMPISH', 'CALM', 'CAREFUL', 'RELAXED', 'SASSY', 'ADAMANT', 'MODEST', 'TIMID', 'JOLLY',
];
// TM pool key → human label (with slot range from randomizer/docs/tms.md).
const TM_POOL_LABELS = [
    ['avgDmg', 'Average damage (TM01–10)'],
    ['goodDmg', 'Good damage (TM11–30)'],
    ['strongDmg', 'Strong damage (TM31–50)'],
    ['godlikeDmg', 'Top-tier damage (TM51–56)'],
    ['niche', 'Niche (TM57–60)'],
    ['avgStatus', 'Average status (TM61–71)'],
    ['weather', 'Weather (TM72–75)'],
    ['barriers', 'Screens / hazards (TM76–77)'],
    ['goodStatus', 'Good status (TM78–90)'],
    ['godlikeStatus', 'Top-tier status (TM91–95)'],
];
const _prettyMint = (n) => n[0] + n.slice(1).toLowerCase();
function priceCell(id, label, value) {
    return `<label class="price-cell" for="${id}" style="display:flex;flex-direction:column;gap:3px;font-size:0.82em">
      <span>${label}</span>
      <input type="number" id="${id}" class="input" min="0" step="10" value="${value}">
    </label>`;
}
function priceGrid(cells) {
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">${cells.join('')}</div>`;
}
function shopPricesBlock() {
    const D = PRICE_DEFAULTS;
    const sub = (t) => `<strong style="font-size:0.85em;opacity:0.85">${t}</strong>`;
    const balls = priceGrid([
        priceCell('price-ball-ultra', 'Ultra Ball', D.balls.ultra),
        priceCell('price-ball-quick', 'Quick Ball', D.balls.quick),
        priceCell('price-ball-timer', 'Timer Ball', D.balls.timer),
    ]);
    const mints = priceGrid(MINT_PRICE_NAMES.map(n => priceCell(`price-mint-${n}`, _prettyMint(n), D.mints[n])));
    const ability = priceGrid([
        priceCell('price-ability-capsule', 'Ability Capsule', D.abilityCapsule),
        priceCell('price-ability-patch', 'Ability Patch', D.abilityPatch),
    ]);
    const tms = priceGrid(TM_POOL_LABELS.map(([k, l]) => priceCell(`price-tm-${k}`, l, D.tms[k])));
    return `<div id="shop-prices" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:16px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;flex-direction:column;gap:4px">
        <strong style="font-size:0.95em">Shop prices</strong>
        <span class="field-hint">Buy prices for the items sold in Marts. Applied at ROM-build time (patches src/data/items.h); defaults match the current game.</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">${sub('Poké Balls')}${balls}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${sub('Mints')}${mints}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${sub('Ability items')}${ability}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${sub('TMs by category')}<span class="field-hint" style="margin:0">Priced by the randomizer's move pool (power tier), not per TM.</span>${tms}</div>
    </div>`;
}

// T-163 — Docs visibility. Each toggle redacts what the generated docs reveal; redaction is baked at
// generation time (randomizer/writerDocs.js), following the showExactPositions precedent. All-true
// with showIVs / hidePokemon / showExactPositions false reproduces today's docs exactly.
const DOCS_VISIBILITY_DEFAULT = {
    // Trainers tab
    showTrainers: true,
    showBosses: true,
    showNonBosses: true,
    showHeldItems: true,
    showNatures: true,
    showMoves: true,
    showAbility: true,
    showRewards: true,
    showIVs: false,
    showExactPositions: false,   // migrated out of the old "General" category
    hidePokemon: false,
    hidePokemonCount: 1,         // 1..5, only meaningful when hidePokemon is on
    // Encounters tab (+ Mail inbox, for the static toggles)
    showWildEncounters: true,
    showLegendaryStatic: true,
    showNonLegendaryStatic: true,
    showSuperRod: true,
    showDive: true,
    showSurf: true,
    showGoodRod: true,
    showOldRod: true,
    showGrass: true,
};

// [checkbox id, config key] for every docs-visibility boolean toggle (drives _read/_setDocsVisibility
// and the event wiring). hidePokemonCount (a number input) is handled separately.
const DOCS_VISIBILITY_TOGGLES = [
    ['show-trainers', 'showTrainers'], ['show-bosses', 'showBosses'], ['show-non-bosses', 'showNonBosses'],
    ['show-held-items', 'showHeldItems'], ['show-natures', 'showNatures'], ['show-moves', 'showMoves'],
    ['show-ability', 'showAbility'], ['show-rewards', 'showRewards'], ['show-ivs', 'showIVs'],
    ['show-exact-positions', 'showExactPositions'], ['hide-pokemon', 'hidePokemon'],
    ['show-wild-encounters', 'showWildEncounters'], ['show-legendary-static', 'showLegendaryStatic'],
    ['show-non-legendary-static', 'showNonLegendaryStatic'], ['show-super-rod', 'showSuperRod'],
    ['show-dive', 'showDive'], ['show-surf', 'showSurf'], ['show-good-rod', 'showGoodRod'],
    ['show-old-rod', 'showOldRod'], ['show-grass', 'showGrass'],
];

const DEFAULTS = {
    runType: 'default',
    // T-085/ADR-014 — global battle format (singles | doubles | mixed). singlesPercent (% of single
    // battles) and leagueRunAndBun only apply to 'mixed'.
    battleFormat: 'singles',
    singlesPercent: 60,
    leagueRunAndBun: false,
    mixedSequentialSplit: false,   // T-146/ADR-018 — first half singles / second half doubles (mixed only)
    // T-162 — wild encounters. 'deterministic' = 1 predictable species per zone; 'classic' = several
    // per zone (random which you meet). pokemonPerZone only applies to 'classic'.
    wildEncounterType: 'deterministic',
    pokemonPerZone: 5,
    difficulty: 7,
    // T-186 — difficulty settings. nonBossQuality: quality steps a non-boss sits below its split's fair
    // boss (default −2 = today's behaviour, range −6..0). boss/nonBossTeamSize: cap each team to 1–6,
    // dropping the weakest (default 6 = no trim). boss/nonBossLevelModifier: shift boss / non-boss trainer
    // levels vs the cap (default 0, may be negative). All defaults reproduce the previous ROM.
    nonBossQuality: -2,
    bossTeamSize: 6,
    nonBossTeamSize: 6,
    bossLevelModifier: 0,
    nonBossLevelModifier: 0,
    rebalance: true,
    balanceChance: 0.2,
    // T-052 — Pokémon mutation category toggles (only apply when rebalance is on)
    mutateStats: true,
    mutateAbilities: true,
    mutateTypes: true,
    mutateLearnsets: true,
    mutationProbs: MUTATION_PROB_DEFAULTS,
    // T-187 — move mutation (opt-in; off by default). Stored as 0..1 probabilities; the UI shows whole
    // percents. When off, no move RNG is drawn and the run is identical to before.
    mutateMoves: false,
    moveMutationChance: 0.10,
    // Per-field toggles (basic) — which fields may change; the per-field chances (advanced) are below.
    mutatePower: true,
    mutateAccuracy: true,
    mutateType: true,
    mutateCategory: true,
    movePowerChance: 0.70,
    moveAccuracyChance: 0.50,
    moveTypeChance: 0.10,
    moveCategoryChance: 0.10,
    evoLevels: EVO_LEVELS_DEFAULT,
    // T-052 — Rewards (money). Applied at ROM-build time (patches src/battle_script_commands.c).
    money: { normal: 250, boss: 3000, gym: 5000 },
    // T-073 — Shop item prices. Applied at ROM-build time (patches src/data/items.h).
    prices: PRICE_DEFAULTS,
    // T-167 — Move relearn price. Applied at ROM-build time (patches src/move_relearner.c). 0 = always free.
    moveRelearnPrice: 250,
    // T-072 — quality tier for the 3 main starters (same vocabulary as extra starters).
    // Default UU reproduces the historical hardcoded behaviour (3-stage LC line peaking at UU).
    starterQuality: 'UU',
    // T-052 — extra-starter category list (unlimited; default = today's 9)
    extraStarters: EXTRA_STARTER_DEFAULT_PRESET,
    seed: '',
    universeSeed: '',   // T-189 — shared-world seed (nuzlocke/soul-link); blank derives from seed

    // T-163 — docs-visibility toggles (see DOCS_VISIBILITY_DEFAULT).
    docsVisibility: DOCS_VISIBILITY_DEFAULT,
    // T-052 — Trainers & bosses
    gymsTypeChanged: 2,   // 0..8 gym leaders get a randomized type theme
    e4TypeChanged: 2,     // 0..4 Elite Four members get a randomized type theme
    championTypeChangeChance: 0.05, // T-076 — probability the champion (Steven) gets a randomized type
    aquaTypes: ['WATER', 'DARK', 'POISON', 'ICE', 'RANDOM'],   // main, secondary, other 1..3
    magmaTypes: ['FIRE', 'GROUND', 'ROCK', 'GRASS', 'RANDOM'],
    disableStevenTagBattle: false, // T-165 — Mossdeep tag battle → solo Tabitha boss when on
    // T-068/T-070 — nicknames (starters + location-based), default OFF
    nicknames: NICKNAMES_DEFAULT,
};

// T-052 — the 18 Pokémon types plus the RANDOM token, and the 5 evil-team slot labels. Used to
// render the reusable Team Aqua / Team Magma type-selector component.
const POKEMON_TYPE_LIST = [
    'NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
    'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY',
];
const TEAM_TYPE_SLOTS = ['Main type', 'Secondary type', 'Other type 1', 'Other type 2', 'Other type 3'];

function typeSelectOptions(selected) {
    const entries = [['RANDOM', 'Random'], ...POKEMON_TYPE_LIST.map(t => [t, t[0] + t.slice(1).toLowerCase()])];
    return entries.map(([v, l]) => `<option value="${v}"${v === selected ? ' selected' : ''}>${l}</option>`).join('');
}

function teamTypeSelectors(prefix, defaults) {
    return TEAM_TYPE_SLOTS.map((label, i) => `
      <div class="type-slot">
        <label for="${prefix}-type-${i}">${label}</label>
        <select id="${prefix}-type-${i}" class="input type-select">${typeSelectOptions(defaults[i])}</select>
      </div>`).join('');
}

function getDifficultyDesc(level) {
    const n = Math.abs(level - 7);
    if (level === 7) return 'In fair difficulty, trainers are expected to have access to the same quality of Pokémon the player has access to.';
    const dir = level < 7 ? 'below' : 'above';
    return `Each trainer will have ${n} Pokémon ${dir} the player's expected team quality.`;
}

// T-186 — non-boss quality modifier: how many quality steps an ordinary trainer sits below its area's
// boss (0 = same quality as the boss; −2 is the historical default).
function getNonBossQualityDesc(modifier) {
    const m = Number(modifier);
    if (m === 0) return 'Ordinary trainers use the same Pokémon quality as their area’s boss.';
    const n = Math.abs(m);
    return `Ordinary trainers use Pokémon ${n} quality step${n === 1 ? '' : 's'} below their area’s boss.`;
}

// T-081 — clamp a raw numeric field value into [min,max]. Returns the clamped Number, or null when
// the value is blank / non-numeric (those are left untouched — e.g. a blank seed means "random").
// min/max may be '' | null | undefined to mean "unbounded on that side". Exported for unit testing.
export function clampToRange(raw, min, max) {
    if (raw === '' || raw === null || raw === undefined) return null;
    const n = typeof raw === 'number' ? raw : parseFloat(raw);
    if (Number.isNaN(n)) return null;
    let out = n;
    if (min !== '' && min !== null && min !== undefined && Number.isFinite(Number(min))) out = Math.max(Number(min), out);
    if (max !== '' && max !== null && max !== undefined && Number.isFinite(Number(max))) out = Math.min(Number(max), out);
    return out;
}

// T-085/ADR-014 — Run & Bun ingame Elite Four split: round(%singles × 4) clamped to 1–3, so the
// player is always offered at least one singles and one doubles E4 fight. Pure + exported for tests.
export function runAndBunE4Split(singlesPercent) {
    const total = 4;
    const pct = Number.isFinite(Number(singlesPercent)) ? Number(singlesPercent) : 60;
    const singles = Math.max(1, Math.min(total - 1, Math.round((pct / 100) * total)));
    return { singles, doubles: total - singles };
}

// T-172 — the fast-queue limit, mirrored from the backend SSOT (`FAST_MAX_ROMS` in
// backend/queue/scheduler.js). The browser can't import backend ESM, so this is a copy kept honest by a
// drift-guard test (__tests__/slow-queue-warning.test.js) that fails if the two ever diverge. Used only
// for the config-time UX hint below; the backend `classify` remains the authority on queue placement.
export const FAST_QUEUE_MAX_ROMS = 2;

// Total ROMs a config would build — the single home of this computation (default = 1, nuzlocke = the
// chosen count, soul-link = players × ROMs-per-player). Undefined fields fall back to 1 so a
// partially-built config never yields NaN. Pure + exported for tests (and reused by app.js's summary).
export function totalRoms(cfg = {}) {
    if (!cfg) return 1;
    if (cfg.runType === 'nuzlocke') return Number(cfg.numROMs) || 1;
    if (cfg.runType === 'soullink') return (Number(cfg.numPlayers) || 1) * (Number(cfg.romsPerPlayer) || 1);
    return 1; // default (or unknown) run type is always a single ROM
}

// Whether a config's ROM count would land the build in the slow queue, and the numbers behind it.
// `show` is true only strictly above the fast-queue limit (matching backend `classify`: <= limit → fast).
export function slowQueueWarning(cfg, fastMax = FAST_QUEUE_MAX_ROMS) {
    const total = totalRoms(cfg);
    return { show: total > fastMax, total, fastMax };
}

// The user-facing warning copy. Names the chosen total and the fast-queue limit, and states the build
// goes to the slow queue. Centralised (one wording) and pure/exported for tests.
export function slowQueueMessage(total, fastMax) {
    return `This run builds ${total} ROMs, over the fast-queue limit of ${fastMax}. `
        + `It will go to the slow queue behind smaller builds, so it may take noticeably longer to finish.`;
}

export class ConfigForm {
    constructor(containerEl, { onConfigChange, onRegenerateBundle } = {}) {
        this.container = containerEl;
        this.onConfigChange = onConfigChange ?? (() => {});
        // T-190 — invoked with a full uploaded bundle to rebuild it as-is (bypasses the randomizer).
        this.onRegenerateBundle = onRegenerateBundle ?? (() => {});
        this._build();
        this._restore();
        this._wireEvents();
    }

    /** Returns the current validated config object, or null if invalid. */
    getConfig() {
        const runType = this._q('input[name="run-type"]:checked')?.value ?? 'default';
        // T-085/ADR-014 — battle format + mixed-only proportion / Run & Bun.
        const battleFormat = this._q('input[name="battle-format"]:checked')?.value ?? 'singles';
        const singlesPercent = this._intField('#singles-percent', 60, 0, 100);
        const leagueRunAndBun = this._q('#league-runandbun')?.checked === true;
        const mixedSequentialSplit = this._q('#mixed-sequential-split')?.checked === true;   // T-146/ADR-018
        // T-162 — wild encounters.
        const wildEncounterType = this._q('input[name="wild-encounter-type"]:checked')?.value ?? 'deterministic';
        const pokemonPerZone = this._intField('#pokemon-per-zone', 5, 2, 12);
        const difficulty = parseInt(this._q('#difficultySlider')?.value ?? '7', 10);
        // T-186 — difficulty settings.
        const nonBossQuality = this._intField('#nonBossQualitySlider', -2, -6, 0);
        const bossTeamSize = this._intField('#boss-team-size', 6, 1, 6);
        const nonBossTeamSize = this._intField('#non-boss-team-size', 6, 1, 6);
        const bossLevelModifier = this._intField('#boss-level-modifier', 0, -30, 30);
        const nonBossLevelModifier = this._intField('#non-boss-level-modifier', 0, -30, 30);
        const rebalance = this._q('#rebalance').checked;
        const balanceChance = rebalance
            ? Math.round(parseInt(this._q('#balance-chance').value, 10)) / 100
            : 0.2;
        const seedRaw = this._q('#seed').value.trim();
        const seed = seedRaw === '' ? null : parseInt(seedRaw, 10);

        if (seed !== null && (isNaN(seed) || !Number.isInteger(seed))) return null;

        // T-189 — optional universe (shared-world) seed; blank ⇒ null ⇒ engine derives it from seed.
        const universeSeedRaw = this._q('#universe-seed').value.trim();
        const universeSeed = universeSeedRaw === '' ? null : parseInt(universeSeedRaw, 10);
        if (universeSeed !== null && (isNaN(universeSeed) || !Number.isInteger(universeSeed))) return null;

        const docsVisibility = this._readDocsVisibility();   // T-163
        const mutateStats = this._q('#mutate-stats').checked;
        const mutateAbilities = this._q('#mutate-abilities').checked;
        const mutateTypes = this._q('#mutate-types').checked;
        const mutateLearnsets = this._q('#mutate-learnsets').checked;
        const mutationProbs = this._readMutationProbs();
        // T-187 — move mutation. Percentages (0–100) in the UI, stored as 0..1. Read unconditionally
        // (harmless when off); the pipeline ignores them unless mutateMoves is true.
        const mutateMoves = this._q('#mutate-moves').checked;
        const moveMutationChance = mutateMoves
            ? Math.round(parseInt(this._q('#move-mutation-chance').value, 10)) / 100
            : 0.10;
        const mutatePower = this._q('#mutate-power').checked;
        const mutateAccuracy = this._q('#mutate-accuracy').checked;
        const mutateType = this._q('#mutate-type').checked;
        const mutateCategory = this._q('#mutate-category').checked;
        const movePowerChance = this._intField('#move-power-chance', 70, 0, 100) / 100;
        const moveAccuracyChance = this._intField('#move-accuracy-chance', 50, 0, 100) / 100;
        const moveTypeChance = this._intField('#move-type-chance', 10, 0, 100) / 100;
        const moveCategoryChance = this._intField('#move-category-chance', 10, 0, 100) / 100;
        const evoLevels = this._readEvoLevels();
        const money = {
            normal: this._intField('#reward-normal', 250, 0, 999999),
            boss: this._intField('#reward-boss', 3000, 0, 999999),
            gym: this._intField('#reward-gym', 5000, 0, 999999),
        };
        const moveRelearnPrice = this._intField('#reward-relearn', 250, 0, 999999); // T-167
        const gymsTypeChanged = this._intField('#gyms-type-changed', 2, 0, 8);
        const e4TypeChanged = this._intField('#e4-type-changed', 2, 0, 4);
        // T-076 — champion type-change probability, exposed as a percentage (0–100 → 0..1).
        const championTypeChangeChance = this._intField('#champion-type-change-pct', 5, 0, 100) / 100;
        const aquaTypes = this._readTeamTypes('aqua');
        const magmaTypes = this._readTeamTypes('magma');
        const disableStevenTagBattle = this._q('#disable-steven-tag-battle')?.checked === true; // T-165
        const extraStarters = (this._starterSpecs || []).map(s => ({ ...s }));
        const starterQualityRaw = (this._q('#starter-quality') || {}).value;
        const starterQuality = EXTRA_STARTER_TIER_OPTIONS.includes(starterQualityRaw) ? starterQualityRaw : 'UU';
        const nicknames = this._readNicknames();
        const prices = this._readPrices();
        const base = { runType, battleFormat, singlesPercent, leagueRunAndBun, mixedSequentialSplit, wildEncounterType, pokemonPerZone, difficulty,
            nonBossQuality, bossTeamSize, nonBossTeamSize, bossLevelModifier, nonBossLevelModifier, rebalance, balanceChance,
            mutateStats, mutateAbilities, mutateTypes, mutateLearnsets, mutationProbs,
            mutateMoves, moveMutationChance, mutatePower, mutateAccuracy, mutateType, mutateCategory,
            movePowerChance, moveAccuracyChance, moveTypeChance, moveCategoryChance, evoLevels,
            money, prices, moveRelearnPrice, starterQuality, extraStarters, seed, universeSeed, docsVisibility, gymsTypeChanged, e4TypeChanged, championTypeChangeChance, aquaTypes, magmaTypes, disableStevenTagBattle, nicknames };

        if (runType === 'nuzlocke') {
            // T-081 — clamp to the field's documented range (matches the input's min/max) so a
            // negative or absurd count can never reach the pipeline.
            const numROMs = this._intField('#nz-numroms', 3, 2, 10);
            const shared = {
                pokedex:  this._q('#nz-share-pokedex').checked,
                trainers: this._q('#nz-share-trainers').checked,
                starters: this._q('#nz-share-starters').checked,
            };
            return { ...base, numROMs, shared };
        }

        if (runType === 'soullink') {
            // T-081 — clamp to each field's documented range (matches the inputs' min/max).
            const numPlayers    = this._intField('#sl-numplayers', 2, 2, 8);
            const romsPerPlayer = this._intField('#sl-roms-per-player', 2, 1, 10);
            const playerShared = {
                pokedex:  this._q('#sl-player-share-pokedex').checked,
                trainers: this._q('#sl-player-share-trainers').checked,
                starters: this._q('#sl-player-share-starters').checked,
            };
            const romShared = {
                pokedex:  this._q('#sl-rom-share-pokedex').checked,
                trainers: this._q('#sl-rom-share-trainers').checked,
                starters: this._q('#sl-rom-share-starters').checked,
            };
            return { ...base, numPlayers, romsPerPlayer, playerShared, romShared };
        }

        return base;
    }

    /** Populate the form from a config object (e.g. from localStorage or upload). */
    setConfig(cfg) {
        if (cfg.sharedModules !== undefined && cfg.runType === undefined) {
            cfg = this._convertLegacy(cfg);
        }

        const runType = cfg.runType ?? 'default';
        const radio = this._q(`input[name="run-type"][value="${runType}"]`);
        if (radio) radio.checked = true;

        // T-085/ADR-014 — battle format + mixed-only proportion / Run & Bun.
        const bf = this._q(`input[name="battle-format"][value="${cfg.battleFormat ?? 'singles'}"]`);
        if (bf) bf.checked = true;
        const sp = this._q('#singles-percent'); if (sp) sp.value = cfg.singlesPercent ?? 60;
        const rb = this._q('#league-runandbun'); if (rb) rb.checked = cfg.leagueRunAndBun === true;
        const ms = this._q('#mixed-sequential-split'); if (ms) ms.checked = cfg.mixedSequentialSplit === true;   // T-146

        // T-162 — wild encounters.
        const wet = this._q(`input[name="wild-encounter-type"][value="${cfg.wildEncounterType ?? 'deterministic'}"]`);
        if (wet) wet.checked = true;
        const ppz = this._q('#pokemon-per-zone'); if (ppz) ppz.value = cfg.pokemonPerZone ?? 5;

        const slider = this._q('#difficultySlider');
        if (slider) slider.value = cfg.difficulty ?? 7;
        // T-186 — difficulty settings.
        const nbq = this._q('#nonBossQualitySlider'); if (nbq) nbq.value = cfg.nonBossQuality ?? -2;
        const bts = this._q('#boss-team-size'); if (bts) bts.value = cfg.bossTeamSize ?? 6;
        const nbts = this._q('#non-boss-team-size'); if (nbts) nbts.value = cfg.nonBossTeamSize ?? 6;
        const blm = this._q('#boss-level-modifier'); if (blm) blm.value = cfg.bossLevelModifier ?? 0;
        const nblm = this._q('#non-boss-level-modifier'); if (nblm) nblm.value = cfg.nonBossLevelModifier ?? 0;

        this._q('#rebalance').checked = cfg.rebalance !== false;
        this._q('#balance-chance').value = Math.round((cfg.balanceChance ?? 0.2) * 100);
        this._q('#mutate-stats').checked = cfg.mutateStats !== false;
        this._q('#mutate-abilities').checked = cfg.mutateAbilities !== false;
        this._q('#mutate-types').checked = cfg.mutateTypes !== false;
        this._q('#mutate-learnsets').checked = cfg.mutateLearnsets !== false;
        this._setMutationProbs(cfg.mutationProbs);
        // T-187 — move mutation
        this._q('#mutate-moves').checked = cfg.mutateMoves === true;
        this._q('#move-mutation-chance').value = Math.round((cfg.moveMutationChance ?? 0.10) * 100);
        this._q('#mutate-power').checked = cfg.mutatePower !== false;
        this._q('#mutate-accuracy').checked = cfg.mutateAccuracy !== false;
        this._q('#mutate-type').checked = cfg.mutateType !== false;
        this._q('#mutate-category').checked = cfg.mutateCategory !== false;
        this._q('#move-power-chance').value = Math.round((cfg.movePowerChance ?? 0.70) * 100);
        this._q('#move-accuracy-chance').value = Math.round((cfg.moveAccuracyChance ?? 0.50) * 100);
        this._q('#move-type-chance').value = Math.round((cfg.moveTypeChance ?? 0.10) * 100);
        this._q('#move-category-chance').value = Math.round((cfg.moveCategoryChance ?? 0.10) * 100);
        this._setEvoLevels(cfg.evoLevels);
        const money = cfg.money || {};
        this._q('#reward-normal').value = money.normal ?? 250;
        this._q('#reward-boss').value = money.boss ?? 3000;
        this._q('#reward-gym').value = money.gym ?? 5000;
        this._q('#reward-relearn').value = cfg.moveRelearnPrice ?? 250; // T-167
        this._setPrices(cfg.prices);
        const sq = this._q('#starter-quality');
        if (sq) sq.value = EXTRA_STARTER_TIER_OPTIONS.includes(cfg.starterQuality) ? cfg.starterQuality : 'UU';
        this._starterSpecs = (cfg.extraStarters || EXTRA_STARTER_DEFAULT_PRESET).map(normalizeStarterSpec);
        this._renderStarterList();
        this._q('#seed').value = cfg.seed != null ? String(cfg.seed) : '';
        this._q('#universe-seed').value = cfg.universeSeed != null ? String(cfg.universeSeed) : '';
        this._setDocsVisibility(cfg);   // T-163
        this._q('#gyms-type-changed').value = cfg.gymsTypeChanged ?? 2;
        this._q('#e4-type-changed').value = cfg.e4TypeChanged ?? 2;
        // T-076 — stored as a 0..1 probability; surfaced as a whole-percent input.
        this._q('#champion-type-change-pct').value = Math.round((cfg.championTypeChangeChance ?? 0.05) * 100);
        this._setTeamTypes('aqua', cfg.aquaTypes ?? DEFAULTS.aquaTypes);
        this._setTeamTypes('magma', cfg.magmaTypes ?? DEFAULTS.magmaTypes);
        const dstb = this._q('#disable-steven-tag-battle'); if (dstb) dstb.checked = cfg.disableStevenTagBattle === true; // T-165
        this._setNicknames(cfg.nicknames);

        if (runType === 'nuzlocke') {
            this._q('#nz-numroms').value = cfg.numROMs ?? 3;
            const sh = cfg.shared ?? { pokedex: true, trainers: true, starters: true };
            this._q('#nz-share-pokedex').checked = sh.pokedex !== false;
            this._q('#nz-share-trainers').checked = sh.trainers !== false;
            this._q('#nz-share-starters').checked = sh.starters !== false;
        }

        if (runType === 'soullink') {
            this._q('#sl-numplayers').value = cfg.numPlayers ?? 2;
            this._q('#sl-roms-per-player').value = cfg.romsPerPlayer ?? 2;
            const ps = cfg.playerShared ?? { pokedex: true, trainers: true, starters: false };
            const rs = cfg.romShared ?? { pokedex: true, trainers: true, starters: true };
            this._q('#sl-player-share-pokedex').checked = ps.pokedex !== false;
            this._q('#sl-player-share-trainers').checked = ps.trainers !== false;
            this._q('#sl-player-share-starters').checked = ps.starters === true;
            this._q('#sl-rom-share-pokedex').checked = rs.pokedex !== false;
            this._q('#sl-rom-share-trainers').checked = rs.trainers !== false;
            this._q('#sl-rom-share-starters').checked = rs.starters !== false;
        }

        this._syncUI();
    }

    // ── Private ──────────────────────────────────────────────────────────────

    _q(sel) { return this.container.querySelector(sel); }

    // T-163 — read every docs-visibility toggle into the nested config object.
    _readDocsVisibility() {
        const dv = {};
        for (const [id, key] of DOCS_VISIBILITY_TOGGLES) {
            dv[key] = this._q('#' + id)?.checked === true;
        }
        dv.hidePokemonCount = this._intField('#hide-pokemon-count', 1, 1, 5);
        return dv;
    }

    // T-163 — restore the docs-visibility toggles. A pre-T-163 saved config carried
    // showExactPositions at the top level, so migrate that legacy key when the nested one is absent.
    _setDocsVisibility(cfg) {
        const dv = { ...DOCS_VISIBILITY_DEFAULT, ...(cfg.docsVisibility || {}) };
        dv.showExactPositions = (cfg.docsVisibility?.showExactPositions ?? cfg.showExactPositions
            ?? DOCS_VISIBILITY_DEFAULT.showExactPositions) === true;
        for (const [id, key] of DOCS_VISIBILITY_TOGGLES) {
            const el = this._q('#' + id);
            if (el) el.checked = dv[key] === true;
        }
        const cnt = this._q('#hide-pokemon-count');
        if (cnt) cnt.value = dv.hidePokemonCount ?? 1;
    }

    /** Read an integer input, clamped to [min,max], falling back to `def` when blank/invalid. */
    _intField(sel, def, min, max) {
        const el = this._q(sel);
        if (!el) return def;
        const n = parseInt(el.value, 10);
        if (isNaN(n)) return def;
        return Math.max(min, Math.min(max, n));
    }

    /**
     * T-081 — clamp a number input to its own `min`/`max` attributes (visible validation on blur).
     * Returns true when the displayed value was changed. Blank/non-numeric inputs are left alone.
     */
    _clampNumberInput(el) {
        if (!el || el.type !== 'number') return false;
        const clamped = clampToRange(el.value, el.min, el.max);
        if (clamped === null) return false;
        const next = String(clamped);
        if (next !== String(el.value).trim()) { el.value = next; return true; }
        return false;
    }

    /** Read the 5 evil-team type slots (`<prefix>-type-0..4`) as an array of type/RANDOM tokens. */
    _readTeamTypes(prefix) {
        const arr = [];
        for (let i = 0; i < TEAM_TYPE_SLOTS.length; i++) {
            const el = this._q(`#${prefix}-type-${i}`);
            arr.push(el ? el.value : 'RANDOM');
        }
        return arr;
    }

    /** Populate the 5 evil-team type slots from an array. */
    _setTeamTypes(prefix, types) {
        for (let i = 0; i < TEAM_TYPE_SLOTS.length; i++) {
            const el = this._q(`#${prefix}-type-${i}`);
            if (el) el.value = (types && types[i]) || 'RANDOM';
        }
    }

    /** Read the starter-nickname config (T-068). Textareas → arrays (one trimmed name per line). */
    _readNicknames() {
        const parsePool = (sel) => (this._q(sel)?.value ?? '').split('\n').map(s => s.trim()).filter(Boolean);
        return {
            enabled: this._q('#nickname-enabled').checked,
            includeStarter: this._q('#nickname-include-starter').checked,
            autoLocation: this._q('#nickname-auto-location').checked,
            lockGenderPerRoute: this._q('#nickname-lock-gender-route').checked,
            sameNamesAcrossRuns: this._q('#nickname-same-across-runs').checked,
            shareAcrossSoullink: this._q('#nickname-share-soullink').checked,
            differentPerGender: this._q('#nickname-different-per-gender').checked,
            pools: {
                both: parsePool('#nickname-pool-both'),
                female: parsePool('#nickname-pool-female'),
                male: parsePool('#nickname-pool-male'),
                single: parsePool('#nickname-pool-single'),
            },
        };
    }

    /** Populate the starter-nickname controls from a config object (T-068). */
    _setNicknames(n) {
        n = n || {};
        const pools = n.pools || {};
        this._q('#nickname-enabled').checked = n.enabled === true;
        this._q('#nickname-include-starter').checked = n.includeStarter === true;
        this._q('#nickname-auto-location').checked = n.autoLocation === true;
        this._q('#nickname-lock-gender-route').checked = n.lockGenderPerRoute === true;
        this._q('#nickname-same-across-runs').checked = n.sameNamesAcrossRuns === true;
        this._q('#nickname-share-soullink').checked = n.shareAcrossSoullink !== false;   // default ON
        this._q('#nickname-different-per-gender').checked = n.differentPerGender !== false; // default ON
        const setPool = (sel, arr, def) => {
            const el = this._q(sel);
            if (el) el.value = (Array.isArray(arr) ? arr : def).join('\n');
        };
        setPool('#nickname-pool-both', pools.both, STARTER_NAME_POOLS.both);
        setPool('#nickname-pool-female', pools.female, STARTER_NAME_POOLS.female);
        setPool('#nickname-pool-male', pools.male, STARTER_NAME_POOLS.male);
        setPool('#nickname-pool-single', pools.single, NICKNAME_SINGLE_DEFAULT);
    }

    /** Re-render the extra-starter rows from this._starterSpecs (the source of truth). */
    _renderStarterList() {
        const el = this._q('#starter-list');
        if (!el) return;
        this._starterSpecs = this._starterSpecs || EXTRA_STARTER_DEFAULT_PRESET.map(normalizeStarterSpec);
        el.innerHTML = this._starterSpecs.map((s, i) => starterRowHtml(s, i)).join('');
        const count = this._q('#starter-count');
        if (count) {
            const n = this._starterSpecs.length;
            count.textContent = `${n} extra starter${n === 1 ? '' : 's'}`;
        }
    }

    /** T-073 — read the Shop-prices block into a { balls, mints, abilityCapsule, abilityPatch, tms } object. */
    _readPrices() {
        const D = PRICE_DEFAULTS;
        const int = (sel, def) => this._intField(sel, def, 0, 999999);
        const balls = {
            ultra: int('#price-ball-ultra', D.balls.ultra),
            quick: int('#price-ball-quick', D.balls.quick),
            timer: int('#price-ball-timer', D.balls.timer),
        };
        const mints = {};
        for (const n of MINT_PRICE_NAMES) mints[n] = int(`#price-mint-${n}`, D.mints[n]);
        const tms = {};
        for (const [k] of TM_POOL_LABELS) tms[k] = int(`#price-tm-${k}`, D.tms[k]);
        return {
            balls, mints, tms,
            abilityCapsule: int('#price-ability-capsule', D.abilityCapsule),
            abilityPatch: int('#price-ability-patch', D.abilityPatch),
        };
    }

    /** T-073 — populate the Shop-prices inputs from a prices config (per-item default fallback). */
    _setPrices(prices) {
        const p = prices || {};
        const D = PRICE_DEFAULTS;
        const set = (sel, v) => { const el = this._q(sel); if (el) el.value = v; };
        set('#price-ball-ultra', (p.balls && p.balls.ultra) ?? D.balls.ultra);
        set('#price-ball-quick', (p.balls && p.balls.quick) ?? D.balls.quick);
        set('#price-ball-timer', (p.balls && p.balls.timer) ?? D.balls.timer);
        for (const n of MINT_PRICE_NAMES) set(`#price-mint-${n}`, (p.mints && p.mints[n]) ?? D.mints[n]);
        for (const [k] of TM_POOL_LABELS) set(`#price-tm-${k}`, (p.tms && p.tms[k]) ?? D.tms[k]);
        set('#price-ability-capsule', p.abilityCapsule ?? D.abilityCapsule);
        set('#price-ability-patch', p.abilityPatch ?? D.abilityPatch);
    }

    /** Read the whole Evolution-levels config (scalars + stage spacing + per-tier tables). */
    _readEvoLevels() {
        const num = (sel, def) => { const el = this._q(sel); const n = el ? parseFloat(el.value) : NaN; return isNaN(n) ? def : n; };
        const readTable = (prefix, tiers) => {
            const out = {};
            for (const [t, a, b] of tiers) out[t] = [num(`#${prefix}-${t}-min`, a), num(`#${prefix}-${t}-max`, b)];
            return out;
        };
        // T-081 — clamp the scalars to sane bounds (levels 1..100, deviation 0..1) and keep max ≥ min,
        // so a hand-typed or imported value can't produce an impossible evolution-level window.
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        const evoMin = clamp(num('#evo-min', 5), 1, 100);
        const evoMax = Math.max(evoMin, clamp(num('#evo-max', 65), 1, 100));
        return {
            enabled: this._q('#evo-enabled').checked,
            min: evoMin,
            max: evoMax,
            deviation: clamp(num('#evo-deviation', 0.05), 0, 1),
            stageAdjustments: {
                lcOf2: num('#evo-stage-lcOf2', 0),
                lcOf3: num('#evo-stage-lcOf3', -0.1),
                nfeOf3: num('#evo-stage-nfeOf3', 0.1),
            },
            baseRanges: readTable('evo-base', EVO_BASE_RANGE_TIERS),
            preEvoModifiers: readTable('evo-mod', EVO_PREEVO_MOD_TIERS),
        };
    }

    /** Populate the Evolution-levels controls from config. */
    _setEvoLevels(evo) {
        evo = evo || EVO_LEVELS_DEFAULT;
        const set = (sel, v) => { const el = this._q(sel); if (el) el.value = v; };
        this._q('#evo-enabled').checked = evo.enabled !== false;
        set('#evo-min', evo.min ?? 5);
        set('#evo-max', evo.max ?? 65);
        set('#evo-deviation', evo.deviation ?? 0.05);
        const st = evo.stageAdjustments || {};
        set('#evo-stage-lcOf2', st.lcOf2 ?? 0);
        set('#evo-stage-lcOf3', st.lcOf3 ?? -0.1);
        set('#evo-stage-nfeOf3', st.nfeOf3 ?? 0.1);
        const setTable = (prefix, tiers, table) => {
            table = table || {};
            for (const [t, a, b] of tiers) {
                const r = table[t] || [a, b];
                set(`#${prefix}-${t}-min`, r[0]);
                set(`#${prefix}-${t}-max`, r[1]);
            }
        };
        setTable('evo-base', EVO_BASE_RANGE_TIERS, evo.baseRanges);
        setTable('evo-mod', EVO_PREEVO_MOD_TIERS, evo.preEvoModifiers);
    }

    /** Read the Advanced mutation probability inputs → stored as 0..1 fractions (percent fields are
     *  divided back by 100), clamped to each field's [0,max]. */
    _readMutationProbs() {
        const out = {};
        for (const f of MUTATION_PROB_FIELDS) {
            const el = this._q(`#mutprob-${f.key}`);
            const raw = el ? parseFloat(el.value) : NaN;
            if (isNaN(raw)) { out[f.key] = f.def; continue; }
            const val = f.percent !== false ? raw / 100 : raw;
            out[f.key] = Math.max(0, Math.min(f.max || 1, val));
        }
        return out;
    }

    /** Populate the Advanced mutation probability inputs from stored 0..1 fractions (percent fields are
     *  shown ×100 as whole percents). */
    _setMutationProbs(probs) {
        probs = probs || {};
        for (const f of MUTATION_PROB_FIELDS) {
            const el = this._q(`#mutprob-${f.key}`);
            if (!el) continue;
            const v = typeof probs[f.key] === 'number' ? probs[f.key] : f.def;
            el.value = f.percent !== false ? Math.round(v * 100) : v;
        }
    }

    _convertLegacy(cfg) {
        const sm = cfg.sharedModules ?? 1;
        if (sm <= 1) return { runType: 'default', difficulty: cfg.difficulty, rebalance: cfg.rebalance, balanceChance: cfg.balanceChance, seed: cfg.seed };
        return {
            runType: 'nuzlocke',
            numROMs: cfg.numROMs ?? 2,
            shared: { pokedex: sm >= 2, trainers: sm >= 3, starters: sm >= 4 },
            difficulty: cfg.difficulty ?? 7,
            rebalance: cfg.rebalance !== false,
            balanceChance: cfg.balanceChance ?? 0.2,
            seed: cfg.seed ?? null,
        };
    }

    _build() {
        this.container.innerHTML = `
<div class="config-actions">
  <span class="config-actions-label">Config:</span>
  <button type="button" class="btn btn-ghost" id="btn-save-config">Save</button>
  <label class="btn btn-ghost" style="cursor:pointer">
    Load
    <input type="file" accept=".json" id="upload-config" style="display:none">
  </label>
  <button type="button" class="btn btn-ghost" id="btn-reset-config">Reset to defaults</button>
  <span id="config-saved-note" style="font-size:12px;color:var(--muted);display:none">Saved ✓</span>
</div>
<div class="config-actions-hint field-hint">Save downloads your settings as a <code>.json</code>. Load accepts a saved config <strong>or</strong> a full <code>bundle.json</code> — only its configuration is applied; the rest of the bundle is ignored.</div>

<div class="config-accordion">

<section class="config-category" data-cat="run-type">
  <button type="button" class="config-cat-header" aria-expanded="true" aria-controls="cat-body-run-type">
    <span class="config-cat-title">Run type</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body" id="cat-body-run-type">
  <div class="radio-card-group radio-card-group-3">
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-default" value="default" checked>
      <div class="radio-card-body">
        <div class="radio-card-title">Default</div>
        <div class="radio-card-desc">Generate one ROM just for you. All Pokémon, trainers and encounters are unique to this run.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-nuzlocke" value="nuzlocke">
      <div class="radio-card-body">
        <div class="radio-card-title">Nuzlocke</div>
        <div class="radio-card-desc">Generate multiple ROMs in the same shared world. When you lose a run, continue in the next ROM.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="run-type" id="run-soullink" value="soullink">
      <div class="radio-card-body">
        <div class="radio-card-title">Soul-Link</div>
        <div class="radio-card-desc">Share the same world with a friend. Each player gets their own set of ROMs for their nuzlocke.</div>
      </div>
    </label>
  </div>

  <div id="nuzlocke-panel" class="run-panel hidden">
    <div class="coop-numroms">
      <label for="nz-numroms">Number of ROMs</label>
      <input type="number" id="nz-numroms" class="input" value="3" min="2" max="10" style="width:72px">
    </div>
    <!-- T-172 — slow-queue heads-up; text + visibility set live in _syncNuzlocke. -->
    <div id="nz-slow-queue-warning" class="warning-banner hidden"></div>
    <div class="section-title" style="margin-bottom:10px">What's shared across all ROMs?</div>
    <div class="checkbox-row">
      <input type="checkbox" id="nz-share-pokedex" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same Pokémon universe</span>
        <span class="checkbox-desc">All ROMs share the same Pokédex, base stats and movesets.</span>
      </div>
    </div>
    <div id="nz-pokedex-warning" class="warning-banner hidden">
      Games with different Pokémon universes cannot share trainer teams or starter choices.
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="nz-share-trainers" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same trainer teams &amp; rewards</span>
        <span class="checkbox-desc">All ROMs face the same randomized gym leaders, rivals and item rewards.</span>
      </div>
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="nz-share-starters" checked>
      <div class="checkbox-info">
        <span class="checkbox-label">Same starters</span>
        <span class="checkbox-desc">All ROMs share the same randomized starter pool.</span>
      </div>
    </div>
  </div>

  <div id="soullink-panel" class="run-panel hidden">
    <div class="sl-subsection">
      <div class="section-title">Between players</div>
      <div class="coop-numroms">
        <label for="sl-numplayers">Number of players</label>
        <input type="number" id="sl-numplayers" class="input" value="2" min="2" max="8" style="width:72px">
      </div>
      <div class="section-title" style="font-size:10px;margin-bottom:8px;margin-top:4px">What do all players share?</div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-player-share-pokedex" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same Pokémon universe</span>
          <span class="checkbox-desc">Every player encounters the same Pokédex, base stats and movesets.</span>
        </div>
      </div>
      <div id="sl-player-pokedex-warning" class="warning-banner hidden">
        Players with different Pokémon universes cannot share trainer teams or starter choices.
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-player-share-trainers" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same trainer teams &amp; rewards</span>
          <span class="checkbox-desc">All players fight the same randomized gym leaders and rivals.</span>
        </div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-player-share-starters">
        <div class="checkbox-info">
          <span class="checkbox-label">Same starters</span>
          <span class="checkbox-desc">All players pick from the same randomized starter pool.</span>
        </div>
      </div>
    </div>

    <div class="sl-subsection">
      <div class="section-title">Within each player's runs</div>
      <div class="coop-numroms">
        <label for="sl-roms-per-player">ROMs per player</label>
        <input type="number" id="sl-roms-per-player" class="input" value="2" min="1" max="10" style="width:72px">
      </div>
      <!-- T-172 — slow-queue heads-up for the players × ROMs-per-player total; set live in _syncSoullink. -->
      <div id="sl-slow-queue-warning" class="warning-banner hidden"></div>
      <div class="section-title" style="font-size:10px;margin-bottom:8px;margin-top:4px">What's shared across a player's ROMs?</div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-rom-share-pokedex" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same Pokémon universe</span>
          <span class="checkbox-desc">All of a player's ROMs share the same Pokédex.</span>
        </div>
      </div>
      <div id="sl-rom-pokedex-warning" class="warning-banner hidden">
        ROMs with different Pokémon universes cannot share trainer teams or starter choices.
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-rom-share-trainers" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same trainer teams &amp; rewards</span>
          <span class="checkbox-desc">All of a player's ROMs face the same gym leaders and rivals.</span>
        </div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="sl-rom-share-starters" checked>
        <div class="checkbox-info">
          <span class="checkbox-label">Same starters</span>
          <span class="checkbox-desc">All of a player's ROMs share the same randomized starter pool.</span>
        </div>
      </div>
    </div>
  </div>
  </div>
</section>

<section class="config-category" data-cat="battle-format">
  <button type="button" class="config-cat-header" aria-expanded="true" aria-controls="cat-body-battle-format">
    <span class="config-cat-title">Battle format</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body" id="cat-body-battle-format">
  <div class="radio-card-group radio-card-group-3">
    <label class="radio-card">
      <input type="radio" name="battle-format" id="battle-format-singles" value="singles" checked>
      <div class="radio-card-body">
        <div class="radio-card-title">Singles</div>
        <div class="radio-card-desc">Every trainer battle is a single battle, like the classic game.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="battle-format" id="battle-format-doubles" value="doubles">
      <div class="radio-card-body">
        <div class="radio-card-title">Doubles</div>
        <div class="radio-card-desc">Every eligible trainer (2+ Pokémon) is fought as a double battle.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="battle-format" id="battle-format-mixed" value="mixed">
      <div class="radio-card-body">
        <div class="radio-card-title">Mixed</div>
        <div class="radio-card-desc">A blend of singles and doubles, spread across trainer groups by a proportion you choose.</div>
      </div>
    </label>
  </div>

  <div id="mixed-panel" class="run-panel hidden">
    <div class="coop-numroms">
      <label for="singles-percent">Single battles (%)</label>
      <input type="number" id="singles-percent" class="input" value="60" min="0" max="100" style="width:72px">
    </div>
    <span class="field-hint" style="margin:6px 0 0">% of single battles (the rest are doubles). Each trainer group is set as close to this as possible; the Champion always takes the majority type.</span>
    <div class="checkbox-row" style="margin-top:12px">
      <input type="checkbox" id="mixed-sequential-split">
      <div class="checkbox-info">
        <span class="checkbox-label">First half singles, second half doubles</span>
        <span class="checkbox-desc">On: the early game is single battles and the later game is double battles, switching at a boss chosen by the % above (higher % = the switch happens later). Off (default): single and double battles are mixed throughout the whole game.</span>
      </div>
    </div>
    <div class="checkbox-row" style="margin-top:12px">
      <input type="checkbox" id="league-runandbun">
      <div class="checkbox-info">
        <span class="checkbox-label">League style "Run &amp; Bun"</span>
        <span class="checkbox-desc" id="league-runandbun-desc"></span>
      </div>
    </div>
  </div>
  </div>
</section>

<section class="config-category" data-cat="wild-encounters">
  <button type="button" class="config-cat-header" aria-expanded="true" aria-controls="cat-body-wild-encounters">
    <span class="config-cat-title">Wild encounters</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body" id="cat-body-wild-encounters">
  <div class="radio-card-group">
    <label class="radio-card">
      <input type="radio" name="wild-encounter-type" id="wild-deterministic" value="deterministic" checked>
      <div class="radio-card-body">
        <div class="radio-card-title">Deterministic</div>
        <div class="radio-card-desc">One Pokémon per zone and method. Each run you can predict exactly which encounter every route, cave and rod gives you.</div>
      </div>
    </label>
    <label class="radio-card">
      <input type="radio" name="wild-encounter-type" id="wild-classic" value="classic">
      <div class="radio-card-body">
        <div class="radio-card-title">Classic</div>
        <div class="radio-card-desc">Several Pokémon per zone, like the original games — you never know which of them you'll meet.</div>
      </div>
    </label>
  </div>

  <div id="wild-classic-panel" class="run-panel hidden">
    <div class="coop-numroms">
      <label for="pokemon-per-zone">Pokémon per zone</label>
      <input type="number" id="pokemon-per-zone" class="input" value="5" min="2" max="12" style="width:72px">
    </div>
    <span class="field-hint" style="margin:6px 0 0">How many different species fill each zone (capped per method: grass up to 12, surf up to 5, old rod up to 2, good rod up to 3). Species are spread to be roughly equally likely. The super rod and static/legendary encounters are unaffected.</span>
  </div>
  </div>
</section>

<section class="config-category" data-cat="difficulty">
  <button type="button" class="config-cat-header" aria-expanded="true" aria-controls="cat-body-difficulty">
    <span class="config-cat-title">Difficulty</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body" id="cat-body-difficulty">

  <div class="card-glass" style="padding:20px">

  <!-- 1. General Pokémon quality (affects every trainer at once). -->
  <label style="font-weight:600;display:block;margin-bottom:8px">General Pokémon quality</label>
  <div class="difficulty-slider-wrap">
    <input type="range" name="difficulty" id="difficultySlider" min="1" max="13" value="7" step="1">
    <div class="difficulty-ticks">
      <span style="left:9px">1<br><small>Easiest</small></span>
      <span style="left:calc(9px + (100% - 18px) * 0.25)">4<br><small>Easy</small></span>
      <span style="left:calc(9px + (100% - 18px) * 0.5)">7<br><small>Fair</small></span>
      <span style="left:calc(9px + (100% - 18px) * 0.75)">10<br><small>Hard</small></span>
      <span style="left:calc(100% - 9px)">13<br><small>Hardest</small></span>
    </div>
    <p id="difficultyDesc" class="difficulty-desc"></p>
  </div>

  <!-- 2. Non-boss quality modifier (extra quality gap for ordinary trainers vs their area's boss). -->
  <label style="font-weight:600;display:block;margin:18px 0 8px">Non-boss quality modifier</label>
  <div class="difficulty-slider-wrap">
    <input type="range" name="nonBossQuality" id="nonBossQualitySlider" class="slider" min="-6" max="0" value="-2" step="1">
    <div class="difficulty-ticks">
      <span style="left:9px">-6<br><small>Much weaker</small></span>
      <span style="left:calc(9px + (100% - 18px) * 0.3333)">-4</span>
      <span style="left:calc(9px + (100% - 18px) * 0.6667)">-2<br><small>Default</small></span>
      <span style="left:calc(100% - 9px)">0<br><small>Same as boss</small></span>
    </div>
    <p id="nonBossQualityDesc" class="difficulty-desc"></p>
  </div>

  </div>

  <!-- Advanced: per-team size caps and level offsets for bosses vs. ordinary trainers. -->
  <div class="form-section" style="margin-top:16px">
    <button type="button" class="collapsible-toggle" id="difficulty-advanced-toggle" aria-expanded="false">
      <span class="arrow">▶</span>
      Advanced
    </button>
    <div class="collapsible-body hidden" id="difficulty-advanced-body">
      <div class="card-glass" style="margin-top:12px;padding:20px;display:flex;flex-direction:column;gap:18px">
        <div>
          <label for="boss-team-size">Boss team size: <span id="boss-team-size-val">6</span></label>
          <input type="range" id="boss-team-size" class="slider" min="1" max="6" value="6" step="1" style="width:100%">
        </div>
        <div>
          <label for="non-boss-team-size">Non-boss team size: <span id="non-boss-team-size-val">6</span></label>
          <input type="range" id="non-boss-team-size" class="slider" min="1" max="6" value="6" step="1" style="width:100%">
        </div>
        <span class="field-hint">Teams with a smaller cap keep their strongest Pokémon and drop the weakest of their budget.</span>

        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <div style="display:flex;flex-direction:column;gap:6px">
            <label for="boss-level-modifier">Boss level modifier</label>
            <input type="number" id="boss-level-modifier" class="input" min="-30" max="30" step="1" value="0" style="width:110px">
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <label for="non-boss-level-modifier">Non-boss level modifier</label>
            <input type="number" id="non-boss-level-modifier" class="input" min="-30" max="30" step="1" value="0" style="width:110px">
          </div>
        </div>
        <span class="field-hint">Levels relative to the cap in force when the player reaches each trainer (may be negative). +3 puts a boss three levels above the cap.</span>
      </div>
    </div>
  </div>

  </div>
</section>

<section class="config-category" data-cat="mutations">
  <button type="button" class="config-cat-header" aria-expanded="true" aria-controls="cat-body-mutations">
    <span class="config-cat-title">Pokémon mutations</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body" id="cat-body-mutations">

  <div class="card-glass" style="display:flex;flex-direction:column;gap:20px;padding:20px">
    <div class="toggle-wrap">
      <div>
        <div class="toggle-label">Rebalance stats</div>
        <div class="toggle-desc">Randomly mutate Pokémon base stats and abilities for variety.</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="rebalance" checked>
        <span class="toggle-track"></span>
      </label>
    </div>

    <div id="balance-chance-row" class="field">
      <label for="balance-chance">Balance chance <span id="balance-chance-val" style="color:var(--accent);font-weight:700">20%</span></label>
      <div class="slider-row">
        <input type="range" id="balance-chance" class="slider" min="0" max="100" step="5" value="20">
      </div>
      <span class="field-hint">Fraction of Pokémon whose stats get mutated. 0% = no mutations, 50% = aggressive.</span>
    </div>

    <div id="mutation-categories" style="display:flex;flex-direction:column;gap:20px">
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate stats</div>
          <div class="toggle-desc">Randomly shift base stats up or down in ±10 steps.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-stats" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate abilities</div>
          <div class="toggle-desc">Randomly swap an ability for another (banned abilities excluded).</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-abilities" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate types</div>
          <div class="toggle-desc">Randomly change or add a type. Level-up moves adapt toward the new type.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-types" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate learnsets</div>
          <div class="toggle-desc">Randomly swap or add level-up moves (independent of the type-driven pass above).</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-learnsets" checked><span class="toggle-track"></span></label>
      </div>
    </div>
  </div>

  <div class="form-section" style="margin-top:16px">
    <button type="button" class="collapsible-toggle" id="mutations-advanced-toggle" aria-expanded="false">
      <span class="arrow">▶</span>
      Advanced
    </button>
    <div class="collapsible-body hidden" id="mutations-advanced-body">
      <div class="card-glass" style="margin-top:12px;padding:20px;display:flex;flex-direction:column;gap:14px">
        <span class="field-hint">Fine-tune the mutation algorithm. Every value falls back to its default, so leaving these unchanged reproduces the standard run.</span>
        ${mutationProbInputs()}
      </div>
    </div>
  </div>

  </div>
</section>

<section class="config-category" data-cat="move-mutation">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-move-mutation">
    <span class="config-cat-title">Move mutation</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-move-mutation">

  <div class="card-glass" style="display:flex;flex-direction:column;gap:20px;padding:20px">
    <div class="toggle-wrap">
      <div>
        <div class="toggle-label">Mutate moves</div>
        <div class="toggle-desc">Randomly mutate move power, accuracy, type and category before Pokémon are randomized, so they get built around the changed moves.</div>
      </div>
      <label class="toggle">
        <input type="checkbox" id="mutate-moves">
        <span class="toggle-track"></span>
      </label>
    </div>

    <div id="move-mutation-chance-row" class="field">
      <label for="move-mutation-chance">Move change chance <span id="move-mutation-chance-val" style="color:var(--accent);font-weight:700">10%</span></label>
      <div class="slider-row">
        <input type="range" id="move-mutation-chance" class="slider" min="0" max="100" step="5" value="10">
      </div>
      <span class="field-hint">Chance each move is eligible to mutate at all. The category toggles below (and their Advanced chances) then decide what changes.</span>
    </div>

    <div id="move-mutation-categories" style="display:flex;flex-direction:column;gap:20px">
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate power</div>
          <div class="toggle-desc">Shift power up or down in ±5 steps (non-status moves).</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-power" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate accuracy</div>
          <div class="toggle-desc">Shift accuracy in ±5 steps (moves with an accuracy check; never-miss moves are left alone).</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-accuracy" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate type</div>
          <div class="toggle-desc">Change the move's type to another type.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-type" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Mutate category</div>
          <div class="toggle-desc">Flip Physical ↔ Special (non-status moves).</div>
        </div>
        <label class="toggle"><input type="checkbox" id="mutate-category" checked><span class="toggle-track"></span></label>
      </div>
    </div>
  </div>

  <div class="form-section" style="margin-top:16px">
    <button type="button" class="collapsible-toggle" id="move-mutation-advanced-toggle" aria-expanded="false">
      <span class="arrow">▶</span>
      Advanced
    </button>
    <div class="collapsible-body hidden" id="move-mutation-advanced-body">
      <div class="card-glass" style="margin-top:12px;padding:20px;display:flex;flex-direction:column;gap:14px">
        <span class="field-hint">Per-field chance that a change happens once a move is eligible. Each falls back to its default, so leaving these unchanged reproduces the standard run.</span>
        <div class="field">
          <label for="move-power-chance">Power change chance</label>
          <input type="number" id="move-power-chance" class="input" min="0" max="100" step="1" value="70" style="width:100px">
          <span class="field-hint">Non-status moves only. Default 70%.</span>
        </div>
        <div class="field">
          <label for="move-accuracy-chance">Accuracy change chance</label>
          <input type="number" id="move-accuracy-chance" class="input" min="0" max="100" step="1" value="50" style="width:100px">
          <span class="field-hint">Moves with an accuracy check only. Default 50%.</span>
        </div>
        <div class="field">
          <label for="move-type-chance">Type change chance</label>
          <input type="number" id="move-type-chance" class="input" min="0" max="100" step="1" value="10" style="width:100px">
          <span class="field-hint">Default 10%.</span>
        </div>
        <div class="field">
          <label for="move-category-chance">Category change chance</label>
          <input type="number" id="move-category-chance" class="input" min="0" max="100" step="1" value="10" style="width:100px">
          <span class="field-hint">Non-status moves only. Default 10%.</span>
        </div>
      </div>
    </div>
  </div>

  </div>
</section>

<section class="config-category" data-cat="evolution">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-evolution">
    <span class="config-cat-title">Evolution levels</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-evolution">
    <div class="card-glass" style="display:flex;flex-direction:column;gap:20px;padding:20px">
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Adjust evolution levels</div>
          <div class="toggle-desc">Recompute the level each Pokémon evolves at, scaled by tier. Off = keep base-game levels.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="evo-enabled" checked><span class="toggle-track"></span></label>
      </div>
      <div id="evo-tuning" style="display:flex;flex-direction:column;gap:16px">
        <div class="evo-scalars">
          <div class="field"><label for="evo-min">Min level</label><input type="number" id="evo-min" class="input" min="1" max="100" value="5" style="width:88px"></div>
          <div class="field"><label for="evo-max">Max level</label><input type="number" id="evo-max" class="input" min="1" max="100" value="65" style="width:88px"></div>
          <div class="field"><label for="evo-deviation">Randomness (±)</label><input type="number" id="evo-deviation" class="input" min="0" max="1" step="0.01" value="0.05" style="width:88px"></div>
        </div>
        <div class="section-title" style="margin-top:4px">Stage spacing (fraction of base level)</div>
        <div class="evo-scalars">
          <div class="field"><label for="evo-stage-lcOf2">2-stage line</label><input type="number" id="evo-stage-lcOf2" class="input" min="-1" max="1" step="0.05" value="0" style="width:88px"></div>
          <div class="field"><label for="evo-stage-lcOf3">3-stage · first</label><input type="number" id="evo-stage-lcOf3" class="input" min="-1" max="1" step="0.05" value="-0.1" style="width:88px"></div>
          <div class="field"><label for="evo-stage-nfeOf3">3-stage · middle</label><input type="number" id="evo-stage-nfeOf3" class="input" min="-1" max="1" step="0.05" value="0.1" style="width:88px"></div>
        </div>
        <span class="field-hint">A negative value evolves earlier, positive later. The evolution target's tier sets the base level; the Pokémon's own tier nudges it via the Advanced modifier table.</span>
        <div class="form-section">
          <button type="button" class="collapsible-toggle" id="evolution-advanced-toggle" aria-expanded="false">
            <span class="arrow">▶</span>
            Advanced
          </button>
          <div class="collapsible-body hidden" id="evolution-advanced-body">
            <div class="card-glass" style="margin-top:12px;padding:20px;display:flex;flex-direction:column;gap:8px">
              <div class="section-title">Base level range — by target tier</div>
              <span class="field-hint">The evolution TARGET's competitive tier picks a base level range (min–max).</span>
              <div class="evo-tier-table">${evoTierRows('evo-base', EVO_BASE_RANGE_TIERS, '1', 1, 100)}</div>
              <div class="section-title" style="margin-top:12px">Pre-evo modifier — by holder tier</div>
              <span class="field-hint">The evolving Pokémon's OWN tier adds a fraction (min–max) to the base level.</span>
              <div class="evo-tier-table">${evoTierRows('evo-mod', EVO_PREEVO_MOD_TIERS, '0.01', -1, 1)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="config-category" data-cat="trainers">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-trainers">
    <span class="config-cat-title">Trainers &amp; bosses</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-trainers">
    <div class="card-glass" style="display:flex;flex-direction:column;gap:20px;padding:20px">
      <div class="field">
        <label for="gyms-type-changed">Gyms with changed types</label>
        <input type="number" id="gyms-type-changed" class="input" min="0" max="8" value="2" style="width:88px">
        <span class="field-hint">How many of the 8 gym leaders get a randomized type theme (0–8). The rest keep their canonical type. Gyms, Elite Four and the champion draw from one shared type pool, so a type freed by one boss can be picked up by another.</span>
      </div>
      <div class="field">
        <label for="e4-type-changed">Elite Four with changed types</label>
        <input type="number" id="e4-type-changed" class="input" min="0" max="4" value="2" style="width:88px">
        <span class="field-hint">How many of the 4 Elite Four members get a randomized type theme (0–4). The rest keep their canonical type.</span>
      </div>
      <div class="field">
        <label for="champion-type-change-pct">Champion type-change chance</label>
        <input type="number" id="champion-type-change-pct" class="input" min="0" max="100" value="5" style="width:88px">
        <span class="field-hint">Percent chance the champion (Steven) also gets a randomized type instead of Steel (0–100, default 5%). When it changes, its freed Steel joins the shared pool; when it stays Steel, Steel is reserved from gyms/E4. All Steven battles use the resulting type.</span>
      </div>
    </div>
    <div class="card-glass" style="padding:20px;margin-top:16px">
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Disable Steven tag battle</div>
          <div class="toggle-desc">Turns the Mossdeep Space Center tag battle (you + Steven vs Maxie + Tabitha) into a normal battle against Tabitha alone. Steven takes on Maxie while you face Tabitha as a regular boss (single or double, per your battle-format settings); the number of bosses and the story after the fight are unchanged.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="disable-steven-tag-battle"><span class="toggle-track"></span></label>
      </div>
    </div>
    <div class="card-glass" style="padding:20px;margin-top:16px">
      <div class="section-title">Team Aqua types</div>
      <div class="type-slot-grid">${teamTypeSelectors('aqua', DEFAULTS.aquaTypes)}</div>
      <span class="field-hint">Each slot is a fixed type or Random (rolled per run). Team Aqua trainers field Pokémon of these types; the main + secondary drive their card colour.</span>
    </div>
    <div class="card-glass" style="padding:20px;margin-top:16px">
      <div class="section-title">Team Magma types</div>
      <div class="type-slot-grid">${teamTypeSelectors('magma', DEFAULTS.magmaTypes)}</div>
      <span class="field-hint">Each slot is a fixed type or Random (rolled per run). Team Magma trainers field Pokémon of these types; the main + secondary drive their card colour.</span>
    </div>
  </div>
</section>

<section class="config-category" data-cat="rewards">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-rewards">
    <span class="config-cat-title">Economy</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-rewards">
    <div class="card-glass" style="display:flex;flex-direction:column;gap:20px;padding:20px">
      <div class="field">
        <label for="reward-normal">Normal trainer money ($)</label>
        <input type="number" id="reward-normal" class="input" min="0" step="50" value="250" style="width:120px">
        <span class="field-hint">Prize money for a regular trainer. Game default: 250.</span>
      </div>
      <div class="field">
        <label for="reward-boss">Boss money ($)</label>
        <input type="number" id="reward-boss" class="input" min="0" step="100" value="3000" style="width:120px">
        <span class="field-hint">Prize money for rivals, admins, Steven, Wally, etc. Game default: 3000. Museum &amp; Space-Center grunts derive from this (≈⅔ of it; the 2nd museum grunt adds $50), so at 3000 they stay $2000 / $2050.</span>
      </div>
      <div class="field">
        <label for="reward-gym">Gym leader money ($)</label>
        <input type="number" id="reward-gym" class="input" min="0" step="100" value="5000" style="width:120px">
        <span class="field-hint">Prize money for gym leaders. Game default: 5000. Elite Four ($10k) and the Champion ($50k) are fixed.</span>
      </div>
      <div class="field">
        <label for="reward-relearn">Move relearn price ($)</label>
        <input type="number" id="reward-relearn" class="input" min="0" step="50" value="250" style="width:120px">
        <span class="field-hint">Cost to relearn a move a Pokémon has had before (from its initial moveset or a level-up). Relearning a move it never actually had is always free. Game default: 250. Set to 0 to make every relearn free.</span>
      </div>
      ${shopPricesBlock()}
    </div>
  </div>
</section>

<section class="config-category" data-cat="starters">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-starters">
    <span class="config-cat-title">Starters</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-starters">
    <div class="card-glass" style="display:flex;flex-direction:column;gap:14px;padding:20px">
      <div class="field">
        <label for="starter-quality">Starter quality</label>
        <select id="starter-quality" class="input" style="width:140px">${EXTRA_STARTER_TIER_OPTIONS.map(t => `<option value="${t}"${t === DEFAULTS.starterQuality ? ' selected' : ''}>${t}</option>`).join('')}</select>
        <span class="field-hint">Competitive tier the <strong>3 normal starters</strong>' evolution lines peak at. They are always early 3-stage (Little Cup) lines with a weak base — this sets how strong their final evolution ends up. Game default: UU.</span>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <strong style="font-size:0.95em">Extra starters</strong>
          <span class="field-hint" id="starter-count" style="margin:0"></span>
        </div>
        <span class="field-hint">Extra starter choices offered in-game, beyond the 3 normal starters. Each slot picks a Pokémon by category: an early Pokémon whose evolution line peaks at a given competitive tier (optionally a 3- or 2-stage line), or a standalone (non-evolving) Pokémon of that tier. Add or remove as many as you like.</span>
        <div id="starter-list"></div>
        <div><button type="button" class="btn btn-ghost btn-sm" id="add-starter">+ Add extra starter</button></div>
      </div>
    </div>
  </div>
</section>

<section class="config-category" data-cat="nicknames">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-nicknames">
    <span class="config-cat-title">Nicknames</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-nicknames">
    <div class="card-glass" style="display:flex;flex-direction:column;gap:14px;padding:20px">
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Enable nicknames</div>
          <div class="toggle-desc">Give the extra starters (and, optionally, your chosen starter) baked-in nicknames with matching genders. All nickname options below — including location-based names — share the same name pool.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="nickname-enabled"><span class="toggle-track"></span></label>
      </div>

      <div id="nickname-box" style="display:none;flex-direction:column;gap:14px">
        <div class="toggle-wrap">
          <div>
            <div class="toggle-label">Include the main starter</div>
            <div class="toggle-desc">Also nickname the starter you pick. Off = only the extra starters are named.</div>
          </div>
          <label class="toggle"><input type="checkbox" id="nickname-include-starter"><span class="toggle-track"></span></label>
        </div>

        <div class="toggle-wrap">
          <div>
            <div class="toggle-label">Auto-nickname every Pokémon by location</div>
            <div class="toggle-desc">Also name every wild, gift and static Pokémon after where it's found — one name per route/area (e.g. every Pokémon on Route 102 is "Percy"), drawn from the same pool below.</div>
          </div>
          <label class="toggle"><input type="checkbox" id="nickname-auto-location"><span class="toggle-track"></span></label>
        </div>

        <div class="toggle-wrap" id="nickname-lock-gender-route-row">
          <div>
            <div class="toggle-label">Lock gender per route</div>
            <div class="toggle-desc">Make all of a route's encounters share one gender for coherence (genderless / fixed-gender species keep their own). Available only with location nicknames and different-names-per-gender both on.</div>
          </div>
          <label class="toggle"><input type="checkbox" id="nickname-lock-gender-route"><span class="toggle-track"></span></label>
        </div>

        <div class="toggle-wrap" id="nickname-same-runs-row">
          <div>
            <div class="toggle-label">Same names across runs</div>
            <div class="toggle-desc">Every ROM of this nuzlocke / soul-link uses the same name for the same starter slot / route. Off = each ROM rolls fresh names.</div>
          </div>
          <label class="toggle"><input type="checkbox" id="nickname-same-across-runs"><span class="toggle-track"></span></label>
        </div>

        <div class="toggle-wrap" id="nickname-share-soullink-row">
          <div>
            <div class="toggle-label">Share names between soul-link players</div>
            <div class="toggle-desc">Each player's ROM at the same position shares slot / route names (e.g. every player's ROM 1 gets the same names).</div>
          </div>
          <label class="toggle"><input type="checkbox" id="nickname-share-soullink" checked><span class="toggle-track"></span></label>
        </div>

        <div class="toggle-wrap">
          <div>
            <div class="toggle-label">Different names per gender</div>
            <div class="toggle-desc">Draw male / female names from separate pools plus a shared unisex pool. Off = one pool for everyone.</div>
          </div>
          <label class="toggle"><input type="checkbox" id="nickname-different-per-gender" checked><span class="toggle-track"></span></label>
        </div>

        <div id="nickname-pools-gendered">
          <div class="nick-tabs" role="tablist">
            <button type="button" class="nick-tab active" data-nick-tab="both">Both</button>
            <button type="button" class="nick-tab" data-nick-tab="female">Female</button>
            <button type="button" class="nick-tab" data-nick-tab="male">Male</button>
          </div>
          <div class="nick-tab-panel active" data-nick-panel="both">
            <span class="field-hint">Unisex names — usable for either gender. One name per line; letters/digits/spaces only, max 12 characters.</span>
            <textarea id="nickname-pool-both" class="feedback-textarea" rows="8" spellcheck="false"></textarea>
          </div>
          <div class="nick-tab-panel" data-nick-panel="female">
            <span class="field-hint">Female names. One name per line; letters/digits/spaces only, max 12 characters.</span>
            <textarea id="nickname-pool-female" class="feedback-textarea" rows="8" spellcheck="false"></textarea>
          </div>
          <div class="nick-tab-panel" data-nick-panel="male">
            <span class="field-hint">Male names. One name per line; letters/digits/spaces only, max 12 characters.</span>
            <textarea id="nickname-pool-male" class="feedback-textarea" rows="8" spellcheck="false"></textarea>
          </div>
        </div>

        <div id="nickname-pool-single-wrap">
          <span class="field-hint">Name pool — one name per line; letters/digits/spaces only, max 12 characters.</span>
          <textarea id="nickname-pool-single" class="feedback-textarea" rows="8" spellcheck="false"></textarea>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="config-category" data-cat="docs-visibility">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-docs-visibility">
    <span class="config-cat-title">Docs visibility</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-docs-visibility">
    <div class="card-glass" style="padding:20px">
      <span class="field-hint" style="margin:0 0 4px">Controls only what the generated documentation reveals — never what the ROM actually contains. Hidden information is stripped from the docs, not just hidden on screen.</span>

      <div class="section-title" style="margin-top:14px">Trainers</div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Show trainers</div>
          <div class="toggle-desc">Master switch for the Trainers tab. Off removes the tab entirely and hides trainer rewards from the Encounters tab.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="show-trainers" checked><span class="toggle-track"></span></label>
      </div>
      <div id="dv-trainer-children" class="dv-children">
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show bosses</div><div class="toggle-desc">Off hides boss / rival / gym cards (and their encounter rewards).</div></div>
          <label class="toggle"><input type="checkbox" id="show-bosses" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show non-bosses</div><div class="toggle-desc">Off hides ordinary route / trainer cards.</div></div>
          <label class="toggle"><input type="checkbox" id="show-non-bosses" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show held items</div></div>
          <label class="toggle"><input type="checkbox" id="show-held-items" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show natures</div></div>
          <label class="toggle"><input type="checkbox" id="show-natures" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show moves</div></div>
          <label class="toggle"><input type="checkbox" id="show-moves" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show ability</div></div>
          <label class="toggle"><input type="checkbox" id="show-ability" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show rewards</div><div class="toggle-desc">Off hides rewards everywhere — on trainer cards and in the Encounters tab.</div></div>
          <label class="toggle"><input type="checkbox" id="show-rewards" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show IVs</div><div class="toggle-desc">Off (default) omits IVs from the docs entirely.</div></div>
          <label class="toggle"><input type="checkbox" id="show-ivs"><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show exact positions in teams</div><div class="toggle-desc" title="When enabled, the docs show each Pokémon in the exact slot it occupies in-game, including lead and Illusion placement. Disabled by default to preserve in-game surprise.">Show each Pokémon's exact in-game position in the documentation.</div></div>
          <label class="toggle"><input type="checkbox" id="show-exact-positions"><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Hide some Pokémon of the team</div><div class="toggle-desc">Collapse the last few Pokémon of every team into an "(and X other Pokémon)" box.</div></div>
          <label class="toggle"><input type="checkbox" id="hide-pokemon"><span class="toggle-track"></span></label>
        </div>
        <div id="hide-pokemon-count-row" class="run-panel hidden">
          <div class="coop-numroms">
            <label for="hide-pokemon-count">How many to hide</label>
            <input type="number" id="hide-pokemon-count" class="input" value="1" min="1" max="5" style="width:72px">
          </div>
          <span class="field-hint" style="margin:6px 0 0">Hidden per team — never the whole team (at least one always shows). The box shows the real number hidden.</span>
        </div>
      </div>

      <div class="section-title" style="margin-top:14px">Wild encounters</div>
      <div class="toggle-wrap">
        <div>
          <div class="toggle-label">Show wild encounters</div>
          <div class="toggle-desc">Off keeps the Encounters tab but shows only starters, extra starters and (if enabled) trainer rewards.</div>
        </div>
        <label class="toggle"><input type="checkbox" id="show-wild-encounters" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div><div class="toggle-label">Show legendary static encounters</div><div class="toggle-desc">Off hides legendary statics from the Encounters tab and the Mail inbox.</div></div>
        <label class="toggle"><input type="checkbox" id="show-legendary-static" checked><span class="toggle-track"></span></label>
      </div>
      <div class="toggle-wrap">
        <div><div class="toggle-label">Show non-legendary static encounters</div><div class="toggle-desc">Off hides non-legendary statics from the Encounters tab and the Mail inbox.</div></div>
        <label class="toggle"><input type="checkbox" id="show-non-legendary-static" checked><span class="toggle-track"></span></label>
      </div>
      <div id="dv-wild-methods" class="dv-children">
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show super-rod encounters</div><div class="toggle-desc">Off labels them "Super-Rod encounter 1, 2, …" instead of the species.</div></div>
          <label class="toggle"><input type="checkbox" id="show-super-rod" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show dive encounters</div><div class="toggle-desc">Off shows only how many different encounters the zone has.</div></div>
          <label class="toggle"><input type="checkbox" id="show-dive" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show surf encounters</div></div>
          <label class="toggle"><input type="checkbox" id="show-surf" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show good-rod encounters</div></div>
          <label class="toggle"><input type="checkbox" id="show-good-rod" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show old-rod encounters</div></div>
          <label class="toggle"><input type="checkbox" id="show-old-rod" checked><span class="toggle-track"></span></label>
        </div>
        <div class="toggle-wrap">
          <div><div class="toggle-label">Show grass encounters</div></div>
          <label class="toggle"><input type="checkbox" id="show-grass" checked><span class="toggle-track"></span></label>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="config-category" data-cat="general">
  <button type="button" class="config-cat-header" aria-expanded="false" aria-controls="cat-body-general">
    <span class="config-cat-title">General</span><span class="config-cat-arrow">▶</span>
  </button>
  <div class="config-cat-body hidden" id="cat-body-general">
    <div class="card-glass" style="padding:20px">
      <div class="field">
        <label for="seed">Seed</label>
        <div style="display:flex;gap:10px">
          <input type="number" id="seed" class="input" min="0" step="1" placeholder="Leave blank for random" style="flex:1">
          <button type="button" class="btn btn-ghost" id="btn-randomize-seed">Roll</button>
        </div>
        <span class="field-hint">Same seed + same config = identical run every time.</span>
      </div>
      <div class="field" id="universe-seed-field" style="display:none">
        <label for="universe-seed">Universe seed</label>
        <div style="display:flex;gap:10px">
          <input type="number" id="universe-seed" class="input" min="0" step="1" placeholder="Blank = new world (from Seed)" style="flex:1">
          <button type="button" class="btn btn-ghost" id="btn-randomize-universe-seed">Roll</button>
        </div>
        <span class="field-hint">Shared across this run's ROMs (Pokédex, trainers, starters). Reuse it another day to generate more ROMs in the same world; blank derives it from Seed.</span>
      </div>
    </div>
  </div>
</section>

</div>

<div class="regen-actions">
  <label class="btn btn-ghost" style="cursor:pointer">
    Regenerate ROMs from a bundle
    <input type="file" accept=".json" id="upload-bundle" style="display:none">
  </label>
  <span class="field-hint regen-actions-hint">Upload a <code>bundle.json</code> to rebuild those exact ROMs as they were — <strong>no re-randomization</strong>. (Use <em>Load</em> at the top instead if you only want to read its configuration.)</span>
</div>
`;
    }

    _restore() {
        const saved = storageGet(STORAGE_KEY, DEFAULTS);
        this.setConfig(saved);
    }

    /** Reset every randomizer option back to its default (T-055). */
    resetToDefaults() {
        this.setConfig(DEFAULTS);
        this._syncUI();
        this._save();
    }

    _save() {
        const cfg = this.getConfig();
        if (!cfg) return;
        storageSet(STORAGE_KEY, cfg);
        const note = this._q('#config-saved-note');
        note.style.display = 'inline';
        clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => { note.style.display = 'none'; }, 1500);
        this.onConfigChange(cfg);
    }

    _syncUI() {
        const runType = this._q('input[name="run-type"]:checked')?.value ?? 'default';

        this._q('#nuzlocke-panel').classList.toggle('hidden', runType !== 'nuzlocke');
        this._q('#soullink-panel').classList.toggle('hidden', runType !== 'soullink');

        // T-189 — the Universe seed field only applies to multi-ROM shared worlds.
        const uniField = this._q('#universe-seed-field');
        if (uniField) uniField.style.display = (runType === 'nuzlocke' || runType === 'soullink') ? '' : 'none';

        // T-085/ADR-014 — the % proportion + Run & Bun controls live in a run-panel box revealed only
        // for 'mixed' (like the nuzlocke/soul-link panels); the Run & Bun description shows the live
        // ingame E4 split derived from the chosen %.
        const battleFormat = this._q('input[name="battle-format"]:checked')?.value ?? 'singles';
        const mixedPanel = this._q('#mixed-panel'); if (mixedPanel) mixedPanel.classList.toggle('hidden', battleFormat !== 'mixed');

        // T-162 — reveal the "Pokémon per zone" input only for the classic wild-encounter type.
        const wildType = this._q('input[name="wild-encounter-type"]:checked')?.value ?? 'deterministic';
        const wildPanel = this._q('#wild-classic-panel'); if (wildPanel) wildPanel.classList.toggle('hidden', wildType !== 'classic');
        const rbDesc = this._q('#league-runandbun-desc');
        if (rbDesc) {
            const { singles, doubles } = runAndBunE4Split(parseInt(this._q('#singles-percent')?.value ?? '60', 10));
            rbDesc.textContent = `Each Elite Four member has a singles and a doubles version of their team; you choose which to fight in-game. At this proportion you'll fight ${singles} in singles and ${doubles} in doubles across the four members (the Champion always uses the majority type).`;
        }

        const rebalanceOn = this._q('#rebalance').checked;
        this._q('#balance-chance-row').style.display = rebalanceOn ? '' : 'none';
        this._q('#mutation-categories').style.display = rebalanceOn ? '' : 'none';
        this._q('#balance-chance-val').textContent = this._q('#balance-chance').value + '%';

        // T-187 — reveal the move-mutation gate + category toggles only when the master toggle is on
        // (mirrors the rebalance reveal), and keep the gate % readout live.
        const mutateMovesOn = this._q('#mutate-moves')?.checked;
        const mmChanceRow = this._q('#move-mutation-chance-row');
        const mmCategories = this._q('#move-mutation-categories');
        if (mmChanceRow) mmChanceRow.style.display = mutateMovesOn ? '' : 'none';
        if (mmCategories) mmCategories.style.display = mutateMovesOn ? '' : 'none';
        const mmVal = this._q('#move-mutation-chance-val');
        if (mmVal) mmVal.textContent = (this._q('#move-mutation-chance')?.value ?? '10') + '%';

        const evoOn = this._q('#evo-enabled')?.checked;
        const evoTuning = this._q('#evo-tuning');
        if (evoTuning) evoTuning.style.display = evoOn ? '' : 'none';

        const diffLevel = parseInt(this._q('#difficultySlider')?.value ?? '7', 10);
        const descEl = this._q('#difficultyDesc');
        if (descEl) descEl.textContent = getDifficultyDesc(diffLevel);

        // T-186 — non-boss quality description + advanced team-size value readouts.
        const nbqEl = this._q('#nonBossQualityDesc');
        if (nbqEl) nbqEl.textContent = getNonBossQualityDesc(parseInt(this._q('#nonBossQualitySlider')?.value ?? '-2', 10));
        const btsVal = this._q('#boss-team-size-val');
        if (btsVal) btsVal.textContent = this._q('#boss-team-size')?.value ?? '6';
        const nbtsVal = this._q('#non-boss-team-size-val');
        if (nbtsVal) nbtsVal.textContent = this._q('#non-boss-team-size')?.value ?? '6';

        // T-068/T-070 — nicknames: master toggle shows the box; run-type gates the sharing switches;
        // "different per gender" swaps the tabbed pools ↔ the single pool. Location naming (autoLocation)
        // lives in the same box; "lock gender per route" is only usable with autoLocation + differentPerGender.
        const nickOn = this._q('#nickname-enabled')?.checked;
        const nickBox = this._q('#nickname-box');
        if (nickBox) nickBox.style.display = nickOn ? 'flex' : 'none';
        const sameRunsRow = this._q('#nickname-same-runs-row');
        if (sameRunsRow) sameRunsRow.style.display = (runType === 'nuzlocke' || runType === 'soullink') ? '' : 'none';
        const shareSlRow = this._q('#nickname-share-soullink-row');
        if (shareSlRow) shareSlRow.style.display = (runType === 'soullink') ? '' : 'none';
        const diffGender = this._q('#nickname-different-per-gender')?.checked;
        const genderedPools = this._q('#nickname-pools-gendered');
        const singlePool = this._q('#nickname-pool-single-wrap');
        if (genderedPools) genderedPools.style.display = diffGender ? '' : 'none';
        if (singlePool) singlePool.style.display = diffGender ? 'none' : '';
        // Lock-gender-per-route: enabled only while auto-location AND different-per-gender are both ON.
        const autoLoc = this._q('#nickname-auto-location')?.checked;
        const lockGenderEl = this._q('#nickname-lock-gender-route');
        const lockGenderRow = this._q('#nickname-lock-gender-route-row');
        const lockAllowed = !!(autoLoc && diffGender);
        if (lockGenderEl) lockGenderEl.disabled = !lockAllowed;
        if (lockGenderRow) lockGenderRow.classList.toggle('control-disabled', !lockAllowed);

        // T-163 — docs visibility: grey out a master's children when it is off, and reveal the
        // hide-count input only when "Hide some Pokémon" is on. The static toggles live OUTSIDE
        // #dv-wild-methods because they also drive the Mail tab, which "Show wild encounters" does
        // not gate — so they stay active regardless.
        const showTrainers = this._q('#show-trainers')?.checked;
        const trChildren = this._q('#dv-trainer-children');
        if (trChildren) {
            trChildren.classList.toggle('control-disabled', !showTrainers);
            trChildren.querySelectorAll('input').forEach(el => { el.disabled = !showTrainers; });
        }
        const hidePk = this._q('#hide-pokemon')?.checked && showTrainers;
        const hpRow = this._q('#hide-pokemon-count-row');
        if (hpRow) hpRow.classList.toggle('hidden', !hidePk);

        const showWild = this._q('#show-wild-encounters')?.checked;
        const wildMethods = this._q('#dv-wild-methods');
        if (wildMethods) {
            wildMethods.classList.toggle('control-disabled', !showWild);
            wildMethods.querySelectorAll('input').forEach(el => { el.disabled = !showWild; });
        }

        if (runType === 'nuzlocke') this._syncNuzlocke();
        if (runType === 'soullink') this._syncSoullink();

        this._paintSliders();
    }

    // T-186/T-187 — paint the filled (left) portion of every range slider orange via the `--fill`
    // custom property the `.slider` CSS reads. Called from _syncUI (covers Save/Load + reset) and, for
    // live dragging, from the per-slider input listener wired in _wireEvents.
    _paintSliders() {
        this.container.querySelectorAll('input[type="range"]').forEach(el => {
            const min = parseFloat(el.min || '0');
            const max = parseFloat(el.max || '100');
            const pct = max > min ? ((parseFloat(el.value) - min) / (max - min)) * 100 : 0;
            el.style.setProperty('--fill', pct + '%');
        });
    }

    // T-172 — show/hide + fill an inline slow-queue warning banner from a config's ROM count. `cfg` is
    // built from the live inputs (clamped via _intField, so it matches what getConfig sends to produce).
    _syncSlowQueueWarning(sel, cfg) {
        const el = this._q(sel);
        if (!el) return;
        const { show, total, fastMax } = slowQueueWarning(cfg);
        if (show) el.textContent = slowQueueMessage(total, fastMax);
        el.classList.toggle('hidden', !show);
    }

    _syncNuzlocke() {
        const pdxOn = this._q('#nz-share-pokedex').checked;
        if (!pdxOn) {
            this._q('#nz-share-trainers').checked = false;
            this._q('#nz-share-starters').checked = false;
        }
        this._q('#nz-share-trainers').disabled = !pdxOn;
        this._q('#nz-share-starters').disabled = !pdxOn;
        this._q('#nz-pokedex-warning').classList.toggle('hidden', pdxOn);

        this._syncSlowQueueWarning('#nz-slow-queue-warning', {
            runType: 'nuzlocke', numROMs: this._intField('#nz-numroms', 3, 2, 10),
        });
    }

    _syncSoullink() {
        const pp = this._q('#sl-player-share-pokedex').checked;

        // Player-level pokedex dependency
        if (!pp) {
            this._q('#sl-player-share-trainers').checked = false;
            this._q('#sl-player-share-starters').checked = false;
        }
        this._q('#sl-player-share-trainers').disabled = !pp;
        this._q('#sl-player-share-starters').disabled = !pp;
        this._q('#sl-player-pokedex-warning').classList.toggle('hidden', pp);

        const pt = this._q('#sl-player-share-trainers').checked;
        const ps = this._q('#sl-player-share-starters').checked;

        const rpdEl = this._q('#sl-rom-share-pokedex');
        const rtrEl = this._q('#sl-rom-share-trainers');
        const rstEl = this._q('#sl-rom-share-starters');

        // Player-shared forces ROM-shared on and disabled
        if (pp) { rpdEl.checked = true; rpdEl.disabled = true; }
        else     { rpdEl.disabled = false; }

        if (pt) { rtrEl.checked = true; rtrEl.disabled = true; }
        else    { rtrEl.disabled = false; }

        if (ps) { rstEl.checked = true; rstEl.disabled = true; }
        else    { rstEl.disabled = false; }

        // ROM-level pokedex dependency (only for non-forced items)
        const romPdxOn = rpdEl.checked;
        if (!romPdxOn) {
            if (!pt) { rtrEl.checked = false; rtrEl.disabled = true; }
            if (!ps) { rstEl.checked = false; rstEl.disabled = true; }
        }
        this._q('#sl-rom-pokedex-warning').classList.toggle('hidden', romPdxOn);

        this._syncSlowQueueWarning('#sl-slow-queue-warning', {
            runType: 'soullink',
            numPlayers: this._intField('#sl-numplayers', 2, 2, 8),
            romsPerPlayer: this._intField('#sl-roms-per-player', 2, 1, 10),
        });
    }

    _wireEvents() {
        const onChange = () => { this._syncUI(); this._save(); };

        // T-186/T-187 — repaint each range slider's orange fill live as it is dragged (independent of
        // whether the slider is individually wired to onChange), plus an initial paint.
        this.container.querySelectorAll('input[type="range"]').forEach(el =>
            el.addEventListener('input', () => this._paintSliders()));
        this._paintSliders();

        // T-081 — validate every number field against its own min/max on blur/commit, so typed
        // out-of-range values (negatives, absurd counts) are clamped in the UI, not silently later.
        this.container.addEventListener('change', (e) => {
            const el = e.target;
            if (el && el.matches && el.matches('input[type="number"]') && this._clampNumberInput(el)) {
                this._syncUI();
                this._save();
            }
        });

        this.container.querySelectorAll('input[name="run-type"]').forEach(el => el.addEventListener('change', onChange));
        // T-085/ADR-014 — battle format controls.
        this.container.querySelectorAll('input[name="battle-format"]').forEach(el => el.addEventListener('change', onChange));
        this._q('#singles-percent')?.addEventListener('input', onChange);
        this._q('#league-runandbun')?.addEventListener('change', onChange);
        this._q('#mixed-sequential-split')?.addEventListener('change', onChange);   // T-146
        // T-162 — wild encounter type + per-zone count.
        this.container.querySelectorAll('input[name="wild-encounter-type"]').forEach(el => el.addEventListener('change', onChange));
        this._q('#pokemon-per-zone')?.addEventListener('input', onChange);
        this._q('#nz-numroms').addEventListener('input', onChange);
        this._q('#nz-share-pokedex').addEventListener('change', onChange);
        this._q('#nz-share-trainers').addEventListener('change', onChange);
        this._q('#nz-share-starters').addEventListener('change', onChange);
        this._q('#sl-numplayers').addEventListener('input', onChange);
        this._q('#sl-player-share-pokedex').addEventListener('change', onChange);
        this._q('#sl-player-share-trainers').addEventListener('change', onChange);
        this._q('#sl-player-share-starters').addEventListener('change', onChange);
        this._q('#sl-roms-per-player').addEventListener('input', onChange);
        this._q('#sl-rom-share-pokedex').addEventListener('change', onChange);
        this._q('#sl-rom-share-trainers').addEventListener('change', onChange);
        this._q('#sl-rom-share-starters').addEventListener('change', onChange);
        this._q('#difficultySlider').addEventListener('input', onChange);
        // T-186 — difficulty settings.
        this._q('#nonBossQualitySlider')?.addEventListener('input', onChange);
        this._q('#boss-team-size')?.addEventListener('input', onChange);
        this._q('#non-boss-team-size')?.addEventListener('input', onChange);
        this._q('#boss-level-modifier')?.addEventListener('input', onChange);
        this._q('#non-boss-level-modifier')?.addEventListener('input', onChange);
        this._q('#rebalance').addEventListener('change', onChange);
        this._q('#balance-chance').addEventListener('input', onChange);
        this._q('#mutate-stats').addEventListener('change', onChange);
        this._q('#mutate-abilities').addEventListener('change', onChange);
        this._q('#mutate-types').addEventListener('change', onChange);
        this._q('#mutate-learnsets').addEventListener('change', onChange);
        for (const f of MUTATION_PROB_FIELDS) {
            this._q(`#mutprob-${f.key}`)?.addEventListener('input', onChange);
        }
        // T-187 — move mutation: master + per-field toggles (change); gate slider + Advanced chances (input).
        for (const sel of ['#mutate-moves', '#mutate-power', '#mutate-accuracy', '#mutate-type', '#mutate-category']) {
            this._q(sel)?.addEventListener('change', onChange);
        }
        for (const sel of ['#move-mutation-chance', '#move-power-chance', '#move-accuracy-chance', '#move-type-chance', '#move-category-chance']) {
            this._q(sel)?.addEventListener('input', onChange);
        }
        // Evolution levels: scalars, stage spacing, and every per-tier table input.
        for (const sel of ['#evo-enabled', '#evo-min', '#evo-max', '#evo-deviation',
            '#evo-stage-lcOf2', '#evo-stage-lcOf3', '#evo-stage-nfeOf3']) {
            this._q(sel)?.addEventListener(sel === '#evo-enabled' ? 'change' : 'input', onChange);
        }
        for (const [prefix, tiers] of [['evo-base', EVO_BASE_RANGE_TIERS], ['evo-mod', EVO_PREEVO_MOD_TIERS]]) {
            for (const [t] of tiers) {
                this._q(`#${prefix}-${t}-min`)?.addEventListener('input', onChange);
                this._q(`#${prefix}-${t}-max`)?.addEventListener('input', onChange);
            }
        }
        this._q('#seed').addEventListener('input', onChange);
        this._q('#universe-seed').addEventListener('input', onChange);
        // T-163 — docs-visibility toggles (masters resync the grey-out; count input saves on input).
        for (const [id] of DOCS_VISIBILITY_TOGGLES) {
            this._q('#' + id)?.addEventListener('change', onChange);
        }
        this._q('#hide-pokemon-count')?.addEventListener('input', onChange);
        this._q('#gyms-type-changed').addEventListener('input', onChange);
        this._q('#e4-type-changed').addEventListener('input', onChange);
        this._q('#champion-type-change-pct').addEventListener('input', onChange);
        this._q('#disable-steven-tag-battle')?.addEventListener('change', onChange); // T-165
        this._q('#reward-normal').addEventListener('input', onChange);
        this._q('#reward-boss').addEventListener('input', onChange);
        this._q('#reward-gym').addEventListener('input', onChange);
        // T-073 — shop prices (many inputs → one delegated listener on the block)
        this._q('#shop-prices')?.addEventListener('input', onChange);
        // T-072 — quality tier for the 3 main starters
        this._q('#starter-quality')?.addEventListener('change', onChange);

        // Extra-starter list: add / remove / edit rows (event delegation, since rows re-render).
        this._q('#add-starter')?.addEventListener('click', () => {
            this._starterSpecs = this._starterSpecs || [];
            this._starterSpecs.push({ tier: 'RU', kind: 'line', lineLength: 'any' });
            this._renderStarterList();
            this._save();
        });
        this._q('#starter-list')?.addEventListener('click', (e) => {
            const btn = e.target.closest && e.target.closest('.starter-remove');
            if (!btn) return;
            const row = btn.closest('.starter-row');
            const idx = parseInt(row?.dataset.idx, 10);
            if (!isNaN(idx)) { this._starterSpecs.splice(idx, 1); this._renderStarterList(); this._save(); }
        });
        this._q('#starter-list')?.addEventListener('change', (e) => {
            const row = e.target.closest && e.target.closest('.starter-row');
            if (!row) return;
            const idx = parseInt(row.dataset.idx, 10);
            if (isNaN(idx) || !this._starterSpecs[idx]) return;
            if (e.target.classList.contains('starter-tier')) this._starterSpecs[idx].tier = e.target.value;
            else if (e.target.classList.contains('starter-kind')) { this._starterSpecs[idx].kind = e.target.value; this._renderStarterList(); }
            else if (e.target.classList.contains('starter-length')) this._starterSpecs[idx].lineLength = e.target.value;
            this._save();
        });
        for (const prefix of ['aqua', 'magma']) {
            for (let i = 0; i < TEAM_TYPE_SLOTS.length; i++) {
                this._q(`#${prefix}-type-${i}`)?.addEventListener('change', onChange);
            }
        }

        // T-068/T-070 — nickname controls: toggles resync + save; pool textareas save on input.
        for (const id of ['#nickname-enabled', '#nickname-include-starter', '#nickname-auto-location',
            '#nickname-lock-gender-route', '#nickname-same-across-runs',
            '#nickname-share-soullink', '#nickname-different-per-gender']) {
            this._q(id)?.addEventListener('change', onChange);
        }
        for (const id of ['#nickname-pool-both', '#nickname-pool-female', '#nickname-pool-male', '#nickname-pool-single']) {
            this._q(id)?.addEventListener('input', onChange);
        }
        // Nickname pool tabs (Both / Female / Male) — scoped to this form (distinct from the Features .subtab).
        this.container.querySelectorAll('.nick-tab[data-nick-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.nickTab;
                this.container.querySelectorAll('.nick-tab[data-nick-tab]').forEach(b => b.classList.toggle('active', b === btn));
                this.container.querySelectorAll('.nick-tab-panel[data-nick-panel]').forEach(p =>
                    p.classList.toggle('active', p.dataset.nickPanel === tab));
            });
        });

        this._q('#btn-randomize-seed').addEventListener('click', () => {
            this._q('#seed').value = Math.floor(Math.random() * 0xFFFFFFFF);
            onChange();
        });
        this._q('#btn-randomize-universe-seed').addEventListener('click', () => {
            this._q('#universe-seed').value = Math.floor(Math.random() * 0xFFFFFFFF);
            onChange();
        });

        // Category accordion (T-052): each header toggles its own body independently.
        this.container.querySelectorAll('.config-cat-header').forEach(btn => {
            btn.addEventListener('click', () => {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', String(!expanded));
                const body = this.container.querySelector('#' + btn.getAttribute('aria-controls'));
                if (body) body.classList.toggle('hidden', expanded);
            });
        });

        // Scoped "Advanced" sub-panel inside Pokémon mutations (T-052). Evolution levels gets its
        // own in a later step; both reuse the .collapsible-toggle / .collapsible-body pattern.
        for (const id of ['mutations-advanced', 'evolution-advanced', 'difficulty-advanced', 'move-mutation-advanced']) {
            const toggle = this._q(`#${id}-toggle`);
            const body = this._q(`#${id}-body`);
            if (!toggle || !body) continue;
            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                body.classList.toggle('hidden', expanded);
            });
        }

        this._q('#btn-save-config').addEventListener('click', () => {
            const cfg = this.getConfig();
            if (cfg) downloadConfig(cfg);
        });

        this._q('#btn-reset-config')?.addEventListener('click', () => {
            if (confirm('Reset all randomizer options to their defaults?')) this.resetToDefaults();
        });

        this._q('#upload-config').addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const parsed = await readJsonFile(file);
                const cfg = extractConfig(parsed);
                this.setConfig(cfg);
                this._save();
            } catch (err) {
                alert('Could not load config: ' + err.message);
            }
            e.target.value = '';
        });

        // T-190 — regenerate ROMs from a full uploaded bundle (rebuild as-is, no re-randomization).
        this._q('#upload-bundle').addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const parsed = await readJsonFile(file);
                if (!isFullBundle(parsed)) {
                    throw new Error('That is not a bundle.json (missing formatVersion / roms / config). To load only its settings, use Load instead.');
                }
                this.onRegenerateBundle(parsed);
            } catch (err) {
                alert('Could not regenerate from bundle: ' + err.message);
            }
            e.target.value = '';
        });
    }
}
