# QA Checklist — The Baseline

Last verified: 2026-08-24 · Tests: 123 unit + 62 component + Playwright E2E (incl. visual regression) passing, production build clean.

This is the pre-release gate for the site. It captures everything that must hold before calling a build "shipped", plus the evidence from the most recent full pass.

---

## Test gate (must pass before any deploy)

| Check | Command | Expected | Status |
|---|---|---|---|
| Unit suite | `npm test` | 123 passing | ✅ PASS |
| Component suite | `npm run test:components` | 62 passing (incl. axe a11y on 9 surfaces) | ✅ PASS |
| Full gate | `npm run test:all` | both suites green | ✅ PASS |
| E2E + visual regression | `npm run test:e2e` | all specs green, snapshots stable across runs | ✅ PASS |
| Production build | `npm run build` | no errors, assets emitted | ✅ PASS |
| CI parity | `npm ci && npm test` on Node 24 | same as local | ✅ PASS (verified via deploy run) |

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

## Security checklist (see SECURITY-AUDIT.md for detail)

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

## Accessibility checklist

| Check | Standard | Status |
|---|---|---|
| Keyboard: Tab order, visible `focus-visible` outlines | WCAG 2.4.7 | ✅ PASS |
| Keyboard: modal focus trap + Escape + focus restore | WCAG 2.1.1/2.1.2 | ✅ PASS |
| Reduced motion respected (CSS + rAF settle + framer-motion) | WCAG 2.3.3 | ✅ PASS |
| Landmarks: `nav aria-label`, `main`, `section` regions | WCAG 1.3.1 | ✅ PASS |
| Forms: sr-only labels (`htmlFor`/`id`) for search | WCAG 1.3.1 | ✅ PASS |
| Dynamic content: `aria-live` toast region | WCAG 4.1.3 | ✅ PASS |
| Charts: `role="img"`/`role="meter"` with text equivalents | WCAG 1.1.1 | ✅ PASS |
| Icon-only buttons: `aria-label`/`aria-pressed` | WCAG 1.1.1 | ✅ PASS |
| Contrast: body 15.15:1, muted 6.46:1, primary 4.91:1 (light); all ≥4.5:1 | WCAG 1.4.3 AA | ✅ PASS |
| Contrast: helper labels raised off `/60–/80` opacity (was 3.29–4.06:1) | WCAG 1.4.3 AA | ✅ PASS (fixed `f0859a8`) |
| Decorative elements `aria-hidden` (icons, trend glyphs) | WCAG 1.3.1 | ✅ PASS |
| `MotionConfig reducedMotion="user"` in App root | WCAG 2.3.3 | ✅ PASS |

## Performance checklist

| Check | Result |
|---|---|
| Main JS bundle | 294.6 kB (92.0 kB gzip) — under the 120 kB gzip budget |
| Code-split routes | `/about`, `/sources`, `/hype-index`, `/story/:id`, `/methodology`, `/sources/:name`, `/week-in-review`, 404 all lazy |
| Decorative canvas | `Asciify` + `DecryptReveal` lazy chunks, idle-mounted after first paint; `VHS`/`Glitch` viewport/lazy; masthead renders as plain text first |
| Framer-motion | `LazyMotion` + `domAnimation` only (~5 kB, tree-shaken); card hover-lift removed (polish pass) |
| Canvas effects | `prefers-reduced-motion` settle + `IntersectionObserver` pause + `cancelAnimationFrame` cleanup |
| Fonts | preconnect + `media="print"` swap (non-render-blocking) |
| Images | feed images `loading="lazy"`; OG/favicons local |
| Theme | inline sync script (no FOUC), localStorage persisted |

> Bundle note: the masthead WebGL effects are now lazy chunks loaded on idle;
> the main chunk no longer carries them (was 148.8 kB gzip, now 92.0 kB).

## Production smoke (local Worker, 2026-08-24)

| Check | Result |
|---|---|
| All SPA routes (`/`, `/edition`, `/hype-index`, `/sources`, `/sources/:name`, `/saved`, `/week-in-review`, `/methodology`, `/about`, 404) | render, zero console errors |
| `/feed.xml`, `/feed.json`, `/api/feeds`, `/robots.txt`, `/sitemap.xml` | all 200 |
| Canonical / `og:url` / `og:image` | consistent, served from `src/lib/site.js` origin |
| Partial ingestion | "N of M sources did not respond" notice verified with mocked dead wires |

## Known limitations (accepted)

- *(Resolved 2026-08-14)* CSP shipped via the Worker header (inline theme script extracted to `public/theme-init.js`).
- *(Resolved 2026-08-14)* Feed image URLs sanitized (`sanitizeImageUrl`) + `referrerpolicy="no-referrer"` on feed images.
- *(Resolved 2026-08-14)* Dead `src/components/ui/` directory removed in the Phase 8 regression pass.
- `npm audit` reports 4 vulnerabilities (2 moderate, 2 high) in build tooling, untriaged — no runtime exposure.