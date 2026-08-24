# The Baseline — Improvement Plan

**Repo:** https://github.com/sinzo8771-prog/Baseline
**Live:** https://the-baseline.baseline-news.workers.dev
**Constraint (do not violate):** no backend, no KV, no server-side state. Cloudflare Worker stays pure I/O (static assets + feed relay). All new state lives in the browser (`localStorage`), matching the existing pattern in `src/app/lib/hypeHistory.js`.

Work top to bottom. Each task lists exact files, what to build, and how to know it's done. Run `npm run test:all` after every task — do not move to the next task with a red suite.

---

## Tier 0 — Fix before adding anything

### 0.1 Trim the main bundle
- **Problem:** `dist/assets/index-*.js` is ~477 KB (152 KB gzip), all in one chunk.
- **Files:** `vite.config.js`
- **Do:** Add manual chunk splitting for `react-router-dom` and `lucide-react` via `build.rollupOptions.output.manualChunks`. Re-run `npm run build` and confirm the main chunk shrinks and a separate vendor chunk appears.
- **Done when:** `npm run build` output shows the main chunk reduced; no visual regression.

### 0.2 Add a CSP header
- **Files:** `src/index.js` (Worker response headers), `index.html` (inline theme-init script)
- **Do:** Extract the inline theme-init script from `index.html` into a static file (or hash it), then add a `content-security-policy` header to responses served by the Worker: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; base-uri 'self'; form-action 'none'`. Adjust if Google Fonts isn't actually used — check `index.html` first.
- **Done when:** deployed Worker response includes the CSP header and the site still renders/functions with no console CSP violations.

### 0.3 Sanitize feed image URLs
- **Files:** `src/lib/feeds.js` (or wherever `story.image` is parsed), `src/app/components/StoryModal.jsx`
- **Do:** Reject any `story.image` that isn't `http(s)://` at parse time (mirror the existing `safeHref` pattern). Add `referrerpolicy="no-referrer"` to the `<img>` in the modal.
- **Done when:** a test in `test/feeds.test.js` covers a malicious/`data:` image URL being dropped.

### 0.4 Delete dead code
- **Files:** `src/components/ui/news-cards.jsx`
- **Do:** Confirm no imports reference it (`grep -rn "news-cards" src/`), then delete it.
- **Done when:** file is gone, build still passes.

---

## Tier 1 — Quick UI/UX wins

### 1.1 Sparkline in the Sources trend column
- **Files:** `src/app/components/TrendCell.jsx`, `src/app/pages/Sources.jsx`, `src/app/lib/hypeHistory.js`
- **Current state:** `TrendCell` only renders a single up/down/flat glyph comparing today vs. yesterday (`sourceTrendReading()`). The "Trend" column on `/sources` shows this or a bare `·`.
- **Do:** Add a function to `hypeHistory.js` that returns the last 7 daily readings for a source (it already stores 30 days). Render a small inline SVG sparkline (7 points, ~40×16px) next to the existing glyph in `TrendCell`. Keep the existing glyph/aria-label behavior for screen readers — the sparkline is decorative (`aria-hidden="true"`), same pattern already used for the direction glyph.
- **Done when:** `/sources` shows a 7-day line per source instead of a dead dot; component test added under `test/components/`.

### 1.2 Print stylesheet
- **Files:** `src/app/styles.css` (or a new `src/app/print.css` imported in `main.jsx`)
- **Do:** Add `@media print` rules: hide nav, search, filter chips, theme toggle, canvas/VHS effects, and buttons. Force light background + black text. Keep masthead, date/edition line, headlines, and summaries. This should make Cmd+P on `/edition` look like an actual printed edition, on-brand with the existing "print" identity.
- **Done when:** print preview of `/edition` in a real browser shows a clean, readable page.

### 1.3 Prev/next navigation on story pages
- **Files:** `src/app/pages/StoryPage.jsx`
- **Do:** Below "Read original" / "Back to the edition," add two links: "← Previous in edition" / "Next in edition →" (based on the current day's ranked story order — same data `StoryFeed` uses), and/or "More from `<source>` →" linking to `/sources/:name`. Needs the story's position in the day's ranked list; pass it via route state or recompute from the same pipeline hook (`useBaselineData`).
- **Done when:** navigating a story shows working prev/next links that don't 404 at the list boundaries (first/last story hides the missing direction).

### 1.4 Keyboard shortcuts
- **Files:** new `src/app/hooks/useKeyboardShortcuts.js`, wired into `App.jsx` or `StoryFeed.jsx`
- **Do:** `j` / `k` move focus between story cards in the current view; `/` focuses the search input; `Escape` already closes the modal (confirm, don't duplicate). Don't hijack these keys when focus is inside a text input.
- **Done when:** shortcuts work on `/edition`, documented in a `?` help tooltip or the About page, no conflicts with existing modal focus trap.

---

## Tier 2 — Medium effort

### 2.1 Fix uneven story card grid
- **Files:** `src/app/components/CardsView.jsx`, `src/app/components/StoryFeed.jsx`
- **Problem:** cards with a feed image and cards without one render at different visual weights, making the grid look patchy rather than intentional (see `screenshots/home.jpg`).
- **Do:** Either (a) normalize card height regardless of image presence — reserve consistent image slot space and use a text-only placeholder treatment (subtle texture/pattern, not blank), or (b) design a deliberate text-only card variant so the absence of an image reads as a choice, not a missing asset.
- **Done when:** a mixed-image edition (real data, not the empty/zero-story dev fixture) renders a visually consistent grid.

### 2.2 "New since your last visit" indicator
- **Files:** `src/app/lib/hypeHistory.js` (or a new sibling module, e.g. `src/app/lib/lastVisit.js`), `src/app/components/StoryFeed.jsx`, `src/app/components/CardsView.jsx`
- **Do:** On each visit, read a `localStorage` timestamp of the last session (write it on unmount/visibility-hidden, same lightweight pattern as hype history). Badge stories published after that timestamp (e.g. a small "NEW" chip or left-border accent). Update the stored timestamp after rendering the current batch.
- **Done when:** returning to `/edition` after new stories have been fetched visibly distinguishes them; a fresh browser (no stored timestamp) shows no badges (don't badge everything on first visit).

### 2.3 Save-for-later / reading list
- **Files:** new `src/app/lib/savedStories.js`, new `src/app/pages/Saved.jsx`, route addition in `App.jsx`, bookmark icon added to `StoryFeed.jsx` / `CardsView.jsx` / `StoryModal.jsx` / `StoryPage.jsx`
- **Do:** `localStorage`-backed set of saved story IDs (mirror `hypeHistory.js`'s read/write pattern). Bookmark toggle icon on every story surface. New `/saved` route listing saved stories with the same card component used elsewhere. Handle the case where a saved story's source feed no longer contains it (show cached headline/summary/link, don't break).
- **Done when:** a story can be saved from any surface, persists across reloads, and `/saved` renders it; component test added.

---

## Tier 3 — Bigger features (scope fully before starting)

### 3.1 Weekly recap page
- **Files:** new `src/app/pages/WeekInReview.jsx`, route in `App.jsx`, reads from `src/app/lib/hypeHistory.js`
- **Do:** A `/week-in-review` page computed entirely from the existing 30-day localStorage history: biggest single-day Hype Index swing, loudest source of the week (highest avg intensity), calmest day, week-over-week trend line. Pure read of existing data — no new fetching or storage needed.
- **Constraint:** if the reader has less than 7 days of history, show a clear partial/empty state (same honesty pattern as the existing "Come back tomorrow" copy on Hype Index) — never fabricate a week.
- **Done when:** page renders correctly with 0, partial, and full 7-day history; linked from nav or footer.

### 3.2 Command palette (Cmd+K)
- **Files:** new `src/app/components/CommandPalette.jsx`, wired into `App.jsx`
- **Do:** Cmd/Ctrl+K opens a modal (reuse existing modal/focus-trap pattern from `StoryModal.jsx`) with fuzzy-searchable actions: jump to a page (`/edition`, `/hype-index`, `/sources`, `/about`), jump to a specific source profile, toggle Edition/Cards view, toggle theme.
- **Done when:** opens/closes correctly, keyboard-navigable, respects the existing focus-trap and reduced-motion conventions, doesn't conflict with the Tier 1.4 shortcuts (`/` for search vs. Cmd+K for palette — keep them distinct).

---

## Order of execution

1. Tier 0 (0.1 → 0.4) — ship as one PR, these are hardening, not features.
2. Tier 1 (1.1 → 1.4) — each is independently shippable, do in any order.
3. Tier 2 (2.1 → 2.3) — 2.2 and 2.3 share the localStorage-timestamp pattern, consider building together.
4. Tier 3 — only after 0–2 are done and deployed; these are the most speculative and should be scoped with fresh eyes before implementation.

## Non-negotiables for every task

- Add or update tests under `test/` (unit) or `test/components/` (component) for any new logic — this repo has 100% green CI and it should stay that way.
- Match existing code conventions: `localStorage` patterns from `hypeHistory.js`, `safeHref`-style sanitization, `aria-label` + `aria-hidden` pairing for decorative-but-meaningful UI, reduced-motion guards on anything animated.
- No new dependencies without checking bundle impact (Tier 0.1 is about *shrinking* the bundle — don't undo it).
- Update `README.md` Features/Pages tables and `FUTURE-ROADMAP.md` when a roadmap item is completed or newly parked.
