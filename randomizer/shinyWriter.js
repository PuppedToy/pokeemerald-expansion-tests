'use strict';

// T-274 — the per-run shiny rule and starter IV floors, patched into the runtime settings block
// `gRandomizerSettings` (src/randomizer_settings.c) so a prebuilt ROM can be repatched without recompiling
// (ADR-022). The engine reads them at its one shiny seam (src/pokemon.c `IsBoxMonShinyByRule`) and in
// `CB2_GiveStarter` (src/battle_setup.c):
//
//   shinyByQuality     — TRUE: the IV total decides. FALSE: gen 3's PID/OT-id lottery.
//   shinyOdds          — classic mode's threshold out of 65536 (8 ⇒ 1 in 8192)
//   shinyIvThreshold   — quality mode's IV total (150 ⇒ about 1 in 205 wild Pokémon)
//   starterPerfectIvs  — how many of the starter's IVs are forced to 31
//   starterMinIvTotal  — ... and the total its IVs are then topped up to
//
// Called from make.js buildOneRom at ROM-build time (make.js's restore() reverts the file afterwards) and
// re-run by the injector's dataDrivenAndToggles module. Sibling of leagueRulesWriter.js, which patches the
// same struct's league fields; the *numbers* are decided by shinyRules.js, the single home of the maths.

const fs = require('fs').promises;
const path = require('path');
const { normalizeShinyRules } = require('./shinyRules');

const SETTINGS_FILE = path.resolve(__dirname, '..', 'src', 'randomizer_settings.c');

// Struct order — the injector encodes the bytes in this same order.
const SHINY_RULE_FIELDS = [
    'shinyByQuality',
    'shinyOdds',
    'shinyIvThreshold',
    'starterPerfectIvs',
    'starterMinIvTotal',
];

/**
 * Patch the five shiny/starter-IV fields of gRandomizerSettings in the given C source text. Pure — returns
 * the new text. Throws when a field is missing from the source: that means the base sources and this writer
 * have drifted, and writing four fifths of the rule would be worse than stopping.
 * @param {string} content - src/randomizer_settings.c source
 * @param {object|null|undefined} config - the run config (shinyByQuality, shinyIvThreshold,
 *   shinyChancePercent, starterPerfectIvs, starterMinIvTotal); absent fields fall back to the defaults,
 *   which are exactly the committed initializers.
 * @returns {string}
 */
function patchShinyRulesInContent(content, config) {
    const rules = normalizeShinyRules(config);
    let out = content;

    for (const field of SHINY_RULE_FIELDS) {
        const pattern = new RegExp(`(\\.${field}\\s*=\\s*)(TRUE|FALSE|\\d+)`);
        if (!pattern.test(out))
            throw new Error(`.${field} is not in src/randomizer_settings.c`);
        const value = field === 'shinyByQuality'
            ? (rules.shinyByQuality ? 'TRUE' : 'FALSE')
            : String(rules[field]);
        out = out.replace(pattern, `$1${value}`);
    }

    return out;
}

/**
 * Read the settings C file, patch the shiny rule from config, and write it back.
 * A no-op-equivalent when the config carries none of the fields (the committed defaults).
 */
async function writeShinyRules(config, { file = SETTINGS_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchShinyRulesInContent(content, config);
    await fs.writeFile(file, patched, 'utf8');
}

module.exports = {
    writeShinyRules,
    patchShinyRulesInContent,
    SHINY_RULE_FIELDS,
    file: SETTINGS_FILE,
};
