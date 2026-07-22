'use strict';

// T-190 — app-version provenance. The value is DERIVED from the version SoT
// (CHANGELOG.brooktec.md), never a second copy. parseAppVersion is the pure parser;
// readAppVersion reads the changelog and must never throw (provenance can't break a run).

const { parseAppVersion, readAppVersion } = require('../../appVersion');

describe('appVersion — parseAppVersion', () => {
    test('picks the first RELEASED version, skipping [Unreleased]', () => {
        const cl = [
            '# Changelog (Brooktec)',
            '',
            '## [Unreleased]',
            '',
            '### Added',
            '- something',
            '',
            '## [0.5.0] - 2026-07-01',
            '',
            '## [0.4.0] - 2026-06-01',
        ].join('\n');
        expect(parseAppVersion(cl)).toBe('0.5.0');
    });

    test('returns the version when the top section is already released', () => {
        expect(parseAppVersion('## [1.2.3] - 2020-01-01\n')).toBe('1.2.3');
    });

    test('returns null when there is no released version', () => {
        expect(parseAppVersion('## [Unreleased]\n\n### Added\n- x')).toBe(null);
        expect(parseAppVersion('no versions here')).toBe(null);
        expect(parseAppVersion(null)).toBe(null);
    });
});

describe('appVersion — readAppVersion', () => {
    test('returns a SemVer string or null and never throws', () => {
        let v;
        expect(() => { v = readAppVersion(); }).not.toThrow();
        expect(v === null || /^\d+\.\d+\.\d+$/.test(v)).toBe(true);
    });
});
