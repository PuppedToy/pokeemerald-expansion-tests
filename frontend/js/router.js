/**
 * T-259 — the site's URL map, and its only home.
 *
 * Every destination the top nav can reach is an entry here, with a real path. Three consumers share it:
 *   - app.js          → turns a pathname into the visible tab/list, and a click into a pushState;
 *   - backend/server.js → which paths get answered with the app shell (everything else keeps 404-ing),
 *                         plus /robots.txt and /sitemap.xml;
 *   - the tests        → that the nav anchors in index.html point at paths that actually resolve.
 *
 * Pure by design: no DOM, no imports, nothing touched at load time — it is imported by Node as well as
 * by the browser. Add a destination by adding it here, not by hand-wiring a path in three places.
 *
 * A tab's first list is canonically the bare tab path (`/features`, not `/features/rom`), so the default
 * list is one URL and not two. The `/features/rom` form still resolves — a shared link must not rot —
 * but nothing links to it and app.js rewrites it to the canonical form on arrival.
 */

export const SITE_TITLE = 'Pokémon Emerald Cut';

// `title: null` → the route uses SITE_TITLE bare (Home is the site's front page).
// `indexable: false` → served and navigable, but kept out of the sitemap.
export const ROUTES = [
  { tab: 'home', path: '/', title: null, indexable: true, aliases: ['/home'] },
  {
    tab: 'features', path: '/features', title: 'Features', indexable: true,
    lists: [
      { key: 'rom', title: 'ROM' },
      { key: 'randomizer', title: 'Randomizer' },
      { key: 'docs', title: 'Generated docs' },
    ],
  },
  { tab: 'randomizer', path: '/randomizer', title: 'Randomizer', indexable: true },
  {
    tab: 'feedback', path: '/feedback', title: 'Feedback', indexable: true,
    lists: [
      { key: 'features', title: 'Most requested features' },
      { key: 'bugs', title: 'Known bugs' },
    ],
  },
  { tab: 'settings', path: '/settings', title: 'Settings', indexable: true },
  // Admin-only: admin.js reveals the tab and fills the panel only for an admin, and every
  // /api/admin/* endpoint is 403 otherwise — the path is not a permission.
  { tab: 'admin', path: '/admin', title: 'Beta admin', indexable: false },
];

const routeFor = (tab) => ROUTES.find((r) => r.tab === tab) || null;

// Fold away the differences a browser or Express will hand us anyway: case (Express matches paths
// case-insensitively by default) and a trailing slash. '' / undefined → the root.
function normalize(pathname) {
  const stripped = String(pathname ?? '').toLowerCase().replace(/\/+$/, '');
  return stripped === '' ? '/' : stripped;
}

/** Resolve a pathname to `{ tab, subtab }`, or null if it is not a destination of this site. */
export function parsePath(pathname) {
  const p = normalize(pathname);
  for (const r of ROUTES) {
    if (p === r.path || (r.aliases || []).includes(p)) {
      return { tab: r.tab, subtab: r.lists ? r.lists[0].key : null };
    }
    // Only a tab that HAS lists owns the paths below it; `r.path !== '/'` because every path starts
    // with the root's own path.
    if (r.lists && r.path !== '/' && p.startsWith(`${r.path}/`)) {
      const key = p.slice(r.path.length + 1);
      return r.lists.some((l) => l.key === key) ? { tab: r.tab, subtab: key } : null;
    }
  }
  return null;
}

/** The canonical path of a destination — the deepest one that can be honoured. Null if the tab is unknown. */
export function pathFor(tab, subtab) {
  const r = routeFor(tab);
  if (!r) return null;
  if (!subtab || !r.lists) return r.path;
  const i = r.lists.findIndex((l) => l.key === subtab);
  // i === 0 → the first list is the tab path itself; i < 0 → unknown list, fall back to the tab.
  return i > 0 ? `${r.path}/${subtab}` : r.path;
}

/** The document title for a destination, deepest segment first, always ending in the site name. */
export function titleFor(tab, subtab) {
  const r = routeFor(tab);
  if (!r || !r.title) return SITE_TITLE;
  const i = r.lists ? r.lists.findIndex((l) => l.key === subtab) : -1;
  const parts = i > 0 ? [r.lists[i].title, r.title] : [r.title];
  return [...parts, SITE_TITLE].join(' · ');
}

/** Every path that must be answered with the app shell — canonical forms and accepted aliases alike. */
export const SHELL_PATHS = ROUTES.flatMap((r) => [
  r.path,
  ...(r.aliases || []),
  ...(r.lists || []).map((l) => `${r.path}/${l.key}`),
]);

/** One entry per public destination, for the sitemap: no aliases, no duplicates, no private pages. */
export const CANONICAL_PATHS = ROUTES.filter((r) => r.indexable).flatMap((r) => [
  r.path,
  ...(r.lists || []).slice(1).map((l) => `${r.path}/${l.key}`),
]);
