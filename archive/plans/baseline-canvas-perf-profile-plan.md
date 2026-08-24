# The Baseline — Profile masthead canvas effects (investigation only, no fix yet)

**Repo:** https://github.com/sinzo8771-prog/Baseline
This is a data-gathering task, not a fix. `App.jsx` mounts `Asciify`, `DecryptReveal`, and `VHS` together in the persistent masthead — three independent `requestAnimationFrame` loops running concurrently, unthrottled, on every route (confirmed: no frame-rate throttling exists in any of the five `src/components/canvasui/*.jsx` effects — every `raf = requestAnimationFrame(frame)` loop runs at full display refresh rate). This is the likely driver behind the 56–64/100 Lighthouse performance scores measured in the last round, but "likely" isn't good enough to act on — profile first, then decide what (if anything) to change.

**Do not modify any effect's rendering logic as part of this task.** The goal is a written findings doc, same pattern as `SCREEN-READER-AUDIT.md`/`SECURITY-AUDIT.md` already in the repo — data first, decisions later, in a separate follow-up task once there's something real to act on.

---

## 1. Record a real profile

- **Tool:** Chrome DevTools → Performance panel, against the deployed site or a local `npm run build && npm run preview`.
- **Do:**
  1. Open the site fresh (hard reload, empty cache) on `/` — the masthead is visible immediately here, all three effects active.
  2. Start a Performance recording, let it run ~5 seconds of idle (no scrolling, no interaction) so the recording captures steady-state animation cost, not page-load noise.
  3. Stop recording. Look at the **Main** thread flame chart's "Summary" tab for total Scripting/Rendering/Painting time, and specifically the **Bottom-Up** or **Call Tree** view filtered to `canvasui/` — this tells you which file's code is actually consuming main-thread time, not just which files exist.
  4. Repeat the same recording on `/edition` (heaviest content page) to see if the cost is masthead-only or compounds with page content.

## 2. Isolate per-effect cost

- **Do:** temporarily comment out two of the three effects in `App.jsx` (locally, not committed) and re-run the same profile with only one active at a time. Three profiles total: Asciify-only, DecryptReveal-only, VHS-only. This answers "is the cost evenly split three ways, or does one effect dominate" — the plan's assumption (Asciify, at 1266 lines, is the largest file and the likely heaviest) needs to actually be confirmed against real data, not assumed from line count alone. Line count is a weak proxy for runtime cost; a short but per-pixel-expensive loop could easily outweigh a longer but cheap one.
- **Revert the temporary comment-outs before finishing** — this task produces a findings doc, not a code change.

## 3. Cross-check against Lighthouse's own diagnostics

- **Do:** run `npx lhci autorun` locally (or `npx lighthouse http://localhost:4173/ --view` for a one-off with the full report UI) and look specifically at the **"Minimize main-thread work"** and **"Reduce JavaScript execution time"** diagnostics — Lighthouse already attributes cost by script/task category, which either confirms or complicates the DevTools findings from steps 1-2.
- **Also check:** Total Blocking Time (TBT) specifically, since three concurrent long-running rAF loops are a classic TBT cause (frequent long tasks blocking input responsiveness), more so than an LCP problem — worth confirming whether TBT or LCP is actually the dominant score-dragger, since the fix strategy differs (TBT → reduce per-frame work or stagger effects; LCP → prioritize what paints first, likely already addressed by the earlier lead-image work).

## 4. Write up findings

- **File:** new `CANVAS-PERF-AUDIT.md` at repo root, matching the existing audit-doc convention.
- **Include:**
  - Per-effect main-thread cost (from step 2), with actual numbers, not impressions.
  - Whether cost is evenly distributed or dominated by one effect.
  - TBT vs. LCP as the primary score driver (from step 3).
  - 2-3 candidate next steps, each with a rough cost/benefit note, e.g.:
    - Throttle the heaviest effect's frame rate (e.g., 60fps → 30fps via a `1000/30` interval gate before calling the per-frame render work) — likely near-invisible visually for a stylized retro effect, cheap to implement.
    - Stagger effect start times or reduce simultaneous active effects on first paint, resuming full effect after LCP.
    - Accept current cost as an intentional trade-off for the brand identity, and instead raise the Lighthouse performance budget threshold to reflect a realistic ceiling rather than chase a score that conflicts with the site's design.
  - Explicitly do NOT recommend removing an effect outright as a first option — this is a deliberate design choice (the "print terminal" identity the whole project is built around), not an accident. Any fix suggestion should reduce cost without changing what the site visually is.

---

## Done when

`CANVAS-PERF-AUDIT.md` exists with real profiled numbers (not estimates), a clear answer to "which effect(s) actually dominate main-thread cost," and 2-3 concrete, scoped next-step options — ready to become a real fix-it plan in a follow-up task, once there's data to act on instead of a hunch.
