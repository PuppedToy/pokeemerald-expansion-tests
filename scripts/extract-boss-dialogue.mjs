#!/usr/bin/env node
// T-206 — Boss dialogue extractor.
//
// Walks the ordered boss list (frontend/data/bosscaps.json, itself derived from src/caps.c) and, for
// each boss trainer, finds its main (non-rematch) `trainerbattle*` in data/maps/**/scripts.inc, then
// pulls the four dialogue buckets around it:
//   • PRE-BATTLE   — msgbox/message lines before the battle in the same script block
//   • IN-BATTLE INTRO (presentation) — the trainerbattle intro_text param (or, for _no_intro battles,
//                    the preceding msgbox)
//   • ON-DEFEAT    — the trainerbattle lose_text param (shown when the boss's last mon faints)
//   • POST-BATTLE  — msgbox/message after the battle + the event_script continuation (followed 1–2
//                    levels through goto/call)
// plus a completeness net: OTHER TEXT in the same map file mentioning the boss's name.
//
// It resolves every text label to its decoded `.string` body and writes a screenplay-style TXT
// (boss-dialogue.txt) with `[label @ file:line]` markers so the owner's edits can be mapped back to
// the exact `.string` in phase 2. Re-running OVERWRITES the TXT — regenerate from source, then edit.
//
// Usage: node scripts/extract-boss-dialogue.mjs [--out path]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const outArgIdx = process.argv.indexOf('--out');
const OUT = outArgIdx !== -1 ? path.resolve(process.argv[outArgIdx + 1]) : path.join(ROOT, 'boss-dialogue.txt');

// ── Gather all .inc files (label resolution corpus) ────────────────────────────
function walkInc(dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkInc(full, acc);
        else if (entry.isFile() && entry.name.endsWith('.inc')) acc.push(full);
    }
    return acc;
}
const incFiles = [
    ...walkInc(path.join(ROOT, 'data', 'maps')),
    ...(fs.existsSync(path.join(ROOT, 'data', 'scripts')) ? walkInc(path.join(ROOT, 'data', 'scripts')) : []),
    ...(fs.existsSync(path.join(ROOT, 'data', 'text')) ? walkInc(path.join(ROOT, 'data', 'text')) : []),
];

const LABEL_RE = /^(\w+):{1,2}\s*(?:@.*)?$/;

// Parse each file: lines, label→{file,idx}, per-line enclosing label.
const files = new Map(); // absPath -> { rel, lines }
const labelDef = new Map(); // label -> { file, idx }
for (const file of incFiles) {
    const rel = path.relative(ROOT, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    files.set(file, { rel, lines });
    lines.forEach((line, idx) => {
        const m = line.match(LABEL_RE);
        if (m && !labelDef.has(m[1])) labelDef.set(m[1], { file, idx });
    });
}

// Decode a text label to its readable string body (concatenated .string lines).
const STRING_RE = /^\s*\.string\s+"(.*)"\s*$/;
function decodeString(raw) {
    return raw
        .replace(/\\n/g, '\n')
        .replace(/\\l/g, '\n')
        .replace(/\\p/g, '\n\n')
        .replace(/\$$/, '')
        .replace(/\\/g, '');
}
const textCache = new Map();
function resolveText(label) {
    if (textCache.has(label)) return textCache.get(label);
    const def = labelDef.get(label);
    let result = null;
    if (def) {
        const { lines } = files.get(def.file);
        const parts = [];
        for (let i = def.idx + 1; i < lines.length; i++) {
            const s = lines[i].match(STRING_RE);
            if (s) { parts.push(s[1]); continue; }
            if (lines[i].trim() === '') { if (parts.length) break; else continue; }
            break; // hit a non-.string, non-blank line
        }
        if (parts.length) result = decodeString(parts.join('')).trim();
    }
    textCache.set(label, result);
    return result;
}

// The script block enclosing a given (file, idx): from the nearest preceding label to the next label.
function enclosingBlock(file, idx) {
    const { lines } = files.get(file);
    let start = idx;
    while (start > 0 && !LABEL_RE.test(lines[start])) start--;
    let end = idx + 1;
    while (end < lines.length && !LABEL_RE.test(lines[end])) end++;
    return { start, end };
}

// Collect msgbox/message text-label references from a range of lines, in order.
const MSG_RE = /^\s*(?:msgbox|message)\s+(\w+)/;
function collectMsgboxes(file, from, to) {
    const { lines } = files.get(file);
    const out = [];
    for (let i = from; i < to && i < lines.length; i++) {
        const m = lines[i].match(MSG_RE);
        if (m && resolveText(m[1])) out.push({ label: m[1], file, line: i + 1 });
    }
    return out;
}

// Follow event_script / goto / call targets to collect their msgboxes (depth-limited).
const JUMP_RE = /^\s*(?:goto|call|goto_if\w*|call_if\w*)\s+.*?\b(\w+EventScript\w*)\b/;
function followScript(label, depth, seen, acc) {
    if (!label || depth < 0 || seen.has(label)) return;
    seen.add(label);
    const def = labelDef.get(label);
    if (!def) return;
    const { start, end } = enclosingBlock(def.file, def.idx);
    for (const mb of collectMsgboxes(def.file, start, end)) {
        if (!acc.some(x => x.label === mb.label)) acc.push(mb);
    }
    const { lines } = files.get(def.file);
    for (let i = start; i < end; i++) {
        const j = lines[i].match(JUMP_RE);
        if (j) followScript(j[1], depth - 1, seen, acc);
    }
}

// ── trainerbattle parsing ──────────────────────────────────────────────────────
// Returns the first non-rematch battle line referencing `trainer`, with parsed roles.
const NON_TEXT_ARG = new Set(['NULL', '0', 'FALSE', 'TRUE', 'NO_MUSIC']);
function splitArgs(s) { return s.split(',').map(x => x.trim()).filter(Boolean); }
function findBattle(trainer) {
    const tokenRe = new RegExp(`\\b${trainer}\\b`);
    for (const [file, { lines }] of files) {
        for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx];
            const tb = line.match(/^\s*(trainerbattle\w*)\s+(.*?)\s*$/);
            if (!tb) continue;
            const macro = tb[1];
            if (macro.includes('rematch')) continue; // main battle only
            const args = splitArgs(tb[2]);
            // trainer must be the trainer arg (position depends on macro)
            let intro = null, lose = null, eventScript = null, trainerArgOk = false;
            if (macro === 'trainerbattle_single' || macro === 'trainerbattle_double') {
                if (args[0] !== trainer) continue;
                trainerArgOk = true;
                intro = args[1];
                lose = macro === 'trainerbattle_double' ? args[2] : args[2];
                // _single: [trainer,intro,lose,(event_script),(music)]; _double: [trainer,intro,lose,not_enough,(event_script)]
                const rest = macro === 'trainerbattle_double' ? args.slice(4) : args.slice(3);
                eventScript = rest.find(a => !NON_TEXT_ARG.has(a) && !a.startsWith('MUS_') && labelDef.has(a)) || null;
            } else if (macro === 'trainerbattle_no_intro') {
                if (args[0] !== trainer) continue;
                trainerArgOk = true;
                lose = args[1];
            } else if (macro === 'trainerbattle_two_trainers') {
                // [trainer_a, lose_a, trainer_b, lose_b]
                if (args[0] === trainer) { lose = args[1]; trainerArgOk = true; }
                else if (args[2] === trainer) { lose = args[3]; trainerArgOk = true; }
                else continue;
            } else if (macro === 'trainerbattle') {
                // raw: [type, localIdA, trainer_a, intro_a, lose_a, event_a, ...]
                if (args[2] !== trainer) continue;
                trainerArgOk = true;
                intro = args[3]; lose = args[4]; eventScript = args[5];
            } else {
                if (!tokenRe.test(line) || args[0] !== trainer) continue;
                trainerArgOk = true;
            }
            if (!trainerArgOk) continue;
            const norm = a => (a && !NON_TEXT_ARG.has(a) ? a : null);
            return { file, idx, macro, intro: norm(intro), lose: norm(lose), eventScript: norm(eventScript) };
        }
    }
    return null;
}

// Some boss scenes co-star another villain whose lines live in a SEPARATE object-event script,
// not reachable from the boss's own trainerbattle chain. Keyed by boss flag → extra character
// tokens folded into the "OTHER TEXT" net so those lines still surface next to the boss.
const COMPANION_TOKENS = {
    // Maxie confronts you right after you beat Tabitha at Mt Chimney (cutscene, no battle — T-148).
    FLAG_DEFEATED_TABITHA_MT_CHIMNEY: ['Maxie'],
};

// Character tokens for the completeness net (from the boss label + trainer ids).
function charTokens(boss) {
    const tokens = new Set();
    const seg = boss.label.split(/[–\-]/)[0].trim(); // before the en-dash
    for (const w of seg.split(/[^A-Za-z]+/)) {
        if (w.length >= 3 && !['and', 'the'].includes(w.toLowerCase())) tokens.add(w);
    }
    if (/rival/i.test(seg)) { tokens.add('May'); tokens.add('Brendan'); tokens.delete('Rival'); }
    for (const t of boss.trainers) {
        const core = t.replace(/^TRAINER_/, '').replace(/_\d+$/, '').split('_')[0];
        if (core.length >= 3) tokens.add(core[0] + core.slice(1).toLowerCase());
    }
    return [...tokens];
}

// All *_Text_* labels defined in `file` whose name contains any token (case-insensitive).
function relatedTextInFile(file, tokens) {
    const { lines } = files.get(file);
    const out = [];
    lines.forEach((line, idx) => {
        const m = line.match(/^(\w*_Text_\w+):\s*(?:@.*)?$/);
        if (m && tokens.some(t => m[1].toLowerCase().includes(t.toLowerCase()))) {
            if (resolveText(m[1])) out.push({ label: m[1], line: idx + 1 });
        }
    });
    return out;
}

// ── Formatting ─────────────────────────────────────────────────────────────────
// Point a marker at the label's .string DEFINITION (where the editable text lives).
function labelLoc(label) {
    const def = labelDef.get(label);
    return def ? `${files.get(def.file).rel}:${def.idx + 1}` : '(definition not found)';
}
function block(title, entries) {
    const lines = [`  [${title}]`];
    if (!entries.length) { lines.push('    (none found)'); return lines.join('\n'); }
    for (const e of entries) {
        lines.push(`    · ${e.label} @ ${labelLoc(e.label)}`);
        const text = resolveText(e.label);
        for (const tl of (text || '(unresolved)').split('\n')) {
            lines.push(tl.trim() ? `        ${tl}` : '');
        }
    }
    return lines.join('\n');
}

const bosscaps = JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend', 'data', 'bosscaps.json'), 'utf8'));
const out = [];
out.push('BOSS DIALOGUE — extracted scene text, in level-cap order');
out.push('='.repeat(72));
out.push('');
out.push('HOW TO USE THIS FILE');
out.push('  • This is a GENERATED file (scripts/extract-boss-dialogue.mjs). Edit the dialogue text');
out.push('    freely; when you are done, tell me and I will fold your edits back into the game');
out.push('    scripts. Re-running the extractor OVERWRITES this file, so edit a copy if unsure.');
out.push('  • Each line of dialogue is tagged  [label @ file:line]  — do NOT change those tags;');
out.push('    they are how your edited text is mapped back to the exact .string in the ROM source.');
out.push('  • Buckets per boss: PRE-BATTLE / IN-BATTLE INTRO / ON-DEFEAT / POST-BATTLE, plus an');
out.push('    "OTHER TEXT IN THIS MAP" net (same character, may or may not belong to the scene).');
out.push('  • Rival bosses have 6 trainer variants (May/Brendan × 3 starters) that usually share');
out.push('    the same text — identical variants are collapsed.');
out.push('');

for (const boss of bosscaps) {
    out.push('');
    out.push('#'.repeat(72));
    out.push(`# BOSS ${String(boss.order).padStart(2, '0')} — ${boss.label}  (level cap ${boss.level})`);
    out.push(`#   flag: ${boss.flag}`);
    out.push('#'.repeat(72));

    const tokens = [...charTokens(boss), ...(COMPANION_TOKENS[boss.flag] || [])];
    const seenSignatures = new Set();
    const battleFiles = new Set();
    const shownInBuckets = new Set();
    let anyBattle = false;

    for (const trainer of boss.trainers) {
        const b = findBattle(trainer);
        if (!b) continue;
        anyBattle = true;
        battleFiles.add(b.file);

        const { start, end } = enclosingBlock(b.file, b.idx);
        const pre = collectMsgboxes(b.file, start, b.idx);
        const introEntries = [];
        if (b.intro) introEntries.push({ label: b.intro, file: b.file, line: b.idx + 1 });
        else if (pre.length) { /* no_intro: the preceding msgbox is the presentation (already in pre) */ }
        const defeatEntries = b.lose ? [{ label: b.lose, file: b.file, line: b.idx + 1 }] : [];
        const post = collectMsgboxes(b.file, b.idx + 1, end);
        if (b.eventScript) followScript(b.eventScript, 2, new Set(), post);

        // Collapse identical scenes across rival variants.
        const sig = JSON.stringify([
            pre.map(x => x.label), introEntries.map(x => x.label),
            defeatEntries.map(x => x.label), post.map(x => x.label),
        ]);
        if (seenSignatures.has(sig)) continue;
        seenSignatures.add(sig);
        for (const e of [...pre, ...introEntries, ...defeatEntries, ...post]) shownInBuckets.add(e.label);

        out.push('');
        out.push(`--- ${trainer}   (${b.macro} @ ${files.get(b.file).rel}:${b.idx + 1}) ---`);
        out.push(block('PRE-BATTLE', pre));
        out.push(block(b.intro ? 'IN-BATTLE INTRO' : 'IN-BATTLE INTRO — none (no-intro battle; see PRE-BATTLE)', introEntries));
        out.push(block('ON-DEFEAT', defeatEntries));
        out.push(block('POST-BATTLE', post));
    }

    if (!anyBattle) {
        out.push('');
        out.push('  (no trainerbattle script found for this boss — battle may be triggered by a special/');
        out.push('   scripted event; text will need manual location)');
    }

    // Completeness net: other same-character text in the battle file(s), excluding what the
    // buckets already showed.
    const shownLabels = new Set(shownInBuckets);
    out.push('');
    out.push('  [OTHER TEXT IN THIS MAP — same or related character, not already shown above]');
    let anyRelated = false;
    for (const file of battleFiles) {
        for (const r of relatedTextInFile(file, tokens)) {
            if (shownLabels.has(r.label)) continue;
            shownLabels.add(r.label);
            anyRelated = true;
            out.push(`    · ${r.label} @ ${files.get(file).rel}:${r.line}`);
            for (const tl of (resolveText(r.label) || '').split('\n')) {
                out.push(tl.trim() ? `        ${tl}` : '');
            }
        }
    }
    if (!anyRelated) out.push('    (none)');
}

out.push('');
fs.writeFileSync(OUT, out.join('\n'));
process.stderr.write(`Wrote ${path.relative(ROOT, OUT)} (${bosscaps.length} bosses)\n`);
