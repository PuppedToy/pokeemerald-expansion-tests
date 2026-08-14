'use strict';

// T-278 / ADR-026 — a Pokémon inherits from its DIRECT pre-evolution and from nothing else: never a
// sibling, never another form. A convergence point inherits from ALL its pre-evolutions, stacked.
//
// Before this, `rebalancer.js` kept one mutation log per `family` string and replayed the whole log
// onto every later member, so Eevee's eight branches inherited each other in dex order and
// Weezing-Galar (a different `family` from Koffing) inherited nothing at all.

const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');

const abilityNames = Object.keys(abilities).map(k => k.replace('ABILITY_', ''));

function freshBalancer() {
    let mod, isolatedRng;
    jest.isolateModules(() => {
        mod = require('../../rebalancer');
        isolatedRng = require('../../rng');
    });
    return { ...mod, rng: isolatedRng };
}

const STATS = { baseHP: 60, baseAttack: 60, baseDefense: 60, baseSpeed: 60, baseSpAttack: 60, baseSpDefense: 60 };
const mon = (id, evolutions) => ({
    id, name: id, family: 'IGNORED', ...STATS,
    parsedTypes: ['NORMAL'], parsedAbilities: ['RUN_AWAY', 'NONE'],
    learnset: [{ move: 'MOVE_TACKLE', level: '1' }],
    ...(evolutions ? { evolutions: evolutions.map(pokemon => ({ method: 'LEVEL', param: '20', pokemon })) } : {}),
});

// Only stat entries are compared: they always apply on replay, while a type/ability/move entry is
// conditional on the receiving mon still having the old value.
const statLog = log => log.filter(e => String(e.target).startsWith('base'))
    .map(e => `${e.target}${e.value > 0 ? '+' : ''}${e.value}`);

// Balance a whole mini-dex in order, giving each mon its real parents. Always mutates
// (balanceChance 1) so every mon has something to pass down.
function balanceDex(list, seed) {
    const { balancePokemon, resetInheritance, rng } = freshBalancer();
    resetInheritance();
    rng.seed(seed);
    const parentsOf = id => list
        .filter(p => (p.evolutions || []).some(e => e.pokemon === id))
        .map(p => p.id);
    const out = new Map();
    for (const poke of list) {
        out.set(poke.id, balancePokemon(poke, abilityNames, moves, 1, { parents: parentsOf(poke.id) }));
    }
    return out;
}

describe('T-278 — siblings never inherit from each other', () => {
    // Eevee's shape, cut to three branches. Vaporeon is balanced first, so under the old
    // family-log model Jolteon and Flareon inherited its changes.
    const DEX = [
        mon('EEVEE', ['VAPOREON', 'JOLTEON', 'FLAREON']),
        mon('VAPOREON'), mon('JOLTEON'), mon('FLAREON'),
    ];

    test.each([13, 21, 34, 55])('seed %i: every branch inherits Eevee and only Eevee', seed => {
        const r = balanceDex(DEX, seed);
        const eevee = statLog(r.get('EEVEE').log);
        expect(eevee.length).toBeGreaterThan(0);

        for (const branch of ['VAPOREON', 'JOLTEON', 'FLAREON']) {
            // Eevee's entries arrive first, unchanged and complete.
            expect(statLog(r.get(branch).log).slice(0, eevee.length)).toEqual(eevee);
        }
        // What each branch rolled for itself reaches no other branch.
        const own = id => statLog(r.get(id).log).slice(eevee.length);
        const all = ['VAPOREON', 'JOLTEON', 'FLAREON'].map(own);
        for (let i = 0; i < all.length; i++) {
            for (let j = 0; j < all.length; j++) {
                if (i === j || all[i].length === 0) continue;
                expect(all[j]).not.toEqual(expect.arrayContaining(all[i]));
            }
        }
    });
});

describe('T-278 — a cross-family evolution inherits from its real pre-evolution', () => {
    // Koffing branches into Weezing and Weezing-Galar. The Galar form sits in a different `family`,
    // so the old model gave it nothing.
    const DEX = [
        mon('KOFFING', ['WEEZING', 'WEEZING_GALAR']),
        mon('WEEZING'),
        { ...mon('WEEZING_GALAR'), family: 'A_COMPLETELY_DIFFERENT_FAMILY' },
    ];

    test.each([7, 99])('seed %i: both branches carry Koffing forward', seed => {
        const r = balanceDex(DEX, seed);
        const koffing = statLog(r.get('KOFFING').log);
        expect(koffing.length).toBeGreaterThan(0);
        expect(statLog(r.get('WEEZING').log).slice(0, koffing.length)).toEqual(koffing);
        expect(statLog(r.get('WEEZING_GALAR').log).slice(0, koffing.length)).toEqual(koffing);
    });
});

describe('T-278 — a convergence point stacks every pre-evolution', () => {
    const DEX = [
        mon('BURMY_PLANT', ['WORMADAM_PLANT', 'MOTHIM']),
        mon('BURMY_SANDY', ['WORMADAM_SANDY', 'MOTHIM']),
        mon('BURMY_TRASH', ['WORMADAM_TRASH', 'MOTHIM']),
        mon('WORMADAM_PLANT'), mon('WORMADAM_SANDY'), mon('WORMADAM_TRASH'),
        mon('MOTHIM'),
    ];

    test.each([3, 44])('seed %i: Mothim gets all three cloaks, each Wormadam only its own', seed => {
        const r = balanceDex(DEX, seed);
        const cloaks = ['BURMY_PLANT', 'BURMY_SANDY', 'BURMY_TRASH'].map(id => statLog(r.get(id).log));
        const stacked = cloaks.flat();
        expect(stacked.length).toBeGreaterThan(0);

        expect(statLog(r.get('MOTHIM').log).slice(0, stacked.length)).toEqual(stacked);

        // Each Wormadam takes its own cloak and nothing from the other two.
        for (const [i, suffix] of ['PLANT', 'SANDY', 'TRASH'].entries()) {
            const own = statLog(r.get(`WORMADAM_${suffix}`).log);
            expect(own.slice(0, cloaks[i].length)).toEqual(cloaks[i]);
        }
    });
});

describe('T-278 — inheritance is cumulative down a line', () => {
    const DEX = [mon('PICHU', ['PIKACHU']), mon('PIKACHU', ['RAICHU']), mon('RAICHU')];

    test.each([11, 77])('seed %i: Raichu carries Pichu and Pikachu', seed => {
        const r = balanceDex(DEX, seed);
        const pikachu = statLog(r.get('PIKACHU').log);   // already includes Pichu's
        expect(pikachu.length).toBeGreaterThan(0);
        expect(statLog(r.get('RAICHU').log).slice(0, pikachu.length)).toEqual(pikachu);
    });
});

describe('T-278 — no parents means no inheritance', () => {
    test('a species with no pre-evolution only ever has its own log', () => {
        const { balancePokemon, resetInheritance, rng } = freshBalancer();
        resetInheritance();
        rng.seed(5);
        const a = balancePokemon(mon('SOLO_A'), abilityNames, moves, 1, { parents: [] });
        const b = balancePokemon(mon('SOLO_B'), abilityNames, moves, 1, { parents: [] });
        expect(statLog(b.log)).not.toEqual(expect.arrayContaining(statLog(a.log)));
    });

    test('resetInheritance clears the store between runs (B-069)', () => {
        const { balancePokemon, resetInheritance, rng } = freshBalancer();
        const run = () => {
            resetInheritance();
            rng.seed(42);
            const dex = [mon('P', ['C']), mon('C')];
            const parentsOf = id => dex.filter(p => (p.evolutions || []).some(e => e.pokemon === id)).map(p => p.id);
            return dex.map(p => balancePokemon(p, abilityNames, moves, 1, { parents: parentsOf(p.id) }));
        };
        expect(run().map(r => statLog(r.log))).toEqual(run().map(r => statLog(r.log)));
    });
});
