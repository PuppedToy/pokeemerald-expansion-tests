# frontend/assets — hand-authored static assets for the docs

This folder holds **your own** static assets that should end up **embedded** in the
generated docs (`docs-*.html`) so those docs stay 100% self-contained / offline —
the same way Pokémon and trainer sprites already are (see T-001).

Unlike `frontend/data/sprites.json` (generated, gitignored), **everything in this
folder is source and is committed to git.** Put files you author or curate here:

```
frontend/assets/
  header/      # header / banner / logo images
  fonts/       # web fonts (.woff2) to embed instead of Google Fonts
  icons/       # type icons, UI glyphs, etc.
```

## How it will work (planned — T-002)

> ⚠️ Not wired up yet. This folder and convention exist so assets can be collected
> now; the embedding is implemented in T-002 as part of the docs overhaul.

1. `build.js` walks `frontend/assets/**`, encodes each file as a base64 `data:` URI,
   and writes a map to `frontend/data/assets.json` (generated, gitignored) keyed by
   the relative path, e.g. `"header/banner.png"`, `"fonts/Inter.woff2"`.
2. `app.js` inlines that map into each generated doc (same mechanism as
   `EMBEDDED_SPRITES`), exposed to the template as `EMBEDDED_ASSETS`.
3. `template.html` references assets through a helper, e.g.
   `getAsset('header/banner.png')` → returns the embedded `data:` URI, with the
   external URL kept only as a dev fallback. Fonts are embedded via an
   `@font-face { src: url(<data-uri>) }` built from `EMBEDDED_ASSETS`.

## Rules

- **Source here, generated in `frontend/data/`.** Never hand-edit the generated map.
- Keep assets small — every byte is base64-embedded into every doc (~+33% over raw).
  Prefer optimized PNG/WOFF2; subset fonts to the glyphs the docs use.
- Reference assets by their path under `frontend/assets/` (the map key), never by a
  remote URL in the template.
