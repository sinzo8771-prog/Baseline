# The Baseline — Fix CommandPalette a11y bug + skipped-test hygiene

**Repo:** https://github.com/sinzo8771-prog/Baseline
Two small, independent items.

---

## 1. Fix the `nested-interactive` violation in CommandPalette

- **File:** `src/app/components/CommandPalette.jsx`
- **Bug:** each result renders as `<li role="option"><button onClick={...}>...</button></li>` (around line 161-162). Axe's `nested-interactive` rule flags this correctly — an ARIA `option` must not contain a nested focusable/interactive element. Screen readers and some AT can end up with two overlapping interactive targets for one visual row, which is exactly the kind of thing that breaks in practice even when it "mostly works" in a quick manual check.
- **Fix:** move the click/keyboard handling onto the `<li role="option">` itself and drop the inner `<button>` (use a `<div>`/plain content inside instead, or keep semantic text elements but no nested button/link/input):
  ```jsx
  <li
    key={result.id}
    role="option"
    aria-selected={i === cursor}
    tabIndex={-1}
    onClick={() => selectResult(result)}
    onKeyDown={(e) => {
      if (e.key === "Enter") selectResult(result);
    }}
    className="..." // move the button's existing classes here, adjust for li
  >
    {/* existing button's inner content, unwrapped */}
  </li>
  ```
  Check how the palette currently manages the "cursor" (arrow-key highlighted row) — that logic almost certainly already targets `<li>` elements by index for the `aria-selected` state, so the click handler moving to the `<li>` should be a small, contained change, not a rewrite. Keep the existing focus-trap and Enter-to-select behavior at the `<CommandPalette>` root level unchanged; this fix is scoped to the individual row markup only.
- **Verify:** in `test/components/a11y.test.jsx`, remove `it.skip` → `it` on the CommandPalette test (delete the `.skip`, no other changes needed — the test body is already correct, it was just never fixed to pass). Run `npx vitest run test/components/a11y.test.jsx` and confirm all 7 pass, then run `npm run test:all` to confirm nothing else regressed (the palette's existing 7 tests in `test/components/command-palette.test.jsx` — selection, keyboard nav, open/close — must still pass unchanged).
- **Done when:** `test/components/a11y.test.jsx` has zero `it.skip` calls, `npm run test:all` is fully green, and the fix is documented in `FUTURE-ROADMAP.md`/`CHANGELOG.md` under today's date (see item 2 below for why that record matters).

---

## 2. Require a reason on every skipped test

This is a process fix, not a code fix — there's no lint rule that can perfectly enforce "explain your skip," but a lightweight convention plus a periodic check is enough for a project this size.

- **Convention going forward:** any `it.skip(...)` or `describe.skip(...)` must have a comment on the line immediately above it stating *why* it's skipped and what needs to happen to un-skip it. Example:
  ```jsx
  // Skipped: nested-interactive violation in CommandPalette.jsx (li>button).
  // Un-skip once src/app/components/CommandPalette.jsx row markup moves the
  // interactive handler onto <li role="option"> per FUTURE-ROADMAP.md 2026-08-14.
  it.skip("CommandPalette (open) has no violations", async () => { ... });
  ```
  A skip with no reason is the same failure mode as a comment-free `// TODO` — it rots, because nobody remembers why it's there six weeks later, and eventually someone either deletes the test or ships past a real bug because "it was already skipped."
- **One-time sweep:** grep the whole test suite for existing unexplained skips and fix them the same way — either add the reason comment or (preferably, per item 1) fix the underlying issue and remove the skip entirely.
  ```
  grep -rn "\.skip(" test/
  ```
- **Where to record it:** when a test is skipped for a real, non-trivial reason (not "I'll get to it later today"), add a line to `FUTURE-ROADMAP.md`'s open-items list, same pattern already used for "Automated axe sweep" and "Screen-reader pass" — this project already has a good habit of tracking open work there; skipped tests should follow the same discipline instead of living silently in the test file only.
- **Done when:** `grep -rn "\.skip(" test/` returns zero results, or every remaining result has an explanatory comment directly above it and a corresponding `FUTURE-ROADMAP.md` entry.
