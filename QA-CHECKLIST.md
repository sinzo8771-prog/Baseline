# QA Checklist — The Baseline

Last verified: 2026-08-13 · Build: `f0859a8` (deployed live) · Tests: 68 unit + 8 component passing, production build clean.

This is the pre-release gate for the site. It captures everything that must hold before calling a build "shipped", plus the evidence from the most recent full pass.

---

## Test gate (must pass before any deploy)

| Check | Command | Expected | Status |
|---|---|---|---|
| Unit suite | `npm test` | 68 passing | ✅ PASS |
| Component suite | `npm run test:components` | 8 passing | ✅ PASS |
| Full gate | `npm run test:all` | both suites green | ✅ PASS |
| Production build | `npm run build` | no errors, assets emitted | ✅ PASS |
| CI parity | `npm ci && npm test` on Node 20 | same as local | ✅ PASS (verified via deploy run) |

> CI (`deploy.yml`) runs only `npm test` on Node 20. The vitest suite is run manually
> (or `test:all`). Node 20 `node --test` accepts no globs — keep test scripts glob-free.

---

## Functional checks (manual, last pass 2026-08-13)

| Area | Check | Status |
|---|---|---|
| Home | Edition streams in (partial → settled), toast announces count | ✅ PASS |
| Home | View toggle (Edition/Cards), Sort toggle, filter chips, search | ✅ PASS |
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
| Main JS bundle | 462.8 kB (148.8 kB gzip) |
| Code-split routes | `/about`, `/sources`, `/hype-index`, `/story/:id`, `/methodology`, `/sources/:name`, 404 all lazy |
| Framer-motion | `LazyMotion` + `domAnimation` only (~5 kB, tree-shaken) |
| Canvas effects | `prefers-reduced-motion` settle + `IntersectionObserver` pause + `cancelAnimationFrame` cleanup |
| Fonts | preconnect + `media="print"` swap (non-render-blocking) |
| Images | feed images `loading="lazy"`; OG/favicons local |
| Theme | inline sync script (no FOUC), localStorage persisted |

> Bundle note: the main chunk is dominated by the app + the always-visible masthead/footer
> WebGL effects, which cannot be lazy-loaded without hurting LCP. Acceptable; see FUTURE-ROADMAP.md.

## Production smoke (live, 2026-08-13)

| Check | Result |
|---|---|
| `https://the-baseline.baseline-news.workers.dev/` | 200, correct asset hash (`index-BAwtj85w.js`) |
| SPA routes (`/about`, `/hype-index`, `/sources`, `/methodology`, `/story/:id`, 404) | all 200 (shell) |
| `/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, `/sw.js`, `/og-image.png` | all 200 |
| `/api/feeds`, `/api/feed?name=…` (known), unknown feed, `/api/news` | 200 / 200 / 404 / 410 |
| Deploy parity | live asset hash matches local `dist/` exactly |

## Known limitations (accepted)

- No `Content-Security-Policy` header (inline theme script + Google Fonts make it fiddly). Low risk — no XSS vector found. Roadmap item.
- Feed image URLs are used verbatim as `<img src>` (no scheme check). Not XSS-capable; possible tracking concern. Roadmap item.
- `src/components/ui/news-cards.jsx` is dead code (superseded by CardsView). Harmless; roadmap cleanup.
- `npm audit` reports 4 vulnerabilities (2 moderate, 2 high) in build tooling, untriaged — no runtime exposure.