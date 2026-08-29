'use strict';

/**
 * T-290 — premium transformation items: held items that turn a Pokémon into a stronger form, placed
 * like mega stones but as a tier of their own.
 *
 * They are the `FORM_CHANGE_ITEM_HOLD` / `BATTLE_PRIMAL_REVERSION` / item-gated `BEGIN_BATTLE` group
 * from the T-277 engine audit — the transformations the PLAYER opts into by attaching an item, as
 * opposed to the automatic battle states (Aegislash, Wishiwashi…) that nobody chooses. See
 * randomizer/docs/families-and-forms.md.
 *
 * The owner's rules, and who owns each:
 *   1. only in the last mega-stone batch          → the placement caller
 *   2. only if the base Pokémon is obtainable     → HERE
 *   3. only the Elite Four and the Champion       → the trainer caller
 *   4. carried as well as a regular mega stone    → the trainer caller
 *   5. equippable only alongside its base form    → the trainer caller
 *   6. withheld entirely if the form rates AG     → HERE
 *   7. mega stones first when slots run short     → the placement caller, by truncating this list
 *
 * O9 — one Ogerpon mask and one Genesect Drive per run, chosen at random. Every other mask and drive
 * is simply not placed, so a run offers at most nine of these.
 */

const rng = require('./rng');
const { TIER_AG, MEGA_TRAINERS } = require('./constants');

/**
 * A `choices` entry is a group: the run takes ONE of them (O9). Everything else is a single item.
 * `base` is the Pokémon that must be obtainable; `form` is what the item turns it into, and whose
 * tier decides whether the item exists at all.
 */
const PREMIUM_ITEMS = [
    { item: 'ITEM_RUSTED_SWORD',    base: 'SPECIES_ZACIAN_HERO',      form: 'SPECIES_ZACIAN_CROWNED' },
    { item: 'ITEM_RUSTED_SHIELD',   base: 'SPECIES_ZAMAZENTA_HERO',   form: 'SPECIES_ZAMAZENTA_CROWNED' },
    { item: 'ITEM_RED_ORB',         base: 'SPECIES_GROUDON',          form: 'SPECIES_GROUDON_PRIMAL' },
    { item: 'ITEM_BLUE_ORB',        base: 'SPECIES_KYOGRE',           form: 'SPECIES_KYOGRE_PRIMAL' },
    { item: 'ITEM_ADAMANT_CRYSTAL', base: 'SPECIES_DIALGA',           form: 'SPECIES_DIALGA_ORIGIN' },
    { item: 'ITEM_LUSTROUS_GLOBE',  base: 'SPECIES_PALKIA',           form: 'SPECIES_PALKIA_ORIGIN' },
    { item: 'ITEM_GRISEOUS_ORB',    base: 'SPECIES_GIRATINA_ALTERED', form: 'SPECIES_GIRATINA_ORIGIN' },
    {
        group: 'OGERPON_MASK',
        base: 'SPECIES_OGERPON_TEAL',
        choices: [
            { item: 'ITEM_WELLSPRING_MASK',  form: 'SPECIES_OGERPON_WELLSPRING' },
            { item: 'ITEM_HEARTHFLAME_MASK', form: 'SPECIES_OGERPON_HEARTHFLAME' },
            { item: 'ITEM_CORNERSTONE_MASK', form: 'SPECIES_OGERPON_CORNERSTONE' },
        ],
    },
    {
        // T-155 cuts Genesect to its base form, so the Drive forms are not in the dex — and a Drive
        // changes nothing but Techno Blast's type anyway (all five entries share GENESECT_SPECIES_INFO,
        // verified in T-283). The base's rating is therefore the honest one for rule 6.
        group: 'GENESECT_DRIVE',
        base: 'SPECIES_GENESECT',
        choices: [
            { item: 'ITEM_DOUSE_DRIVE', form: 'SPECIES_GENESECT_DOUSE' },
            { item: 'ITEM_SHOCK_DRIVE', form: 'SPECIES_GENESECT_SHOCK' },
            { item: 'ITEM_BURN_DRIVE',  form: 'SPECIES_GENESECT_BURN' },
            { item: 'ITEM_CHILL_DRIVE', form: 'SPECIES_GENESECT_CHILL' },
        ],
    },
];

function shuffle(array) {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Which premium items this run may place, in a random order so a caller short on slots can truncate
 * without favouring any of them (rule 7).
 *
 * @param {Array}  pokedex      the run's rated pokémon
 * @param {Set<string>} obtainable species ids the player can actually get this run
 * @returns {Array<{item: string, base: string, form: string}>}
 */
function selectPremiumItems(pokedex, obtainable) {
    const tierOf = id => {
        const poke = (pokedex || []).find(p => p.id === id);
        return poke && poke.rating ? poke.rating.tier : undefined;
    };
    // Rule 6 — an AG form withholds its item. A form the dex does not carry (a Genesect Drive) is
    // judged by its base, which is the same Pokémon in everything but Techno Blast's type.
    const allowed = (entry, form) => {
        const tier = tierOf(form) !== undefined ? tierOf(form) : tierOf(entry.base);
        return tier !== TIER_AG;
    };

    const picked = [];
    for (const entry of PREMIUM_ITEMS) {
        if (!obtainable || !obtainable.has(entry.base)) continue;   // rule 2
        if (!entry.choices) {
            if (allowed(entry, entry.form)) picked.push({ item: entry.item, base: entry.base, form: entry.form });
            continue;
        }
        // O9 — one of the group, drawn only from the choices rule 6 allows.
        const viable = entry.choices.filter(choice => allowed(entry, choice.form));
        if (!viable.length) continue;
        const choice = viable[Math.floor(rng.random() * viable.length)];
        picked.push({ item: choice.item, base: entry.base, form: choice.form, group: entry.group });
    }
    return shuffle(picked);
}

/**
 * Rule 1 — the last mega-stone batch, the one unlocked by defeating May. The owner named its five
 * trainers: Violet, Jacki, Fredrick, Davis and Jonas, i.e. `MEGA_TRAINERS` ids 17–21. Nothing in the
 * sources records the batch, so it is stated here once rather than inferred from trainer levels.
 */
const PREMIUM_ITEM_TRAINERS = ['17', '18', '19', '20', '21'];

/**
 * Rule 7 — which of the last batch's trainers hands out which premium item.
 *
 * `assignMegaStones` runs first and is never disturbed: premium items take only the last-batch slots
 * it left empty, and when every slot holds a mega stone nothing is placed. `picks` arrives already
 * shuffled by `selectPremiumItems`, so truncating from the front is fair.
 *
 * Lives beside the mega assignment for the reason that module exists (B-062): this rule crosses a JSON
 * boundary into the writer, the injector and the docs, and three re-derivations of one rule is exactly
 * how the documentation and the ROM came to disagree.
 *
 * @param {Array}  picks                   from `selectPremiumItems`
 * @param {{assigned: Map}} megaAssignment from `assignMegaStones`
 * @returns {Map<string, {item: string, base: string, form: string}>} MEGA_TRAINERS id → pick
 */
function assignPremiumItems(picks, megaAssignment) {
    const taken = (megaAssignment && megaAssignment.assigned) || new Map();
    const freeSlots = PREMIUM_ITEM_TRAINERS.filter(id => !taken.has(id));
    const queue = [...(picks || [])];
    const out = new Map();
    for (const slot of freeSlots) {
        if (!queue.length) break;
        out.set(slot, queue.shift());
    }
    return out;
}

/**
 * Rules 3, 4 and 5 — which premium item a trainer's team carries, and on which member.
 *
 * The caller decides who is eligible (rule 3: the Elite Four and the Champion). This decides the rest:
 * the item must be one the run actually placed, the team must field its base form, and it goes on a
 * mon that is not already carrying something — a premium item is EXTRA (rule 4), so it never displaces
 * a mega stone or a held item, it simply goes elsewhere or not at all.
 *
 * One per trainer: the first eligible pairing in team order, which keeps every output path agreeing.
 *
 * @param {Array}  team    the trainer's mons, each `{ species, item?, megaStone? }`
 * @param {Array}  placed  the picks this run placed (`assignPremiumItems`' values)
 * @returns {{monIndex: number, item: string, base: string, form: string}|null}
 */
function equipPremiumItem(team, placed) {
    if (!Array.isArray(team) || !team.length || !Array.isArray(placed) || !placed.length) return null;
    for (let monIndex = 0; monIndex < team.length; monIndex++) {
        const mon = team[monIndex];
        if (!mon || mon.item || mon.megaStone) continue;   // rule 4 — extra, never a replacement
        const pick = placed.find(candidate => candidate.base === mon.species);   // rule 5
        if (pick) return { monIndex, item: pick.item, base: pick.base, form: pick.form };
    }
    return null;
}

module.exports = {
    PREMIUM_ITEMS, selectPremiumItems, assignPremiumItems, equipPremiumItem,
    PREMIUM_ITEM_TRAINERS, MEGA_TRAINERS,
};
