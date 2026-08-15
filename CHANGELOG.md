# Changelog

All notable changes to **The Baseline** are documented here, grouped by the V2 spec's categories. Format: date · what changed · (spec reference).

## 2026-08-15 — CI hardening, PWA install, self-published feeds, saved export

### Engineering & releases
- **Full test suite in CI**: both `deploy.yml` and `preview-deploy.yml` now run `npm run test:all` (the `node --test` unit suite + the vitest component suite) and a **Playwright browser E2E suite** (informational job) on every push. E2E covers every route rendering without console errors, the command palette (open, fuzzy match, arrow navigation, Enter, Escape), the `?` shortcuts overlay, the story-modal focus trap + focus restore, and the print stylesheet.
- **Node 24 pinned**: CI runs on Node 24 — jsdom 30's bundled undici crashes on Node 20 — and the repo declares `engines.node >= 24` with an `.nvmrc`. Workers `compatibility_date` bumped to 2026-08-01.
- **Dependabot**: weekly update PRs for the `npm` and `github-actions` ecosystems.
- **MIT license** added (`LICENSE` + `package.json` `license` field).

### PWA
- **Installable app**: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and an `apple-touch-icon` complete the web app manifest, so browsers offer "Install The Baseline" alongside the existing offline-shell service worker.

### Self-published feeds
- **Own combined feed**: the Worker now aggregates the same scored, deduped edition the front page shows and publishes it at `/feed.xml` (RSS 2.0) and `/feed.json` (JSON Feed 1.1) — the site is now its own source. Both routes are rate-limited like the relay (90 req / 60 s, fails open) and edge-cached (5 min + stale-while-revalidate). No KV: the edition is composed on each request.
- **Feed discovery**: the app shell ships `<link rel="alternate">` for both formats, and the Sources page's button row links the RSS/JSON feeds alongside OPML.

### Saved
- **Export your saved list**: a "Download saved stories" button on `/saved` serializes your reading list as a JSON Feed file through the same `buildJsonFeed` serializer as the self-published feed, guarding stories whose snapshot lacks a valid publish date.

### Performance & security
- **Security headers** on HTML responses: a strict Content-Security-Policy (incl. `frame-ancestors`), `X-Content-Type-Options: nosniff`, and a `Referrer-Policy` — scoped to `text/html` so static assets stay header-free.
- **Lead-image LCP priority**: the edition's lead image loads with high priority for a faster largest-contentful-paint.

### UI
- Search box icon/clear-button alignment fixed (vertically centered; `ps-9` keeps typed text clear of the icon).
- Screenshots refreshed from the live site.

## 2026-08-14 — Polish pass (updated plan Phases 2–8)

### Hierarchy
- **Navigation grouped** into primary (Edition / Hype Index / Sources) and secondary (Saved / Review / Methodology / About), visually quieter and separated by a hairline; Methodology now reachable from the nav (§17).
- The Hype score figure (`N/100`) sits beside the spin badge on every story surface — feed cards, cards view, modal, landing snapshot — so score is read with the headline (§8).
- Landing hero tightened so the live snapshot sits higher above the fold (§7).

### Hype identity
- **"WHY TODAY?" now answers**: the panel derives a dominant signal family ("Unusually aggressive language is doing most of the shouting — N% of today's signals") and names the single loudest headline at N/100, gated on real data; older caches show `DATA UNAVAILABLE`.
- **Trend bars get a ruled 25% measurement grid** and numeric values under each day label on desktop.
- The honest phrase is standardized everywhere: **"Hype measures loudness, not truth."** — Hype Index footer, landing snapshot, story page, methodology banner.

### Page personality
- Hype = instrument: "Calibrated against N recorded days in this browser." on the reading.
- Sources = newsroom: "The wire room reports who is talking, and how loud." + "Who's on the wire".
- Story = investigation: a quiet "The story file" overline above the headline.
- Methodology = transparency: "The ledger is open" kicker.

### Data trust
- **Small editions are flagged**: `isSmallSample` (`MIN_SAMPLE = 8`) adds a quiet "Small edition — N stories isn't enough…" note on the Hype Index and landing snapshot instead of presenting a thin day as a firm reading.
- Methodology gains "What the day's number actually measures" — the reading is on today's recency-based 25-story mix (a prolific outlet can nudge it; the Index reports the mix as-is rather than rebalancing), and near-duplicate/syndicated headlines collapse to one story.

### Accessibility
- **Single `<h1>` per page**: the masthead is no longer a heading; each page owns its own `h1` (page titles promoted from `h2`; direct subsections promoted from `h3`), so heading levels run sequentially with no skips (§semantic structure).
- **Reduced motion** now also freezes the loading skeletons (`.animate-pulse`) under `prefers-reduced-motion` (§reduced motion).

### A11y sweep
- Added `vitest-axe` (`axe-core` 4.13) + `test/components/a11y.test.jsx` covering the six highest-value interactive surfaces — StoryModal, CommandPalette, TrendCell, Sources, HypeIndex, WeekInReview (empty + partial), and Saved (empty + populated). 7/7 passing.
- Fixed `nested-interactive` axe violation in CommandPalette: listbox rows are now `<li role="option" tabIndex={-1}>` that own `onClick` and `onKeyDown(Enter)` directly (inner `<button>` removed). Existing focus-trap, arrow-key, Escape, and focus-return behavior is unchanged.
- Skip-hygiene convention codified: every `it.skip` / `describe.skip` must carry a reason comment on the line immediately above it; one-time sweep found zero unexplained skips remain.
- `⌘K` / `Ctrl K` discoverability: replaced the hand-rolled kbd pill in the edition search box with the `originui/Input` component from 21st.dev (id:158, fetched via MCP; CLI install blocked by paid-membership requirement, so the component was added manually as `src/components/ui/input.jsx` — actively imported by Home.jsx, so `ui/` is no longer dead code). The `?` help overlay already listed the shortcut.

### SEO
- **Route-accurate Open Graph tags**: `og:title` / `og:description` / `og:url` now track the current route (previously every shared link previewed as the homepage); 404 routes get their own title (§42, §43).
- Sitemap `lastmod` refreshed.

### Regression
- Removed dead code from `src/components/ui/`: the unused shadcn primitives (button/badge/card/progress/separator). Emitted CSS shrank 61.5→49.2 KB. `input.jsx` was later added (actively imported by Home.jsx) so the directory is no longer dead.
- Full suite green: 103 `node --test` + 36 component = 139 passing; build clean.

## 2026-08-13 — Landing page & edition route split

### Product (master plan §8–§23)
- New **landing page at `/`** — the front door. Editorial value proposition ("A quiet interface for a very loud industry."), two CTAs, then a live snapshot of today's hype (real `stats.hypePercent` + honest change vs yesterday), the four latest stories from the live edition (same data, no second feed), "Why The Baseline", an explicitly labeled illustrative "How loud is the story" scale (mirrors the detector's own test fixtures), a NEWS→HYPE→WHY?→SOURCE→TREND signal loop, a real Hype Index preview with 7-day mini trend, a real "Who's shouting" source preview (average headline intensity, not credibility), and a final CTA. Every number is measured; "DATA TEMPORARILY UNAVAILABLE" / "first reading" / "No sources measured yet" guards where data is absent.
- **Edition moved to `/edition`** — the full news experience (previously the homepage) now lives there. Nav + footer "Edition" link repointed; `/` stays the masthead/brand front door; no external story/source/index URLs broken.
- Motion stays restrained (section reveal fade/drift) and honors `prefers-reduced-motion` via the existing `MotionConfig`.

### SEO
- `ROUTE_META` gained an `/edition` entry (previously fell back to the landing's meta); `/` description tuned to the landing. `sitemap.xml` adds `/edition` (priority 1.0) and demotes `/` to 0.9/weekly.

### Docs
- New `V2-MASTER-AUDIT.md` — audit of the repo against `THE_BASELINE_MASTER_AI_AGENT_PLAN.md`, covering Phases 1–3 (already-complete security/QA/a11y work) and a section-by-section Phase 4 landing audit, plus defects found (nav/footer link, sitemap+meta) — all fixed.
- README updated: landing + edition routes in the Pages table and a landing screenshot placeholder.

## 2026-08-13 — Security & QA audit pass

### Security
- New `SECURITY-AUDIT.md` — full audit of the Worker relay (SSRF allowlist, same-origin CORS, rate limit, body cap), the RSS→render XSS path, the service worker, and localStorage. No critical/high findings.
- **Fixed (medium):** `SourceProfile` no longer double-decodes the route param. `react-router` v7 percent-decodes params itself; re-decoding threw an uncaught `URIError` on malformed URLs like `/sources/%` and double-decoded names with literal `%`.

### Accessibility
- Helper labels raised off `text-muted-foreground/60–80` (3.29–4.06:1, below WCAG AA 4.5:1 in light mode) to full-strength `text-muted-foreground` (6.46:1 light / 8.07:1 dark). Decorative `TrendCell` glyph (aria-hidden + sr-only) unchanged.

### QA
- New `QA-CHECKLIST.md` — the pre-release gate: test command matrix, functional/security/a11y/perf checklists, and a production smoke pass (all routes/APIs 200 or expected, live asset hash matches local build).
- New `FUTURE-ROADMAP.md` — parked ideas surfaced by the audits (CSP, feed-image sanitization, dead-code removal, bundle trim, automated a11y sweep), per the master plan's stop condition (§56). No new features added.
- Deployed `f0859a8`; verified the live Worker serves the identical `index-BAwtj85w.js` bundle.

## 2026-08-13 — Final polish batch: audit, explanation, accessibility, docs

### Audit
- `V2-FINAL-AUDIT.md` produced — a section-by-section re-audit of the whole implementation with a status legend (ALREADY DONE / NEEDS POLISH / MISSING / BROKEN) and a defect list. Every defect recorded there is fixed below.

### Accessibility (P0)
- Trend cells (Sources leaderboard and source profiles) are now real accessible elements: `TrendCell` renders an `aria-label` sentence ("Louder than yesterday by 12%…"), a visually hidden copy, and marks the glyph `aria-hidden` so a bare arrow is never announced as the whole meaning (§27).

### Hype explanation (P1)
- New `SignalBreakdown` component: every fired signal listed with its exact `+N pts`, plus the hedged-framing note ("Hedged research framing halves word weight") and the standing disclaimer "A Hype score measures how loudly a headline talks, not whether the story is true" (§15, §21).
- `SpinBadge` popover now opens the full breakdown ("Why Hot · 29/100") instead of a comma-joined string; `StoryPage`'s "Why this score" panel uses the same shared component.
- The story modal's focus trap, Escape handling, and focus restore were extracted into a shared `StoryModal` used by both the Edition feed and the Cards view (§36).

### Source trend magnitude (P1)
- `sourceTrendReading` in `src/app/lib/hypeHistory.js` returns direction + delta + percentage (with a sensible points fallback when the previous day had no average). Sources and source profiles now say *how much* louder/quieter a feed is, not just up/down/flat.

### Cards view (P1)
- Replaced the generic gradient NewsCards feed with `CardsView`: an editorial wire-card grid (hairline separators, serif headlines, SpinBadge, Read affordance, overlay open button) that matches the print identity of the Edition view (§32).

### Hype Index hero (P1)
- The `/hype-index` stat block now leads with a hero number (the real share of today's stories that are enthusiastic), a plain-English caption, and an honest change line ("Up 8 points from yesterday's 55%.") — the redundant "Today" grid cell is gone (§10).

### Mirrored feeds (P1)
- Anthropic's GitHub-mirror feed is now labeled **"mirrored feed"** wherever it appears (leaderboard, profile), with a transparency note that it is a community-run mirror updated on a delay (§26, §29).

### Methodology (P2)
- The methodology page leads with a prominent callout: "A high Hype score does not mean a story is false." (§16, §63).

### SEO (P2)
- Story pages now emit `og:type=article` (§43).

### Tests
- Component-test infrastructure: vitest + `@testing-library/react` + jsdom with polyfills for `matchMedia`, `ResizeObserver`, and `AbortSignal.timeout` (`test/setup.js`). Suite covers `SignalBreakdown`, `SpinBadge` popover, and `StoryModal` focus behavior (open, Escape, focus restore) (§55).
- Four new `sourceTrendReading` unit tests. Total suite: 68 `node --test` + 8 component = 76 passing.

### Docs
- `README.md` refreshed: Cards view described as the editorial wire-card grid, component-test suite documented, roadmap cleared of the completed item.
- `baseline-review.md` — the last open P4 finding (component tests) is now **DONE**.

## 2026-08-11 — Final V2 batch: ranking, dedupe, sharing, mobile QA, docs

### Security
- Worker relay now caps upstream response bodies at 1 MB (`readBodyBounded`) so a malformed or enormous feed cannot consume unbounded resources (§5.4).
- Per-IP fixed-window rate limiting on `/api/feeds` and `/api/feed` (edge-cache backed, fails open, 90 req / 60 s) to keep the public relay from becoming a free scrape target (§5.5).

### Sources & ranking
- Edition ranking extracted to `src/lib/ranking.js`: the default "Edited" order now adds a **source-diversity cap** — no single outlet may hold more than 2 of the trailing 6 slots, so one publisher can't own the front page while a calm but important story stays visible (§27, §29).
- `sortStories` moves to the lib with tests for freshness-vs-hype, diversity, and single-source days (§55).

### Dedupe
- `dedupeStories` now strips leading **source-name prefixes** ("OpenAI: …", "Anthropic — …", "Verge AI | …") before comparing, so a branded syndicated headline collapses onto its unbranded original; punctuation/case variants were already normalized and are now fixture-tested. Unrelated headlines that merely mention a company are never merged (§28).

### Stories
- Story pages add a **Share** button using the native `navigator.share` sheet (mobile/desktop) with the copy-link fallback; permalink preserved in both (§23).

### UX
- Masthead now prints the edition's **story count** (e.g. "42 stories") once loaded (§31).
- Mobile QA pass at 320/375/390/430/768 px: no horizontal overflow, no clipped text or controls, modal and Hype Index gauge fit at the smallest width (§37).

### Docs
- `README.md` refreshed: shipped features, routes, cache/security behavior, and an accurate roadmap (§68).
- `baseline-review.md` updated — every P0–P3 finding is now DONE and pointed at where it landed; one P4 item (component tests) remains.
- Changelog continued.

## 2026-08-11 — Hype product (Phase 3) completes

### Hype Index
- **Stat block** on `/hype-index`: TODAY / YESTERDAY / CHANGE / 7-DAY AVG / STORY COUNT, every value derived from real story data; missing history renders an em dash, never a guess (§10, §53).
- **Hype distribution** now shows per-tier counts, percentages, and score ranges (`0–11` … `40–100`); tiers are carried by text, not color alone (§11, §38).
- **"WHY TODAY?"** panel: per-category share of the day's detected signals (`language`, `superlatives`, `benchmark`, `numerical`, `formatting`, `emotional`), computed from the edition's real `signalBreakdown`. Older caches without a breakdown show `DATA UNAVAILABLE` (§12, §53).
- **"Biggest hype shift"** panel: the three categories whose share moved most vs the previous recorded day, loudest first. With fewer than two recorded days it shows `NOT ENOUGH HISTORY` instead of fabricating a comparison (§13, §53).
- Signal-category counts are recorded with each day's history entry (`recordToday`) so day-over-day shifts are computed from real recorded data (§14).

### Hype algorithm
- Rebuilt `src/lib/hype.js` as a **signal-category engine** (LANGUAGE / SUPERLATIVES / BENCHMARK / NUMERICAL / FORMATTING / EMOTIONAL) that exposes the exact signals behind every score (§18).
- **Contextual scoring** so word presence ≠ automatic hype (§17):
  - hedged research framing ("Researchers examine whether AI could become superhuman") halves word-signal weight;
  - quoted words are treated as reporting a claim, not making one;
  - facts and money ("Company reports $1 billion investment") do not fire;
  - "best practices"/"best of" never trip the superlative signal;
  - stacking words within a family accumulates (bounded per signal), and stacking across categories earns a combo bonus.
- Added `signalStats`, `signalShares`, `biggestSignalShift` utilities powering the panels (§12, §13).

### Methodology
- New `/methodology` page: the scale, what is counted, what is not counted, and the detector's known limits stated plainly. "A high Hype score does not mean a story is false." (§16, §63).

### SEO
- Per-route `title`, `meta description`, and `canonical` for static routes via a new `useSeo` hook (story pages keep their own metadata) (§42, §43).
- `/methodology` added to the sitemap (§44).

### Tests
- Tier fixtures (Measured / Warm / Hot), false-positive suite (hedging, quoted words, money), cross-category stacking, per-word accumulation bounds, and `signalShares` / `biggestSignalShift` history guards (§19, §55). Suite: 51 passing.

## 2026-08-07 — Earlier V2 work (Phase 2, Stories, Sources, UX, SEO)

### Security
- Worker CORS echoes only its own origin; never `*` (§5.1).
- Feed relay is strictly allowlisted by name; arbitrary URLs/hosts return 404 (§5.2).
- Upstream timeouts (Worker 8 s, browser 6 s); one slow or dead feed never blocks the edition (§5.3, §50).
- Edge cache `max-age=300, stale-while-revalidate=600` on `/api/feeds` and `/api/feed` (§51).

### Reliability
- Feed failure states and per-feed streaming so a dead source cannot prevent first paint (§6, §7, §50).
- Stale-while-revalidate saved edition in `localStorage` (30 min TTL) with an honest "showing the saved edition" flag (§8, §9).
- Service worker returns a proper Response when fetch fails and no cache exists.

### Stories
- Deterministic story permalinks `/story/:id`; story pages show source, published time, Hype score, verbatim headline, and "Why this score" with per-signal points (§20, §21, §22, §15).
- `NewsArticle` JSON-LD with real values only; no invented authors/dates/images (§24).

### Sources
- `/sources` leaderboard ("Who's shouting?") with story count, average headline intensity, and trend; neutral terminology throughout (§25, §63).
- `/sources/:name` profile: status, story count, avg hype, distribution, trend, latest stories (§26).

### UX & accessibility
- Cards view (21st NewsCards) alongside Edition view; search with `/` shortcut; hype filters with live counts (§32, §33, §34).
- Keyboard navigation `j`/`k`/`Enter`/`Escape`/`/`/`?`, skipping text inputs (§35).
- Accessible story modal: focus trap, Escape, focus restoration, ARIA dialog (§36).
- Reduced-motion support and canvas effects that honor it (§39).
- Editorial error/empty states and offline treatment (§41).

### Docs
- `README.md` rewritten for shipped features, routes, and API (§68).
