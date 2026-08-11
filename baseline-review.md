# The Baseline — Review Findings & Tasks

Repo: `sinzo8771-prog/Baseline` · Stack: React 19 + Vite + Tailwind 4, Cloudflare Worker host + feed relay.

Status: the findings below were recorded against an earlier snapshot. P0–P3 are now implemented and shipped; each is marked **DONE** with a pointer to where it landed. One P4 item remains open.

---

## P0 — Bugs / gaps to close

- [x] **Offline state missing on two pages.** Now implemented. `HypeIndex.jsx`, `Sources.jsx`, and `SourceProfile.jsx` all check `offline` and render the reusable `EmptyState` ("THE PRESSES ARE JAMMED") with a "TRY AGAIN" reload when feeds are unreachable and no saved edition exists.
- [x] **Sitemap incomplete.** `public/sitemap.xml` now lists `/`, `/hype-index`, `/sources`, `/about`, and `/methodology`.
- [x] **No canonical link tag.** Added — per-route canonical via `useSeo` (`src/app/App.jsx`) for every static route; story pages own theirs.
- [x] **Hype-flag explanation is hover-only.** `SpinBadge` now exposes the flag explanation through a `<details>`-based popover reachable by keyboard, touch, and screen readers; the story page shows the same reasons in a "Why this score" panel.

## P1 — Performance / perceived speed

- [x] **No client-side cache of the fetched edition.** Implemented. A saved-edition SWR cache (`localStorage`, 30-minute TTL) paints instantly on load, then the live fetch swaps in fresh results (`src/app/hooks/useBaselineData.js`); an honest "showing the saved edition" flag distinguishes cached from live.
- [x] **Theme flash on load.** Implemented. An inline script in `index.html` sets `data-theme` from `localStorage` before the app mounts, so an explicitly chosen theme never flashes against the OS default.

## P2 — Security / abuse surface

- [x] **Open CORS on the feed relay.** Fixed. The Worker echoes only its own origin (`originOf()` in `src/index.js`); the browser calls same-origin, so a wildcard would only enable third-party proxy abuse. Added per-IP rate limiting on `/api/feed` and `/api/feeds` (§5.5) and a response-size cap on relayed bodies (§5.4).

## P3 — Feature ideas

- [x] **Per-story permalinks.** Implemented — `/story/:id` with source, published time, Hype score, verbatim headline, "Why this score", native share + copy-link, and `NewsArticle` JSON-LD.
- [ ] **Publish your own combined feed.** Deferred by design (spec §65): aggregation is client-side to stay inside the free-tier CPU cap, and the project deliberately has no KV/cron. Not built.
- [x] **Hype word list is public.** Kept public on purpose — the methodology page documents the heuristics; transparency supports the premise.

## P4 — Minor

- [x] **No `favicon.ico`.** Fixed — `public/favicon.ico` is served alongside the 16/32 PNGs.
- [ ] **No component tests.** Still open: `test/` covers the pure logic well (`node --test`), but there is no `@testing-library/react` suite for `StoryFeed`'s focus trap or `App` routing.
