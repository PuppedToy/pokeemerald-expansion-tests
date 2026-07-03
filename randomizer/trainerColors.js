'use strict';

/**
 * T-044 — Single source of truth for the docs viewer's colour system.
 *
 * Four colours per Pokémon type:
 *   - main         : the bright type colour (identical to the frontend's existing
 *                    `typeColors`; the viewer's move chips still read this via
 *                    `typeMainColors()`, injected into the template).
 *   - secondary    : companion colour for the top gradient bar (main → secondary).
 *   - mainBg       : dark contrast surface — the `main` colour (and light text) reads
 *                    on it. Used for the trainer-dossier rail background.
 *   - secondaryBg  : darker/neutral surface for the Pokémon cards — white / light-blue /
 *                    light-green text reads on it.
 *
 * Boss cards are coloured by `resolveTrainerColors(trainer)` (pure, unit-tested):
 *   - typed bosses (gym / E4 / champion): the palette of the type they run this seed,
 *     carried on `trainer.themeType` (Steven is always Steel).
 *   - evil-team bosses: a mix of two type mains (Aqua = Water+Dark, Magma = Fire+Ground).
 *   - rival / Wally: fixed identity palettes.
 *   - common trainers: the neutral GENERIC palette, with NO top bar.
 */

// main values MUST stay identical to frontend/template.html's typeColors (guarded by tests).
const TYPE_PALETTES = {
    NORMAL:   { main: '#A8A77A', secondary: '#D6D3B0', mainBg: '#35342A', secondaryBg: '#201F18' },
    FIRE:     { main: '#EE8130', secondary: '#F7C94B', mainBg: '#3A1206', secondaryBg: '#1E0C05' },
    WATER:    { main: '#6390F0', secondary: '#4FA3F0', mainBg: '#10254F', secondaryBg: '#0A1428' },
    ELECTRIC: { main: '#F7D02C', secondary: '#FFB020', mainBg: '#3A3208', secondaryBg: '#201C06' },
    GRASS:    { main: '#7AC74C', secondary: '#C4E85A', mainBg: '#123A18', secondaryBg: '#0A1F0D' },
    ICE:      { main: '#96D9D6', secondary: '#7FC2F0', mainBg: '#14383B', secondaryBg: '#0A1E20' },
    FIGHTING: { main: '#C22E28', secondary: '#F0763C', mainBg: '#3A0E0B', secondaryBg: '#1E0908' },
    POISON:   { main: '#A33EA1', secondary: '#D65FD0', mainBg: '#2E0E30', secondaryBg: '#170818' },
    GROUND:   { main: '#E2BF65', secondary: '#C6873A', mainBg: '#3A2A10', secondaryBg: '#1F1608' },
    FLYING:   { main: '#A98FF3', secondary: '#8FD0F3', mainBg: '#221C3D', secondaryBg: '#12101F' },
    PSYCHIC:  { main: '#F95587', secondary: '#C86BE0', mainBg: '#3A0E22', secondaryBg: '#1E0812' },
    BUG:      { main: '#A6B91A', secondary: '#D4E840', mainBg: '#2C3308', secondaryBg: '#171A06' },
    ROCK:     { main: '#B6A136', secondary: '#8C7A2A', mainBg: '#332C0E', secondaryBg: '#1A1607' },
    GHOST:    { main: '#735797', secondary: '#A98FD6', mainBg: '#241A33', secondaryBg: '#120D1A' },
    DRAGON:   { main: '#6F35FC', secondary: '#B05CFF', mainBg: '#1C1147', secondaryBg: '#0E0824' },
    DARK:     { main: '#705746', secondary: '#A0836A', mainBg: '#241A12', secondaryBg: '#130D09' },
    STEEL:    { main: '#B7B7CE', secondary: '#C9D6F2', mainBg: '#23262E', secondaryBg: '#12151A' },
    FAIRY:    { main: '#D685AD', secondary: '#F5B8D8', mainBg: '#3A1A2C', secondaryBg: '#1F0E17' },
};

// Common trainers: deliberately generic neutral slate-blue, kept clearly distinct from
// Water (royal/navy) and Ice (teal) so those types still read as "typed". No top bar.
const GENERIC_PALETTE = {
    title:  '#CFE0F2',
    railBg: '#17293E',
    cardBg: '#0C1626',
};

// Fixed identity palettes for non-typed bosses.
// Rival (May/Brendan): emerald identity with red + blue accents.
const RIVAL_PALETTE = {
    title:  '#56D96B',                 // emerald (matches the app brand green)
    bar:    ['#EF5350', '#4F9FEF'],    // red → blue
    railBg: '#0E2A1C',
    cardBg: '#101E27',
};
// Wally: emerald with white — Gardevoir-like.
const WALLY_PALETTE = {
    title:  '#EAFFF3',
    bar:    ['#DFF7E9', '#56D96B'],    // white → emerald
    railBg: '#132E22',
    cardBg: '#0F2119',
};

// Battle allies (isPartner, e.g. Steven at the Space Center): a friendly green look,
// distinct from every enemy palette. Rendered with a green "Ally" tag and no crown.
const ALLY_PALETTE = {
    title:  '#6EE7A0',
    bar:    ['#A8F0C8', '#3FC978'],   // mint → green (friendly, never a type/enemy gradient)
    railBg: '#0C2A17',
    cardBg: '#08170D',
};

// Fallback for an unexpected boss with no themeType and no matched identity.
const BOSS_FALLBACK_PALETTE = {
    title:  '#FFCE3F',
    bar:    ['#FFCE3F', '#B34E00'],
    railBg: '#2A130B',
    cardBg: '#160B07',
};

// Evil teams mix two type mains: [rail/title type, cards type].
const EVIL_TEAM_TYPES = {
    aqua:  ['WATER', 'DARK'],
    magma: ['FIRE', 'GROUND'],
};

/** {TYPE: main} map — what the frontend move chips consume (injected into the template). */
function typeMainColors() {
    const out = {};
    for (const [t, p] of Object.entries(TYPE_PALETTES)) out[t] = p.main;
    return out;
}

function typedColors(themeType) {
    const p = TYPE_PALETTES[themeType];
    return {
        kind: 'typed',
        bar: [p.main, p.secondary],
        title: p.main,
        railBg: p.mainBg,
        cardBg: p.secondaryBg,
    };
}

function evilColors(team, override) {
    // T-052 — when the run configured this team's types, follow its main/secondary; otherwise use
    // the static two-type mix. `override` is the resolved [main, secondary] carried on the trainer.
    const [t1, t2] = (Array.isArray(override) && override.length === 2
        && TYPE_PALETTES[override[0]] && TYPE_PALETTES[override[1]])
        ? override
        : EVIL_TEAM_TYPES[team];
    const p1 = TYPE_PALETTES[t1];
    const p2 = TYPE_PALETTES[t2];
    return {
        kind: 'evil',
        bar: [p1.main, p2.main],
        title: p1.main,
        railBg: p1.mainBg,
        cardBg: p2.mainBg,   // second type's dark surface for the Pokémon cards
    };
}

function fixedColors(palette, kind) {
    return {
        kind,
        bar: palette.bar || null,
        title: palette.title,
        railBg: palette.railBg,
        cardBg: palette.cardBg,
    };
}

/**
 * Resolve a trainer's card colours from its static fields (never its resolved team),
 * so both writer.js (out.html) and writerDocs.js (browser bundle) resolve identically.
 *
 * @param {{class?: string, isBoss?: boolean, themeType?: string}} trainer
 * @returns {{kind: string, bar: [string,string]|null, title: string, railBg: string, cardBg: string}}
 */
function resolveTrainerColors(trainer = {}) {
    const cls = typeof trainer.class === 'string' ? trainer.class : '';

    // Allies first — a partner (e.g. Steven at the Space Center) is a friend, so it must
    // never inherit its class's enemy/type palette (partner Steven still carries a STEEL
    // themeType). Friendly green + an "Ally" tag instead.
    if (trainer.isPartner) return fixedColors(ALLY_PALETTE, 'ally');

    // Typed bosses carry a resolved themeType (gym / E4 / Steven=STEEL).
    if (trainer.themeType && TYPE_PALETTES[trainer.themeType]) {
        return typedColors(trainer.themeType);
    }

    // Fixed identities (classes are stable regardless of type randomization).
    if (cls.includes('Aqua')) return evilColors('aqua', trainer.evilThemeTypes);
    if (cls.includes('Magma')) return evilColors('magma', trainer.evilThemeTypes);
    if (cls === 'May' || cls === 'Brendan') return fixedColors(RIVAL_PALETTE, 'rival');
    if (cls === 'Wally') return fixedColors(WALLY_PALETTE, 'wally');

    // Any other boss without a resolved theme → neutral boss fallback.
    if (trainer.isBoss) return fixedColors(BOSS_FALLBACK_PALETTE, 'boss');

    // Common trainers: generic, no bar.
    return {
        kind: 'common',
        bar: null,
        title: GENERIC_PALETTE.title,
        railBg: GENERIC_PALETTE.railBg,
        cardBg: GENERIC_PALETTE.cardBg,
    };
}

module.exports = {
    TYPE_PALETTES,
    GENERIC_PALETTE,
    RIVAL_PALETTE,
    WALLY_PALETTE,
    ALLY_PALETTE,
    BOSS_FALLBACK_PALETTE,
    EVIL_TEAM_TYPES,
    typeMainColors,
    resolveTrainerColors,
};
