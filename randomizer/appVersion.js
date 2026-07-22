'use strict';

// T-190 — app-version provenance. The version's home is CHANGELOG.brooktec.md + git tags
// (owned by /release); this module DERIVES from that SoT, it never stores a second copy.
// The last RELEASED SemVer is the build's released baseline, stamped into bundles
// (bundle.appVersion) and telemetry. Node-only (reads the changelog); readAppVersion never
// throws so provenance can never break a generation run.

const fs = require('fs');
const path = require('path');

// Pure parser: the first `## [X.Y.Z]` heading, skipping `## [Unreleased]`.
function parseAppVersion(changelogText) {
    if (typeof changelogText !== 'string') return null;
    const m = changelogText.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m);
    return m ? m[1] : null;
}

function readAppVersion() {
    try {
        const clPath = path.resolve(__dirname, '..', 'CHANGELOG.brooktec.md');
        return parseAppVersion(fs.readFileSync(clPath, 'utf8'));
    } catch (_) {
        return null;
    }
}

module.exports = { parseAppVersion, readAppVersion };
