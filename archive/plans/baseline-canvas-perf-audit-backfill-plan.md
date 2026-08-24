# The Baseline — Backfill CANVAS-PERF-AUDIT.md

**Repo:** https://github.com/sinzo8771-prog/Baseline
One item. The `65037ca` perf fix (deferred VHS/Glitch canvas effects, chunked feed compose) shipped good, well-targeted, verified work — but skipped the investigation write-up the original task asked for, so there's no recorded baseline for what was measured before the change. This backfills that record after the fact; no further code changes.

---

## Write `CANVAS-PERF-AUDIT.md` documenting the already-completed work

- **File:** new `CANVAS-PERF-AUDIT.md` at repo root, matching the existing audit-doc convention (`SECURITY-AUDIT.md`, `V2-FINAL-AUDIT.md`, etc.)
- **Do:** document what was actually measured and changed in `65037ca`, using the numbers already reported in that commit message as the source of truth:
  - **Before/after Lighthouse (mobile, production build):**
    - `/`: Perf 57 → 66, LCP 4.4s → 2.5s
    - `/edition`: Perf 64 → 79, CLS 0.30 → 0.018
  - **What was identified as the cost driver:** the masthead's concurrent canvas effects (specifically the footer VHS and lead Glitch effects) running/initializing on first load, plus a feed-compose loop that didn't yield to the main thread during scoring/dedup on large batches.
  - **What was changed, and why each change targets a specific metric:**
    - VHS (footer) deferred via `React.lazy()` + `IntersectionObserver` gate — doesn't mount/run until scrolled near viewport, cutting initial main-thread cost and improving LCP.
    - Glitch (lead effect) split into its own chunk, out of the initial bundle.
    - `useBaselineData.js`'s compose step now yields via `yieldToMainThread()` every 25 items during scoring/dedup — addresses TBT/long-task blocking during a large feed batch.
    - Hero `<h1>` moved out of the opacity fade so it paints at first frame (direct LCP-element fix).
    - `/edition` toolbar held steady across the loading state so only the cards region swaps — targets the CLS improvement (0.30 → 0.018).
  - **What was deliberately *not* changed:** confirm no canvas effect was removed or visually altered — this was a load-timing/deferral fix, not a reduction in what the site does. Worth stating explicitly, since that was the constraint the original investigation task was protecting.
- **Also note in the doc:** this fix was implemented directly rather than via the original profile-first, write-findings-first sequence the task asked for — a short, honest line acknowledging that is fine and keeps the audit-doc history accurate, not something to omit or paper over.
- **Done when:** `CANVAS-PERF-AUDIT.md` exists with the numbers above, a plain-language explanation of what changed and why, and an honest note on how the work was actually sequenced.
