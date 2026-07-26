/**
 * T-222 — the required legal notices must be present in the shipped HTML: the site footer disclaimers,
 * the registration consent, the standalone Privacy/Terms pages, and the generated-docs footer notice.
 * Source-inspection (ADR-009). Pokémon/ability names are intentionally NOT masked — this only checks the
 * disclaimers exist.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('index.html footer carries the core disclaimers + Privacy/Terms links', () => {
  const html = read('index.html');
  assert.match(html, /class="site-footer"/, 'the legal footer exists');
  assert.match(html, /[Nn]ot affiliated with[^<]*Nintendo/, 'not-affiliated-with-Nintendo notice');
  assert.match(html, /trademarks and copyrights of\s+their respective owners/i, 'trademark/rights notice');
  assert.match(html, /non-commercial/i, 'non-commercial notice');
  assert.match(html, /generates patch files[^<]*does not distribute the game/i, 'patch-not-game notice');
  assert.match(html, /href="\/privacy\.html"/, 'Privacy link');
  assert.match(html, /href="\/terms\.html"/, 'Terms link');
});

test('registration requires GDPR consent (required checkbox linking Privacy + Terms)', () => {
  const html = read('index.html');
  assert.match(html, /id="reg-consent"[^>]*required|required[^>]*id="reg-consent"/, 'required consent checkbox');
  assert.match(html, /Privacy Policy<\/a>\s*\n?\s*and <a href="\/terms\.html"[^>]*>Terms/i, 'consent links Privacy + Terms');
  const acct = read('js/account.js');
  assert.match(acct, /reg-consent'\)\?\.checked/, 'doRegister guards on consent too');
});

test('an own-a-legal-copy notice is shown at the point of use', () => {
  const html = read('index.html');
  assert.match(html, /own a legal copy of Pok[eé]mon Emerald/i, 'legal-copy disclaimer near the generate flow');
});

test('standalone Privacy and Terms pages exist with the key content', () => {
  const privacy = read('privacy.html');
  assert.match(privacy, /Privacy Policy/);
  assert.match(privacy, /salted hash|password.*hash/i, 'explains password hashing');
  assert.match(privacy, /48\s*hours?/i, 'states the 48h retention');
  assert.match(privacy, /delete your account/i, 'right to erasure');
  assert.match(privacy, /do not (use analytics|sell)|no.*tracking/i, 'no-tracking / no-sale statement');

  const terms = read('terms.html');
  assert.match(terms, /[Nn]ot affiliated with[^<]*Nintendo/);
  assert.match(terms, /must legally own|legally own/i, 'own-a-legal-copy term');
  assert.match(terms, /does not distribute the game/i, 'patch-not-game term');
  assert.match(terms, /as is|“as is”|without warranty/i, 'no-warranty term');
});

test('the generated docs footer carries the not-affiliated + trademark notice', () => {
  const tpl = read('template.html');
  assert.match(tpl, /not affiliated with[^<]*Nintendo/i, 'docs footer not-affiliated notice');
  assert.match(tpl, /trademarks and copyrights of their respective owners/i, 'docs footer rights notice');
});

test('no user-facing copy claims the SERVICE builds/delivers a ROM', () => {
  // The internal state id "building" (categoryOf / req.state) is allowed; the ban is on marketing/status copy.
  const acct = read('js/account.js');
  assert.doesNotMatch(acct, /Building your ROM|build a ROM|build ROMs|your ROM is ready/i, 'no "build a ROM" service copy');
  const emails = read('../backend/email/templates.js');
  assert.doesNotMatch(emails, /your ROM is ready|build your ROM|generating ROMs/i, 'emails speak of patches, not ROMs');
});
