# The Baseline — PWA Icons + Self-Published Feed

**Repo:** https://github.com/sinzo8771-prog/Baseline
Two independent items, plus one doc correction. No shared code between the first two — do in any order.

---

## 1. Add PWA install icons

- **Problem:** `public/site.webmanifest` only lists 16×16 and 32×32 icons. The service worker, `display: "standalone"`, and manifest link are all already correct — this is the one missing piece blocking real installability. Chrome/Android require at least a 192×192 icon to offer the install prompt; 512×512 is the other size virtually every platform checklist expects.
- **Files:** `public/site.webmanifest`, new files `public/icon-192.png`, `public/icon-512.png` (and ideally a maskable variant — see below)
- **Do:**
  1. Generate 192×192 and 512×512 PNGs from the existing brand mark (whatever source the current 16/32px favicons were cut from — check for a source SVG/vector first before re-exporting from a raster). Keep the same dark/cream brand palette already used in `theme_color`/`background_color`.
  2. Add a **maskable** variant if feasible: Android applies its own mask shape (circle, squircle, etc.) to `purpose: "maskable"` icons, so the safe content needs to sit within the center ~80% of the canvas with padding around it — a tight edge-to-edge logo will get clipped. If you don't want to design a separate maskable version right now, ship `purpose: "any"` only rather than mislabeling a non-safe icon as maskable.
  3. Update `site.webmanifest`:
     ```json
     "icons": [
       { "src": "/favicon-16.png", "sizes": "16x16", "type": "image/png" },
       { "src": "/favicon-32.png", "sizes": "32x32", "type": "image/png" },
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
     ]
     ```
     Add a second `maskable` entry only if you did step 2 properly.
  4. Confirm the service worker's asset cache list (`public/sw.js`) doesn't need the new icon paths added — check whether it explicitly lists static assets to precache or relies on the stale-while-revalidate pattern picking them up on first request; if it's an explicit precache list, add the new icons to it.
- **Done when:** Chrome DevTools → Application → Manifest shows no icon-size warnings, and "Install app" is offered in a real browser session (not just theoretically valid JSON).

---

## 2. Publish The Baseline's own feed

- **Rationale:** you aggregate other outlets' RSS to build the daily edition; nothing lets a reader subscribe to *your* output in their own reader. This is on-brand ("AI news, hype removed" — let people take that with them) and cheap: you already compute the day's ranked, scored story list client-side for `/edition`.
- **Constraint check first:** the Worker is intentionally I/O-only with no KV/server state (see `src/index.js` comments and the no-backend rule in `FUTURE-ROADMAP.md`). The edition is currently assembled in the *browser*, not on the server — so a server-rendered `/feed.xml` isn't a trivial addition without changing that architecture. Decide between two real options before writing code:
  - **Option A (stays architecturally honest, more limited):** a static, build-time-generated feed reflecting the state of sources/config at deploy time — not live per-visitor data. Lower value (it won't reflect today's actual hype scores, which are computed client-side), but zero architecture change.
  - **Option B (matches the site's actual behavior, more work):** move the story-fetch-and-score step (or a lightweight version of it) into the Worker for the sole purpose of serving `/feed.xml` / `/feed.json`, cached at the edge for e.g. 15–30 minutes via Cloudflare's cache API — no KV needed, just `caches.default` in the Worker, which is still stateless/ephemeral and doesn't violate the no-persistent-backend rule.
  - **Recommendation:** Option B if there's appetite for it — it's the only version that's actually true to what the site does. Confirm this with whoever owns the architecture decision before starting; this plan assumes Option B below.
- **Files:** `src/index.js` (Worker), reuse scoring logic from wherever `hype.js`/ranking currently lives client-side (likely needs a small shared module extracted so both the browser bundle and the Worker can call the same scoring function without duplicating it — check `src/lib/` for what's already isomorphic vs. browser-only, e.g. anything touching `localStorage` or `window` can't run in the Worker as-is)
- **Do:**
  1. Add a `/feed.xml` (RSS 2.0) and/or `/feed.json` (JSON Feed 1.1 — simpler to generate correctly) route to the Worker.
  2. Fetch and score the same sources the client does, using a shared/extracted scoring module (not a reimplementation — duplicated hype-scoring logic drifting out of sync would undermine the whole product's credibility).
  3. Cache the response at the edge (`caches.default`, ~15–30 min TTL) so this doesn't multiply origin-fetch load per RSS-reader poll.
  4. Add `<link rel="alternate" type="application/rss+xml">` (or `application/feed+json`) to `index.html` / route meta so feed readers and browsers can auto-discover it.
  5. Link it from the `/sources` page near the existing "Download OPML" button — natural pairing, both are "take this data with you" actions.
- **Done when:** `/feed.xml` (or `.json`) validates against the relevant spec (W3C Feed Validator for RSS, or a JSON Feed validator), reflects real current story data within the cache TTL, and is linked from both `<head>` and the Sources page.

---

## 3. Doc correction (no code)

- **File:** `FUTURE-ROADMAP.md`
- **Problem:** the 2026-08-13 changelog line reads `Automated a11y sweep + SR pass | open` — the automated sweep shipped 2026-08-14 but this line was never split, so the roadmap currently overstates what's still open (or under-states what's done, depending how it's read).
- **Do:** split into two lines — mark the automated sweep `done` (cross-reference the 2026-08-14 CommandPalette a11y entry that already exists), leave the manual screen-reader pass `open` on its own line.
- **Done when:** the roadmap accurately reflects that only the manual SR pass remains from that original item.
