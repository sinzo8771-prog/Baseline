# The Baseline — Review Findings & Tasks

Repo: `sinzo8771-prog/Baseline` · Stack: React 19 + Vite + Tailwind 4, Cloudflare Worker host + feed relay.

Overall: solid, well-built site. Accessibility, print-editorial design, and code quality are already strong. Items below are gaps/fixes, ranked by impact.

---

## P0 — Bugs / gaps to close

- [ ] **Offline state missing on two pages.** `src/app/pages/HypeIndex.jsx` and `src/app/pages/Sources.jsx` only check `loaded`, not `offline` — when feeds are unreachable they show an infinite pulsing skeleton instead of an explanation. `src/app/pages/Home.jsx` already has the right pattern (`EmptyState` with "OUT TO LUNCH" copy). Reuse that component/message in both pages.

- [ ] **Sitemap incomplete.** `public/sitemap.xml` lists only `/`. Add `/hype-index`, `/sources`, `/about` (all four are real routes registered in `src/app/App.jsx`).

- [ ] **No canonical link tag.** Add `<link rel="canonical" href="https://the-baseline.baseline-news.workers.dev/">` to `index.html` (per-route canonical if routes ever get real URLs beyond the SPA shell).

- [ ] **Hype-flag explanation is hover-only.** In `src/app/components/SpinBadge.jsx`, the reason a story was flagged (`flags.join(", ")`) is only exposed via the `title` attribute — invisible on touch devices, inconsistent across screen readers. Replace with a small popover/disclosure (button + tooltip component, or a `<details>`-based fallback) so the explanation is reachable without hover.

---

## P1 — Performance / perceived speed

- [ ] **No client-side cache of the fetched edition.** Every page load refetches all 10 feeds from scratch (`src/lib/feeds.js` → `fetchAllFeeds`). Add a stale-while-revalidate pattern: on load, read the last successful edition from `localStorage`/`sessionStorage` and paint it immediately, then run the live fetch behind it and swap in fresh results when ready. This is the single biggest perceived-speed win available.

- [ ] **Theme flash on load.** `src/app/hooks/useTheme.js` sets `data-theme` via `useEffect`, so a user who's explicitly chosen a theme opposite their OS preference can see a flash of the wrong theme before hydration. Add a small inline blocking script in `index.html` (before the app mounts) that reads `localStorage` and sets `data-theme` on `<html>` synchronously.

---

## P2 — Security / abuse surface

- [ ] **Open CORS on the feed relay.** In `src/index.js`, `relayFeed()` sets `access-control-allow-origin: "*"` on `/api/feed` responses. Since the app calls this same-origin, the wildcard serves no purpose for you but lets anyone use the Worker as a free open proxy for those 10 feeds, burning your Cloudflare free-tier request quota. Either drop the header or restrict it to your own origin, and consider basic per-IP rate limiting on `/api/feed` and `/api/feeds`.

---

## P3 — Feature ideas (fit the product concept)

- [ ] **Publish your own combined feed.** You already ship OPML export of the *sources* (`src/app/lib/exportOPML.js` / About page). The natural companion: a `/feed.xml` of your own deduped, scored edition, so people can subscribe to The Baseline itself in a reader. Aggregation currently only happens client-side (by design, to dodge the free-tier CPU cap) — this would need a small server-computed fallback, e.g. a scheduled Worker cron writing a cached feed to KV. Weigh against the current "no KV, no cron" simplicity.

- [ ] **Per-story permalinks.** Add a `/story/:id` route showing a single story with its score + flags, so individual stories are shareable/bookmarkable (currently only reachable via the in-page modal).

- [ ] **Hype word list is public.** Lives in the client bundle (`src/lib/hype.js`), so anyone can read it and word headlines around it. Not necessarily worth hiding — transparency arguably supports the site's premise — but worth a conscious decision either way.

---

## P4 — Minor

- [ ] **No `favicon.ico`.** Only 16/32 PNGs are served (`public/favicon-16.png`, `public/favicon-32.png`). Some browsers/crawlers still request `/favicon.ico` by default, causing a stray 404. Add a redirect or a literal `.ico` file.

- [ ] **No component tests.** `test/` covers `hype.js`, `dedupe.js`, `feeds.js`, `pipeline.js` well (`node --test`) but has zero UI tests. Add a couple of `@testing-library/react` smoke tests for `StoryFeed`'s focus trap (`src/app/components/StoryFeed.jsx`) and `App` routing — the parts most likely to regress silently.
