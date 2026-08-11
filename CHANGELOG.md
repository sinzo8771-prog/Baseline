# Changelog

All notable changes to **The Baseline** are documented here, grouped by the V2 spec's categories. Format: date · what changed · (spec reference).

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
