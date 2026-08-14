import { test } from "node:test";
import assert from "node:assert/strict";
import {
  localDateKey,
  readHypeHistory,
  recordToday,
  hypeTrend,
  recordSourceStats,
  readSourceHistory,
  sourceTrend,
  sourceTrendReading,
  sourceSeries,
} from "../src/app/lib/hypeHistory.js";

function fakeWindow() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = { localStorage };
  return store;
}

test("localDateKey formats a local YYYY-MM-DD", () => {
  const d = new Date(2026, 7, 9, 12, 0, 0);
  assert.equal(localDateKey(d), "2026-08-09");
});

test("hypeTrend with no history has no delta and no series", () => {
  const { delta, series } = hypeTrend([]);
  assert.equal(delta, null);
  assert.deepEqual(series, []);
});

test("hypeTrend with a single day has no delta yet", () => {
  const { delta, series } = hypeTrend([{ date: "2026-08-09", hypePercent: 63 }]);
  assert.equal(delta, null);
  assert.deepEqual(series, [{ date: "2026-08-09", hypePercent: 63 }]);
});

test("hypeTrend computes delta vs the previous day", () => {
  const history = [
    { date: "2026-08-09", hypePercent: 63 },
    { date: "2026-08-08", hypePercent: 55 },
  ];
  const { delta, series } = hypeTrend(history);
  assert.equal(delta, 8);
  assert.equal(series.length, 2);
});

test("hypeTrend treats same-date entries as one day (no delta)", () => {
  const history = [
    { date: "2026-08-09", hypePercent: 63 },
    { date: "2026-08-09", hypePercent: 55 },
  ];
  assert.equal(hypeTrend(history).delta, null);
});

test("recordToday then readHypeHistory roundtrips one entry", () => {
  fakeWindow();
  const stats = { hypePercent: 63, total: 25, bySpin: { Measured: 10, Warm: 5, Hot: 5, "On Fire": 5 } };
  recordToday(stats);
  const history = readHypeHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].hypePercent, 63);
  assert.equal(history[0].date, localDateKey());
});

test("recordToday replaces the same day's entry instead of duplicating it", () => {
  fakeWindow();
  recordToday({ hypePercent: 60, total: 20, bySpin: {} });
  recordToday({ hypePercent: 70, total: 20, bySpin: {} });
  const history = readHypeHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].hypePercent, 70);
});

test("hypeHistory ignores garbage in storage", () => {
  const store = fakeWindow();
  store.set("baseline-hype-history-v1", "not json");
  assert.deepEqual(readHypeHistory(), []);
});

test("recordSourceStats roundtrips and replaces the same day", () => {
  fakeWindow();
  const day1 = [
    { name: "OpenAI", count: 3, avgHype: 40 },
    { name: "Wired", count: 2, avgHype: 12 },
  ];
  recordSourceStats(day1);
  recordSourceStats([
    { name: "OpenAI", count: 4, avgHype: 55 },
    { name: "Wired", count: 2, avgHype: 12 },
  ]);
  const history = readSourceHistory();
  assert.equal(history.length, 1);
  const openai = history[0].sources.find((s) => s.name === "OpenAI");
  assert.equal(openai.avgHype, 55);
  assert.equal(history[0].date, localDateKey());
});

test("sourceTrend compares against the previous available day", () => {
  fakeWindow();
  // Two different calendar days so there's a real before/after to compare.
  recordSourceStats(
    [
      { name: "OpenAI", count: 3, avgHype: 60 },
      { name: "Wired", count: 2, avgHype: 12 },
    ],
    new Date(2026, 7, 8),
  );
  recordSourceStats(
    [
      { name: "OpenAI", count: 4, avgHype: 45 },
      { name: "Wired", count: 2, avgHype: 12 },
    ],
    new Date(2026, 7, 9),
  );
  const history = readSourceHistory();
  assert.equal(sourceTrend(history, "OpenAI"), "down");
  assert.equal(sourceTrend(history, "Wired"), "flat");
});

test("sourceTrend returns null when a source has no prior reading", () => {
  fakeWindow();
  recordSourceStats([{ name: "Only", count: 1, avgHype: 50 }], new Date(2026, 7, 9));
  const history = readSourceHistory();
  assert.equal(sourceTrend(history, "Missing"), null);
});

test("sourceTrendReading reports magnitude (direction, delta, pct)", () => {
  fakeWindow();
  recordSourceStats([{ name: "OpenAI", count: 2, avgHype: 50 }], new Date(2026, 7, 8));
  recordSourceStats([{ name: "OpenAI", count: 3, avgHype: 60 }], new Date(2026, 7, 9));
  const history = readSourceHistory();
  const reading = sourceTrendReading(history, "OpenAI");
  assert.deepEqual(reading, { direction: "up", delta: 10, pct: 20 });
});

test("sourceTrendReading uses points when the previous average was 0", () => {
  fakeWindow();
  recordSourceStats([{ name: "Quiet", count: 2, avgHype: 0 }], new Date(2026, 7, 8));
  recordSourceStats([{ name: "Quiet", count: 2, avgHype: 14 }], new Date(2026, 7, 9));
  const history = readSourceHistory();
  const reading = sourceTrendReading(history, "Quiet");
  assert.equal(reading.direction, "up");
  assert.equal(reading.delta, 14);
  assert.equal(reading.pct, null);
});

test("sourceTrendReading is flat when intensity is unchanged", () => {
  fakeWindow();
  recordSourceStats([{ name: "Wired", count: 2, avgHype: 12 }], new Date(2026, 7, 8));
  recordSourceStats([{ name: "Wired", count: 3, avgHype: 12 }], new Date(2026, 7, 9));
  const history = readSourceHistory();
  const reading = sourceTrendReading(history, "Wired");
  assert.deepEqual(reading, { direction: "flat", delta: 0, pct: 0 });
});

test("sourceTrendReading returns null when a source has no prior reading", () => {
  fakeWindow();
  recordSourceStats([{ name: "Only", count: 1, avgHype: 50 }], new Date(2026, 7, 9));
  const history = readSourceHistory();
  assert.equal(sourceTrendReading(history, "Missing"), null);
});

test("sourceSeries returns up to limit points, oldest first", () => {
  const history = [
    { date: "2026-08-09", sources: [{ name: "OpenAI", count: 3, avgHype: 60 }] },
    { date: "2026-08-08", sources: [{ name: "OpenAI", count: 4, avgHype: 45 }] },
    { date: "2026-08-07", sources: [{ name: "OpenAI", count: 2, avgHype: 50 }] },
  ];
  const series = sourceSeries(history, "OpenAI");
  assert.deepEqual(series.map((e) => e.avgHype), [50, 45, 60]);
});

test("sourceSeries skips days a source was absent", () => {
  const history = [
    { date: "2026-08-09", sources: [{ name: "OpenAI", count: 3, avgHype: 60 }] },
    { date: "2026-08-08", sources: [{ name: "Wired", count: 2, avgHype: 12 }] },
    { date: "2026-08-07", sources: [{ name: "OpenAI", count: 2, avgHype: 50 }] },
  ];
  const series = sourceSeries(history, "OpenAI");
  assert.deepEqual(series.map((e) => e.avgHype), [50, 60]);
});

test("sourceSeries honors the limit and guards bad input", () => {
  const history = [
    { date: "2026-08-09", sources: [{ name: "OpenAI", count: 3, avgHype: 60 }] },
    { date: "2026-08-08", sources: [{ name: "OpenAI", count: 4, avgHype: 45 }] },
    { date: "2026-08-07", sources: [{ name: "OpenAI", count: 2, avgHype: 50 }] },
  ];
  assert.equal(sourceSeries(history, "OpenAI", 2).length, 2);
  assert.deepEqual(sourceSeries([], "OpenAI"), []);
  assert.deepEqual(sourceSeries(null, "OpenAI"), []);
  assert.deepEqual(sourceSeries(history, "Missing"), []);
});
