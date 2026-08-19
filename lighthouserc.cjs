// Lighthouse CI budget. All assertions are informational ("warn") for now,
// matching how the E2E job was introduced. Thresholds are derived from a local
// measurement run (2026-08-19, `lighthouse` against `vite preview`):
//   /            perf ~56  a11y 96  LCP ~3.1s  ~341 kB
//   /edition     perf ~64  a11y 96  LCP ~2.4s  ~352 kB
//   /hype-index  perf ~61  a11y 100 LCP ~2.6s  ~354 kB
// Budgets sit slightly below today's actuals so they catch real regressions
// without warning on every run. CI runners are slower/noisier than local, so
// expect lower numbers there; re-tune against a real Actions run.
//
// NOTE for local Windows runs: `npx lhci autorun` can die on a Windows-only
// chrome-launcher cleanup bug (EPERM deleting the temp Chrome profile). It
// does not affect CI (ubuntu-latest). Workaround if you hit it locally:
//   npx lhci autorun --collect.settings.chromeFlags="--user-data-dir=$env:TEMP\lhci-profile"
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
        "categories:performance": ["warn", { minScore: 0.5 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4500 }],
        "total-byte-weight": ["warn", { maxNumericValue: 500000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};