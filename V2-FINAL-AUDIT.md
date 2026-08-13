# V2-FINAL-AUDIT — The Baseline

Audit of the repository against **THE BASELINE — FINAL POLISH & PRODUCT UPGRADE PLAN.md**, recorded after the baseline commands (`npm install`, `npm test`, `npm run build`) pass and the current implementation was inspected end-to-end.

Status legend: **ALREADY DONE** = implemented and verified · **NEEDS POLISH** = implemented, upgradeable · **MISSING** = not present · **BROKEN** = present but wrong.

## Repository snapshot

- Stack: React 19 + Vite 6 + Tailwind CSS 4, Cloudflare Worker host + feed relay. `node --test` unit suite (68 passing) + vitest component suite (8 passing). Production build passes.
- Routes: `/`, `/hype-index`, `/sources`, `/sources/:name`, `/story/:id`, `/about`, `/methodology`, `*`.
- Worker (`src/index.js`): static assets, `/api/feeds`, `/api/feed` (allowlist + rate-limit + body cap + same-origin CORS), `/api/news` (410).
- Feed pipeline: browser fetches each feed through the relay, parses with `DOMParser`, scores hype, dedupes, ranks, renders. Per-feed streaming (`onPartial`).
- Cache: Worker edge cache (5 min + SWR 600) + browser saved edition (30 min TTL) + per-day hype/source history (30 days, localStorage).
- Hype engine verified against the plan's fixtures: Low `0`, Medium `18` (Warm), High `29` (Hot), hedged research `5`, money/facts `0`.

## The five things that matter

| Plan section | Status | Notes |
| --- | --- | --- |
| §5 Hype Index as hero | **DONE** | Stat block now leads with the day's reading as a hero number (real share), plain-English caption, and honest change line; "Today" cell removed. |
| §6 "WHY TODAY?" | **ALREADY DONE** | Real per-category signal shares; "DATA UNAVAILABLE" on older caches. |
| §7 "BIGGEST SHIFT" | **ALREADY DONE** | Category-share deltas vs the previous recorded day; "NOT ENOUGH HISTORY" guard. |
| §8 Hype explanation UI | **DONE** | `<details>` popover opens a per-signal `+points` breakdown with the visible disclaimer; also used on story page and story modal. |
| §9 Hype explanation design | **DONE** | `SignalBreakdown` shows human labels + points + "measures intensity, not truth" in the popover itself. |
| §10 Methodology | **DONE** | Page now leads with a prominent "A high Hype score does not mean a story is false" callout. |
| §11 Hype algorithm audit | **ALREADY DONE** | Contextual scoring verified with the plan's fixtures; hedge/quotes/money guards hold. |
| §12 Hype tests | **ALREADY DONE** | Covers measured/hype/hedged/money; explicit Low/Medium/High fixtures verified. |
| §13 Cards view design | **DONE** | Replaced generic NewsCards with editorial wire-card grid (hairline separators, serif headlines, shared StoryModal). |
| §14 No more visual effects | **ALREADY DONE** | No new effects added; existing paper/print/VHS/glitch kept. |
| §15 Source analytics | **DONE** | Trend cells now report magnitude (`↑12%`) via `sourceTrendReading`; accessible `TrendCell`. |
| §16 Source language | **ALREADY DONE** | Neutral terminology throughout ("average headline intensity", not judgment words). |
| §17 Source profiles | **ALREADY DONE** | Status, count, avg, distribution, trend, latest stories. |
| §18 Mirrored feeds | **DONE** | Anthropic's hourly GitHub mirror labeled "mirrored feed" in the leaderboard and profile with a transparency note. |
| §19 Source diversity | **ALREADY DONE** | `editedRank` caps one source at 2 of the trailing 6 slots; freshness dominates, hype only tilts ties. |
| §20 Story experience | **ALREADY DONE** | `/story/:id` resolves on a fresh visit from `allStories`; verbatim headline. |
| §21 Story sharing | **ALREADY DONE** | Copy-link uses the canonical story URL; native share fallback. |
| §22 Story attribution | **ALREADY DONE** | Source + published + "Read original" always present. |
| §23 Mobile experience | **ALREADY DONE** | Verified at 320/375/390/430/768 px in prior QA; no horizontal scroll. |
| §24 Mobile hype explanation | **ALREADY DONE** | `<details>` opens on tap; not hover-dependent. |
| §25 Keyboard UX | **ALREADY DONE** | `j`/`k`/`Enter`/`Escape`/`/`/`?`, skips inputs and open dialogs. |
| §26 Story modal accessibility | **DONE** | Shared `StoryModal` with focus trap, Escape, focus restore, ARIA dialog used by both StoryFeed and CardsView. |
| §27 Component tests | **DONE** | `test/components/story-feed.test.jsx` (vitest + @testing-library/react): SignalBreakdown, SpinBadge popover, StoryModal focus behavior. 8 passing. |
| §28 Feed reliability | **ALREADY DONE** | Timeout, per-feed isolation, partial render, offline, cached edition, SWR. One broken feed never breaks the edition. |
| §29 Security regression | **ALREADY DONE** | Same-origin CORS, allowlist, 8 s upstream timeout, 1 MB body cap, per-IP rate limit, browser-UA relay. |
| §30 SEO polish | **DONE** | Per-route title/description/canonical/OG/Twitter/JSON-LD; story pages get `NewsArticle` + `og:type=article`. |
| §31 Favicon | **ALREADY DONE** | `favicon.ico` + 16/32 PNGs + manifest; Baseline-branded. |
| §32 README reorder | **DONE** | Cards view, tests, structure, roadmap, and history sections refreshed. |
| §33 Documentation cleanup | **DONE** | `baseline-review.md` P4 → DONE; `V2-AUDIT.md` and `CHANGELOG.md` updated. |
| §34 Performance | **ALREADY DONE** | No blind optimization; bundle is 468 kB gz 150 kB, lazily split secondary routes. |
| §35–37 Don't-adds / no DB / future | **ALREADY DONE** | Auth/comments/likes/chatbot/DB all absent; history stays browser-local. |
| §38–39 Visual polish / anti-slop | **ALREADY DONE** | Editorial typography + rules throughout; the Cards view is the exception being fixed. |
| §40 Data trust | **ALREADY DONE** | No fabricated numbers; em dashes / "DATA UNAVAILABLE" / "NOT ENOUGH HISTORY" fallbacks. |
| §41 Editorial trust | **ALREADY DONE** | "detector, not a judgment" copy across story pages, methodology, badge popover. |
| §42 Final user journey | **ALREADY DONE** | NEWS → HYPE → WHY → SOURCE → TREND → ORIGINAL loop is coherent and undirected. |

## Defects found during this audit

1. **Trend glyphs are title-only** (`Sources.jsx` `TrendGlyph`, `SourceProfile.jsx` trend cell). The `↑/↓/→` meaning is only on `title=`, invisible to touch and ambiguous to screen readers. → add `aria-label` + sr-only text. **P0 (a11y). — FIXED (`TrendCell`).**
2. **Hype explanation is a comma-joined string**, not the plan's per-signal `+points` breakdown, and the popover lacks the disclaimer. **P1 — FIXED (`SignalBreakdown`, wired into badge popover / story page / modal).**
3. **Cards view is generic SaaS** (gradients, rounded corners, bookmark icon, blur-in animations). **P1 — FIXED (`CardsView` editorial wire cards).**
4. **Anthropic's mirrored feed is not labeled.** **P1 — FIXED (`isMirroredFeed` + "mirrored feed" chip/note).**
5. **Source trend shows no magnitude** (bare glyph, no `↑12%`). **P1 — FIXED (`sourceTrendReading`).**
6. **Story pages omit `og:type=article`** (NewsArticle JSON-LD present). **P2 (SEO). — FIXED (`StoryPage.jsx`).**

## Planned fixes (in priority order)

1. P0 — accessible trend glyphs (aria-label + sr-only).
2. P1 — per-signal hype breakdown component with `+points`, human labels, and the intensity-not-truth disclaimer, wired into the badge popover, story page, and story modal.
3. P1 — source trend magnitude (percent + points vs previous reading).
4. P1 — editorial wire-card redesign of the Cards view (shared StoryModal extraction).
5. P1 — Hype Index hero polish (the day's reading as the headline number) + mirrored-feed labeling.
6. P2 — prominent methodology trust statement; story `og:type=article`.
7. P2 — React smoke-test suite (vitest + @testing-library/react) for the critical paths.
8. P2 — README product-first reorder; update `baseline-review.md` / `V2-AUDIT.md` / `CHANGELOG.md`.

**All eight fixes landed** in this pass. Verified: 68 unit tests + 8 component tests pass (`npm run test:all`), production build passes. Component tests (`test/components/story-feed.test.jsx`) cover `SignalBreakdown`, `SpinBadge` popover, and `StoryModal` focus behavior (open, Escape, focus restore). Docs updated: README (Cards view, tests, structure, roadmap), `baseline-review.md` (P4 → DONE), `V2-AUDIT.md`, `CHANGELOG.md`.
