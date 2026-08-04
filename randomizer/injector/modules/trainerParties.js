'use strict';

/**
 * Inject trainer parties, battle partners and the battle format — the `trainer-parties` entry (T-241).
 *
 * The compile path is two tools. `writer.js` rewrites the **team text** inside
 * `src/data/trainers.party` / `battle_partners.party`; `tools/trainerproc` then turns that text into
 * `struct TrainerMon` initializers. `injector/partyFile.js` is the port of the second one; this module
 * mirrors the first, which is where the decisions live:
 *
 *  - **Only the trainers the bundle names** are rewritten (209 of 860 in a real run), and an id with no
 *    `=== ID ===` block is silently skipped — the writer's replace regex simply matches nothing.
 *  - **The whole team block is replaced**, so a field the writer does not emit does not keep the base's
 *    value: it takes trainerproc's default. That is why every entry is written whole (see partyFile).
 *  - **The header's `Double Battle:` line** is rewritten from `effectiveBattleType(battleType,
 *    team.length)` — T-087's ≥2-mon rule — and that line compiles into `gTrainers[].battleType`, not
 *    into the party. Partners are the exception: the writer leaves their header alone.
 *  - Teams come from the bundle's docs (`buildTrainersResultsFromDocs`, the writer's own function), so
 *    there is no RNG here; the shuffle and lead logic only run on the doc-less analyze path, which
 *    inject mode does not have.
 *
 * A party has **no symbol of its own** — trainerproc emits it as an anonymous compound literal inside
 * `gTrainers[]` — so the slot is found by reading the `.party` pointer out of the base ROM. T-237 gave
 * every party the same fixed 216 B capacity precisely so that pointer can be written through.
 *
 * Before anything is written, all 860 base parties are re-encoded from the base `.party` files and
 * byte-matched against the ROM, together with each trainer's `partySize` and `battleType`. That single
 * pass proves the port, the `struct Trainer` offsets (whose header comments are stale — `.party` is at
 * +8, not the commented +4, because `aiFlags` is a u64) and that these sources built this ROM.
 */

const { TRAINER, TRAINER_MON } = require('../structLayout');
const { BASE_SOURCE_FILES } = require('../sources');
const { parsePartyFile, encodeParty, encodeTrainerMon } = require('../partyFile');
const { TRAINER_PARTY_CAPACITY } = require('../../layout');
const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');
const { buildInjectionContext } = require('../context');
const writer = require('../../writer');

const TAG = 'trainerParties';

const TABLES = [
    { symbol: 'gTrainers', countConstant: 'TRAINERS_COUNT', source: 'trainersSource', file: BASE_SOURCE_FILES.trainers, partner: false },
    { symbol: 'gBattlePartners', countConstant: 'PARTNER_COUNT', source: 'partnersSource', file: BASE_SOURCE_FILES.battlePartners, partner: true },
];

/**
 * Where one trainer's `struct Trainer` sits. Both tables are `[DIFFICULTY_COUNT][COUNT]` and trainerproc
 * emits every trainer into the DIFFICULTY_NORMAL row unless its block carries a `Difficulty:` line —
 * this base has none, so the other rows stay zero and are never written.
 */
function trainerOffset(ctx, table, id) {
    const { constants, offsetMap } = ctx;
    const index = constants.get(id);
    if (index === undefined) return null;                 // not a trainer the base defines
    const count = constants.require(table.countConstant);
    const stride = tableStride(ctx, table);
    return offsetMap.offsetOf(table.symbol)
        + (constants.require('DIFFICULTY_NORMAL') * count + index) * stride;
}

/** The struct stride, derived from the symbol's exact size when the `.sym` gives one. */
function tableStride(ctx, table) {
    const symbol = ctx.offsetMap.require(table.symbol);
    const entries = ctx.constants.require('DIFFICULTY_COUNT') * ctx.constants.require(table.countConstant);
    if (!symbol.sizeExact || symbol.size % entries !== 0) return TRAINER.stride;
    const stride = symbol.size / entries;
    if (stride !== TRAINER.stride) {
        throw new Error(
            `injector/trainerParties: ${table.symbol} is ${symbol.size} B for ${entries} entries ` +
            `(${stride} B each), but struct Trainer is ${TRAINER.stride} B. The struct changed — every ` +
            `offset in structLayout.TRAINER has to be re-derived before injecting.`);
    }
    return stride;
}

/**
 * Prove one table against the base source: every trainer's party bytes, partySize and battleType must
 * be what the base `.party` file compiles to. Returns `Map(id → { at, partyAt })` for the write pass.
 */
function verifyTable(ctx, table, source) {
    const { rom } = ctx;
    const parsed = parsePartyFile(source);
    const slots = new Map();
    const partyOwners = new Map();

    for (const [id, trainer] of parsed) {
        const at = trainerOffset(ctx, table, id);
        if (at === null) continue;                        // the file names a trainer the base dropped
        const partyAt = rom.readPointer(at + TRAINER.party);
        const expected = encodeParty(ctx.constants, trainer.mons, id, TRAINER_PARTY_CAPACITY);
        const actual = rom.readBytes(partyAt, expected.length);
        const partySize = rom.readU8(at + TRAINER.partySize);
        const poolSize = rom.readU8(at + TRAINER.poolSize);
        const battleType = rom.readU8(at + TRAINER.battleType) & 0x3;
        const expectedBattleType = trainer.doubleBattle
            ? ctx.constants.require('TRAINER_BATTLE_TYPE_DOUBLES')
            : ctx.constants.require('TRAINER_BATTLE_TYPE_SINGLES');

        // poolSize is 0 for every trainer here and stays 0: trainerproc emits it ONLY inside the
        // `Party Size:` branch, which no block in this base has (partyFile refuses one outright). GATE-3
        // caught the injector setting it to the team size — 206 bytes per ROM that compile() never
        // touches — so the base's own value is pinned here rather than assumed.
        if (!actual.equals(expected) || partySize !== trainer.mons.length || poolSize !== 0
            || battleType !== expectedBattleType) {
            throw new Error(
                `injector/trainerParties: ${id} does not match src/data/${table.file} — the base ROM at ` +
                `0x${partyAt.toString(16)} holds a different party (partySize ${partySize} vs ` +
                `${trainer.mons.length}, poolSize ${poolSize} vs 0, battleType ${battleType} vs ` +
                `${expectedBattleType}). The ROM and these sources are not the same build; injecting ` +
                `would overwrite the wrong team.`);
        }

        const sharedWith = partyOwners.get(partyAt);
        if (sharedWith) {
            throw new Error(
                `injector/trainerParties: ${sharedWith} and ${id} share one party at ` +
                `0x${partyAt.toString(16)} — the linker folded two identical parties into one object, so ` +
                `writing either team would silently change the other's. Give one of them a different ` +
                `base party before injecting.`);
        }
        partyOwners.set(partyAt, id);
        slots.set(id, { at, partyAt });
    }
    return slots;
}

/** The team the writer would emit as text, in the shape trainerproc parses back. */
function monsForTeam(trainerData, moves) {
    return (trainerData.team || []).map((entry) => {
        if (!entry.ivs) {
            throw new Error(`injector/trainerParties: a team member of a bundle trainer has no IVs; the writer would crash too`);
        }
        return {
            species: (entry.pokemon && entry.pokemon.name) || entry.pokemon,
            item: entry.item || null,
            ability: entry.ability || null,
            nature: entry.nature || null,
            level: trainerData.level,
            ivs: entry.ivs,
            // `moves[m] ? moves[m].name : m` — the writer emits the display name when the pokedex has
            // the move, and the raw id otherwise (which trainerproc reads as a constant either way).
            moves: (entry.moves || []).slice(0, TRAINER_MON.moveCount)
                .map(move => ((moves && moves[move] && moves[move].name) || move)),
        };
    });
}

/**
 * @param {object} ctx  see injector/context.js
 * @param {object} [opts]
 * @param {string} [opts.trainersSource]  base trainers.party text (defaults to reading the tree)
 * @param {string} [opts.partnersSource]  base battle_partners.party text
 */
function injectTrainerParties(ctx, { trainersSource = null, partnersSource = null } = {}) {
    const { rom, constants, data, log } = ctx;
    const sources = { trainersSource, partnersSource };

    const teams = (data.docs || {}).trainersResultsSimplified;
    const claimed = teams ? Object.keys(teams).length : 0;

    // A base that exports neither table has no trainer surface to write. That is only ever a real base
    // in a harness; for a run that HAS teams it is the T-234/T-237 trap (a vanished symbol turning every
    // write into a silent no-op), so it throws rather than producing an un-randomized ROM.
    const missing = TABLES.filter(table => !ctx.offsetMap.has(table.symbol));
    if (missing.length) {
        if (claimed === 0) return { writes: 0, trainers: 0, unknown: [] };
        throw new Error(
            `injector/trainerParties: this run writes ${claimed} trainer team(s) but the base exports no ` +
            `${missing.map(t => t.symbol).join(' / ')}. The base does not carry the table(s) ` +
            `(cf. T-234/T-237) or the offset map is from another build.`);
    }

    if (!teams) {
        // The compile path can re-roll teams from the trainer definitions; inject mode deliberately
        // cannot (that would be a second, divergent copy of the team resolver). Every bundle whose ROMs
        // carry docs — all of them since T-030 — has them.
        throw new Error(
            'injector/trainerParties: this bundle carries no docs.trainersResultsSimplified, so there are ' +
            'no resolved teams to inject. Inject mode cannot re-roll them — build this bundle with the ' +
            'compile path, or regenerate it.');
    }

    const pokes = ((data.pokedex && data.pokedex.pokes) || [])
        .filter(poke => !BANNED_SPECIES_FOR_PICKING.includes(poke.id));
    const trainersResults = writer.buildTrainersResultsFromDocs(teams, pokes);
    const moves = (data.pokedex && data.pokedex.moves) || {};

    const slots = new Map();
    for (const table of TABLES) {
        const source = sources[table.source] ?? ctx.baseSources.read(table.file);
        for (const [id, slot] of verifyTable(ctx, table, source)) slots.set(id, { ...slot, table });
    }

    let writes = 0;
    const unknown = [];
    for (const [id, trainerData] of Object.entries(trainersResults)) {
        const slot = slots.get(id);
        if (!slot) { unknown.push(id); continue; }        // no `=== id ===` block: the writer's no-op
        const mons = monsForTeam(trainerData, moves);
        // `via` tells the parity harness this payload lives wherever the pointer at that field points,
        // in EACH build: a party is an anonymous compound literal, and compile() puts it at a different
        // address than the base does (B-057), so comparing it at a fixed delta reads the wrong bytes.
        rom.writeBytes(slot.partyAt, encodeParty(constants, mons, id, TRAINER_PARTY_CAPACITY), `${TAG}:party`,
            { via: { symbol: slot.table.symbol, at: slot.at + TRAINER.party } });
        rom.writeU8(slot.at + TRAINER.partySize, mons.length, `${TAG}:partySize`);
        // NOT poolSize: trainerproc only emits it for a `Party Size:` block, so compile() leaves it 0.

        // The battle format lives in gTrainers, and the writer only rewrites it for non-partners.
        if (!slot.table.partner && !trainerData.isPartner) {
            const effective = writer.effectiveBattleType(trainerData.battleType, mons.length);
            const value = effective === 'doubles'
                ? constants.require('TRAINER_BATTLE_TYPE_DOUBLES')
                : constants.require('TRAINER_BATTLE_TYPE_SINGLES');
            // battleType:2 shares its byte with startingStatus:6, which nothing here owns.
            rom.writeBits(slot.at + TRAINER.battleType, 0, 2, value, `${TAG}:battleType`);
        }
        writes += 1;
    }

    log(`trainer parties: ${writes} team(s) written of ${slots.size} in the base` +
        `${unknown.length ? `, ${unknown.length} bundle trainer(s) the .party files do not declare` : ''}`);
    return { writes, trainers: slots.size, unknown };
}

/**
 * @param {object} args  `{ rom, offsetMap, data, log }` as the registry calls it (injector/index.js)
 * @param {object} [args.sources]  `{ trainersSource, partnersSource }` instead of reading the tree
 */
function applyTrainerParties({ rom, offsetMap, data = {}, log = () => {}, sources = {}, baseSources = null }) {
    const ctx = buildInjectionContext({ rom, offsetMap, data, log, baseSources });
    return injectTrainerParties(ctx, sources);
}

module.exports = {
    applyTrainerParties,
    injectTrainerParties,
    monsForTeam,
    trainerOffset,
    TAG,
};
