# V2-AUDIT — The Baseline

State of the repository against **THE BASELINE — V2 IMPLEMENTATION SPEC.md**. Initial snapshot was recorded before any V2 changes; this file is maintained through the V2 work, so the tables below reflect the current tree.

Status legend: **DONE** = already implemented · **PARTIAL** = implemented with gaps · **MISSING** = not present · **BROKEN** = present but wrong.

## Repository snapshot

- Stack: React 19 + Vite 6 + Tailwind CSS 4, Cloudflare Worker host + feed relay. `node --test` suite.
- Routes: `/` (Home), `/hype-index`, `/sources`, `/sources/:name`, `/story/:id`, `/about`, `*` (NotFound).
- Worker (`src/index.js`): serves `dist/` via `env.ASSETS`, `/api/feeds` (source list), `/api/feed?name=` (allowlisted relay), `/api/news` (410, retired).
- Feed pipeline: browser fetches each feed through the Worker relay, parses with `DOMParser`, scores hype, dedupes, ranks, renders. Streaming per-feed resolution (`onPartial`).
- Cache: Worker edge cache (5 min + SWR 600) + browser `localStorage` saved edition (`baseline-edition-v1`, 30 min TTL) + per-day hype/source history (30 days).
- Tests: 64 passing (`npm test`). Production build passes (`npm run build`).

## Security hardening

| Spec | Status | Notes |
| --- | --- | --- |
| §5.1 CORS — never `*` | **DONE** | `originOf()` in `src/index.js` echoes only the Worker's own origin. |
| §5.2 Feed allowlist | **DONE** | `FEEDS` map in Worker; `test/feeds.test.js` guards sync with browser `SOURCES`. Arbitrary names → 404. |
| §5.3 Timeouts (8 s max) | **DONE** | `UPSTREAM_TIMEOUT_MS = 8000` in Worker; browser `FEED_TIMEOUT_MS = 6000`. Failures don't block other feeds. |
| §5.4 Response limits | **DONE** | `MAX_RELAY_BYTES = 1_000_000` + `readBodyBounded()` in `src/index.js` refuse oversized upstream feeds (504) instead of buffering them wholesale. |
| §5.5 Abuse protection | **DONE** | Per-IP fixed-window counter (90 req / 60 s) backed by the edge cache in `src/index.js` (`allowRequest`), fails open, on `/api/feed` + `/api/feeds`. |

## Feed reliability & resilience

| Spec | Status | Notes |
| --- | --- | --- |
| §6 Explicit source states | **DONE** | `LIVE` / `DOWN (reason)` per source on Sources + SourceProfile, derived from `sources` (`ok`/`error`), plus editorial loading ("PRESSING THE WIRES…") and offline ("THE PRESSES ARE JAMMED") states. |
| §7 No infinite loading | **DONE** | `loaded` + `settled` flags; all async pages resolve to content / empty / error states. |
| §8 Offline experience | **DONE** | Saved edition paints instantly with a "SAVED EDITION · LAST UPDATED …" banner + retry; full-screen "THE PRESSES ARE JAMMED" EmptyState when no saved edition exists. |
| §9 Stale-while-revalidate | **DONE** | `readCachedEdition` → render → background fetch → swap. |
| §50 Feed concurrency | **DONE** | `fetchAllFeeds` streams per-feed completion; one slow feed never blocks first paint. |
| §51 Edge cache (5 min + SWR) | **DONE** | `max-age=300, stale-while-revalidate=600` on `/api/feeds` and `/api/feed`. |
| §52 Observability | **PARTIAL** | Client-side source statuses exist. No lightweight metrics (latency/failure/dedupe counts) tracked anywhere. |

## Hype product

| Spec | Status | Notes |
| --- | --- | --- |
| §10 Hype Index = core | **DONE** | TODAY / YESTERDAY / CHANGE / 7-DAY AVG / STORY COUNT stat block, all from real data, with em dashes where history is missing. |
| §11 Hype distribution | **DONE** | Per-tier counts, percentages, and score ranges; text carries the tier, not color alone. |
| §12 "WHY TODAY?" | **DONE** | Per-category signal shares computed from the day's real `signalBreakdown`; "DATA UNAVAILABLE" on older caches. |
| §13 Biggest hype shift | **DONE** | Category-share deltas vs the previous recorded day, loudest first; "NOT ENOUGH HISTORY" when two days aren't available. |
| §14 Hype history | **DONE** | Today/yesterday/7-day avg/peak/low via browser history, honestly labeled (local). |
| §15 Hype transparency | **DONE** | `<details>` popover on badges + "Why this score" on the story page; keyboard/touch/screen-reader reachable. |
| §16 Methodology page `/methodology` | **DONE** | Full method, what is not counted, and honest limits. Linked from Hype Index, About, and sitemap. |
| §17 Algorithm audit | **DONE** | Contextual scoring: hedged research framing halves word weight, quoted words are ignored, money/facts don't fire, per-word stacking bounded. |
| §18 Signal categories | **DONE** | LANGUAGE / SUPERLATIVES / BENCHMARK / NUMERICAL / FORMATTING / EMOTIONAL + cross-category combo bonus; signals exposed per score. |
| §19 Hype scoring tests | **DONE** | Measured/Warm/Hot fixtures, hedging + quotes + money false positives, category stacking, signal shares & shift guards. |
| §63 Hype ≠ truth | **DONE** | Copy everywhere insists "detector, not a judgment". |

## Stories

| Spec | Status | Notes |
| --- | --- | --- |
| §20 Story permalinks | **DONE** | `/story/:id`, deterministic hash id, resolves from `allStories` on fresh visits. |
| §21 Story page | **DONE** | Source, published, hype, verbatim headline, "Why", read original. |
| §22 Original attribution | **DONE** | Source chip + "Read original" link. |
| §23 Story sharing | **DONE** | "Copy link" plus native `navigator.share` (Share button) on supported platforms, preserving the story permalink; copy fallback. |
| §24 Story structured data | **DONE** | `NewsArticle` JSON-LD with real values only. |

## Sources

| Spec | Status | Notes |
| --- | --- | --- |
| §25 Source leaderboard | **DONE** | `/sources` "Who's Shouting?" with source / stories / avg intensity / trend. Neutral terminology. |
| §26 Source profile | **DONE** | `/sources/:name`: status, story count, avg hype, distribution, trend, latest stories. |
| §27 Source diversity | **DONE** | `src/lib/ranking.js` caps one source at 2 of the trailing 6 slots in the default "Edited" order, so no outlet dominates the front page. |
| §29 Edition ranking | **DONE** | "Edited" order = freshness + hype + source diversity (spec §27/§29); pure sorts (Newest/Hottest/By Source) retained. Hype never becomes a proxy for importance — freshness dominates the score. |
| §28 Deduplication | **DONE** | Normalize + Jaccard ≥ 0.8, plus leading source-name prefix stripping ("OpenAI: …") and punctuation/case fixtures; unrelated headlines mentioning a company are never merged. |
| §48 OPML | **DONE** | `Download OPML` on Sources + About; valid output. |

## UX & accessibility

| Spec | Status | Notes |
| --- | --- | --- |
| §30 Homepage | **DONE** | Answers what/hype/worth-reading/who/why directly. |
| §31 Edition metadata | **DONE** | Masthead shows date, edition No., and a live story count. |
| §32 Cards view | **DONE** | 21st NewsCards keyed to hype tier. |
| §33 Search | **DONE** | headline/source/summary; "NO MATCHES" empty state; `/` shortcut (ignores inputs). |
| §34 Filters | **DONE** | Live counts; composes with search/source/sort. |
| §35 Keyboard nav | **DONE** | `j`/`k`/`Enter`/`Escape`/`/`/`?`, skips inputs. |
| §36 Story modal | **DONE** | Focus trap, Escape, focus restore, ARIA dialog; full-screen-friendly at 320 px (verified in mobile QA). |
| §37 Mobile QA | **DONE** | Verified at 320/375/390/430/768 px: no horizontal overflow, no clipped text, filters/sort/search reachable, modal + Hype Index gauge + Sources table fit at the smallest width. |
| §38 Accessibility | **DONE** | Semantic HTML, labels, focus states, keyboard navigation, ARIA meters, contrast, reduced motion. |
| §39 Reduced motion | **DONE** | `MotionConfig reducedMotion="user"`, `motion-reduce:transition-none`, canvas effects honor it. |
| §40 Loading design | **DONE** | "PRESSING THE WIRES…" editorial loading copy above real skeletons, backed by genuine timeout + error paths. |
| §41 Error design | **DONE** | Reusable editorial EmptyState with "THE PRESSES ARE JAMMED", "SAVED EDITION · LAST UPDATED" offline banner, "TRY AGAIN" reload everywhere. |
| §36/38 Modal on mobile | **DONE** | Modal fits 320 px without clipping; content remains reachable by touch. |

## SEO & metadata

| Spec | Status | Notes |
| --- | --- | --- |
| §42 SEO audit | **DONE** | Title/description/OG/Twitter/JSON-LD/sitemap/robots/favicon/manifest all present. Per-route title + description + canonical for static routes via `useSeo`; story pages set their own. |
| §43 Canonicals | **DONE** | `useSeo` sets a canonical for every static route (`/`, `/hype-index`, `/sources`, `/sources/:name`, `/about`, `/methodology`); story pages own theirs. |
| §44 Sitemap | **DONE** | `/`, `/hype-index`, `/sources`, `/about`, `/methodology`. |
| §45 Favicon | **DONE** | `favicon.ico` + 16/32 PNGs + manifest. |
| §46 About page | **PARTIAL** | Concise and honest; could cover "what the score does not mean" more explicitly. |
| §47 RSS output | **MISSING** | Deferred (future feature per spec §65). |
| §42 Page-level descriptions | **DONE** | Unique meta description per static route via `useSeo`. |

## Testing & quality

| Spec | Status | Notes |
| --- | --- | --- |
| §55 Feed tests | **PARTIAL** | RSS/Atom/malformed XML covered. No missing-title/date/description, timeout, or failed-source fixtures. |
| §55 Hype tests | **PARTIAL** | Thresholds + boundaries. Missing tier fixtures and false-positive suite. |
| §55 Dedupe tests | **DONE** | Exact, near, source-prefix, punctuation/case variants, and "unrelated headlines that mention a company" are all covered. |
| §55 Ranking tests | **DONE** | Freshness-vs-hype, calm-important vs hype, source-diversity cap, single-source day, pure sorts. |
| §55 History tests | **PARTIAL** | Empty/single/seven-day covered. Missing corrupted-storage fixture. |
| §55 UI tests | **MISSING** | No component/smoke tests (open P4 item in `baseline-review.md`). |
| §56 Build check | **DONE** | `npm test` 64/64 pass; `npm run build` passes. |
| §67 Code quality | **DONE** | Small components, deterministic utilities, minimal deps, no magic numbers in hot paths. |

## Docs & housekeeping

| Spec | Status | Notes |
| --- | --- | --- |
| §68 README | **DONE** | Refreshed for shipped features, routes, cache/security behavior, ranking, and an accurate roadmap (shipped items removed). |
| §68 baseline-review.md | **DONE** | Updated — every P0–P3 finding marked fixed with pointers to where it landed; one P4 item (component tests) remains open. |
| §69 CHANGELOG.md | **DONE** | Created; V2 changes grouped by category (Security / Hype Index / Stories / Sources / UX / SEO / Testing / Docs). |
| §70 Git discipline | **DONE** | Logical per-feature commits in history. |

## Not to build (spec §66) — verified absent

No auth, comments, likes, social feed, chatbot, AI writer, fake community/numbers, database, or third-party services.

## Data integrity (spec §53) — verified

No fabricated stories, scores, history, or statistics. All numbers derive from real fetched + browser-local data. `DATA UNAVAILABLE` fallbacks used where history is missing.

---

## Summary of V2 work items (derived)

Reliability: Worker response-size cap (§5.4), lightweight abuse protection (§5.5), explicit source states + editorial offline/error copy (§6, §8, §41), loading copy (§40).

Hype: rebuild `hype.js` with signal categories + contextual scoring (§17, §18), tier + false-positive tests (§19), Hype Index stat block / distribution % / WHY TODAY / biggest shift (§10–§13), `/methodology` (§16), per-signal "Why" on stories (§15).

Stories: native share (§23).

Sources: source diversity in ranking (§27, §29), dedupe prefix handling (§28).

UX: mobile QA pass at all five widths (§37), full-screen-friendly modal (§36).

SEO: per-route canonical/description, sitemap `/methodology`, About improvements (§42–§46).

Docs: README, baseline-review.md, CHANGELOG.md (§68, §69).

## Remaining open items

Only three low-severity gaps remain, all already logged:
- `§52` Observability: no lightweight metrics (latency/failure/dedupe counts) tracked.
- `§55` History tests: missing a corrupted-`localStorage` fixture.
- `§55` UI tests: no component/smoke suite (see `baseline-review.md` P4).
