# The Baseline — Test Cleanup

**Repo:** https://github.com/sinzo8771-prog/Baseline
One issue remains from the last recheck. Everything else (Tier 0–3) is verified shipped and passing.

## Fix the `act()` warning in story-feed tests

- **File:** `test/components/story-feed.test.jsx`
- **Test:** `StoryFeed consistent image slots > falls back to the placeholder when an image fails to load`
- **Symptom:** Vitest/RTL prints:
  ```
  An update to CardImage inside a test was not wrapped in act(...).
  ```
  Suite still passes — this is a warning, not a failure — but left alone it tends to mask real async bugs later and is worth closing off now while the cause is fresh.

- **Cause:** the test triggers the image's `onError` handler (which flips `CardImage` into its placeholder state via `setState`) but doesn't wait for that state update to flush before asserting.

- **Fix:**
  1. Open `test/components/story-feed.test.jsx`, find the `falls back to the placeholder when an image fails to load` test.
  2. Wrap the event that fires `onError` in `act()` (or, if using `@testing-library/react`'s `fireEvent`, switch the assertion to `findBy...` / wrap in `await waitFor(...)` so RTL flushes the update for you — prefer this over a raw `act()` import if the test already uses RTL queries elsewhere in the file, for consistency).
  3. Re-run `npm run test:all` and confirm the warning is gone and all 138 tests (102 unit + 36 component) still pass.

- **Done when:** `npm run test:all` output has zero React `act()` warnings anywhere in the run, and the full suite is still green.

That's the only open item — no other follow-up work from the recheck.
