'use strict';

/**
 * T-101/T-102 — loader + validator for the teambuilding archetype models
 * (`data/archetypes/{singles,doubles}.json`). Each model is ONE base archetype per team
 * (balanced|offensive|defensive) + a weighted, stackable gimmick layer (Batch-3 owner decision). The
 * 2C engine (T-107) reads `entry` (emergent crystallization from a partial team) and `structure`
 * (soft preferred composition). This module just loads + integrity-checks the data; the feature
 * DETECTORS (mapping a mon → features) are implemented later in the engine. Values are provisional per
 * the meta-analysis validation clause (see docs/research/rating-decisions.md).
 */

const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, 'data', 'archetypes');
const FORMATS = ['singles', 'doubles'];
const VALID_CATEGORIES = ['balanced', 'offensive', 'defensive'];

/** Throws with a full list of problems if the model is malformed; returns it otherwise. */
function validateArchetypeModel(model, format = null) {
    const errs = [];
    if (!model || typeof model !== 'object') throw new Error('archetype model must be an object');
    if (!FORMATS.includes(model.format)) errs.push(`invalid format: ${model.format}`);
    if (format && model.format !== format) errs.push(`format mismatch: ${model.format} !== ${format}`);

    const feats = model.featureDefinitions || {};
    if (!Object.keys(feats).length) errs.push('featureDefinitions is empty');

    const seenIds = new Set();
    const checkList = (arr, kind, requireCategory) => {
        if (!Array.isArray(arr) || arr.length === 0) { errs.push(`${kind} must be a non-empty array`); return; }
        for (const a of arr) {
            const tag = a && a.id ? `${kind}.${a.id}` : kind;
            if (!a || !a.id) { errs.push(`${kind}: an entry is missing 'id'`); continue; }
            if (seenIds.has(a.id)) errs.push(`duplicate archetype id: ${a.id}`);
            seenIds.add(a.id);
            if (!a.name) errs.push(`${tag}: missing 'name'`);
            if (requireCategory && !VALID_CATEGORIES.includes(a.category)) errs.push(`${tag}: invalid/missing category '${a.category}'`);
            if (!Array.isArray(a.entry) || a.entry.length === 0) errs.push(`${tag}: 'entry' must be a non-empty array`);
            for (const e of (a.entry || [])) {
                if (!(e.feature in feats)) errs.push(`${tag}: entry feature '${e.feature}' is not in featureDefinitions`);
                if (typeof e.min !== 'number') errs.push(`${tag}: entry '${e.feature}' needs a numeric 'min'`);
            }
            if (!Array.isArray(a.structure) || a.structure.length === 0) errs.push(`${tag}: 'structure' must be a non-empty array`);
            for (const s of (a.structure || [])) {
                if (!(s.role in feats)) errs.push(`${tag}: structure role '${s.role}' is not in featureDefinitions`);
                if (typeof s.min !== 'number' || typeof s.max !== 'number' || s.min > s.max) errs.push(`${tag}: role '${s.role}' has bad min/max`);
                if (typeof s.weight !== 'number') errs.push(`${tag}: role '${s.role}' needs a numeric 'weight'`);
            }
        }
    };
    checkList(model.baseArchetypes, 'baseArchetypes', true);
    checkList(model.gimmicks, 'gimmicks', false);

    if (errs.length) throw new Error(`Invalid ${model.format || '?'} archetype model:\n- ${errs.join('\n- ')}`);
    return model;
}

function loadArchetypeModel(format) {
    if (!FORMATS.includes(format)) throw new Error(`unknown archetype format: ${format}`);
    const model = JSON.parse(fs.readFileSync(path.join(DIR, `${format}.json`), 'utf8'));
    return validateArchetypeModel(model, format);
}

module.exports = { loadArchetypeModel, validateArchetypeModel, DIR, FORMATS, VALID_CATEGORIES };
