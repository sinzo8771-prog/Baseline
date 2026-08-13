# Security Audit — The Baseline

Audited: 2026-08-13 · Scope: Worker relay, RSS input path, browser rendering, service worker, SEO/JSON-LD injection, localStorage, rate limiting. Methodology follows the master plan §6–8 (Strix-style security retest performed manually; no live scanner was available).

## Summary

The Baseline's threat surface is small and well-contained by design: the Worker is a **static host + same-origin feed relay** with no server-side parsing, no user-supplied persistence, and no database. The browser does all aggregation/scoring client-side. No critical or high-severity findings. **One medium-severity defect was found and fixed** (uncaught `URIError` crash on a crafted URL). Three low-severity hardening items are noted for the roadmap.

---

## 1. Worker relay (`src/index.js`) — PASS

### SSRF — SAFE
- Upstream URL is always a lookup keyed by exact `name` against the hardcoded `FEEDS` allowlist (`src/index.js:82-86`).
- Unknown names → `404`; a crafted `name` (including a full URL) is never used as a fetch target.
- Verified live against production: `?name=EvilFeed` → 404, `?name=https%3A%2F%2Fevil.com%2Fx` → 404.

### CORS — SAFE (same-origin only)
- `originOf()` (`src/index.js:198-201`) echoes the requesting origin **only** when it equals the Worker's own origin; everything else receives the site's own origin as ACAO.
- Verified live: an `Origin: https://evil.example.com` request returns `Access-Control-Allow-Origin: https://the-baseline.baseline-news.workers.dev`, which the browser refuses to expose cross-origin. The relay cannot be turned into an open proxy.
- Edge-cache copies cannot be poisoned to a permissive ACAO: the cached header is always computed by `originOf`, which never yields an arbitrary third-party origin.

### Rate limiting — PASS
- Per-IP fixed window (90 req / 60 s) on `/api/feed` and `/api/feeds` (`src/index.js:50-54`, `164-185`).
- Keyed on `CF-Connecting-IP`, set by Cloudflare and unspoofable from the client.
- Fails open on cache errors so a cache hiccup never blocks a legitimate reader.
- A normal page load is ~11 relay requests, so the window is generous for humans while deterring scripted scraping.

### Body cap & timeout — PASS
- Upstream body hard-capped at 1 MB via `readBodyBounded()` (`src/index.js:34`, `139-159`), enforced against both the declared `Content-Length` and actual streamed bytes — a malicious or buggy upstream cannot blow the request budget.
- Upstream fetch timeout 8 s (`UPSTREAM_TIMEOUT_MS`), ≤ the browser-side 6 s `FEED_TIMEOUT_MS` so the relay never holds connections the client already abandoned.
- Cache `max-age=300, stale-while-revalidate=600` — bounded TTL, nothing cached forever.
- Only `res.ok` relays are cached; error responses never poison the edge copy.

### Retired endpoint — PASS
- `/api/news` returns `410 Gone` (`src/index.js:68-76`).

## 2. RSS input path (`src/lib/feeds.js`) — PASS

- All titles/summaries run through `stripTags()` (`<[^>]*>` removal + entity decode, `src/lib/feeds.js:68-72`) and are rendered by React as **text nodes** — React escapes by default, so even a bypassed tag cannot execute.
- Parsing uses the namespace-aware, CDATA-aware `DOMParser` (`text/xml`); summaries capped at 500 chars.
- No `dangerouslySetInnerHTML` anywhere in the codebase (confirmed by grep).
- Source list is a compile-time constant in sync with the Worker allowlist (guarded by `test/feeds.test.js`).

## 3. Rendering / XSS — PASS

- All external links pass through `safeHref` (`/^https?:\/\//i`) in `StoryPage.jsx`, `StoryModal.jsx`, and `news-cards.jsx`. Non-http(s) schemes (including `javascript:`) are rejected.
- Story IDs are `hashId(title|link)` (base36) and are `encodeURIComponent`-encoded in URLs — no path injection.
- JSON-LD on story pages is injected via `script.textContent = JSON.stringify(...)` (not HTML parsing), so feed-controlled titles cannot break out of the script element.
- `document.title` / `setAttribute` assignments are safe property writes, never HTML.

## 4. Service worker (`public/sw.js`) — PASS

- Only intercepts **same-origin** GETs; foreign-origin requests are passed through untouched.
- Network-first for navigations and `/api/` with cached fallback; static assets are stale-while-revalidate.
- **Never caches an error response** (`if (fresh.ok)`) — a transient failure cannot poison the offline shell.
- The app shell is a static bundle; the feed data is deliberately **not** baked into the SW (offline readers see their last saved edition, never fabricated "fresh" news).

## 5. localStorage — PASS

- All persisted reads (`edition cache`, hype history, source history) are wrapped in try/catch with shape validation (`Array.isArray`, type checks); corrupted or malicious localStorage fails closed to empty state.
- Edition cache is versioned (`baseline-edition-v1`) and TTL'd (30 min) so a shape change can't replay a poison pill.
- localStorage is same-origin-only and offers no privilege boundary — self-XSS is out of scope.

## 6. SEO / static assets — PASS

- `robots.txt`, `sitemap.xml` (production origin), and `site.webmanifest` are static and well-formed.
- OG image and favicons are local assets, not feed-controlled.

---

## Findings

### Fixed during audit
| Severity | Finding | Fix |
|---|---|---|
| **Medium** | `SourceProfile.jsx` re-decoded the already-decoded route param (`decodeURIComponent(name)`). `react-router` v7's `decodePath` percent-decodes params itself, so a crafted URL like `/sources/%` (malformed segment) threw an **uncaught `URIError`**, crashing the page to an error/blank screen. Names with a literal `%` (e.g. `/sources/%25`) were also double-decoded to the wrong source. | Removed the redundant decode; the component now uses the param exactly as react-router delivers it (`src/app/pages/SourceProfile.jsx:39-43`). Verified: unit (68) + component (8) tests pass, build clean. |

### Low severity (roadmap — see `FUTURE-ROADMAP.md`)
| Severity | Finding | Suggestion |
|---|---|---|
| **Low** | No `Content-Security-Policy` header/meta. The app uses inline scripts (theme init) and Google Fonts, so a strict CSP needs care — but a permissive-script CSP (`default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:`) would add defense-in-depth against any future injection. | Add CSP meta in `index.html` (or via Worker header) after verifying the inline theme script's nonce/hash. |
| **Low** | Story `image` URLs come from feeds and are used verbatim as `<img src>` (no scheme check). `<img src>` cannot execute JS, but a malicious/misbehaving feed could reference an external tracker. | Consider `safeHref`-style validation or a referrerpolicy on feed images. |
| **Low** | `src/components/ui/news-cards.jsx` is dead code (no longer imported) yet still ships pattern code with a `safeHref`. | Remove the file in a future cleanup pass. |

---

## Regression baseline (verified this audit)

- Worker: SSRF blocked (live probe), same-origin CORS (live probe), 429 rate limit, 1 MB body cap, 8 s timeout, bounded cache TTL.
- Browser: no `dangerouslySetInnerHTML`, all links `safeHref`, JSON-LD via `textContent`, encoded IDs.
- SW: same-origin only, network-first, never caches errors.
- localStorage: try/catch + shape validation everywhere.
- Tests: 68 unit + 8 component passing; production build clean.