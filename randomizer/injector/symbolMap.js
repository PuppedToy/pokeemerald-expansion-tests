'use strict';

/**
 * symbolMap.js — the base build's `.map` → a machine-readable offset map (T-238, folded in from T-232).
 *
 * Every injection offset comes from HERE, never from a constant in the code: an upstream sync or any
 * source edit moves every table (ADR-012 / T-232 measured gSpeciesInfo drifting between builds), so a
 * hardcoded offset is a corrupted ROM waiting to happen. The injector reads the `.map` produced next to
 * the base ROM it is injecting into — the two are a matched pair.
 *
 * What it understands (GNU ld map, `Linker script and memory map` section):
 *   .rodata.gItemsInfo                                   ← input section, name wrapped onto its own line
 *                0x000000000860a998    0x15000 build/modern/src/data/items.o
 *                0x000000000860a998                gItemsInfo      ← symbol
 *   .ewram_data  0x0000000002020000       0x20 load address 0x0000000008e00000   ← LMA (ROM image of RAM data)
 *
 * Symbol sizes come from the enclosing input section, split at the next symbol when a section holds
 * several. `*fill*`, `PROVIDE (…)`, `. = ALIGN (…)` and the `Discarded input sections` block are skipped.
 */

const fs = require('fs');
const path = require('path');

const ROM_BASE_ADDR = 0x08000000;
const ROM_MAX_BYTES = 0x02000000;               // 32 MB cartridge ceiling (GATE-1)
const ROM_END_ADDR  = ROM_BASE_ADDR + ROM_MAX_BYTES;

/** GBA pointer (0x08xxxxxx) → offset inside the ROM file. Throws for anything not in the ROM region. */
function toRomOffset(addr) {
    if (!Number.isInteger(addr) || addr < ROM_BASE_ADDR || addr >= ROM_END_ADDR) {
        throw new Error(`Address 0x${(addr >>> 0).toString(16)} is not in ROM (0x8000000..0x9ffffff)`);
    }
    return addr - ROM_BASE_ADDR;
}

/** ROM file offset → the GBA pointer the game sees. */
function toGbaPointer(offset) {
    if (!Number.isInteger(offset) || offset < 0 || offset >= ROM_MAX_BYTES) {
        throw new Error(`ROM offset 0x${Number(offset).toString(16)} is outside 0..0x1ffffff`);
    }
    return ROM_BASE_ADDR + offset;
}

function inRom(addr) {
    return Number.isInteger(addr) && addr >= ROM_BASE_ADDR && addr < ROM_END_ADDR;
}

/**
 * The parsed map: symbol name → { name, addr, romOffset, size, section, object }.
 * `romOffset` is null for symbols with no image in the ROM (pure .bss / RAM).
 */
class OffsetMap {
    constructor({ symbols, romCapacity = ROM_MAX_BYTES, romEndOffset = 0, source = null }) {
        this.symbols = symbols;
        this.romCapacity = romCapacity;
        this.romEndOffset = romEndOffset;
        this.source = source;
    }

    get symbolCount() { return Object.keys(this.symbols).length; }

    /** Bytes left under the cartridge ceiling — the GATE-1 budget, recomputed per build. */
    get freeBytes() { return this.romCapacity - this.romEndOffset; }

    has(name) { return Object.prototype.hasOwnProperty.call(this.symbols, name); }

    get(name) { return this.symbols[name]; }

    /** Lookup that fails loudly — the only form injection code should use. */
    require(name) {
        const sym = this.symbols[name];
        if (!sym) {
            throw new Error(
                `Symbol '${name}' is not in the base offset map${this.source ? ` (${path.basename(this.source)})` : ''}. ` +
                `Either the base does not export it (drop 'static' / add an noipa accessor, cf. T-234/T-237) ` +
                `or the map belongs to a different build.`);
        }
        return sym;
    }

    /** The ROM offset of `name`, asserted to exist in the ROM image. */
    offsetOf(name) {
        const sym = this.require(name);
        if (sym.romOffset === null) throw new Error(`Symbol '${name}' has no ROM image (it lives in RAM at 0x${sym.addr.toString(16)})`);
        return sym.romOffset;
    }

    /**
     * A new map with `other`'s symbols folded in; THIS map wins on conflicts (the `.map` knows the
     * section and object, the `.sym` only the address). Used to add the local script labels a linker
     * map never contains — the Group-D setvar sites.
     *
     * One exception, learned from the real base: a linker map only **bounds** a symbol by its section
     * (gStarterExtraCount, a u8, came out as 335 B), while an ELF symbol table states the true size.
     * So a non-zero **exact** size always wins, whichever side it comes from.
     */
    merge(other) {
        const symbols = { ...other.symbols };
        for (const [name, mine] of Object.entries(this.symbols)) {
            const theirs = symbols[name];
            const preferTheirSize = theirs && theirs.sizeExact && !mine.sizeExact && theirs.size > 0;
            symbols[name] = preferTheirSize ? { ...mine, size: theirs.size, sizeExact: true } : mine;
        }
        return new OffsetMap({
            symbols,
            romCapacity: this.romCapacity,
            romEndOffset: Math.max(this.romEndOffset, other.romEndOffset || 0),
            source: this.source,
        });
    }

    /**
     * A new map holding only `names` (those it has), with the same ROM budget.
     *
     * The full map of a real base is 88,000 symbols; injection can only address a few thousand of them.
     * See `filterOffsetMapForInjection` in injector/index.js for who decides which, and T-249 for why a
     * browser cannot be handed the whole thing.
     */
    pick(names) {
        const symbols = {};
        for (const name of names) if (this.has(name)) symbols[name] = this.symbols[name];
        return new OffsetMap({
            symbols,
            romCapacity: this.romCapacity,
            romEndOffset: this.romEndOffset,
            source: this.source,
        });
    }

    /** Every symbol whose name matches, in address order — how families (2205 learnsets) are found. */
    findAll(pattern) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        return Object.values(this.symbols).filter(s => re.test(s.name)).sort((a, b) => a.addr - b.addr);
    }

    toJSON() {
        return {
            _comment: 'Generated from a base build .map by randomizer/injector/symbolMap.js (T-238). Valid ONLY for that exact base ROM.',
            romCapacity: this.romCapacity,
            romEndOffset: this.romEndOffset,
            source: this.source,
            symbols: this.symbols,
        };
    }

    static fromJSON(json) {
        if (!json || typeof json !== 'object' || !json.symbols) throw new Error('Not an offset map JSON (no `symbols`)');
        return new OffsetMap({
            symbols: json.symbols,
            romCapacity: json.romCapacity ?? ROM_MAX_BYTES,
            romEndOffset: json.romEndOffset ?? 0,
            source: json.source ?? null,
        });
    }
}

// ── Line shapes ──────────────────────────────────────────────────────────────

// ` .rodata.gItemsInfo   0x000000000860a998   0x15000 build/modern/src/data/items.o`
// `.text                 0x0000000008000000   0x9e1e78`
const SECTION_RE = /^(\s*)(\.\S+)\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)(?:\s+(.*))?$/;
// A wrapped section name alone on its line: ` .rodata.sBulbasaurLevelUpLearnset`
const SECTION_NAME_ONLY_RE = /^(\s*)(\.\S+)\s*$/;
// The address/size line that completes a wrapped name (no section name of its own).
const SECTION_BODY_RE = /^\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)(?:\s+(.*))?$/;
// `                0x000000000860a998                gItemsInfo`
const SYMBOL_RE = /^\s+(0x[0-9a-fA-F]+)\s+(\S+)\s*$/;
const LOAD_ADDRESS_RE = /load address\s+(0x[0-9a-fA-F]+)/;

function isSymbolName(name) {
    // Skip linker bookkeeping: `. = ALIGN (0x4)` (caught earlier by the trailing-token rule),
    // `PROVIDE (…)`, absolute `0x…` values and section-ish names.
    return !!name && !name.startsWith('0x') && !name.startsWith('.') && !name.startsWith('*') && name !== 'PROVIDE';
}

/** Parse the text of a GNU ld `.map` into an OffsetMap. */
function parseMapFile(text, { source = null } = {}) {
    const lines = String(text).split(/\r?\n/);

    let romCapacity = ROM_MAX_BYTES;
    let inMemoryConfig = false;
    let inDiscarded = false;
    let started = false;              // past the "Linker script and memory map" header

    let output = null;                // current top-level output section {vma, lma}
    let current = null;               // current input section {name, vma, lma, size, object}
    let pendingName = null;           // a wrapped section name awaiting its address line

    const sections = [];              // for size splitting + the ROM end
    const rawSymbols = [];            // {name, addr, section}

    const openSection = (name, vma, size, rest, indent) => {
        const lmaMatch = rest ? rest.match(LOAD_ADDRESS_RE) : null;
        const objectMatch = rest && !lmaMatch ? rest.trim().split(/\s+/)[0] : null;
        const isOutput = indent.length === 0;
        let lma = lmaMatch ? parseInt(lmaMatch[1], 16) : null;
        if (isOutput) {
            output = { vma, lma: lma !== null ? lma : vma };
        } else if (lma === null && output) {
            // An input section inherits its enclosing output section's load address.
            lma = output.lma + (vma - output.vma);
        }
        current = {
            name,
            vma,
            lma: lma !== null ? lma : vma,
            size,
            object: objectMatch,
            symbols: [],
        };
        sections.push(current);
    };

    for (const line of lines) {
        if (!line.trim()) continue;

        if (/^Memory Configuration/.test(line)) { inMemoryConfig = true; continue; }
        if (/^Discarded input sections/.test(line)) { inDiscarded = true; continue; }
        if (/^Linker script and memory map/.test(line)) { inMemoryConfig = false; inDiscarded = false; started = true; continue; }

        if (inMemoryConfig) {
            const m = line.match(/^ROM\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)/);
            if (m) romCapacity = parseInt(m[2], 16);
            continue;
        }
        if (!started) continue;       // archive-member list / discarded sections
        if (inDiscarded) continue;
        if (/^(LOAD|OUTPUT|START GROUP|END GROUP)\b/.test(line)) continue;
        if (/^\s*\*fill\*/.test(line)) continue;
        if (/\bPROVIDE\b|\bASSERT\b|=\s/.test(line)) continue;

        if (pendingName) {
            const body = line.match(SECTION_BODY_RE);
            if (body && !SYMBOL_RE.test(line)) {
                openSection(pendingName.name, parseInt(body[1], 16), parseInt(body[2], 16), body[3], pendingName.indent);
                pendingName = null;
                continue;
            }
            pendingName = null;       // not the expected continuation — fall through
        }

        const sec = line.match(SECTION_RE);
        if (sec) {
            openSection(sec[2], parseInt(sec[3], 16), parseInt(sec[4], 16), sec[5], sec[1]);
            continue;
        }

        const nameOnly = line.match(SECTION_NAME_ONLY_RE);
        if (nameOnly) { pendingName = { name: nameOnly[2], indent: nameOnly[1] }; continue; }

        const sym = line.match(SYMBOL_RE);
        if (sym && isSymbolName(sym[2])) {
            const entry = { name: sym[2], addr: parseInt(sym[1], 16), section: current };
            rawSymbols.push(entry);
            if (current) current.symbols.push(entry);
            continue;
        }
    }

    const symbols = {};
    for (const entry of rawSymbols) {
        const sec = entry.section;
        let size = null;
        if (sec) {
            const sorted = sec.symbols.slice().sort((a, b) => a.addr - b.addr);
            const idx = sorted.findIndex(s => s === entry);
            const next = sorted[idx + 1];
            const end = next ? next.addr : sec.vma + sec.size;
            size = Math.max(0, end - entry.addr);
        }
        let romOffset = null;
        if (inRom(entry.addr)) {
            romOffset = entry.addr - ROM_BASE_ADDR;
        } else if (sec && inRom(sec.lma)) {
            romOffset = sec.lma + (entry.addr - sec.vma) - ROM_BASE_ADDR;
        }
        symbols[entry.name] = {
            name: entry.name,
            addr: entry.addr,
            romOffset,
            size,
            // A map size is an upper bound (section end / next symbol), never the declared size.
            sizeExact: false,
            section: sec ? sec.name : null,
            object: sec ? sec.object : null,
        };
    }

    if (Object.keys(symbols).length === 0) {
        throw new Error('Parsed no symbols out of the .map — wrong file, or a linker map in an unexpected format');
    }

    // The last loaded ROM byte across every section — what "free space" is measured against.
    let romEndOffset = 0;
    for (const sec of sections) {
        if (!inRom(sec.lma)) continue;
        romEndOffset = Math.max(romEndOffset, sec.lma + sec.size - ROM_BASE_ADDR);
    }

    return new OffsetMap({ symbols, romCapacity, romEndOffset, source });
}

/**
 * Parse a `make syms` file — `objdump -t` boiled down to `<addr8> <flag> <size8> <name>`.
 *
 * The reason this exists next to the `.map` parser: a linker map lists only what the linker resolved,
 * so **local** symbols — every map-script label, i.e. every Group-D setvar site — are absent from it.
 * `objdump -t` sees them.
 */
function parseSymFile(text, { source = null } = {}) {
    const symbols = {};
    let romEndOffset = 0;
    for (const line of String(text).split(/\r?\n/)) {
        const m = line.match(/^([0-9a-fA-F]{8})\s+(\S)\s+([0-9a-fA-F]{8})\s+(\S+)\s*$/);
        if (!m) continue;
        const addr = parseInt(m[1], 16);
        const size = parseInt(m[3], 16);
        const romOffset = inRom(addr) ? addr - ROM_BASE_ADDR : null;
        symbols[m[4]] = {
            name: m[4], addr, romOffset, size,
            sizeExact: size > 0,           // objdump states the declared size; 0 = label with no size
            section: null, object: null, local: m[2] === m[2].toLowerCase(),
        };
        if (romOffset !== null) romEndOffset = Math.max(romEndOffset, romOffset + size);
    }
    if (Object.keys(symbols).length === 0) {
        throw new Error('Parsed no symbols out of the .sym — wrong file, or not the `make syms` format');
    }
    return new OffsetMap({ symbols, romEndOffset, source });
}

/** Load an offset map from a `.map`, a `.sym`, or a `.json` previously exported by `toJSON()`. */
function loadOffsetMap(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Offset map not found: ${filePath} (build the base first — its .map ships next to the ROM)`);
    }
    const text = fs.readFileSync(filePath, 'utf8');
    if (filePath.endsWith('.json')) return OffsetMap.fromJSON(JSON.parse(text));
    if (filePath.endsWith('.sym')) return parseSymFile(text, { source: filePath });
    return parseMapFile(text, { source: filePath });
}

module.exports = {
    parseMapFile,
    parseSymFile,
    loadOffsetMap,
    OffsetMap,
    toRomOffset,
    toGbaPointer,
    ROM_BASE_ADDR,
    ROM_MAX_BYTES,
};
