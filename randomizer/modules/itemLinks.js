'use strict';

// T-133 — link-aware bag/TM consumption. A trainer's item economy mirrors the PLAYER's: at each world
// pick-point the player takes ONE option from a group and forgoes the rest. A trainer's bag therefore holds
// each pick-group as a LINKED PACK (all options, local to that bag); the trainer only "makes the pick" when
// it actually USES an item — on use, one unit of each pack sibling is removed from ITS OWN bag (personal,
// never cascades). This module is the single source of truth for that consumption, used identically at both
// consumption moments (forward archetype assignment + post-build item assignment) and for TMs at move
// selection. Pure: mutates the passed pouch, consumes no RNG.
//
// A "pouch" is a flat multiset `units` (item display names OR MOVE_* ids) plus `groups`
// ([{ members:[id,…] }] — each ONE pick-instance). Duplicates in `units` = multiple physical copies
// (e.g. a buyable/loose copy alongside a pack copy). See T-133 for the full model + owner nuances.

// A bag entry produced by `linkedChoiceSample` — carries ALL options of a pick-group as ONE atomic element,
// so it survives the definition-time bag cascade + the difficulty bagOffset intact and is expanded (into flat
// units + a link group) only at the per-trainer finalize (`normalizeTrainerBagTms`). Local to the bag it lands
// in: each `linkedChoiceSample` call = one distinct pick-instance.
const LINKED_PACK = '__linkedPack';

// Replaces `sample([...group])` in bag construction. Does NOT pick — it packs all options, linked together.
function linkedChoiceSample(options) {
    return { [LINKED_PACK]: [...options] };
}

const isLinkedPack = x => !!x && typeof x === 'object' && Array.isArray(x[LINKED_PACK]);

// Flatten a bag array that may hold `linkedChoiceSample` markers: plain entries stay as units; each marker
// becomes its member units PLUS a link group. Returns { units, groups } (members verbatim — the caller routes
// TM_* packs to the tms pool). Order-preserving, so the non-marker case is byte-identical to the old bag.
function expandLinkedPacks(entries) {
    const units = [];
    const groups = [];
    for (const e of (entries || [])) {
        if (isLinkedPack(e)) {
            const members = e[LINKED_PACK];
            for (const m of members) units.push(m);
            groups.push({ members: [...members] });
        } else {
            units.push(e);
        }
    }
    return { units, groups };
}

const countOf = (units, id) => {
    let n = 0;
    for (const u of units) if (u === id) n++;
    return n;
};

const groupsWith = (groups, id) => (groups || []).filter(g => (g.members || []).includes(id));

// "Unlinked" (loose / buyable / fixed-reward) units of `id`: physical copies beyond those claimed by a
// pick-pack. Each pick-pack containing `id` lays claim to exactly one unit of it.
function unlinkedCount(units, groups, id) {
    return countOf(units, id) - groupsWith(groups, id).length;
}

function removeOne(units, id) {
    const i = units.indexOf(id);
    if (i >= 0) { units.splice(i, 1); return true; }
    return false;
}

// Consume one unit of `id` for USE (equip / teach), respecting links. Mutates `units` and `groups`.
// Returns:
//   { removed:false }                                             — id not present, nothing changed
//   { removed:true, activated:false }                             — spent a loose/unlinked copy, no pack
//   { removed:true, activated:true, pack:[…], removedSiblings:[…] } — a pack activated: siblings trimmed
function consumeLinkedUnit(units, groups, id) {
    if (countOf(units, id) === 0) return { removed: false };

    // Prefer a loose/unlinked copy → the pick-pack is left intact (owner nuances 3 & 4; prevents the n2
    // self-block bug whenever a buyable copy exists).
    if (unlinkedCount(units, groups, id) > 0) {
        removeOne(units, id);
        return { removed: true, activated: false };
    }

    // Every remaining copy of `id` is pack-claimed → making this pick spends one pack and forgoes its
    // siblings (one unit each, from THIS bag only).
    const g = groupsWith(groups, id)[0];
    removeOne(units, id);
    const removedSiblings = [];
    for (const sib of g.members) {
        if (sib === id) continue;
        if (removeOne(units, sib)) removedSiblings.push(sib);
    }
    groups.splice(groups.indexOf(g), 1);
    return { removed: true, activated: true, pack: [...g.members], removedSiblings };
}

module.exports = { consumeLinkedUnit, unlinkedCount, linkedChoiceSample, isLinkedPack, expandLinkedPacks, LINKED_PACK };
