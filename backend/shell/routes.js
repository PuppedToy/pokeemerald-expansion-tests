/**
 * T-259 — serve the app shell for the frontend's own paths, plus the two files that make those paths
 * discoverable (robots.txt, sitemap.xml).
 *
 * The frontend is a single HTML shell that swaps sections client-side, but each destination has a real
 * URL, so a reload / bookmark / crawler hitting `/features/docs` has to get that shell back. The list of
 * such paths is NOT restated here: it is imported from the frontend's router.js, the single home for
 * "which URLs this site has" — which is what keeps a destination from being navigable in the browser
 * and a 404 on reload.
 *
 * Deliberately a fixed list and not a catch-all: an unknown path must keep 404-ing, or every typo,
 * every asset the build forgot and every unmatched /api call would come back as 200 + a page of HTML.
 */

import fs from 'fs';
import path from 'path';
import express from 'express';

import { SHELL_PATHS, CANONICAL_PATHS } from '../../frontend/js/router.js';

const xmlEscape = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]
));

function robotsTxt(origin) {
  return [
    'User-agent: *',
    'Allow: /',
    // Not access control (the panel is empty without an admin token and every endpoint 403s) —
    // just nothing here is worth a crawl budget.
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /client/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

function sitemapXml(origin) {
  const urls = CANONICAL_PATHS.map((p) => `  <url><loc>${xmlEscape(origin + p)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * @param {string} frontendDir  the frontend root (holds index.html and the built dist/)
 * @param {boolean} serveDist   prefer the minified shell, as the static mounts do in production
 * @param {string} baseUrl      public origin, for the absolute URLs robots/sitemap must carry
 */
export function createShellRouter({ frontendDir, serveDist = false, baseUrl = '' }) {
  const router = express.Router();
  const origin = String(baseUrl).replace(/\/+$/, '');
  const distIndex = path.join(frontendDir, 'dist', 'index.html');
  const srcIndex = path.join(frontendDir, 'index.html');

  // Resolved per request, not at boot: a box that has not run `node build.js` has no dist/, and the
  // static mounts fall through to source in exactly the same way.
  const indexFile = () => (serveDist && fs.existsSync(distIndex) ? distIndex : srcIndex);

  router.get(SHELL_PATHS, (req, res) => res.sendFile(indexFile()));

  router.get('/robots.txt', (req, res) => res.type('text/plain').send(robotsTxt(origin)));
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(origin)));

  return router;
}
