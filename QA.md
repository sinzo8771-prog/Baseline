# QA Checklist — The Baseline

Last verified: 2026-10-16 · Tests: 124 unit + 64 component + 22 E2E (incl. 4 visual regression baselines) passing, production build clean.

> **Scope of this refresh:** verified on the unmerged `redesign-experiment` branch ("The Broadsheet" redesign). The gates in the next table were re-run in full on that branch. Rows still dated 2026-08-13 / 2026-08-24 describe `master` and were **not** re-run — see [Cross-route sweep](#cross-route-sweep-2026-10-16) for exactly what the redesign pass re-verified.

This is the pre-release gate for the site. It captures everything that must hold before calling a build "shipped", plus the evidence from the most recent full pass.

---

## Test gate (must pass before any deploy)

| Check | Command | Expected | Status |
|---|---|---|---|
| Unit suite | `npm test` | 124 passing | ✅ PASS (2026-10-16) |
| Component suite | `npm run test:components` | 64 passing (incl. axe a11y on 9 surfaces) | ✅ PASS (2026-10-16) |
| Full gate | `npm run test:all` | both suites green | ✅ PASS (2026-10-16) |
| E2E + visual regression | `npm run test:e2e` | all specs green, snapshots stable across runs | ✅ PASS (2026-10-16, 22 specs) |
| Production build | `npm run build` | no errors, assets emitted | ✅ PASS (2026-10-16, 3.1 s) |
| CI parity | `npm ci && npm test` on Node 24 | same as local | ✅ PASS (verified via deploy run, 2026-08-24 — **not** re-run) |

> CI (`deploy.yml`) runs `npm run test:all` on Node 24 before deploying.

---

## Functional checks (manual, last pass 2026-08-13)

| Area | Check | Status |
|---|---|---|
| Home | Edition streams in (partial → settled), toast announces count | ✅ PASS |
| Home | View toggle (Edition/Cards), Sort toggle, Filter disclosure (spin chips + legend), search | ✅ PASS |
| Home | `?view`, `?sort`, `?source=` URL params restore state; `?` help dialog | ✅ PASS |
| Stories | Modal opens (focus on close button), Escape closes, focus restores | ✅ PASS |
| Stories | Focus trap keeps Tab inside modal | ✅ PASS (by inspection) |
| Stories | Copy link, permalink, "read original" (target=_blank + noopener) | ✅ PASS |
| Permalinks | `/story/:id` resolves any story in today's composed set; `og:type=article` + JSON-LD | ✅ PASS |
| Hype Index | Gauge, trend bars (role=img + aria-label), tier bars (role=meter), WHY TODAY | ✅ PASS |
| Sources | Table, per-source trend cells (aria-label sentence), mirrored-feed badge | ✅ PASS |
| Source profile | `/sources/:name` decodes names; empty/offline states | ✅ PASS |
| Offline | EmptyState + TRY AGAIN; saved edition re-renders from localStorage | ✅ PASS |
| 404 | Unknown routes → NotFound page | ✅ PASS |
| Theme | Toggle persists; no FOUC (inline sync script); OS preference on first visit | ✅ PASS |
| Reduced motion | rAF loops settle to a static frame; framer-motion `reducedMotion="user"` | ✅ PASS |

## Cross-route sweep (2026-10-16)

Automated sweep of all 11 routes × 5 viewports against the local dev server, plus axe-core WCAG 2.x. Two pre-existing defects were found and fixed on this branch (see Known limitations).

| Check | Scope | Result |
|---|---|---|
| Horizontal overflow | 11 routes × 320 / 390 / 768 / 1024 / 1440 | ✅ PASS — no page scrolls sideways. The only elements crossing the viewport edge are nav `<a>` links inside `.site-nav-links` (`overflow-x: auto`), which is the intended mobile nav strip |
| Leaderboard scroll strip | `/sources`, `/hype-index` @ 320 / 390 / 1440 | ✅ PASS — table keeps its 560px min-width and scrolls inside `.board-scroll` (strip `scrollLeft` 272 @320, 202 @390); desktop fills the container (1232px @1440) with no strip |
| Heading structure | 11 routes | ✅ PASS — exactly one `<h1>` per route |
| Landmarks | 11 routes | ✅ PASS — `.site-nav` + `.site-footer` on every route |
| axe-core WCAG 2.x | 11 routes | ✅ PASS — 0 violations after the search `kbd` contrast fix below |
| Dark-theme parity | 12 route/size combos, `colorScheme: dark` | ✅ PASS — dark tokens resolve (`--paper #17150f`, `--ink #f2ede1`, `--vermillion #ec7d5a`); 0 axe violations, no horizontal overflow, one `<h1>` per route, 0 page errors |
| Print stylesheet | all 11 routes, `emulateMedia({ media: "print" })` | ✅ PASS — `.site-nav` and `.theme-toggle` hidden, every decorative `canvas` hidden, `.masthead-title` + `h1` visible, no printed overflow. `e2e/print.spec.js` still covers `/edition` only; the other 10 were verified by sweep, not by a committed spec |
| Focus visibility | 6 tabbed elements × light + dark | ✅ PASS — 2px `--vermillion` outline on every one (light `#b3371c`, dark `#ec7d5a`) |
| Console / page errors | 11 routes | ✅ PASS — 0 page errors. The 429s seen mid-sweep were upstream feed rate-limiting triggered by the sweep itself, not a defect |
| Text encoding | repo-wide scan for U+00E2 / U+00C3 / C1 mojibake | ✅ PASS — one hit found (`Saved.jsx` empty state), fixed, re-scan clean. Remaining non-ASCII is intentional (`·` `—` `§` `…` `⌘`) |
| Visual inspection | every route screenshot has now been looked at | ✅ PASS — 9 read at full resolution (`sources-390`, `hype-index-1440`, `saved-390`, `methodology-390`, `week-in-review-1440`, `story-390`, `no-such-page-390`, `landing-dark-1440`, one dispatch card), 2 read at legible resolution via a 2-up sheet (`sources/:name` desktop + mobile, `about-390`), and all 13 remaining light-theme captures reviewed together as a contact sheet for layout and chrome consistency. Stored outside the repo in `../qa-shots/final/` + `../qa-shots/final-dark/` (not committed) |

> **Screenshot gotcha (method, not a defect):** below-the-fold sections animate in with `whileInView` from `opacity: 0`, so a `fullPage: true` screenshot taken **without scrolling** captures them at `opacity: 0` and they look missing when they are present (the landing dispatch had `articles=5` in the DOM while the capture showed a blank band). Scroll the section into view before capturing. Reduced-motion users are not affected: `.fp-card` reaches `opacity: 1` under both `prefers-reduced-motion: reduce` and `no-preference`.

## Security checklist (see archive/plans/SECURITY-AUDIT.md for detail)

| Check | Status |
|---|---|
| Worker: SSRF impossible (allowlist only) | ✅ PASS (live probe: unknown name → 404) |
| Worker: same-origin CORS only | ✅ PASS (live probe: evil origin gets site origin) |
| Worker: rate limit (90/60s/IP), 1 MB body cap, 8 s timeout | ✅ PASS |
| Worker: retired `/api/news` → 410 | ✅ PASS |
| Browser: no `dangerouslySetInnerHTML`; React escapes feed text | ✅ PASS |
| Links: all through `safeHref` (`^https?://`) | ✅ PASS |
| JSON-LD: injected via `textContent` (no HTML parsing) | ✅ PASS |
| Route params: no double-decode (URIError crash fixed `f0859a8`) | ✅ PASS |
| Service worker: same-origin only, never caches errors | ✅ PASS |
| localStorage: try/catch + shape validation everywhere | ✅ PASS |
| Document security headers (CSP / nosniff / referrer-policy) on **every** document | ❌ **GAP — pre-existing, live in production.** `wrangler.toml` sets `not_found_handling = "single-page-application"` but leaves `html_handling` at its `auto-trailing-slash` default, so Cloudflare's asset layer serves `/` straight from `index.html` **without invoking the Worker**. `src/index.js:129` (`withSecurityHeaders(await env.ASSETS.fetch(request))`) therefore never runs for the root URL. Confirmed live: `https://the-baseline.baseline-news.workers.dev/` → 200 with **no** `content-security-policy`, while `/edition`, `/methodology` and deep links carry all three. One-line fix — `html_handling = "none"` under `[assets]` — verified locally: `/` then serves CSP/nosniff/referrer-policy and every route still boots (landing, edition, 404 all render with zero page errors). **Not applied**: it is a production config change and needs its own deploy |

## Accessibility checklist

| Check | Standard | Status |
|---|---|---|
| Keyboard: Tab order, visible `focus-visible` outlines | WCAG 2.4.7 | ✅ PASS |
| Keyboard: modal focus trap + Escape + focus restore | WCAG 2.1.1/2.1.2 | ✅ PASS |
| Reduced motion respected (CSS + rAF settle + framer-motion) | WCAG 2.3.3 | ✅ PASS |
| Reduced motion: scroll-reveal content still reaches its visible end state | WCAG 2.3.3 | ✅ PASS (verified 2026-10-16 — `.fp-card` goes opacity 0 → 1 with the transform dropped, under both `reduce` and `no-preference`) |
| Landmarks: `nav aria-label`, `main`, `section` regions | WCAG 1.3.1 | ✅ PASS |
| Forms: sr-only labels (`htmlFor`/`id`) for search | WCAG 1.3.1 | ✅ PASS |
| Dynamic content: `aria-live` toast region | WCAG 4.1.3 | ✅ PASS |
| Charts: `role="img"`/`role="meter"` with text equivalents | WCAG 1.1.1 | ✅ PASS |
| Icon-only buttons: `aria-label`/`aria-pressed` | WCAG 1.1.1 | ✅ PASS |
| Contrast: body 15.15:1, muted 6.46:1, primary 4.91:1 (light); all ≥4.5:1 | WCAG 1.4.3 AA | ✅ PASS |
| Contrast: helper labels raised off `/60–/80` opacity (was 3.29–4.06:1) | WCAG 1.4.3 AA | ✅ PASS (fixed `f0859a8`) |
| Contrast: edition search `kbd` hint off `/70` opacity (was 3.02:1) | WCAG 1.4.3 AA | ✅ PASS (fixed 2026-10-16 — now 5.60:1 light / 6.87:1 dark, re-checked with axe in both themes) |
| Decorative elements `aria-hidden` (icons, trend glyphs) | WCAG 1.3.1 | ✅ PASS |
| `MotionConfig reducedMotion="user"` in App root | WCAG 2.3.3 | ✅ PASS |

## Performance checklist

| Check | Result |
|---|---|
| Main JS bundle | 294.6 kB (92.0 kB gzip) — under the 120 kB gzip budget |
| Build output, per-chunk (2026-10-16 — different basis from the critical-bundle figure above) | CSS 87.68 kB (gzip 16.25) · `index` 100.61 (30.11) · `react` 232.11 (74.27) · `motion` 81.71 (28.69) · `HypeIndex` 14.74 (5.20) · dist 35 files / 877.8 KiB |
| Code-split routes | `/about`, `/sources`, `/hype-index`, `/story/:id`, `/methodology`, `/sources/:name`, `/week-in-review`, 404 all lazy |
| Decorative canvas | `Asciify` + `DecryptReveal` lazy chunks, idle-mounted after first paint; `VHS`/`Glitch` viewport/lazy; masthead renders as plain text first |
| Framer-motion | `LazyMotion` + `domAnimation` only (~5 kB, tree-shaken); card hover-lift removed (polish pass) |
| Canvas effects | `prefers-reduced-motion` settle + `IntersectionObserver` pause + `cancelAnimationFrame` cleanup |
| Fonts | preconnect + `media="print"` swap (non-render-blocking) |
| Images | feed images `loading="lazy"`; OG/favicons local |
| Theme | inline sync script (no FOUC), localStorage persisted |

> Bundle note: the masthead WebGL effects are now lazy chunks loaded on idle;
> the main chunk no longer carries them (was 148.8 kB gzip, now 92.0 kB).

## Production smoke (local Worker, 2026-08-24; branch re-run 2026-10-16)

| Check | Result |
|---|---|
| All SPA routes (`/`, `/edition`, `/hype-index`, `/sources`, `/sources/:name`, `/story/:id`, `/saved`, `/week-in-review`, `/methodology`, `/about`, 404) | render, zero console errors |
| `/feed.xml`, `/feed.json`, `/api/feeds`, `/robots.txt`, `/sitemap.xml` | all 200 |
| Canonical / `og:url` / `og:image` | consistent, served from `src/lib/site.js` origin |
| Partial ingestion | "N of M sources did not respond" notice verified with mocked dead wires |

> **2026-10-16 re-run on `redesign-experiment`**, against the local Worker (`npm run dev`): all 11 routes render with one `h1` each, canonical + `og:url` + JSON-LD present, and **zero console errors**; all five endpoints return 200 with the right content types (`application/rss+xml`, `application/feed+json`, `application/json`, `text/plain`, `application/xml`); `og:image` resolves to the configured worker origin. This is a **local Worker run, not production** — the two smoke runs above the note (2026-08-24) are the production one. The security-header gap on `/` is recorded in the security checklist above and was confirmed against production.

## Known limitations (accepted)

- *(Resolved 2026-08-14)* CSP shipped via the Worker header (inline theme script extracted to `public/theme-init.js`).
- *(Resolved 2026-08-14)* Feed image URLs sanitized (`sanitizeImageUrl`) + `referrerpolicy="no-referrer"` on feed images.
- *(Resolved 2026-08-14)* Dead `src/components/ui/` directory removed in the Phase 8 regression pass.
- *(Resolved 2026-10-16)* `/sources` scrolled 174px sideways at ≤390px — Chromium propagated the 560px leaderboard's scrollable overflow past its `overflow-x: auto` wrapper. Fixed with `contain: paint` on `.board-scroll`; the table still scrolls inside its strip and desktop is unchanged.
- *(Resolved 2026-10-16)* Mojibake in the `/saved` empty-state copy — a mis-encoded em dash and middot, now real `—` and `·`. Pre-existing on `master`; repo-wide re-scan is clean.
- *(Triaged 2026-10-16)* `npm audit` whole tree: 41 findings (2 low, 12 moderate, 26 high, 1 critical), all in the dev/test toolchain (`vite`/`postcss`/`jsdom`/`shadcn`/`playwright` chains) — none ship to the Worker or client bundle. The 2 that npm classed as runtime under `--omit=dev` were `nanoid` (<3.3.18, CVSS 5.9) and `source-map-js` (<1.2.2, CVSS 7.5), pulled in via `@tailwindcss/vite` + `tailwindcss`; those two live in `dependencies` (build-time only) rather than `devDependencies`, which is why npm counts them as runtime. Both patched within their existing ranges (`nanoid` 3.3.17→3.3.20, `source-map-js` 1.2.1→1.2.2, lockfile only) and `--omit=dev` now reports 0. The remaining 41 need major bumps (`npm audit fix --force`) and were deliberately left alone — that is a toolchain-upgrade decision, not a redesign fix.