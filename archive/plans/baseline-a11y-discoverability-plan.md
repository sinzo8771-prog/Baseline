# The Baseline — Accessibility & Discoverability Plan

**Repo:** https://github.com/sinzo8771-prog/Baseline
**Test setup:** `vitest` + `jsdom`, config at `vitest.config.js`, component tests live in `test/components/**/*.test.jsx`, setup file `vitest.setup.js`. Unit tests (`test/*.test.js`) run on plain `node --test` — don't add axe there, it needs a DOM.

Three independent items. No shared dependencies between them — do in any order, ship separately.

---

## 1. Automated a11y sweep (axe-core in CI)

- **Install:** `npm install --save-dev vitest-axe` (wraps `axe-core` with a `toHaveNoViolations` matcher for vitest/jest-style assertions; check current npm listing before pinning a version — confirm it supports the installed `vitest` major version in `package.json`).
- **Files:**
  - `vitest.setup.js` — extend expect with the matcher: `import { toHaveNoViolations } from "vitest-axe"; expect.extend({ toHaveNoViolations });`
  - New test files, one per existing component test file that renders a full page/major surface: `test/components/a11y.test.jsx` (start with one file covering the highest-value surfaces rather than scattering `axe()` calls everywhere).
- **What to cover, in priority order** (these are the surfaces with real interactive complexity — not every dumb presentational component needs its own axe pass):
  1. `StoryModal` (focus trap, dialog semantics)
  2. `CommandPalette` (focus trap, listbox/dialog semantics, keyboard nav)
  3. `TrendCell` (already has manual aria-label work — verify axe agrees)
  4. `Sources` page (the sparkline addition — confirm the decorative SVG is properly `aria-hidden`)
  5. `WeekInReview` and `HypeIndex` (chart-heavy, easy to accidentally fail color-contrast or missing-label rules)
  6. `Saved` page (empty state + populated state — both, since empty states often get built without a second look at semantics)
- **Pattern per test:**
  ```jsx
  import { render } from "@testing-library/react";
  import { axe } from "vitest-axe";

  it("has no accessibility violations", async () => {
    const { container } = render(<ComponentUnderTest {...requiredProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  ```
- **Do not** wire this into `npm run test` or `npm run test:all` as a hard gate on day one — axe will likely surface a handful of real findings on first run (this codebase has a lot of custom canvas/SVG effects that axe doesn't always parse cleanly, e.g. the Asciify/DecryptReveal masthead effects). Run it standalone first (`npx vitest run test/components/a11y.test.jsx`), triage findings, fix what's real, then fold into `test:all` once it's green.
- **Done when:** `test/components/a11y.test.jsx` exists covering the six surfaces above, runs clean, and is included in `npm run test:all`.

---

## 2. Manual screen-reader pass

This is a manual QA task, not code — the deliverable is a written findings doc, not a PR. Do this **after** item 1, since axe will already have caught the mechanical stuff (missing labels, contrast) and the SR pass should focus on things axe can't check: does the experience actually make sense read aloud, in order, with no visual context.

- **Tools:** VoiceOver (Mac, built in — Cmd+F5) or NVDA (Windows, free). Test with at least one.
- **Surfaces to walk, in this order:**
  1. **Landing (`/`) → skip link** — confirm the skip-link added in the redesign pass actually lands focus on `#main` and is announced before the masthead.
  2. **Edition (`/edition`)** — full read-through of one story card: is the hype badge announced meaningfully (`role="img"` + `aria-label` pattern used in `TrendCell`/badges), or does it read as noise?
  3. **Story modal** — open via keyboard (Enter on a card), confirm focus moves into the modal, Escape returns focus to the triggering card (not lost to `<body>`).
  4. **Command palette (Cmd/Ctrl+K)** — open, type a query, arrow through results, Enter to select. Confirm it's announced as a dialog/listbox, not silent.
  5. **Sources page sparklines** — confirm the new SVG trend lines don't get announced as meaningless SVG noise (should be silent; the existing glyph + aria-label should be the only thing read).
  6. **Week in Review** — the empty/partial-history states in particular; confirm the "not enough data yet" messaging reads clearly rather than announcing an empty chart with no explanation.
  7. **Print stylesheet** — not SR-related, but worth eyeballing in the same pass: print preview of `/edition` still looks right after the redesign changes.
- **Output:** a short markdown findings doc — `SCREEN-READER-AUDIT.md` at repo root, same format as the existing `SECURITY-AUDIT.md`/`V2-AUDIT.md`. List each surface, pass/fail, and file/line for any fix needed. Don't fix issues inline during the walk — record them, then fix as a follow-up batch so the audit doc stays an honest snapshot.
- **Done when:** all 7 surfaces walked with at least one screen reader, findings documented, any real bugs filed as follow-up tasks (not silently fixed without a record).

---

## 3. Command palette discoverability

- **Problem:** Cmd/Ctrl+K opens a fuzzy search over every page and story, but nothing in the UI hints it exists — it's currently only discoverable by reading the changelog.
- **Files:** `src/app/App.jsx` (or wherever the search input from Tier 1's `/` shortcut lives — likely `SiteNav` or the search bar component used on `/edition`), `src/app/components/CommandPalette.jsx`
- **Do:** Add a small visual hint near the existing search input — a `⌘K` (or `Ctrl K` on non-Mac, detect via `navigator.platform`/`navigator.userAgentData` if already used elsewhere in the codebase, otherwise a simple `Mac ? ⌘ : Ctrl` check) badge, styled as a muted pill, right-aligned inside or next to the search input. This is a standard, low-friction pattern — don't invent a new one.
- **Also add:** a one-line mention in the existing `?` keyboard-shortcuts help overlay (from `useKeyboardShortcuts`/Tier 1.4) if Cmd+K isn't already listed there — check `src/app/hooks/useKeyboardShortcuts.js` and whatever renders the help overlay first, since it may already be documented there and only missing the visible badge.
- **Done when:** a `⌘K`/`Ctrl K` hint is visible without opening any help menu, and it's confirmed listed in the `?` help overlay too.

---

## Order

1. Axe sweep first — cheapest, catches mechanical issues before a human wastes time re-finding them.
2. Cmd+K discoverability — trivial, ship immediately, don't block on the other two.
3. Screen-reader pass last — most expensive (manual, human time), and benefits from axe already being clean going in.
