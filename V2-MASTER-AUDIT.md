# V2-MASTER-AUDIT — The Baseline

Audit of the repository against **THE_BASELINE_MASTER_AI_AGENT_PLAN.md**, recorded after `npm install`, `npm test`, `npm run build` all pass and the implementation was inspected end-to-end.

Status legend: **DONE** = implemented and verified · **NEEDS POLISH** = implemented, upgradeable · **MISSING** = not present · **BROKEN** = present but wrong.

## Repository snapshot

- Stack: React 19 + Vite 6 + Tailwind CSS 4, Cloudflare Worker host + feed relay. `node --test` unit suite (68 passing) + vitest component suite (8 passing). Production build passes.
- Routes: `/` (landing), `/edition` (news), `/hype-index`, `/sources`, `/sources/:name`, `/story/:id`, `/about`, `/methodology`, `*`.
- Worker (`src/index.js`): static assets, `/api/feeds`, `/api/feed` (allowlist + rate-limit + body cap + same-origin CORS), `/api/news` (410).
- Feed pipeline: browser fetches each feed through the relay, parses with `DOMParser`, scores hype, dedupes, ranks, renders. Per-feed streaming (`onPartial`).
- Cache: Worker edge cache (5 min + SWR 600) + browser saved edition (30 min TTL) + per-day hype/source history (30 days, localStorage).
- Hype engine verified against the plan's fixtures: Low `0`, Medium `18` (Warm), High `29` (Hot), hedged research `5`, money/facts `0`.

## Audit by phase

### Phase 1 — Evidence of a working product (§5)

| Area | Status | Notes |
| --- | --- | --- |
| Unit tests | **DONE** | 68 passing (`node --test`). |
| Component tests | **DONE** | 8 passing (vitest + testing-library): SignalBreakdown, SpinBadge popover, StoryModal focus behavior. |
| Production build | **DONE** | `npm run build` clean; secondary routes code-split. |

### Phase 2 — Security, reliability, production QA (§4)

| Area | Status | Notes |
| --- | --- | --- |
| Security audit | **DONE** | `SECURITY-AUDIT.md` (2026-08-13): Worker allowlist-only (live 404 on unknown), same-origin CORS (evil origin blocked), 90/60s rate limit, 1 MB cap, 8 s timeout, `/api/news` → 410; browser path clean (no `dangerouslySetInnerHTML`, `safeHref`, localStorage shape-validated); SW network-first/never-caches-errors. |
| Production QA | **DONE** | `QA-CHECKLIST.md`: every route/API/asset live-verified 200/expected; asset hashes match local `dist/`. |
| Known future hardening | **NEEDS POLISH** | `FUTURE-ROADMAP.md` parked: CSP, feed-image URL sanitization, remove dead `news-cards.jsx`, bundle trim (main ≈ 477 kB / gz 152 kB), automated axe sweep, screen-reader pass, per-source history trend, archives, OPML. |

### Phase 3 — Quality bar & standards (§6)

| Area | Status | Notes |
| --- | --- | --- |
| Accessibility | **DONE** | AA contrast fixed (2026-08-13): `text-muted-foreground/60–80` → full-strength across pages; `role=meter`/`progressbar`/`img`, sr-only labels, focus-visible rings, focus trap in modal, reduced-motion honored. |
| Anti-slop | **DONE** | Editorial typography (Fraunces + Inter, paper/ink/vermillion), print rules, no gradients/blobs/glass; restrained effects gated by `prefers-reduced-motion`. |

### Phase 4 — Landing page (PRIMARY OBJECTIVE, §8–§23)

| Plan section | Status | Notes |
| --- | --- | --- |
| §8 Route architecture | **DONE** | `/` → landing, `/edition` → full news experience. Old homepage (the edition) moved to `/edition`; no external URLs broken (edition was `/`; `/story/:id`, `/sources/*`, `/hype-index`, `/about`, `/methodology` all unchanged). Nav + footer "Edition" link repointed; sitemap + ROUTE_META updated. |
| §9 Landing structure | **DONE** | All 10 sections present: hero → live snapshot → story preview → why → how hype works → signal loop → hype index preview → source preview → final CTA → footer. |
| §10 Hero | **DONE** | Masthead carries the nameplate + tagline; in-page hero states the value proposition ("A quiet interface for a very loud industry.") with two CTAs: ENTER THE EDITION → `/edition`, EXPLORE HYPE INDEX → `/hype-index`. |
| §11 Live snapshot | **DONE** | Real `stats.hypePercent` + story count + honest change line vs yesterday (`hypeTrend`); "first reading" guard when no history. |
| §12 Real story preview | **DONE** | Top 4 from the same live edition (`stories`), each with `SpinBadge` + source + time, linked to `/story/:id`. Same data as the edition — no second feed. |
| §13 Why The Baseline | **DONE** | Three-point editorial explainer (headlines verbatim / spin detected / hype measured). |
| §14 "How loud is the story" | **DONE** | Illustrative LOW → MEDIUM → HIGH scale with a visible "Illustrative examples — not today's headlines" label; examples mirror the detector's own test fixtures. |
| §15 Hype explanation format | **DONE** | The illustration shows the scale; deeper per-signal breakdown lives in the badge `<details>` + Methodology. |
| §16 The signal loop | **DONE** | NEWS → HYPE → WHY? → SOURCE → TREND five-step diagram. |
| §17 Hype Index preview | **DONE** | Real today's % + 7-day mini trend (`readHypeHistory`/`hypeTrend`), linked to `/hype-index`, with the "measures intensity, not truth" disclaimer. |
| §18 Source preview | **DONE** | Real top-4 `sourceStats` by average headline intensity (meter + number), linked to `/sources`. Neutral "who's shouting" language, not credibility. |
| §19 Final CTA | **DONE** | "The news is loud enough / Read it differently." → `/edition`. |
| §20 Footer | **DONE** | Global `SiteFooter` (Edition, Hype Index, Sources, About) — consistent with nav. |
| §21 Responsive | **DONE** | Mobile-first Tailwind; sections stack, grids collapse at `sm:`; no horizontal scroll (verified in prior 320–768 px QA). |
| §22 Motion | **DONE** | Restrained editorial fade/drift on section reveal; `MotionConfig reducedMotion="user"` strips transforms for reduced-motion users. |
| §23 Data trust | **DONE** | Every number on the landing is measured from the live edition/history; "DATA TEMPORARILY UNAVAILABLE"/"first reading"/"No sources measured yet" fallbacks; illustrative section explicitly labeled. No fabricated figures. |

### Phase 5–9 — Remaining plan items (§24–§68)

| Area | Status | Notes |
| --- | --- | --- |
| §24–§34 Landing polish details | **NEEDS POLISH** | Copy and section depth could be tightened (e.g. a single-source day yields a thin snapshot). |
| §60 Git / commit discipline | **DONE** | Logical commits + push per prior passes; this landing ships as its own commit. |
| §61–§63 Type / review loops | **NEEDS POLISH** | Not yet run for the landing; a focused read-through of `Landing.jsx` is the immediate next step. |
| §68 Stop condition | **PENDING** | Landing shipped; one review pass then call the objective met. |

## Defects found during this audit

1. **`/edition` was absent from `ROUTE_META` and `sitemap.xml`** after the route split — the news page would have fallen back to the landing's SEO and been invisible to crawlers. **P1 — FIXED (added `/edition` entry + sitemap URL, `/` downgraded to `priority 0.9`).**
2. **Nav/footer "Latest" still pointed at `/`** after moving the edition — would strand readers on the landing. **P0 — FIXED (both repointed to `/edition`, relabeled "Edition").**

## Not audited (explicitly out of scope this pass)

- Visual rendering in a live browser (browser automation unavailable in this environment — verified via build + SPA-shell fetch only). A screenshot/render pass of `/` and `/edition` is recommended before final sign-off.
- Live Lighthouse/a11y tooling (same environment constraint); audits above are manual/static.
