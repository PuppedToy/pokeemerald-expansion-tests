'use strict';

// T-043 / B-017 — cross-ROM boss-team determinism guarantee.
//
// Generates a shared-trainer soul-link through the REAL generation path
// (randomizer/generate.js — the exact algorithm the browser worker and the
// server generator delegate to; nothing is re-implemented here) and asserts that
// every boss battle WITHOUT a legitimately per-ROM-dependent slot has an identical
// team in every ROM.
//
// "Legitimately variable" is DERIVED FROM THE TRAINER TEMPLATE, never a hardcoded
// name list: a boss is allowed to differ across ROMs only if one of its slots is
// committed by per-ROM game state — a starter/encounter slot (rivals) or a mega
// slot (mega availability depends on per-ROM wild mega discovery). Everything else
// (e.g. TRAINER_GRUNT_RUSTURF_TUNNEL) must be byte-identical across ROMs.
//
// EXPECTED RED until B-017 is fixed: evolution levels are re-rolled per ROM inside
// writerDocs (applyEvoLevels mutates the shared pokedex under a per-ROM rng.seed),
// which perturbs each ROM's checkValidEvo candidate pool, so no-committed-slot
// bosses resolve to different teams per ROM. See tasks/T-042 for the root cause.

// The randomizer's run*Module functions write game source files as a side effect
// when running under Node (IS_NODE guards). The browser suppresses these writes via
// an fs shim and still produces a correct in-memory bundle. Mirror that here: no-op
// every fs WRITE (reads stay real) so the test computes the bundle without mutating
// any tracked game file — it must leave the working tree clean. Hoisted by Jest.
jest.mock('fs', () => {
    const real = jest.requireActual('fs');
    const noopCb = (...args) => { const cb = args[args.length - 1]; if (typeof cb === 'function') cb(null); };
    return {
        ...real,
        writeFile: noopCb,
        writeFileSync: () => {},
        appendFile: noopCb,
        appendFileSync: () => {},
        promises: {
            ...real.promises,
            writeFile: async () => {},
            appendFile: async () => {},
        },
    };
});

const fs = require('fs');
const path = require('path');
const { runGeneration } = require('../../generate');
const { BOSS_CAP_TRAINERS } = require('../../bossCaps');

// Pre-parsed base data — the exact artifact the browser worker fetches from
// /data/base-data.json. Passing it makes runPokedexModule skip node-mode file
// parsing (so the test writes NO game source files: it stays hermetic) and mirrors
// how the real app runs generation in the browser.
const BASE_DATA_PATH = path.resolve(__dirname, '../../../frontend/data/base-data.json');

// A template slot that makes the whole team legitimately vary between ROMs.
function hasPerRomSlot(trainer) {
    if (!trainer || !Array.isArray(trainer.team)) return true; // no comparable template → skip
    return trainer.team.some(slot =>
        slot.special != null            // starter / encounter / repeat / mega-from-stone
        || slot.encounterIds != null    // wild-encounter-committed slot
        || slot.tryMega === true         // mega availability is per-ROM (wild mega discovery)
        || slot.isMega === true
        || slot.megaTier != null,
    )
    // T-128 — a favourite (preferred ace) resolves a signature mega whose availability is per-ROM
    // (wild mega discovery), exactly like an isMega/megaTier slot, so it is legitimately ROM-variable.
    || (trainer.favourite != null && trainer.favourite.length > 0);
}

function bossTrainerIds() {
    const ids = new Set();
    for (const entry of Object.values(BOSS_CAP_TRAINERS)) {
        for (const id of entry.trainers) ids.add(id);
    }
    return ids;
}

// Full-team determinism fingerprint: species + item + nature + ability + moves + ivs, in order.
function teamSignature(entry) {
    return JSON.stringify((entry.team || []).map(m => ({
        pokemon: m.pokemon,
        item: m.item,
        nature: m.nature,
        ability: m.ability,
        moves: m.moves,
        ivs: m.ivs,
    })));
}

function speciesList(entry) {
    return (entry ? entry.team : []).map(m => m.pokemon.replace('SPECIES_', '')).join(', ');
}

// This runs the REAL pipeline (parse + rate ~1200 mons, then generate 9 ROMs), so it
// takes ~1 min — far over the fast suite's <2s budget. It is therefore gated out of
// the default `npm test` and run on demand via `npm run test:determinism`
// (which sets RUN_DETERMINISM=1). See randomizer/package.json.
const describeDeterminism = process.env.RUN_DETERMINISM === '1' ? describe : describe.skip;

describeDeterminism('cross-ROM boss-team determinism (T-043 / B-017)', () => {
    let bundle;

    beforeAll(async () => {
        const seed = 1830319788; // fixed → reproducible
        const shared = { pokedex: true, trainers: true, starters: true };
        const cfg = {
            runType: 'soullink',
            seed,
            difficulty: 7,
            rebalance: true,
            balanceChance: 0.4,
            showExactPositions: true,
            numPlayers: 3,
            romsPerPlayer: 3,
            playerShared: { pokedex: true, trainers: true, starters: false },
            romShared: shared,
        };
        const mcfg = {
            seed,
            difficulty: 7,
            rebalance: true,
            balanceChance: 0.4,
            allTms: false,
            showExactPositions: true,
        };
        const baseData = JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf-8'));
        // Same path the browser worker takes: baseData supplied → no game-file I/O.
        bundle = await runGeneration(cfg, mcfg, 'determinism-test', { baseData });
    }, 120000);

    test('shared-trainer bosses without a per-ROM slot have identical teams across all ROMs', () => {
        const trainersData = bundle.sharedData.trainers.trainersData;
        const templateById = new Map(trainersData.map(t => [t.id, t]));

        const compared = [];
        const offenders = [];

        for (const id of bossTrainerIds()) {
            const template = templateById.get(id);
            if (hasPerRomSlot(template)) continue; // rival / encounter / mega — allowed to vary

            const signatures = bundle.roms
                .map(r => r.docs.trainersResultsSimplified[id])
                .filter(Boolean)
                .map(teamSignature);

            if (signatures.length < 2) continue; // need ≥2 ROMs to compare
            compared.push(id);

            if (!signatures.every(s => s === signatures[0])) {
                const distinct = new Set(signatures).size;
                offenders.push({ id, distinct, roms: signatures.length });
            }
        }

        // Guard against a vacuous pass: we must have actually compared some bosses.
        expect(compared.length).toBeGreaterThan(0);

        if (offenders.length > 0) {
            const worst = offenders[0].id;
            const perRom = bundle.roms
                .map((r, i) => `  ROM ${i}: ${speciesList(r.docs.trainersResultsSimplified[worst])}`)
                .join('\n');
            throw new Error(
                `${offenders.length}/${compared.length} shared-trainer boss(es) diverge across ROMs `
                + '(expected identical teams):\n'
                + offenders.map(o => `  - ${o.id}: ${o.distinct} distinct teams across ${o.roms} ROMs`).join('\n')
                + `\n\nExample — ${worst} per ROM:\n${perRom}`,
            );
        }
    });
});
