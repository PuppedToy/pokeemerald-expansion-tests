'use strict';

// T-068 — turn a bundle's per-ROM `starterNaming` into the four starter_choose.c code blocks and
// splice them in. This is the LAST line of defence before untrusted bundle data becomes C source, so
// every nickname is sanitized to [A-Za-z0-9 ] and capped at POKEMON_NAME_LENGTH (12). The genders map
// to the game's MON_MALE / MON_FEMALE / MON_GENDERLESS constants; the maker forces gender only where
// the species allows it (genderless/fixed-gender mons keep their real gender — handled in C).
//
// The committed src/starter_choose.c ships vanilla defaults (empty name, MON_GENDERLESS) so an
// un-rewritten build is unchanged.
//
// T-237 — the three extra-starter arrays are now fixed at STARTER_EXTRA_CAPACITY and exported, and a
// separate `gStarterExtraCount` says how many slots this ROM filled (it used to be a STARTER_EXTRA_COUNT
// #define that this writer rewrote, which resized three arrays and moved everything after them in the
// ROM). Nicknames are stored inline (`_("…")` into a `u8 [POKEMON_NAME_LENGTH + 1]`) instead of pointing
// at COMPOUND_STRINGs. Every block is now matched by REGEX rather than by a byte-for-byte copy of the
// committed text, so an unrelated edit to starter_choose.c can no longer make a replacement silently
// no-op (the failure mode behind B-049).

const { STARTER_EXTRA_CAPACITY } = require('./layout');

const MAX_NICKNAME = 12; // include/constants/global.h POKEMON_NAME_LENGTH
const DEFAULT_EXTRA_COUNT = 9; // how many extra starters the committed source fills in

function sanitizeNickname(name) {
    if (typeof name !== 'string') return '';
    return name.replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, MAX_NICKNAME);
}

function genderConst(gender) {
    if (gender === 'M') return 'MON_MALE';
    if (gender === 'F') return 'MON_FEMALE';
    return 'MON_GENDERLESS';
}

// ── The blocks this writer owns in src/starter_choose.c, matched by shape ─────
const STARTER_NICKNAME_RE = /const u8 gStarterNickname\[[^\]]*\] = _\("[^"]*"\);/;
const STARTER_GENDER_RE = /const u8 gStarterGender = MON_[A-Z]+;/;
const EXTRA_NICKNAMES_RE = /const u8 gStarterExtraNicknames\[STARTER_EXTRA_CAPACITY\]\[[^\]]*\] =\s*\{[\s\S]*?\n\};/;
const EXTRA_GENDERS_RE = /const u8 gStarterExtraGenders\[STARTER_EXTRA_CAPACITY\] =\s*\{[\s\S]*?\n\};/;
const EXTRA_MON_RE = /const u16 gStarterExtraMon\[STARTER_EXTRA_CAPACITY\] =\s*\{[\s\S]*?\n\};/;
const EXTRA_COUNT_RE = /const u8 gStarterExtraCount = \d+;/;

// Build the four replacement blocks for one ROM's naming. `extraCount` = the ROM's actual number of
// extra starters; pad with defaults if `naming` is short. Only the filled slots are emitted — the rest of
// each array is zero-filled by the compiler and never read (gStarterExtraCount bounds every accessor).
function buildStarterNameCode(naming, extraCount) {
    const starter = naming && naming.starter;
    const extras = (naming && naming.extras) || [];

    const nickLines = [];
    const genderLines = [];
    for (let i = 0; i < extraCount; i++) {
        const e = extras[i];
        // Inline fixed-width name (T-237): a `_()` string literal initialising the row, not a pointer.
        nickLines.push(`    _("${sanitizeNickname(e && e.nickname)}"),`);
        genderLines.push(`    ${genderConst(e && e.gender)},`);
    }

    return {
        starterNickname: `const u8 gStarterNickname[POKEMON_NAME_LENGTH + 1] = _("${sanitizeNickname(starter && starter.nickname)}");`,
        starterGender: `const u8 gStarterGender = ${genderConst(starter && starter.gender)};`,
        extraNicknames: `const u8 gStarterExtraNicknames[STARTER_EXTRA_CAPACITY][POKEMON_NAME_LENGTH + 1] =\n{\n${nickLines.join('\n')}\n};`,
        extraGenders: `const u8 gStarterExtraGenders[STARTER_EXTRA_CAPACITY] =\n{\n${genderLines.join('\n')}\n};`,
    };
}

// Replace the four naming blocks in `fileContent`.
function applyStarterNames(fileContent, naming, extraCount) {
    const code = buildStarterNameCode(naming, extraCount);
    return fileContent
        .replace(STARTER_NICKNAME_RE, code.starterNickname)
        .replace(STARTER_GENDER_RE, code.starterGender)
        .replace(EXTRA_NICKNAMES_RE, code.extraNicknames)
        .replace(EXTRA_GENDERS_RE, code.extraGenders);
}

// B-049 — apply ALL per-ROM starter_choose.c edits at once: the extra-mon species array, the count, and
// the nickname/gender arrays. They must stay in lock-step: the arrays are always rebuilt with exactly
// `extraStarters.length` entries (even when `starterNaming` is null → default-filled), and the count is
// written from the same number, so a ROM whose extra-starter count differs from the committed default
// can never leave a stale row readable. T-237 removed the resizing #define — the arrays are fixed at
// STARTER_EXTRA_CAPACITY and only the count varies. Pure string transform; `make.js` restores the file.
function applyStarterChoose(fileContent, extraStarters, starterNaming) {
    const count = extraStarters.length;
    if (count > STARTER_EXTRA_CAPACITY) {
        throw new Error(`starterNameWriter: ${count} extra starters exceed STARTER_EXTRA_CAPACITY `
            + `(${STARTER_EXTRA_CAPACITY}). Raise it in include/constants/randomizer_layout.h.`);
    }
    const monBlock = `const u16 gStarterExtraMon[STARTER_EXTRA_CAPACITY] =\n{\n    ${extraStarters.join(',\n    ')},\n};`;
    let out = fileContent
        .replace(EXTRA_MON_RE, monBlock)
        .replace(EXTRA_COUNT_RE, `const u8 gStarterExtraCount = ${count};`);
    return applyStarterNames(out, starterNaming, count);
}

module.exports = {
    applyStarterChoose,
    sanitizeNickname,
    genderConst,
    buildStarterNameCode,
    applyStarterNames,
    DEFAULT_EXTRA_COUNT,
    MAX_NICKNAME,
    // block matchers, exported so tests can assert the committed source still matches them
    STARTER_NICKNAME_RE,
    STARTER_GENDER_RE,
    EXTRA_NICKNAMES_RE,
    EXTRA_GENDERS_RE,
    EXTRA_MON_RE,
    EXTRA_COUNT_RE,
};
