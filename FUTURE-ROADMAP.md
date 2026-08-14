# Future Roadmap — The Baseline

This is where ideas go to be *remembered*, not implemented. Per the master plan's
stop condition (§56), P0/P1 are complete and **no new features should be added**
without a fresh round of scoping. Everything below was surfaced by the 2026-08-13
audits (security, accessibility, performance) or by earlier review; none of it is
required for the current shipped build.

Status legend: `open` — not started · `scoped` — shape/effort understood · `n/a` — decided not to do

---

## Hardening (security, from SECURITY-AUDIT.md)

### Add a Content-Security-Policy (CSP) — `done`
- **Why:** defense-in-depth. The site currently ships no CSP; a future injection
  bug would be unmitigated.
- **Complication:** the theme init script in `index.html` is inline, and Google
  Fonts needs `style-src`/`font-src`. A workable baseline:
  `default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; base-uri 'self'; form-action 'none'`
- **Effort:** small. Must hash the inline theme script (or extract it to a file),
  then verify via the deployed Worker response header.
- **Shipped 2026-08-14:** inline theme script extracted to `public/theme-init.js`;
  CSP served on `text/html` responses only (see `src/index.js`).

### Sanitize feed image URLs — `done`
- **Why:** `story.image` is used verbatim as `<img src>` (only in the modal). It
  cannot execute JS, but a misbehaving/malicious feed could point at an external
  tracker or a `data:` blob.
- **Shape:** reject non-`https?://` image URLs at parse time (mirror `safeHref`),
  and add `referrerpolicy="no-referrer"` to feed images.
- **Effort:** small; changes `src/lib/feeds.js` (or the modal), plus tests.
- **Shipped 2026-08-14:** `sanitizeImageUrl` in `feeds.js`, applied at parse;
  `referrerpolicy="no-referrer"` on the modal image; 3 new parse tests.

### Remove dead `src/components/ui/news-cards.jsx` — `done`
- **Why:** superseded by `CardsView`; no imports reference it. It still carries
  its own `safeHref`/aria pattern code that future readers may copy.
- **Effort:** trivial (delete file). Low priority; harmless as-is.
- **Shipped 2026-08-14:** file deleted; build passes with no references.
- **Superseded 2026-08-14 (Phase 8):** the *entire* `src/components/ui/`
  directory was removed — the shadcn primitives (`button`/`badge`/`card`/
  `progress`/`separator`) were never imported. Emitted CSS shrank 61.5→49.2 KB.

---

## Performance

### Trim or split the 462 kB main chunk (149 kB gzip) — `done`
- **Why:** the main bundle is dominated by the app + the three always-visible
  WebGL masthead/footer effects (Asciify, DecryptReveal, VHS). They cannot be
  route-split because they render on every page (and lazy-loading them would
  hurt LCP — the masthead is above the fold).
- **Candidates:**
  1. Trim unused shader paths / reduce glyph counts in the canvas components.
  2. Vendor-split `react-router-dom` + `lucide-react` if they exceed the
     automatic chunking threshold.
  3. Re-check after any future dependency bump — Vite 5+ already code-splits
     dynamically; only the eager deps are fat.
- **Shipped 2026-08-14:** `manualChunks` in `vite.config.js` splits `react`
  (react + react-dom + react-router-dom), `lucide-icons`, and `motion`
  (framer-motion); main chunk dropped 477→338 KB (152→105 KB gzip).

### Preload the LCP-critical masthead canvas — `n/a`
- Decided against: the effects already pause off-screen and settle under reduced
  motion; preloading adds complexity for marginal gain.

---

## Accessibility backlog (everything AA-required already ships)

### Automated axe sweep in CI — `open`
- **Why:** the 2026-08-13 pass was manual (browser automation unavailable in the
  audit environment). An automated sweep (axe-core via Playwright/agent-browser)
  would make the AA baseline re-verifiable on every deploy.
- **Effort:** moderate; adds a dev-dependency + a `test:axe` script.

### Screen-reader pass (NVDA/VoiceOver) — `open`
- Manual pass with a real screen reader on the modal, charts, and trend cells.
  No known issues, but nothing replaces a human SR session.

---

## Product / content backlog (intentionally NOT built)

### Per-source "why it's loud" breakdown — `open`
- Today the Sources page shows counts/averages; a per-source signal breakdown
  (mirroring the Hype Index "WHY TODAY?" panel) would explain *why* an outlet is
  hot. Requires storing per-source signal counts in `sourceStats`.

### Historical archive of editions — `open`
- localStorage keeps only a 30-day Hype Index baseline; full-edition archives
  would need a backend (against the "no backend" constraint) or opt-in export.

### OPML / follow-anywhere export — `scoped`
- An `exportOPML.js` chunk already exists in the build output (currently unused).
  A small "follow these sources" button on the Sources page could expose it.

### Editorial notes / "The Baseline at a glance" section — `n/a`
- Considered and rejected: the masthead tagline + toast already carry the
  editorial voice; a dedicated section would dilute it.

---

## Improvement plan (2026-08-14) — baseline-improvement-plan.md

### Tier 1 — quick UI/UX wins (all shipped)
- **Sparkline in Sources trend column** — `done`: `sourceSeries()` in
  `hypeHistory.js` returns the last 7 daily readings; `TrendCell` renders a
  decorative 40×16 SVG line beside the existing direction glyph.
- **Print stylesheet** — `done`: `@media print` rules hide nav/search/chips/
  toggles/buttons/canvas, force paper + ink, keep masthead and headlines, and
  print external URLs after links.
- **Prev/next on story pages** — `done`: `StoryPage` computes its position in
  the ranked "Edited" order and shows Previous/Next at the list boundaries;
  back link repointed to `/edition`.
- **Keyboard shortcuts** — `done`: shared `useKeyboardShortcuts` hook
  (typing + dialog guards); `j`/`k` move story selection, Enter opens, Escape
  closes, `/` focuses search, `?` toggles help.

### Tier 2 — medium effort (all shipped)
- **Consistent story card grid** — `done`: every card reserves a fixed-height
  image slot; missing images render a deliberate halftone "NO PHOTO" placeholder
  (and swap in on image-load error) instead of a void that skews row heights.
- **"New since your last visit" badge** — `done`: `lastVisit.js` persists the
  previous session timestamp on visibility-hidden/unmount; stories published
  after it carry a NEW chip in both views; a first visit badges nothing.
- **Save-for-later / reading list** — `done`: `savedStories.js` keeps full
  snapshots in localStorage, `/saved` renders them (still working after a story
  ages out), and a `BookmarkButton` sits on every story surface.

### Tier 3 — low effort (all shipped)
- **Weekly recap page** — `done`: `/week-in-review` computed purely from the
  browser's stored hype history (`weekSummary` in `hypeHistory.js`): average,
  loudest/calmest day, biggest day-over-day swing, week-over-week trend; honest
  partial (fewer than 7 recorded days) and empty states, never fabricated.
- **Command palette (Cmd+K)** — `done`: global `Cmd/Ctrl+K` opens a fuzzy
  search (`fuzzyMatch.js`) over every story and every page; arrow keys
  navigate, Enter jumps, Escape closes; reuses the StoryModal focus-trap
  pattern; distinct from Tier 1.4's `/` search shortcut.

---

## Changelog of decisions

| Date | Decision | Status |
|---|---|---|
| 2026-08-13 | Add CSP, sanitize image URLs, remove dead cards file | done |
| 2026-08-13 | Bundle trim candidates recorded; lazy-loading effects rejected (LCP) | done / n/a |
| 2026-08-13 | Automated a11y sweep + SR pass | open |
| 2026-08-13 | Product ideas parked (per-source breakdown, archives, OPML, notes) | open / n/a |
| 2026-08-14 | Improvement plan Tier 1 shipped (sparklines, print CSS, prev/next, shortcuts) | done |
| 2026-08-14 | Improvement plan Tier 2 shipped (card slots, last-visit badges, save-for-later) | done |
| 2026-08-14 | Improvement plan Tier 3 shipped (week-in-review page, Cmd+K palette) | done |
| 2026-08-14 | Improvement plan fully executed (Tiers 0-3); remaining ideas scoped for later | done |
| 2026-08-14 | Polish pass Phases 2-3 (hierarchy, hype identity): nav grouping, score-with-headline, WHY TODAY answers, ruled trend, honest phrase | done |
| 2026-08-14 | Polish pass Phase 4 (personality): instrument/wire-room/story-file/ledger framings | done |
| 2026-08-14 | Polish pass Phase 5 (data trust): small-edition flag, measurement-basis docs | done |
| 2026-08-14 | Polish pass Phase 6 (a11y): single h1/page, sequential headings, reduced-motion skeletons | done |
| 2026-08-14 | Polish pass Phase 7 (SEO): route-accurate OG tags, 404 metadata, fresh sitemap | done |
| 2026-08-14 | Polish pass Phase 8 (regression): removed dead `ui/` primitives, full suite green | done |