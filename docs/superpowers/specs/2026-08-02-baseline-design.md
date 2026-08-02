# The Baseline — Design Spec

**Date:** 2026-08-02
**Status:** Approved (verbal, 2026-08-02)
**Stack:** Static frontend + Cloudflare Worker + Cloudflare KV (free tier)

---

## 1. Purpose

A modern, editorial-style website that surfaces the latest AI news for free, with a wry, skeptical voice. The site exists to cut through AI marketing hype: it shows what sources actually said, labels how hyped a story is, and never writes generated fluff. "Anti AI slop" is expressed through the design (editorial print, no gradients/glassmorphism) and the product (a hype meter, dry tone, source-first reporting).

## 2. Product name & voice

- **Name:** The Baseline. Tagline: "AI news, hype removed."
- **Voice:** Wry / skeptical. Headlines come from sources verbatim (never rewritten). UI copy is dry and deadpan. The site fact-checks the hype machine through the Hype Index, not through editorial rants.

## 3. Look & feel (editorial print)

- Warm paper background, near-black ink, one signal accent: vermillion red (#D94A2B-ish), reserved for hype/spin markers only.
- Strong serif headlines (Fraunces), clean sans UI (e.g. Inter or system sans).
- Newspaper masthead with today's date and tagline. Rules and hairlines instead of cards; no gradients, no shadows, no glass, no rounded corners.
- Layout: big lead story up top, then a front-page grid of the rest.

## 4. Data model

A story (as served by `/api/news`):

| Field | Type | Notes |
|---|---|---|
| `id` | string | stable hash of title+link |
| `title` | string | verbatim from source |
| `link` | string | original URL |
| `source` | string | publication name |
| `publishedAt` | ISO 8601 | feed timestamp |
| `summary` | string | verbatim excerpt (truncated) |
| `spin` | enum | `Measured`, `Warm`, `Hot`, `On Fire` |
| `spinScore` | number | 0–100 composite |
| `flags` | string[] | matched hype signals |

Sources are a static config list: feed URL + display name.

## 5. Architecture

```
RSS feeds (10 sources)
        │ scheduled fetch (cron, every 20 min)
        ▼
Cloudflare Worker ──parse, dedupe, score──▶ Cloudflare KV cache
        │                                          │
        ▼                                          ▼
GET /api/news  ◀── served by Worker ──────┐        │
                                          │        │
Static site (index.html + assets) ────────┴── fetch /api/news
```

- **Worker (`src/index.js` / `wrangler.toml`):**
  - `GET /api/news` → returns cached stories JSON, or builds on demand if cache empty (then writes cache).
  - `scheduled` handler → fetches all sources, parses RSS, dedupes by title similarity, scores hype, writes KV.
  - KV keys: `stories:latest` (array), `stats:today` (daily Hype Index summary).
- **Frontend (single static page):** masthead, date, lead story, grid, Hype Index meter, sources footer. Fetch `/api/news`, render. Empty-cache state prints a deadpan "extra! extra!" error.
- **Hype scoring:** regex heuristics on title+summary — hype words ("revolutionary", "AGI", "game-changing", "breakthrough", "billion", "superhuman", ...), ALL CAPS runs, exclamation marks, emoji. Each signal adds weight; composite normalized to 0–100. Thresholds map to spin labels. Config in `src/hype.js`, pure and unit-testable.

## 6. Sources (initial list)

OpenAI, Anthropic, Google DeepMind, Hugging Face, The Verge AI, MIT Technology Review AI, Ars Technica AI, VentureBeat AI, TechCrunch AI, Wired AI. (Feeds resolved at implementation; any dead feed is skipped and logged.)

## 7. Deployment

- Free Cloudflare account, one `wrangler deploy`. The Worker serves both `/api/news` and the static assets (public/ directory via assets binding). Worker schedules itself via `wrangler.toml` cron (every 20 min).
- User creates account and runs deploy once (or I provide exact commands). Live URL is the deliverable.

## 8. Error handling

- Dead/slow feeds: per-feed timeout (~10s), skip failures, keep going.
- Empty KV: `GET /api/news` builds synchronously on first hit (may be slow once) then caches.
- Source changes: dedupe by normalized title; if a source restructures its feed, stories still render from cached KV until next refresh.
- Frontend: if fetch fails, show deadpan offline notice; never a blank page.

## 9. Out of scope (YAGNI)

- No auth, no comments, no newsletter, no search, no user accounts.
- No AI-generated summaries (verbatim excerpts only).
- No database beyond KV.

## 10. Testing

- Unit tests for hype scoring (fixtures: hyped vs measured headlines) and dedupe.
- Manual verification: `wrangler dev`, then `wrangler deploy`, then curl `/api/news` and inspect rendered page in browser.
