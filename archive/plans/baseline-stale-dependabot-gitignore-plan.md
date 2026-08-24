# The Baseline — Resolve stale Dependabot majors + gitignore the perf harness

**Repo:** https://github.com/sinzo8771-prog/Baseline
Two small, independent items.

---

## 1. Resolve the stale `vite-8.2.1` / `plugin-react-6.0.5` PRs

- **Why now, specifically:** these two major-version PRs were deliberately held back for manual verification several rounds ago. Since then, the full redesign and the canvas-perf fix both landed — including `React.lazy()` + dynamic `import()` for `VHS`/`Glitch` and manual chunk splitting in the Vite config. A Vite major version bump is exactly the kind of change most likely to alter chunking/dynamic-import behavior, so the risk these two PRs carry has gone up, not down, while they sat open. Testing a fresh diff against current `master` is not meaningfully more expensive than testing the existing stale one, so there's no reason to keep carrying the drift.
- **Do — pick one path per PR:**
  - **Close and let Dependabot regenerate:** close both PRs on GitHub; Dependabot will reopen fresh ones against current `master` on its next scheduled run (or trigger manually via the Dependabot dashboard's "check for updates" if you don't want to wait for the weekly schedule). This is the simpler path if there's no urgency to be on the latest Vite specifically.
  - **Verify the existing PRs directly** (if you'd rather not wait for regeneration): rebase/update each branch against current `master` first (GitHub's "Update branch" button, or manually merge `master` in), then:
    1. `npm run build` on the updated branch, diff the `dist/assets/` chunk list against a fresh `master` build — confirm `VHS-*.js`, `Glitch-*.js`, and the manual `react`/`motion`/`lucide-icons` chunks still split out the same way, not silently merged back into the main bundle.
    2. `npm run test:all` — all 185 tests (123 unit + 62 component) green.
    3. `npx playwright test` — the full E2E suite, especially the lazy-load-dependent behavior (footer VHS mounting on scroll, Glitch mounting on an "On Fire" lead card) since that's the exact mechanism most exposed to a bundler major-version change.
    4. `npx lhci autorun` — confirm the Lighthouse budgets from the earlier round still pass; a Vite major bump changing output structure could plausibly shift bundle size or LCP timing even without any application code changing.
- **Done when:** either both PRs are closed (with fresh ones expected on the next Dependabot run), or both have been rebased, fully re-tested per the four checks above, and merged.

---

## 2. Add `_perf/` to `.gitignore`

- **File:** `.gitignore`
- **Why:** `CANVAS-PERF-AUDIT.md` documents `_perf/` (the profiling harness: `profile.mjs`, `variant.mjs`, `analyze.mjs`, `lh-extract.mjs`) as "untracked; safe to delete — it is not part of the app." That's currently true only by omission — nothing in `.gitignore` actually prevents a future `git add -A` from checking it in. Make "untracked" a durable guarantee rather than an accident of nobody having run the wrong command yet.
- **Do:** add one line:
  ```
  _perf/
  ```
  anywhere sensible in `.gitignore` (near other build/tooling artifacts, if the file is organized that way).
- **Done when:** `_perf/` is listed in `.gitignore`, and `git status` with the directory present locally shows it as ignored, not untracked-but-visible.
