# The Baseline

**AI news, hype removed.**

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Free_Tier-F38020?logo=cloudflare&logoColor=white)
![Deploy](https://img.shields.io/badge/status-live-2ea44f)
[![CI](https://github.com/sinzo8771-prog/Baseline/actions/workflows/deploy.yml/badge.svg)](https://github.com/sinzo8771-prog/Baseline/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

A free, editorial-print AI news site that aggregates RSS from the AI industry and its chroniclers — verbatim. Headlines as published, spin as detected, hype as measured. No AI-generated content anywhere.

**Live site:** <https://the-baseline.baseline-news.workers.dev>

## Screenshots

The landing page — the front door that explains the product and leads into the news:

![Landing — the front door](screenshots/landing.jpg)

The live edition (now at `/edition`):

![Home — the live edition](screenshots/home.jpg)

The Hype Index gauge, a story page's "Why this score" panel, the source leaderboard, and the methodology page:

| Hype Index | Story | Sources | Methodology |
| --- | --- | --- | --- |
| ![Hype Index](screenshots/hype-index.jpg) | ![Story page](screenshots/story.jpg) | ![Sources](screenshots/sources.jpg) | ![Methodology](screenshots/methodology.jpg) |

Screenshots are refreshed manually from the live site; the feed-driven pages (story permalinks, hype percentages) naturally vary between captures.

---

## Table of contents

- [Screenshots](#screenshots)
- [Why "hype removed"?](#why-hype-removed)
- [Features](#features)
- [Pages](#pages)
- [Stack](#stack)
- [Architecture](#architecture)
- [Local development](#local-development)
- [Tests](#tests)
- [Build](#build)
- [Deploy](#deploy)
  - [Manual](#manual)
  - [CI (recommended)](#ci-recommended)
- [Project structure](#project-structure)
- [API endpoints](#api-endpoints)
- [Adding or changing sources](#adding-or-changing-sources)
- [Hype scoring](#hype-scoring)
- [Hype Index history](#hype-index-history)
- [Accessibility](#accessibility)
- [Roadmap](#roadmap)
- [License](#license)

## Why "hype removed"?

Most AI coverage reads like a press release. Every model is "revolutionary", every benchmark is "AGI-adjacent". The Baseline does the opposite of writing news: it *collects* it. Ten RSS feeds from the people doing the work and the people covering it are fetched fresh on every page load, parsed in your browser, scored for spin, deduped across sources, and laid out like tomorrow's paper — with the hype measured, not amplified.

The site never rewrites a headline and generates no content. It is a meter, not a voice.

## Features

- **Live RSS aggregation** — fetches 10 AI feeds in the browser on every load; a slow feed never holds the front page (stories stream in as each feed resolves).
- **Hype Index** — a print-style gauge showing what share of today's stories are "enthusiastic", with **history**: today's reading vs. yesterday, plus a 7-day trend, persisted per-day in your browser.
- **Spin scale** — every story is scored Measured → Warm → Hot → On Fire by a signal-category detector, shown as color-and-shape badges; a `<details>` popover and the story page's "Why this score" panel explain the exact signals behind each score, each with its own point contribution, plus the standing disclaimer that a Hype score measures loudness, not truth.
- **Methodology** — a dedicated page stating what the score measures, what it does not, and where the detector can be fooled.
- **Search** — filter the edition by any text in a headline, summary, or source name.
- **Source drill-down** — a `?source=` URL filter isolates one outlet, with a one-click "stop filtering" chip, plus `/sources/:name` profile pages. The Sources leaderboard's Trend column pairs the direction glyph with a 7-day intensity sparkline.
- **Sorting** — *Edited* (the default news judgment: freshness weighted by hype, with a source-diversity cap so one publisher never owns the front page), *Newest*, *Hottest*, *By Source*.
- **Filter chips** — filter by hype level with live per-bucket counts; search, source, and hype filters compose.
- **Two views** — *Edition* (the print-style list with lead story, glitch headline, and spin badges) and *Cards* (an editorial wire-card grid — hairline separators, serif headlines, spin badges, overlay open button — that mirrors the print identity).
- **Story permalinks** — `/story/:id` pages with verbatim headline, source, published time, "Why this score", native Share + copy-link, and `NewsArticle` JSON-LD. Each page links **Previous / Next** through the day's ranked edition order, hiding the missing direction at the list boundaries.
- **Keyboard shortcuts** — `j`/`k` move a selection between stories, `Enter` opens the selected story, `Escape` closes the modal, `/` focuses search, and `?` toggles the shortcuts help. Keys are never hijacked while typing in an input or inside the modal's focus trap.
- **Print-friendly** — `Cmd+P` on the edition renders like a physical paper: nav, search, chips, toggles, canvas effects, and buttons are stripped, content is forced to paper + ink, and external links print with their URLs.
- **Save-for-later** — a bookmark on every story surface (feed cards, cards view, modal, permalink page) keeps a story in your browser at `/saved`, as a snapshot that still renders even after it ages out of today's edition. A "Download saved stories" button exports your list as a JSON Feed file.
- **New since your last visit** — stories published after your previous session carry a small NEW badge; a first visit (no stored baseline) badges nothing.
- **Command palette** — `Cmd/Ctrl+K` anywhere opens a fuzzy search over every story and page; arrow keys navigate, Enter jumps, Escape closes. Distinct from `/`, which narrows the feed in place.
- **Week in Review** — `/week-in-review` distills the browser's own 7-day baseline into a weekly summary: average, loudest/calmest day, biggest day-over-day swing, and a week-over-week trend — honest about a partial or empty history.
- **Resilience** — an in-browser saved edition (SWR-style cache) paints instantly when offline; a "SAVED EDITION · LAST UPDATED" banner offers retry, and every error state has a working "Try the presses again" button.
- **Installable PWA** — a web app manifest with 192/512/maskable icons and an `apple-touch-icon` makes the site installable; the offline-shell service worker keeps a returning or offline reader on their last saved edition.
- **Editorial print design** — serif masthead (with date, edition number, and story count), paper texture, sticky utility nav, light/dark themes, subtle canvas flourishes (VHS footer, reveal effects) that respect reduced motion.
- **SEO-ready** — per-route title/description/canonical, Open Graph / Twitter / JSON-LD tags, `robots.txt`, `sitemap.xml`, `site.webmanifest`, and a generated 1200×630 OG image.
- **Self-published feed** — the Worker aggregates today's scored, deduped edition and publishes it as `/feed.xml` (RSS 2.0) and `/feed.json` (JSON Feed 1.1), with `<link rel="alternate">` discovery in the app shell and a button row on Sources; both routes are rate-limited like the relay.
- **OPML export** — one click to grab every source for your own reader.
- **Crash-proofing** — a root `<ErrorBoundary>` catches render errors and prints a "STOP THE PRESSES" recovery screen instead of a blank page.

## Pages

| Route | Page |
| --- | --- |
| `/` | **Landing** — the front door: value proposition, today's live snapshot, fresh-story preview, why/how-it-works, Hype Index + source previews, final CTA |
| `/edition` | **Edition** — the full news experience: lead story, search, hype filter chips, sort control, Edition/Cards view toggle |
| `/hype-index` | **Hype Index** — today's gauge, spin distribution with percentages, WHY TODAY?, biggest hype shift, 7-day trend |
| `/sources` | **Sources** — the ten feeds with live status, "Who's Shouting?" leaderboard, OPML / RSS / JSON Feed export buttons |
| `/sources/:name` | **Source profile** — status, story count, avg intensity, distribution, trend, latest stories |
| `/story/:id` | **Story** — verbatim headline, source, published time, Hype score, "Why this score", Share/Copy, original link |
| `/saved` | **Saved** — your save-for-later reading list (kept in the browser, still renders aged-out stories) with a one-click JSON Feed export |
| `/week-in-review` | **Week in Review** — average, peak, low, and week-over-week trend of the Hype Index over the past 7 recorded days |
| `/methodology` | **Methodology** — the scoring method, what is not counted, and the detector's limits |
| `/about` | **About** — the editorial stance |
| `*` | **404** — a themed dead-end |

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4, `react-router-dom` for routing, `framer-motion` for motion, `lucide-react` for icons. Static build output into `dist/`.
- **Hosting**: a Cloudflare Worker serves the built app (`env.ASSETS` → `dist/`), relays feed XML at `/api/feed` (with a source list at `/api/feeds`), and self-publishes the aggregated edition at `/feed.xml` and `/feed.json`.
- **RSS parsing** happens entirely in the browser (the Worker is pure I/O, so the free-tier CPU cap is respected).

## Architecture

This site runs on Cloudflare's free tier, which enforces a sub-millisecond CPU budget per invocation — too small for server-side RSS parsing. So the work is split:

- **Worker** (`src/index.js`): serves the built React app from `dist/`, lists sources, relays feed XML from an allowlisted set, and aggregates the same scored, deduped edition into the self-published `/feed.xml` + `/feed.json`. Pure I/O, trivial CPU. CORS is locked to its own origin so it can't be used as an open proxy, upstream responses are capped at 1 MB, and `/api/feeds`, `/api/feed`, `/feed.xml`, `/feed.json` are rate-limited per IP (90 req / 60 s, fails open). HTML responses carry a strict CSP (incl. `frame-ancestors`), `nosniff`, and a referrer policy.
- **Browser**: fetches each feed through the Worker, parses it with the native `DOMParser`, scores hype by signal category, dedupes across feeds (prefix-aware), ranks the edition with a source-diversity cap, and renders. Fresh on every load.

```mermaid
flowchart LR
    subgraph Browser["Browser"]
        A["React app (dist/)"]
        C["DOMParser + hype scoring"]
    end
    subgraph Worker["Cloudflare Worker"]
        W["/api/feed relay + /feed.xml + /feed.json"]
    end
    subgraph Upstream["Upstream RSS (allowlist)"]
        F1["OpenAI"]
        F2["Anthropic"]
        F3["Google DeepMind"]
        F4["Hugging Face"]
        F5["The Verge AI"]
        F6["…more"]
    end

    A -- "GET /api/feed?name=…" --> W
    W -- "fetch XML" --> F1 & F2 & F3 & F4 & F5 & F6
    F1 & F2 & F3 & F4 & F5 & F6 -- "XML" --> W
    W -- "relay XML" --> C
    C -- "parse → score → dedupe" --> A
```

A note on the feeds: several publishers block Cloudflare's egress IPs as bots, so the Worker relays with a real browser User-Agent; Anthropic publishes no RSS, so its feed comes from an hourly-updated GitHub mirror.

## Local development

Requires **Node.js 24+** (the Vite 6 and Wrangler 4 toolchain; the repo pins `>= 24` via `engines` and `.nvmrc`). No Cloudflare account is needed to run locally.

```bash
npm install
npm run dev
```

`npm run dev` builds the React app, then `wrangler dev` serves both the static app and the feed relay locally. The first visit to `/` fetches all feeds in the browser (a few seconds on a cold cache), then renders the front page. Visit `http://localhost:8787` (whatever port `wrangler dev` reports).

For a fast React-only dev loop without the Worker relay (no live feed data):

```bash
npm run dev:react
```

## Tests

```bash
npm test             # unit suite (node --test)
npm run test:components   # component suite (vitest + @testing-library/react)
npm run test:e2e     # Playwright browser E2E
npm run test:all     # unit + component
```

- **Unit suite** (`node --test`, `test/*.test.js`, 118 tests): hype scoring (signal categories + false positives), cross-feed dedupe (prefix + punctuation variants), RSS parsing, pipeline composition, edition ranking (freshness, diversity, hype), Hype Index history, saved-story snapshots, security headers, and a guard that the browser-side source allowlist matches the Worker's.
- **Component suite** (`vitest`, `test/components/`, 45 tests): renders the real components in jsdom — `SignalBreakdown` (signal list + disclaimer), `SpinBadge` (sr-only reason + the click-to-open popover), `StoryModal` through `StoryFeed` (open, focus trap, Escape to close, focus restore), `TrendCell` (sparkline rendering), `StoryPage` (prev/next nav at list boundaries), the `useKeyboardShortcuts` hook (typing guard, enabled toggle, preventDefault), consistent image slots (placeholder + error fallback), NEW badges, the Saved page (empty state, aged-out story rendering, and the JSON Feed download), the command palette (fuzzy filtering, empty state, Escape/overlay close), and an `axe-core` sweep (`test/components/a11y.test.jsx`) over the six highest-value interactive surfaces.
- **E2E suite** (`playwright`, `e2e/`, 16 tests): a headless Chromium browser against the built site — every route renders without console errors, the command palette (open, fuzzy match, arrows, Enter, Escape), the `?` shortcuts overlay, the story-modal focus trap and focus restore, and the print stylesheet.

Both CI workflows run the unit + component suites on Node 24 and add the E2E suite as an informational job; a push to `master` deploys only after a green suite.

## Build

```bash
npm run build
```

Emits the production React app and assets into `dist/`.

## Deploy

### Manual

Requires a free Cloudflare account.

```bash
npm install
npx wrangler login
npm run deploy
```

`npm run deploy` builds the React app, then uploads the Worker and the static assets. The Worker serves both the site and the feed relay on your `workers.dev` URL. No KV namespace or bindings are required.

### CI (recommended)

Two GitHub Actions workflows ship with the repo:

- **`deploy.yml`** — runs the unit + component suites, builds, and deploys to production on every push to `master`.
- **`preview-deploy.yml`** — deploys a `the-baseline-preview` Worker per pull request and comments the preview URL.

Both also run the Playwright E2E suite as an informational job (it never blocks a deploy). Dependabot opens weekly update PRs for `npm` and `github-actions`.

Both need two repository secrets:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A token with Workers permissions (Create/Edit) for your account |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

## Project structure

```
LICENSE                    # MIT
src/
  index.js                 # Worker: static assets, /api/feeds, /api/feed relay, self-published /feed.xml + /feed.json
                           # (allowlist, rate-limited, body-capped; strict security headers on HTML)
  main.jsx                 # React entry point (wraps the app in <ErrorBoundary>)
    app/
    App.jsx                # Shell: SiteNav, masthead (+edition metadata), routes, VHS footer, toasts, useSeo
    styles.css             # Print-style theme tokens (Tailwind v4)
    components/            # SiteNav, SiteFooter, StoryFeed, StoryModal, CardsView, SpinBadge,
                           # SignalBreakdown, TrendCell, SelectorChips, HypeMeter, EmptyState,
                           # ErrorBoundary, BookmarkButton
    pages/                 # Home, HypeIndex, Sources, SourceProfile, StoryPage, Saved,
                           # Methodology, About, NotFound
    hooks/                 # useBaselineData, useTheme, useKeyboardShortcuts
    lib/                   # hypeHistory.js, lastVisit.js, savedStories.js, fuzzyMatch.js,
                           # exportOPML.js, exportSaved.js, copyLink.js
  lib/
    feeds.js               # Source allowlist + browser-side fetch/parse helpers
                           # (must match src/index.js)
    hype.js                # Signal-category spin scoring (with explanations)
    dedupe.js              # Cross-feed dedupe (prefix-aware)
    ranking.js             # Edition ranking (freshness + hype + source diversity)
    pipeline.js            # Compose + score + stats
    feedBuilders.js        # RSS 2.0 + JSON Feed 1.1 serializers (self-published feed, saved export)
  components/
    canvasui/              # Glitch, DecryptReveal, VHS, Asciify, RetroDither
public/                    # OG image, robots.txt, sitemap, manifest, install icons, favicons, sw.js
e2e/                       # Playwright specs + support (command-palette, focus-trap, keyboard-shortcuts,
                           # navigation, print)
test/                      # node --test unit suite (test/*.test.js) + vitest component suite (test/components/)
playwright.config.js       # E2E config (webServer, baseURL, project)
.github/
  workflows/               # deploy.yml, preview-deploy.yml
  dependabot.yml           # weekly npm + github-actions updates
```

## API endpoints

The Worker exposes a tiny, same-origin-only API:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/feeds` | JSON list of `{ name, feed }` for every source (cache-control: 5 min + stale-while-revalidate) |
| `GET /api/feed?name=OpenAI` | Relays that source's upstream RSS XML (browser UA, 8 s upstream timeout, 1 MB body cap) |
| `GET /feed.xml` | The self-published RSS 2.0 feed of today's scored, deduped edition |
| `GET /feed.json` | The self-published JSON Feed 1.1 of today's scored, deduped edition |
| `GET /api/news` | Retired — returns a `410` explaining the presses moved into the browser |

CORS is restricted to the Worker's own origin so third parties can't use the relay as a free open proxy. `/api/feeds`, `/api/feed`, `/feed.xml`, and `/feed.json` are additionally rate-limited per IP (90 requests per 60 s, backed by the edge cache, failing open) so the public relay can't be scripted into an abuse target.

Errors are JSON `{ error, message }`:

| Status | Code | Description |
| --- | --- | --- |
| 404 | `unknown_feed` | No feed matches the `name` query param |
| 502 | `upstream HTTP <n>` | Upstream returned a non-2xx status for that feed |
| 504 | `fetch_failed` | Upstream unreachable, timed out (8 s), or returned an oversized body (refused at 1 MB) |
| 429 | `rate_limited` | Per-IP limit exceeded (90 requests / 60 s) on the relay or self-published feeds |
| 410 | `moved_to_the_browser` | `/api/news` is retired — the presses now print in the browser |

## Adding or changing sources

Edit the `SOURCES` array in `src/lib/feeds.js` **and** the `FEEDS` map in `src/index.js` together (they must match — a test checks for drift). Dead feeds are skipped automatically and shown as "down" on the site's Sources list.

## Hype scoring

Heuristics live in `src/lib/hype.js`: signal categories — language, superlatives, benchmark, numerical, formatting, emotional — scored contextually (hedged research framing halves word weight, quoted words are ignored, money/facts don't fire, per-word stacking is bounded). Score maps to Measured / Warm / Hot / On Fire. It is a detector, not a judge. Mostly.

```mermaid
flowchart LR
    S["story headline"] --> H{"hype signals?"}
    H -- "language / superlatives / benchmark / numbers / formatting / emotion" --> P["contextual score"]
    P --> M["Measured"]
    P --> W["Warm"]
    P --> H2["Hot"]
    P --> F["On Fire"]
    M & W & H2 & F --> D["prefix-aware dedupe"]
    D --> R["diversity-ranked edition"]
    R --> FR["front page"]
```

## Hype Index history

The index only means something with a baseline, so each day's reading is written to `localStorage` (`baseline-hype-history-v1`, capped at 30 days). The Hype Index page then shows **today vs. yesterday** ("63% today, up 8 from yesterday") and a **7-day trend line**. Per-source history powers the trend arrows on the Sources leaderboard and source profiles, which report the magnitude of a shift ("Louder than yesterday by 12%"). If a previous day is missing — a first visit, a private-mode browser — the delta and trend quietly hide rather than fabricate a story.

## Accessibility

- Keyboard-navigable story modal with a focus trap, Escape to close, and focus restored on close.
- Full keyboard navigation on the edition: `j`/`k` move the story selection, `Enter` opens, `/` focuses search, `?` lists the shortcuts — all bypassed while typing or inside the modal.
- ARIA-metered hype gauge and `role="status"` banners for offline/refreshing states.
- Reduced-motion support across canvas effects, decrypted headlines, and the VHS footer — and the loading skeletons freeze too.
- One `<h1>` per page (the masthead is not a heading); heading levels run sequentially — page title → subsection → story — with no skipped levels.
- Color-blind-safe spin badges (shape *and* color), AA-safe chip contrast, and `line-clamp`-ed titles that never push the grid.

## Roadmap

Ideas on the press, in rough priority order:

- **Edge-cached relay** — move `/api/feed` fully onto the CDN with shorter TTLs to further cut upstream load (the self-published `/feed.xml` + `/feed.json` already cache at 5 min with stale-while-revalidate).

Parked ideas from the audits (CSP, feed-image sanitization, dead-code removal, bundle trim — all shipped 2026-08-14 — plus the automated a11y sweep) and the improvement plan's Tier 2/3 scope (consistent card grid, "new since your last visit", save-for-later, weekly recap, command palette) are tracked in [`FUTURE-ROADMAP.md`](./FUTURE-ROADMAP.md). PWA installability and the self-published combined feed shipped 2026-08-15. Release gates live in [`QA-CHECKLIST.md`](./QA-CHECKLIST.md), and the security review in [`SECURITY-AUDIT.md`](./SECURITY-AUDIT.md).

## License

MIT — see [LICENSE](./LICENSE).

---

*Verbatim in, hype measured out.*
