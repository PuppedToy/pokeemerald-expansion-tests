'use strict';

/**
 * partyFile — the parts of `tools/trainerproc` that decide bytes, in JS (T-241).
 *
 * A trainer team takes TWO tools to compile: `writer.js` rewrites the team text inside
 * `src/data/trainers.party` / `battle_partners.party`, and then `trainerproc` turns that text into the
 * `struct TrainerMon` initializers the linker lays out. Injection replaces the second tool, so this file
 * is a port of it — deliberately narrow: only the parsing, the name→constant transform and the field
 * encoding, i.e. everything that ends up as a byte.
 *
 * Two rules from the tool that are easy to get wrong and change every party:
 *
 *  - **Names become constants TEXTUALLY, never by lookup.** `fprint_species` collapses a run of
 *    separators into one underscore and maps ♀→`_F`, ♂→`_M`, é→`E`, dropping `'`/`%`/`’`;
 *    `fprint_constant` (items, moves, abilities, natures) does **not** collapse — every non-alphanumeric
 *    character becomes its own underscore. So "Mr. Mime" is `SPECIES_MR_MIME` but the same text as an
 *    item would be `ITEM_MR__MIME`. A name that transforms into an undefined constant is a build error
 *    on the compile path, which is why this module throws instead of guessing.
 *  - **An omitted field is not "keep what was there", it is the tool's default.** The writer replaces a
 *    trainer's whole team block, so every entry is generated from scratch: `gender` is
 *    TRAINER_MON_RANDOM_GENDER, `nature` NATURE_HARDY, `dynamaxLevel` MAX_DYNAMAX_LEVEL, and nickname /
 *    ev / ball / friendship / shiny / tera / gigantamax / tags are zero. An injector that "kept" the
 *    base's ball or nickname would differ from every compiled ROM.
 *
 * The port is not trusted on faith: `modules/trainerParties.js` re-encodes all 860 base trainers and
 * byte-matches them against the base ROM before writing anything.
 */

const { TRAINER_MON } = require('./structLayout');

// tools/trainerproc/main.c `main()`: `.default_ivs = { 31, … }, .default_level = 100` — applied to any
// mon whose block omits the line (the parser sets the line as if it were there, so both are emitted).
const TRAINERPROC_DEFAULTS = { level: 100, iv: 31 };

const IV_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const IV_LABELS = { HP: 'hp', Atk: 'atk', Def: 'def', SpA: 'spa', SpD: 'spd', Spe: 'spe' };

/** `is_constant`: the name already starts with `PREFIX_`, so the tool does not add the prefix again. */
const isConstant = (name, prefix) => name.startsWith(`${prefix}_`);

/** `fprint_constant` — no collapsing: every character that is not alphanumeric becomes an underscore. */
function nameConstant(prefix, name) {
    const text = String(name ?? '');
    if (text.length === 0) return `${prefix}_NONE`;
    const head = isConstant(text, prefix) ? '' : `${prefix}_`;
    let out = '';
    for (const ch of text) {
        if (/[A-Za-z0-9]/.test(ch)) out += ch.toUpperCase();
        else if (ch === "'") continue;
        else out += '_';
    }
    return head + out;
}

/** `fprint_species` — separator runs collapse to one underscore, and the gender/é glyphs are special. */
function speciesConstant(name) {
    const text = String(name ?? '');
    if (text.length === 0) return 'SPECIES_NONE';
    const head = isConstant(text, 'SPECIES') ? '' : 'SPECIES_';
    let out = '';
    let pendingUnderscore = false;
    const emit = (ch) => { if (pendingUnderscore) out += '_'; pendingUnderscore = false; out += ch; };
    for (const ch of text) {
        if (/[A-Za-z0-9]/.test(ch)) emit(ch.toUpperCase());
        else if (ch === "'" || ch === '%' || ch === '’') continue;   // dropped outright
        else if (ch === '♂') { pendingUnderscore = false; out += '_M'; }
        else if (ch === '♀') { pendingUnderscore = false; out += '_F'; }
        else if (ch === 'é' || ch === 'É') emit('E');
        else pendingUnderscore = true;                                    // …and a run of these is one
    }
    return head + out;
}

/** `TRAINER_PARTY_IVS(hp, atk, def, speed, spatk, spdef)` — five bits each, SPEED in the middle. */
function packIvs(ivs = {}) {
    const at = (key) => Number(ivs[key] ?? TRAINERPROC_DEFAULTS.iv) & 0x1f;
    return ((at('hp') | (at('atk') << 5) | (at('def') << 10)
        | (at('spe') << 15) | (at('spa') << 20) | (at('spd') << 25)) >>> 0);
}

// ── Parsing ───────────────────────────────────────────────────────────────────

const TRAINER_HEADER_RE = /^===\s*(\w+)\s*===/;
const HEADER_FIELD_RE = /^([A-Za-z][A-Za-z ]*):\s*(.*)$/;
const MOVE_RE = /^-\s*(.+?)\s*$/;

// The mon-level keys trainerproc accepts. Everything the writer emits is here; the rest exist in the
// tool but never in a file this pipeline produces, so meeting one means the port is out of date.
const MON_FIELDS = new Set(['Ability', 'Level', 'Nature', 'IVs']);
const MON_FIELDS_UNSUPPORTED = new Set(['EVs', 'Ball', 'Happiness', 'Friendship', 'Shiny', 'Dynamax Level', 'Gigantamax', 'Tera Type', 'Tags']);

// Trainer-level fields that change HOW the party is emitted, not just what is in it: `Party Size` is
// the only thing that makes trainerproc write a `.poolSize` at all, and the pool/copy fields replace
// the party with another trainer's. None exists in this base — meeting one means the port is out of
// date about the shape of gTrainers, which is not something to guess through.
const TRAINER_FIELDS_UNSUPPORTED = new Set(['Party Size', 'Copy Pool', 'Pool Rules', 'Pool Pick', 'Pool Prune']);

function parseIvs(value, id) {
    const ivs = Object.fromEntries(IV_KEYS.map(key => [key, TRAINERPROC_DEFAULTS.iv]));
    for (const part of value.split('/')) {
        const match = part.trim().match(/^(\d+)\s+([A-Za-z]+)$/);
        if (!match) throw new Error(`injector/partyFile: ${id}: '${part.trim()}' is not an "<n> <Stat>" IV`);
        const key = IV_LABELS[match[2]];
        if (!key) throw new Error(`injector/partyFile: ${id}: '${match[2]}' is not an IV stat name`);
        ivs[key] = Number(match[1]);
    }
    return ivs;
}

/**
 * Parse a `.party` file into `Map(trainerId → { doubleBattle, mons: [{ species, item, ability, nature,
 * level, ivs, moves }] })`. Only the fields that reach a byte are kept — a trainer's name, class, pic,
 * music, AI flags and mugshot are compiled from the same text but the randomizer never rewrites them.
 */
function parsePartyFile(text) {
    const trainers = new Map();
    let id = null;
    let trainer = null;
    let mon = null;

    const closeMon = () => {
        if (!mon) return;
        if (mon.level === null) mon.level = TRAINERPROC_DEFAULTS.level;
        if (mon.ivs === null) mon.ivs = Object.fromEntries(IV_KEYS.map(key => [key, TRAINERPROC_DEFAULTS.iv]));
        trainer.mons.push(mon);
        mon = null;
    };

    for (const raw of text.split('\n')) {
        const line = raw.replace(/\r$/, '');
        const header = line.match(TRAINER_HEADER_RE);
        if (header) {
            closeMon();
            id = header[1];
            trainer = { doubleBattle: false, mons: [] };
            trainers.set(id, trainer);
            continue;
        }
        if (!trainer) continue;                       // the file's leading comment block
        if (!line.trim()) { closeMon(); continue; }   // a blank line ends a mon

        const move = line.match(MOVE_RE);
        if (move && mon) { mon.moves.push(move[1]); continue; }

        const field = line.match(HEADER_FIELD_RE);
        const key = field && field[1].trim();
        const value = field ? field[2].trim() : null;

        if (field && mon && MON_FIELDS.has(key)) {
            if (key === 'Ability') mon.ability = value || null;
            else if (key === 'Nature') mon.nature = value || null;
            else if (key === 'Level') mon.level = Number(value);
            else mon.ivs = parseIvs(value, id);
            continue;
        }
        if (field && mon && MON_FIELDS_UNSUPPORTED.has(key)) {
            throw new Error(
                `injector/partyFile: ${id} uses the mon field '${key}', which this port of trainerproc ` +
                `does not encode. Add it to encodeTrainerMon before injecting — the compiled ROM has it ` +
                `and the injected one would not.`);
        }
        if (field && !mon) {
            if (TRAINER_FIELDS_UNSUPPORTED.has(key)) {
                throw new Error(
                    `injector/partyFile: ${id} uses the trainer field '${key}', which changes how ` +
                    `trainerproc emits the party (partySize / poolSize / .party itself). This port does ` +
                    `not reproduce it — teach it before injecting.`);
            }
            if (key === 'Double Battle') trainer.doubleBattle = /^y/i.test(value);
            continue;                                  // Name / Class / Pic / Music / AI / Mugshot / …
        }
        if (field) continue;                           // a trainer-level field after a mon: not ours

        // Not a field and not a move → the species line that opens a mon: `Name @ Item`.
        closeMon();
        const [species, item] = line.split('@').map(part => part.trim());
        mon = { species, item: item || null, ability: null, nature: null, level: null, ivs: null, moves: [] };
    }
    closeMon();
    return trainers;
}

// ── Encoding ──────────────────────────────────────────────────────────────────

function requireConstant(constants, name, id, what) {
    const value = constants.get(name);
    if (value === undefined) {
        throw new Error(
            `injector/partyFile: ${id}: ${what} '${name}' is not defined by the base. trainerproc would ` +
            `emit the same token, so the compile path would not build either — the name is wrong, not the map.`);
    }
    return value;
}

/**
 * One `struct TrainerMon` (36 B) exactly as trainerproc emits it for a team the writer generated.
 *
 * @param {object} constants  injector/gameConstants
 * @param {object} mon        `{ species, item, ability, nature, level, ivs, moves }` (names, not ids)
 * @param {string} id         the trainer, for error messages
 */
function encodeTrainerMon(constants, mon, id) {
    const buffer = Buffer.alloc(TRAINER_MON.stride, 0);   // nickname, ev, ball, friendship, tags: 0

    buffer.writeUInt32LE(packIvs(mon.ivs), TRAINER_MON.iv);
    (mon.moves || []).slice(0, TRAINER_MON.moveCount).forEach((move, i) => {
        buffer.writeUInt16LE(requireConstant(constants, nameConstant('MOVE', move), id, 'move'),
            TRAINER_MON.moves + i * 2);
    });
    buffer.writeUInt16LE(requireConstant(constants, speciesConstant(mon.species), id, 'species'), TRAINER_MON.species);
    if (mon.item) {
        buffer.writeUInt16LE(requireConstant(constants, nameConstant('ITEM', mon.item), id, 'item'), TRAINER_MON.heldItem);
    }
    if (mon.ability) {
        buffer.writeUInt16LE(requireConstant(constants, nameConstant('ABILITY', mon.ability), id, 'ability'), TRAINER_MON.ability);
    }
    const level = Number(mon.level ?? TRAINERPROC_DEFAULTS.level);
    if (!Number.isInteger(level) || level < 0 || level > 0xff) {
        throw new Error(`injector/partyFile: ${id}: '${mon.level}' is not a level`);
    }
    buffer.writeUInt8(level, TRAINER_MON.lvl);

    // nature:5 | gender:2 | isShiny:1. The tool prints a gender for EVERY mon (GENDER_ANY →
    // TRAINER_MON_RANDOM_GENDER), so this byte is never just the nature.
    const nature = mon.nature
        ? requireConstant(constants, nameConstant('NATURE', mon.nature), id, 'nature')
        : constants.require('NATURE_HARDY');
    buffer.writeUInt8((nature & 0x1f) | ((constants.require('TRAINER_MON_RANDOM_GENDER') & 0x3) << 5),
        TRAINER_MON.natureGenderShiny);
    // teraType:5 | gigantamaxFactor:1 | shouldUseDynamax:1 | padding1:1 — none of them ever set here.
    // dynamaxLevel:4 | padding2:4 — MAX_DYNAMAX_LEVEL is the tool's default for a mon that omits it.
    buffer.writeUInt8(constants.require('MAX_DYNAMAX_LEVEL') & 0x0f, TRAINER_MON.dynamaxLevel);
    return buffer;
}

/** A whole party slot: the team, then zeros to the fixed capacity T-237 reserved. */
function encodeParty(constants, mons, id, capacity) {
    if (mons.length > capacity) {
        throw new Error(
            `injector/partyFile: ${id} has ${mons.length} mons; TRAINER_PARTY_CAPACITY is ${capacity}. ` +
            `Raise it in include/constants/randomizer_layout.h — the same guard writer.js applies.`);
    }
    const buffer = Buffer.alloc(capacity * TRAINER_MON.stride, 0);
    mons.forEach((mon, i) => encodeTrainerMon(constants, mon, id).copy(buffer, i * TRAINER_MON.stride));
    return buffer;
}

module.exports = {
    parsePartyFile,
    speciesConstant,
    nameConstant,
    packIvs,
    encodeTrainerMon,
    encodeParty,
    TRAINERPROC_DEFAULTS,
};
