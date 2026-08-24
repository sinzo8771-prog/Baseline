# The Baseline — Lighthouse CI

**Repo:** https://github.com/sinzo8771-prog/Baseline
One item: automate what's currently only manually checked (bundle size, LCP) into a real, tracked budget.

---

## Add Lighthouse CI as a third CI job

- **Why:** several rounds of real performance work have landed (bundle splitting 477 KB → 350 KB, lead-image `fetchPriority`/`loading="eager"`, CSS shrinkage from dead-code removal) with nothing automated verifying any of it stays true. A future dependency bump or careless addition could regress LCP or bundle size silently — this is precisely the class of thing CI should catch, not a recheck months later.
- **Reuses existing infra:** `playwright.config.js`'s `webServer` (`npm run build && npm run preview -- --port 4173 --strictPort`, served at `http://localhost:4173`) is exactly what Lighthouse CI needs to run against too — this isn't new infrastructure, it's pointing a new tool at a server config that already exists for E2E.

### Setup

- **Install:** `npm install --save-dev @lhci/cli`
- **File:** new `lighthouserc.js` (or `.lighthouserc.json`) at repo root:
  ```js
  module.exports = {
    ci: {
      collect: {
        startServerCommand: "npm run build && npm run preview -- --port 4173 --strictPort",
        url: [
          "http://localhost:4173/",
          "http://localhost:4173/edition",
          "http://localhost:4173/hype-index",
        ],
        numberOfRuns: 3,
      },
      assert: {
        assertions: {
          "categories:performance": ["warn", { minScore: 0.85 }],
          "categories:accessibility": ["warn", { minScore: 0.95 }],
          "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
          "total-byte-weight": ["warn", { maxNumericValue: 600000 }],
        },
      },
      upload: {
        target: "temporary-public-storage",
      },
    },
  };
  ```
  Treat these thresholds as a starting point, not gospel — run it once locally first (`npx lhci autorun`) to see real current scores, then set the numbers to slightly below today's actual measurements so the budget is meaningful (catches real regressions) rather than arbitrary. Use `"warn"` not `"error"` for every assertion initially — matches the plan's approach for the E2E job (informational first, promote to blocking once proven stable).
  - `categories:accessibility` here is a useful *cross-check* against the existing `vitest-axe` suite, not a replacement — Lighthouse's accessibility audit runs against real rendered Chrome, catching a different (overlapping but not identical) set of issues than jsdom-based axe does.
  - Test 3 routes to start (`/`, `/edition`, `/hype-index`) — the landing page, the heaviest content page, and a chart-heavy page. Don't try to cover every route on day one; add more once this is stable.

- **CI job** — add as a third job in both `deploy.yml` and `preview-deploy.yml`, parallel to the existing `Browser E2E (informational)` job (not nested inside it — Lighthouse needs its own server lifecycle, don't share the Playwright job's server):
  ```yaml
  lighthouse:
    name: Lighthouse CI (informational)
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: "24"
      - name: Install dependencies
        run: npm ci
      - name: Run Lighthouse CI
        run: npx lhci autorun
  ```
  `continue-on-error: true` from the start, matching how the E2E job was introduced — same rationale: don't block deploys while budgets get tuned against real-world numbers.

### Verify

- Run `npx lhci autorun` locally first to confirm it actually completes and produces sane scores before wiring into CI — Lighthouse in a constrained CI runner sometimes reports lower/noisier scores than local, so don't be surprised if CI numbers run a bit lower; that's normal; that's part of why every assertion starts as `"warn"`.
- After merging, check a real Actions run to confirm the `lighthouse` job appears and produces a report link (the `temporary-public-storage` upload target gives a shareable report URL in the job log — useful for eyeballing what regressed if a warning fires later).

### Later (not part of this task, just noting the natural next step)

Once the budget numbers have been live for a few weeks and haven't produced false-positive warnings, consider promoting the `total-byte-weight` and `largest-contentful-paint` assertions specifically to `"error"` (blocking) — those two map most directly to the bundle-size and lead-image work already done, and are the ones most worth actually enforcing rather than just watching.

---

## Done when

`lighthouserc.js` exists with realistic (measured-then-set) thresholds, a third CI job runs it informationally in both workflows, and at least one real Actions run has produced a report confirming it works end-to-end.
