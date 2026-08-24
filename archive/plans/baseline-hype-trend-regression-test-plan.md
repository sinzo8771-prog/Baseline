# The Baseline — Regression test for hypeTrend series ordering

**Repo:** https://github.com/sinzo8771-prog/Baseline
One item, one file. The `99b2de1` fix corrected `hypeTrend()` to return its 7-day series oldest-first (matching `sourceSeries`'s existing convention, and how both chart consumers expect to plot left-to-right), but shipped with no test asserting the order — which is exactly how the bug went unnoticed in the first place.

---

## Add an ordering assertion to `hypeTrend`

- **File:** `test/hypeHistory.test.js`
- **Do:** extend the existing `hypeTrend computes delta vs the previous day` test (around line 44) to also assert order, rather than adding a whole new test for a one-line check — mirror the style already used by `sourceSeries returns up to limit points, oldest first` (line 170) elsewhere in the same file:
  ```js
  test("hypeTrend computes delta vs the previous day", () => {
    const history = [
      { date: "2026-08-09", hypePercent: 63 },
      { date: "2026-08-08", hypePercent: 55 },
    ];
    const { delta, series } = hypeTrend(history);
    assert.equal(delta, 8);
    assert.equal(series.length, 2);
    assert.deepEqual(series.map((e) => e.date), ["2026-08-08", "2026-08-09"]); // oldest first
  });
  ```
  `history` here is already newest-first (as `hypeTrend`'s real callers store it — see `readHypeHistory`), so asserting the output series is reversed relative to the input is the actual regression check.
- **Optional but recommended:** since the real bug was in *chart rendering* using the series (not just `hypeTrend` itself), also check whether `HypeIndex.jsx`'s or `Landing.jsx`'s component tests assert which bar is visually marked `isToday` — if neither does, add one assertion in an existing `HypeIndex`/`Landing` component test (check `test/components/` for whether either page has a test file yet; if not, this may be a one-line addition to `a11y.test.jsx`'s existing render of that page, not necessarily a new file) confirming the last-rendered trend bar carries the "today" styling/marker, not the first. This is what would have caught the bug at the component level, not just the pure-function level.
- **Done when:** `test/hypeHistory.test.js`'s `hypeTrend` test explicitly asserts oldest-first ordering, `npm run test:all` still green, and (if pursued) a component-level assertion exists confirming the rendered "today" position matches the fix.
