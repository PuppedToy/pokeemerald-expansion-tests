'use strict';

/**
 * parity.js — INV-BYTES diagnostics (T-238).
 *
 * The Phase-3 invariant is `inject(base, bundle) == compile(bundle)` byte-for-byte. When it fails, a
 * sha mismatch says nothing useful; what a module author needs is "0x64e1d8+2 differs, that's inside
 * gSpeciesInfo". These helpers turn two buffers into exactly that.
 */

/**
 * Differing runs between two buffers, as `{ offset, length }`.
 * - `mergeGap`: runs closer than this are merged (one struct instead of twenty adjacent fields).
 * - `maxRegions`: stop collecting after N regions; the returned array carries `truncated = true`.
 * - A length difference is reported as a trailing region flagged `sizeMismatch` (a repoint that grew
 *   the ROM would show up this way).
 */
function diffRegions(a, b, { mergeGap = 4, maxRegions = 200 } = {}) {
    const common = Math.min(a.length, b.length);
    const regions = [];
    let truncated = false;
    let start = -1;
    let lastDiff = -1;

    const flush = () => {
        if (start === -1) return;
        regions.push({ offset: start, length: lastDiff - start + 1 });
        start = -1;
    };

    for (let i = 0; i < common; i++) {
        if (a[i] === b[i]) continue;
        if (start === -1) {
            start = i;
        } else if (i - lastDiff > mergeGap) {
            flush();
            if (regions.length >= maxRegions) { truncated = true; break; }
            start = i;
        }
        lastDiff = i;
    }
    if (!truncated) {
        flush();
        if (regions.length > maxRegions) { regions.length = maxRegions; truncated = true; }
    }

    if (a.length !== b.length && !truncated) {
        regions.push({ offset: common, length: Math.abs(a.length - b.length), sizeMismatch: true });
    }
    if (truncated) regions.truncated = true;
    return regions;
}

/** Attach the owning symbol (from the base offset map) to each differing region. */
function attributeDiff(offsetMap, regions) {
    const symbols = Object.values(offsetMap.symbols)
        .filter(s => s.romOffset !== null)
        .sort((x, y) => x.romOffset - y.romOffset);

    return regions.map(region => {
        // The last symbol starting at or before the region, if the region falls inside its span.
        let lo = 0, hi = symbols.length - 1, found = null;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (symbols[mid].romOffset <= region.offset) { found = symbols[mid]; lo = mid + 1; } else { hi = mid - 1; }
        }
        const inside = found && found.size !== null && region.offset < found.romOffset + found.size;
        return {
            ...region,
            symbol: inside ? found.name : null,
            delta: inside ? region.offset - found.romOffset : null,
        };
    });
}

/** One readable line per region — what a failing INV-BYTES check prints. */
function formatDiff(attributed) {
    if (!attributed.length) return 'byte-identical';
    return attributed.map(r => {
        const where = r.symbol ? `${r.symbol}+0x${r.delta.toString(16)}` : 'unattributed (no symbol owns it)';
        const flag = r.sizeMismatch ? '  [SIZE MISMATCH]' : '';
        return `0x${r.offset.toString(16)}  ${r.length} bytes  ${where}${flag}`;
    }).join('\n');
}

module.exports = { diffRegions, attributeDiff, formatDiff };
