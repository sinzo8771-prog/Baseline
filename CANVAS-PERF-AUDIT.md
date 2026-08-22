# CANVAS-PERF-AUDIT — Baseline Landing

Profiled the three canvas effects used on the landing pages (`Asciify`, `DecryptReveal`,
`VHS`) against the production build to answer: **are the canvas effects the reason the
Lighthouse scores sit at ~56 (`/`) / ~64 (`/edition`)?**

**Verdict: no.** The effects are a rounding error. The scores are driven by one-time
bundle script evaluation (~1.7 s), the hero H1's render delay (89 % of its 4.4 s LCP),
and CLS from streaming/feed content. Details and measured numbers below.

---

## 1. How the effects actually run (facts that correct the plan's premise)

The audit plan assumed all three effects run continuously at full refresh rate inside the
masthead. The code says otherwise:

- **Asciify** (wraps the masthead title, `src/components/canvasui/Asciify.jsx`) and
  **DecryptReveal** (wraps the tagline, `DecryptReveal.jsx`) are **idle-stopping reveal
  effects**. They churn while the pointer is over them, then settle. DecryptReveal has an
  explicit `IDLE_AFTER_FRAMES = 180` churn-grace (`DecryptReveal.jsx:764`) after which the
  loop stops; Asciify stops once the pointer leaves and the eased position converges.
- **VHS** (`VHS.jsx`) is the **only continuous loop**, and it is **footer-scoped** — it
  wraps `SiteFooter`, not the masthead — and is gated by an `IntersectionObserver`, so it
  runs only while the footer is on-screen.
- Every effect's rAF loop already **clamps to ~30 fps** internally
  (`Math.min((t - last) / 1000, 1/30)`), so even the "continuous" loops cap their JS work.
- All three render via **WebGL2** — the heavy work (ASCII glyphs, scramble, VHS distortion)
  happens in shaders on the GPU. The per-frame JS cost is tiny.

## 2. Measured per-frame cost (isolated builds, 5 s of active churn)

Method: temporary comment-out builds keeping exactly one effect
(`_perf/variant.mjs`), production `vite preview` on `localhost:4173`, Playwright chromium,
1280×800, a 5 s window while the effect is forced active (synthetic `pointermove` for the
reveals, footer on-screen for VHS). An injected `requestAnimationFrame` wrapper measures
each callback's wall-clock duration and fingerprints its source.

| Effect | scope | frames (5 s) | total JS | per frame | runs when |
|---|---|---|---|---|---|
| Asciify | masthead title | 873 | 64 ms | **0.07 ms** | hover only; settles after ~2 s |
| DecryptReveal | tagline | 871 | 58 ms | **0.07 ms** | hover only; settles after `IDLE_AFTER_FRAMES` |
| VHS | footer | 870 | 55 ms | **0.06 ms** | continuous **while footer visible** |
| framer-motion scheduler | — | ~65 | ~8–11 ms | 0.13–0.17 ms | load + effects |

Full-app production run, 5 s windows:

| scenario | rAF calls | animation JS | share of 5 s |
|---|---|---|---|
| Idle on `/` | 69 | ~15 ms | ~0.3 % (effects stopped after ~2 s) |
| Masthead hover (all three active) | ~2,440 | **196 ms** | **~4 %** |
| Footer visible (VHS only) | ~870 | 69 ms | ~1.4 % |

Worst case — every effect churning at once — is ~0.2 ms of JS per frame. There is no
continuous full-refresh-rate canvas load on the page at any point.

## 3. Lighthouse cross-check (Chrome headless, mobile emulation, production build)

| metric | `/` | `/edition` |
|---|---|---|
| Performance | **57** | **64** |
| LCP | 4.4 s (0.38) | 2.5 s (0.90) |
| TBT | 730 ms (0.41) | 690 ms (0.43) |
| FCP / Speed Index | 2.0 s / 2.0 s | 2.0 s / 2.0 s |
| CLS | 0.18 (0.67) | 0.30 (0.39) |
| A11y / BP / SEO | 96 / 100 / 100 | 96 / 100 / 100 |

**Main-thread work is ~2.4 s on both routes, and ~71 % of it is one-time script
evaluation** (1.72 s `/`; 1.74 s `/edition`), attributed by Lighthouse to the single app
bundle (`index-*.js`, 108 KB): **1,683 ms of scripting at load**. Style & layout is the
next bucket (419 ms `/`, 342 ms `/edition`). Rendering + GC together are under 60 ms.

The score drivers, concretely:

1. **One 729 ms long task inside bundle script evaluation at t ≈ 3.4 s** blocks the main
   thread right when the hero should paint (two more long tasks: 99 ms @625 ms, 96 ms
   @3337 ms). This is React + router + framer-motion + all five canvasui components + the
   feed pipeline being parsed and executed on load — not the animation loops.
2. **The LCP element is the hero H1** ("A quiet interface for a very loud industry."):
   TTFB is only 467 ms (11 %) but **render delay is 3,968 ms (89 %)**. The H1 waits on the
   Fraunces woff2 font fetch (66 KB, ~570 ms network) plus the hero entrance animation;
   the 729 ms long task delays it further. `ttfb`/font/entrance, not canvas.
3. **CLS 0.18–0.30** from feed/story cards streaming in without reserved space.
4. The canvas effects themselves never appear in the long-task or bootup-time breakdown
   (they are ~0.07 ms/frame and idle-stop).

## 4. Next steps (scoped, in ROI order)

1. **Cut the load-time script-eval block** — the single biggest lever for both score and
   LCP. Route-split the feed/editor pipeline and the non-masthead canvasui effects behind
   dynamic `import()`/`lazy()` so the 108 KB bundle's 1.7 s of evaluation no longer runs
   as one 729 ms long task at t≈3.4 s. The canvas effects' code is small, so splitting
   the feed/editor logic is where the payload is.
2. **Attack the H1's 89 % render delay**: preload the Fraunces woff2
   (`<link rel="preload" as="font" crossorigin>`), and/or gate the hero entrance animation
   on `document.fonts.ready` so the headline paints at FCP instead of 4.4 s. This is
   worth ~1.5–2 s of LCP on `/` with no visual change.
3. **Reserve layout for feed cards** (fixed `aspect-ratio` / min-height) to remove the
   0.18–0.30 CLS.

## 5. Follow-up: the three steps, implemented and re-measured

Process note: the fix shipped directly in commit `65037ca` without the planned pause
between profiling and writing up findings first. This document backfills that record
afterward — Sections 1–4 reconstruct the investigation, Section 5 records what actually
landed — so the audit-doc history stays accurate about how the work was sequenced.

All three steps above were then implemented in `src/app` (not the effects themselves) and
re-measured with the same Lighthouse harness:

- **Lazy-load the non-masthead effects.** `VHS` is now `React.lazy` + gated on an
  `IntersectionObserver` (rootMargin 600 px) around the footer in `App.jsx`
  (`FooterEffect`), so its module and WebGL setup never load until the footer is near the
  viewport. `Glitch` in `StoryFeed.jsx` is `React.lazy` too, with the lead card as the
  Suspense fallback, so its shader compiles only when an "On Fire" lead actually renders.
  Both now emit their own chunks (`VHS-*.js` 10.5 kB, `Glitch-*.js` 7.9 kB), shrinking the
  eager main bundle.
- **Chunked feed compose.** `useBaselineData.js` now composes the edition with a
  chunked, yielding pipeline (`composeStoriesChunked` — identical scoring/dedupe rules,
  yielding to the main thread via `yieldToMainThread()` every 25 stories during scoring
  and dedup), so a large feed batch can never become one
  blocking task. The sync `composeStories` in `src/lib/pipeline.js` is untouched for the
  Worker; `hashId` is now exported for reuse.
- **LCP H1 paints at first frame.** The hero H1 in `Landing.jsx` was moved out of the
  opacity-fade wrapper (the fade now applies only to the supporting copy), so the LCP
  element renders at FCP instead of waiting on `whileInView` + animation.
- **Stable `/edition` chrome.** `Home.jsx` now renders the search/sort/view toolbar, spin
  scale, and filter chips identically before and after the feeds arrive; only the cards
  region swaps between skeletons and content, so the loading state no longer collapses
  and rebuilds the page header.

Re-measured (same Chrome headless mobile-emulated production runs):

| metric | `/` before → after | `/edition` before → after |
|---|---|---|
| Performance | 57 → **66** | 64 → **79** |
| LCP | 4.4 s (0.38) → **2.5 s (0.89)** | 2.5 s (0.90) → **2.3 s (0.93)** |
| TBT | 730 ms (0.41) → 860 ms (0.33) | 690 ms (0.43) → 730 ms (0.40) |
| CLS | 0.18 (0.67) → 0.19 (0.64) | 0.30 (0.39) → **0.018 (1.0)** |
| FCP / SI | 2.0 / 2.0 s (unchanged) | 2.0 / 2.0 s (unchanged) |

Residual notes:

- The H1 now paints at FCP (LCP ≈ FCP ≈ 2.0–2.5 s) — the ~89 % render delay is gone.
- `/edition` CLS dropped from 0.30 to 0.018 — the skeleton→content swap was the whole
  shift; the toolbar now holds still.
- The remaining ~0.19 CLS on `/` is the hero H1's Fraunces font-swap (fallback serif →
  Fraunces). The woff2 is fetched by a deliberately deferred Google Fonts stylesheet
  (`media="print" onload`) to protect FCP; removing that deferral would trade FCP for CLS.
  Fully removing it needs self-hosting the woff2 with `size-adjust`/metric overrides — a
  branding-sensitive change not worth it for 0.19.
- The ~730–860 ms TBT is unchanged run-to-run noise around the eager masthead bundle eval
  (React + router + framer-motion + Asciify/DecryptReveal, ~334 kB) on SwiftShader — the
  effects' per-frame cost was never in it (Section 2) and the lazy VHS/Glitch chunks are
  confirmed to still fire their loops when actually in view.
- No regressions: 118 `node --test` + 45 `vitest` + 16 Playwright e2e all pass.

The effects should be kept — they cost ~0.06–0.07 ms/frame and self-stop. If headroom is
ever needed, they already clamp to 30 fps internally, and `prefers-reduced-motion` is
already partially honored (`VHS` stops entirely; the reveals settle faster).

## Appendix — artifacts

- Profiles: `C:\Users\lenovo\AppData\Local\Temp\opencode\baseline-perf\out\`
  (`prod-idle`, `prod-masthead-hover`, `prod-footer-visible`, `iso-asciify`, `iso-decrypt`,
  `iso-vhs`, `lh-root.json`, `lh-edition.json`, `lh-root-opt.json`, `lh-edition-opt.json`).
- Harness: `_perf/` (`profile.mjs` — rAF per-callback profiler with source fingerprinting;
  `variant.mjs` — isolation builds; `analyze.mjs`; `lh-extract.mjs`). Untracked; safe to
  delete — it is not part of the app.
- Implementation (this follow-up): `src/app/App.jsx` (`FooterEffect` + lazy VHS),
  `src/app/components/StoryFeed.jsx` (lazy Glitch), `src/app/hooks/useBaselineData.js`
  (chunked compose), `src/app/pages/Landing.jsx` (H1 out of the fade),
  `src/app/pages/Home.jsx` (stable toolbar), `src/lib/pipeline.js` (exported `hashId`).
  Effect rendering itself is untouched.