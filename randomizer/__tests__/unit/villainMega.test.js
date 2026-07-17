'use strict';

// T-144 — villain leader mega favourite: a `{ villainMega: aceMega }` candidate resolves the {isMega}
// pool slot against a TYPE/PREVO-aware ladder (owner-validated, 2026-07-17). A mega is ELIGIBLE only if it
// passes the slot's budget gate AND has a team type; among eligible megas the first satisfied rung wins:
//   1  cand === aceMega       AND mega types = {t0, t1}
//   2  mega types = {t0, t1}  AND has an on-team pre-evolution           (mascot-viable)
//   3  mega monotype t0       AND has an on-team pre-evolution           (mascot-viable)
//   5  cand === aceMega       AND mega has t0
//   6  mega has t0
//   7  has an on-team pre-evolution
// (no rule 4 — owner's numbering.) No eligible mega → the slot is DROPPED + a VILLAIN_MEGA_DROPPED warning.

const { resolveFavourites } = require('../../modules/favouriteClaim');
const { DIAGNOSTIC_CODES } = require('../../diagnostics');

// A mega ≤OU with base ≤UU — the shape presets.js bossMega(TIER_OU) produces.
const gatedMega = () => ({ isMega: true, absoluteTier: ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU'], maxBaseTier: 'UU', checkValidEvo: true });
const absSlot = t => ({ absoluteTier: [t], checkValidEvo: true });

function mon(id, tier, { types = ['NORMAL'], mega = false, megaBaseForm = null, evolvesInto = null, rating = 0 } = {}) {
    return {
        id, parsedTypes: types,
        rating: { tier, absoluteRating: rating },
        contextualRatings: {},
        evolutionData: { isMega: mega, ...(megaBaseForm ? { megaBaseForm } : {}) },
        ...(evolvesInto ? { evolutions: [{ method: 'LEVEL', param: '30', pokemon: evolvesInto }] } : {}),
    };
}

// Families: a baby (pre-evo, points forward via `evolutions`), a base (megaBaseForm), and the mega.
const LIST = [
    // Signature — Sharpedo (Water/Dark), pre-evo Carvanha (Water/Dark)
    mon('SPECIES_CARVANHA', 'NU', { types: ['WATER', 'DARK'], evolvesInto: 'SPECIES_SHARPEDO' }),
    mon('SPECIES_SHARPEDO', 'NU', { types: ['WATER', 'DARK'] }),
    mon('SPECIES_SHARPEDO_MEGA', 'RU', { types: ['WATER', 'DARK'], mega: true, megaBaseForm: 'SPECIES_SHARPEDO', rating: 6 }),
    // Water/Ground with on-team pre-evo (exact {WATER,GROUND})
    mon('SPECIES_SWAMPBABY', 'NU', { types: ['WATER', 'GROUND'], evolvesInto: 'SPECIES_SWAMPBASE' }),
    mon('SPECIES_SWAMPBASE', 'NU', { types: ['WATER', 'GROUND'] }),
    mon('SPECIES_SWAMPBASE_MEGA', 'RU', { types: ['WATER', 'GROUND'], mega: true, megaBaseForm: 'SPECIES_SWAMPBASE', rating: 5 }),
    // Mono-Water with on-team pre-evo
    mon('SPECIES_MONOWBABY', 'NU', { types: ['WATER'], evolvesInto: 'SPECIES_MONOWBASE' }),
    mon('SPECIES_MONOWBASE', 'NU', { types: ['WATER'] }),
    mon('SPECIES_MONOWBASE_MEGA', 'RU', { types: ['WATER'], mega: true, megaBaseForm: 'SPECIES_MONOWBASE', rating: 4 }),
    // Exact {WATER,DARK} but SOLO base (no pre-evo) — Mega-Mawile-like
    mon('SPECIES_SOLOWD', 'NU', { types: ['WATER', 'DARK'] }),
    mon('SPECIES_SOLOWD_MEGA', 'RU', { types: ['WATER', 'DARK'], mega: true, megaBaseForm: 'SPECIES_SOLOWD', rating: 7 }),
    // Mono-Dark with on-team pre-evo (t1 only, no t0)
    mon('SPECIES_DARKBABY', 'NU', { types: ['DARK'], evolvesInto: 'SPECIES_DARKBASE' }),
    mon('SPECIES_DARKBASE', 'NU', { types: ['DARK'] }),
    mon('SPECIES_DARKBASE_MEGA', 'RU', { types: ['DARK'], mega: true, megaBaseForm: 'SPECIES_DARKBASE', rating: 3 }),
    // A second mono-Dark line, higher-rated (tie-break / pick-best)
    mon('SPECIES_DARKBABY2', 'NU', { types: ['DARK'], evolvesInto: 'SPECIES_DARKBASE2' }),
    mon('SPECIES_DARKBASE2', 'NU', { types: ['DARK'] }),
    mon('SPECIES_DARKBASE2_MEGA', 'RU', { types: ['DARK'], mega: true, megaBaseForm: 'SPECIES_DARKBASE2', rating: 9 }),
    // Off-team (Grass) mega — never eligible for an aqua team
    mon('SPECIES_GRASSBASE', 'NU', { types: ['GRASS'] }),
    mon('SPECIES_GRASS_MEGA', 'RU', { types: ['GRASS'], mega: true, megaBaseForm: 'SPECIES_GRASSBASE', rating: 8 }),
    // Exact {WATER,DARK} with an OFF-team pre-evo (Normal baby) — fails the on-team-prevo rungs
    mon('SPECIES_OFFPREVOBABY', 'NU', { types: ['NORMAL'], evolvesInto: 'SPECIES_OFFPREVOBASE' }),
    mon('SPECIES_OFFPREVOBASE', 'NU', { types: ['WATER', 'DARK'] }),
    mon('SPECIES_OFFPREVO_MEGA', 'RU', { types: ['WATER', 'DARK'], mega: true, megaBaseForm: 'SPECIES_OFFPREVOBASE', rating: 2 }),
];

const byId = Object.fromEntries(LIST.map(p => [p.id, p]));
// A pool with one mega slot; `omit` removes species from the run pool (e.g. a signature not in this run).
function ctx(types, { omit = [], diag } = {}) {
    return {
        pokemonList: omit.length ? LIST.filter(p => !omit.includes(p.id)) : LIST,
        level: 61, types, favouriteIds: ['ARCHIE_MEGA'], diag,
    };
}
const villain = ace => [[{ villainMega: ace }]];
const team = () => [absSlot('OU'), absSlot('RU'), gatedMega()];
const claimed = out => out.find(s => s.__favourite);

describe('T-144 — villain mega favourite selection ladder', () => {
    test('rule 1: default types → the signature (exact {t0,t1}) is chosen, placed first, tagged', () => {
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'), ctx(['WATER', 'DARK']));
        expect(out[0].specific).toBe('SPECIES_SHARPEDO_MEGA');
        expect(out[0].__favourite).toBe(true);
        expect(out[0].id).toBe('ARCHIE_MEGA');           // continuity id → storedIds['ARCHIE_MEGA']
        expect(out.length).toBe(3);                        // size preserved
    });

    test('rule 2 beats rule 5: a non-signature exact-{t0,t1} mega with an on-team prevo wins over the signature', () => {
        // types WATER/GROUND: Sharpedo (W/D) only has t0 (→ rule 5); Swampert (W/Ground) is exact + has prevo (→ rule 2)
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'), ctx(['WATER', 'GROUND']));
        expect(claimed(out).specific).toBe('SPECIES_SWAMPBASE_MEGA');
    });

    test('rule 3 beats rule 5: a mono-t0 mega with an on-team prevo wins over the signature (has-t0)', () => {
        // types WATER/FAIRY: no exact-{W,Fairy} mega; Mono-Water (rule 3) beats Sharpedo (rule 5)
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'), ctx(['WATER', 'FAIRY']));
        expect(claimed(out).specific).toBe('SPECIES_MONOWBASE_MEGA');
    });

    test('rule 5: the signature is used (has t0) when no exact/mono-t0-prevo mega exists, over other has-t0 megas', () => {
        // types WATER/FAIRY, but remove the mono-Water line so rules 2/3 have no candidate. Sharpedo (rule 5,
        // signature+t0) must beat SOLOWD_MEGA (rule 6, has t0, higher rating) — signature rung is higher.
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'),
            ctx(['WATER', 'FAIRY'], { omit: ['SPECIES_MONOWBASE_MEGA', 'SPECIES_MONOWBASE', 'SPECIES_MONOWBABY'] }));
        expect(claimed(out).specific).toBe('SPECIES_SHARPEDO_MEGA');
    });

    test('rule 6 beats rule 7: with the signature absent, a has-t0 mega (no prevo) wins over an on-team-prevo mega without t0', () => {
        // types WATER/DARK, signature removed. SOLOWD_MEGA has t0 (rule 6); DARKBASE_MEGA is mono-Dark w/ prevo (rule 7).
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'),
            ctx(['WATER', 'DARK'], { omit: ['SPECIES_SHARPEDO_MEGA', 'SPECIES_MONOWBASE_MEGA', 'SPECIES_SWAMPBASE_MEGA', 'SPECIES_OFFPREVO_MEGA'] }));
        expect(claimed(out).specific).toBe('SPECIES_SOLOWD_MEGA');
    });

    test('rule 7: an on-team-prevo mega with t1-only (no t0) is chosen last-resort; picks the higher-rated one', () => {
        // types WATER/DARK; only the mono-Dark lines are eligible (t1=Dark), both rule 7 → higher rating wins.
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'),
            ctx(['WATER', 'DARK'], { omit: [
                'SPECIES_SHARPEDO_MEGA', 'SPECIES_MONOWBASE_MEGA', 'SPECIES_SWAMPBASE_MEGA',
                'SPECIES_SOLOWD_MEGA', 'SPECIES_OFFPREVO_MEGA',
            ] }));
        expect(claimed(out).specific).toBe('SPECIES_DARKBASE2_MEGA'); // rating 9 > DARKBASE_MEGA rating 3
    });

    test('rule 2 requires the pre-evolution to be ON-team: an exact-{t0,t1} mega with an off-team baby drops to a lower rung', () => {
        // types WATER/DARK. OFFPREVO_MEGA is exact {W,D} but its baby is Normal (off-team) → NOT rule 2.
        // The genuine rule-2 candidate (would need on-team prevo + exact) is absent; MONOWBASE (rule 3) present.
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'),
            ctx(['WATER', 'DARK'], { omit: ['SPECIES_SHARPEDO_MEGA', 'SPECIES_SWAMPBASE_MEGA'] }));
        // MONOWBASE_MEGA (mono-Water + on-team prevo = rule 3) beats OFFPREVO_MEGA (only rule 6, has t0)
        expect(claimed(out).specific).toBe('SPECIES_MONOWBASE_MEGA');
    });

    test('budget gate: an over-budget signature is skipped and a within-budget mega is chosen', () => {
        // Sharpedo_MEGA bumped to UBERS (over the OU window) → rule 1 fails the gate; Mono-Water (rule 3) fits.
        const overList = LIST.map(p => p.id === 'SPECIES_SHARPEDO_MEGA' ? { ...p, rating: { ...p.rating, tier: 'UBERS' } } : p);
        const out = resolveFavourites(team(), villain('SPECIES_SHARPEDO_MEGA'),
            { pokemonList: overList, level: 61, types: ['WATER', 'DARK'], favouriteIds: ['ARCHIE_MEGA'] });
        expect(claimed(out).specific).toBe('SPECIES_MONOWBASE_MEGA');
        expect(out.find(s => s.specific === 'SPECIES_SHARPEDO_MEGA')).toBeUndefined();
    });

    test('no eligible mega → the mega slot is DROPPED and a VILLAIN_MEGA_DROPPED warning is recorded', () => {
        const diag = { warn: jest.fn() };
        // Only off-team (Grass) mega available for an aqua team → nothing eligible.
        const onlyGrass = LIST.filter(p => ['SPECIES_GRASSBASE', 'SPECIES_GRASS_MEGA'].includes(p.id));
        const out = resolveFavourites(team(),
            villain('SPECIES_SHARPEDO_MEGA'),
            { pokemonList: onlyGrass, level: 61, types: ['WATER', 'DARK'], favouriteIds: ['ARCHIE_MEGA'], diag });
        expect(out.find(s => s.isMega || s.__favourite)).toBeUndefined(); // slot removed entirely
        expect(out.length).toBe(2);                                        // the two non-mega slots remain
        expect(diag.warn).toHaveBeenCalledTimes(1);
        expect(diag.warn.mock.calls[0][0]).toBe(DIAGNOSTIC_CODES.VILLAIN_MEGA_DROPPED);
    });
});
