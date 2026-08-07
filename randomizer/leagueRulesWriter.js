'use strict';

// T-257 / T-258 — the three Pokémon League house rules, patched into the runtime settings block
// `gRandomizerSettings` (src/randomizer_settings.c) so a prebuilt ROM can be repatched without recompiling
// (ADR-022). The engine reads them through include/league_rules.h:
//
//   healFaintedAfterBattle       — restore the party after an ordinary battle
//   healFaintedAfterBattleLeague — restore the party after an Elite Four / Champion battle
//   leagueMoveRelearnAllowed     — let the summary-screen relearner work inside the gauntlet (T-258)
//
// Called from make.js buildOneRom at ROM-build time (make.js's restore() reverts the file afterwards) and
// re-run by the injector's dataDrivenAndToggles module. Modeled on moveRelearnerPriceWriter.js; the only
// difference is that these are bool8s, written as the C literals TRUE/FALSE.

const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.resolve(__dirname, '..', 'src', 'randomizer_settings.c');

// Struct order — the injector encodes the bytes in this same order.
const LEAGUE_RULE_FIELDS = [
    'healFaintedAfterBattle',
    'healFaintedAfterBattleLeague',
    'leagueMoveRelearnAllowed',
];

// Every rule is opt-in: anything that is not exactly `true` lands on the committed default, so an absent or
// malformed config reproduces the base ROM's behaviour.
function ruleValue(v) {
    return v === true;
}

/**
 * Patch the three league-rule fields of gRandomizerSettings in the given C source text. Pure — returns the
 * new text. Throws when a field is missing from the source: that means the base sources and this writer
 * have drifted, and silently writing three quarters of the rules would be worse than stopping.
 * @param {string} content - src/randomizer_settings.c source
 * @param {{healFaintedAfterBattle?: boolean, healFaintedAfterBattleLeague?: boolean, leagueMoveRelearnAllowed?: boolean}|null|undefined} rules
 * @returns {string}
 */
function patchLeagueRulesInContent(content, rules) {
    const cfg = rules || {};
    let out = content;

    for (const field of LEAGUE_RULE_FIELDS) {
        const pattern = new RegExp(`(\\.${field}\\s*=\\s*)(TRUE|FALSE)`);
        if (!pattern.test(out))
            throw new Error(`.${field} is not in src/randomizer_settings.c`);
        out = out.replace(pattern, `$1${ruleValue(cfg[field]) ? 'TRUE' : 'FALSE'}`);
    }

    return out;
}

/**
 * Read the settings C file, patch the three rules from config, and write it back.
 * A no-op-equivalent when every rule is absent or false (the committed default).
 */
async function writeLeagueRules(rules, { file = SETTINGS_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchLeagueRulesInContent(content, rules);
    await fs.writeFile(file, patched, 'utf8');
}

module.exports = {
    writeLeagueRules,
    patchLeagueRulesInContent,
    ruleValue,
    LEAGUE_RULE_FIELDS,
    file: SETTINGS_FILE,
};
