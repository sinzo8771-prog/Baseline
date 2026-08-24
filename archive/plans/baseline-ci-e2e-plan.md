# The Baseline — CI test gap + Playwright E2E

**Repo:** https://github.com/sinzo8771-prog/Baseline
Two items. Do #1 first — it's a real, currently-live gap, not a nice-to-have.

---

## 1. Fix CI: component tests (including the axe suite) never run

- **Files:** `.github/workflows/deploy.yml`, `.github/workflows/preview-deploy.yml`
- **Problem:** both workflows run `npm test`, which `package.json` defines as `node --test` — unit tests only. `npm run test:all` (`node --test && vitest run`) is what actually includes the 44 Vitest component tests: the entire axe a11y suite, `command-palette.test.jsx`, `story-feed.test.jsx`, `trend-cell.test.jsx`, `saved-page.test.jsx`, `use-keyboard-shortcuts.test.jsx`. None of that currently gates a merge or a deploy — it only runs when someone remembers to type `npm run test:all` locally. The CommandPalette nested-interactive fix and the axe sweep itself, both from recent work, are not actually protected against regression right now.
- **Do:** change the test step in both workflow files from `npm test` to `npm run test:all`.
  ```yaml
  - name: Run tests
    run: npm run test:all
  ```
- **Verify:** trigger both workflows (a PR for `preview-deploy.yml`, a push to `master` — or a dry run/manual trigger if available — for `deploy.yml`) and confirm the Actions log shows both the `node --test` output (unit tests) and the Vitest output (component tests, 7 files) in the same run, not just the unit-test summary.
- **Done when:** both workflow files call `npm run test:all`, and a real CI run's log shows all ~162 tests (118 unit + 44 component) executing, not ~118.

---

## 2. Add Playwright for real-browser E2E coverage

- **Rationale:** jsdom-based component tests have documented limits already (color-contrast disabled in `test/components/a11y.test.jsx` specifically because jsdom doesn't compute real Tailwind styles). Nothing currently exercises the app in an actual browser: real routing, the print stylesheet, the command palette's real keyboard behavior, whether the focus trap actually traps focus, or a visual check against what's already screenshotted in `screenshots/*.jpg`. `QA-CHECKLIST.md` existing at all implies this is presently a manual, by-hand process each release.
- **Install:** `npm install --save-dev @playwright/test`, then `npx playwright install --with-deps chromium` (start with one browser; add firefox/webkit later only if there's a specific reason to, e.g. a Safari-specific bug report — don't default to all three for a project this size).
- **Files:**
  - New `playwright.config.js` at repo root — point `webServer` at `npm run preview` (serves the built `dist/` via `vite preview`, closer to production than `dev:react`) or `npm run dev` if the Worker's routes (`/feed.xml`, `/api/feed`, security headers) need to be part of what's tested — check which is more useful before deciding; `wrangler dev` is slower to boot but exercises the real Worker code, `vite preview` is faster but skips the Worker layer entirely.
  - New `e2e/` directory (parallel to `test/`, not inside it — keep unit/component tests and browser tests visually separate in the tree).
- **What to cover, in priority order** — small, high-value smoke tests, not exhaustive coverage:
  1. **Navigation smoke test** — visit every route (`/`, `/edition`, `/hype-index`, `/sources`, `/saved`, `/week-in-review`, `/about`, a `/story/:id`), assert each renders its expected heading/landmark, no console errors.
  2. **Command palette** — open with `Control+k` (or `Meta+k`), type a query, arrow-select a result, Enter navigates; Escape closes without navigating.
  3. **Keyboard shortcuts** — `j`/`k` move selection on `/edition`, `/` focuses search, confirm none of these fire while a text input has focus (regression-guard for the "don't hijack keys in inputs" requirement from the original shortcuts work).
  4. **Focus trap** — open the story modal, `Tab` through it, confirm focus never lands on something behind the modal; `Escape` returns focus to the triggering card.
  5. **Print stylesheet** — Playwright supports `page.emulateMedia({ media: 'print' })`; assert nav/search/canvas-effects are hidden and the masthead/headlines remain, rather than a full visual snapshot (cheaper, less flaky than pixel-diffing).
  6. **Visual regression (optional, add last)** — Playwright's built-in `toHaveScreenshot()` against 2-3 key pages (home, edition, a story). Start with a generous diff threshold; screenshot tests are the flakiest kind (font rendering, animation timing) and are worth having but not worth blocking the rest of this work on getting pixel-perfect on day one.
- **CI:** add a separate job (not folded into the existing unit/component step) — Playwright needs browser binaries and takes longer, so keep it isolated:
  ```yaml
  - name: Install Playwright browsers
    run: npx playwright install --with-deps chromium
  - name: Run E2E tests
    run: npx playwright test
  ```
  Decide whether this blocks merges/deploys or runs informationally at first while the suite stabilizes — recommend informational (non-blocking) for the first couple weeks, then promote to blocking once it's proven not to be flaky.
- **Done when:** `e2e/` exists with the 5 core tests (item 6 optional/separate), `npx playwright test` passes locally, and a CI job runs them (blocking or informational per the decision above).

---

## Order

1 is urgent — it's a currently-live coverage gap on already-written tests, not new work. 2 is a genuine improvement but not time-sensitive; fine to schedule separately.
