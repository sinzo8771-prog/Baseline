import { test } from "node:test";
import assert from "node:assert/strict";
import { composeStories, dailyStats, sourceStats, editionNumber, dailyShift, isSmallSample } from "../src/lib/pipeline.js";

const results = [
  {
    source: "Feed A",
    stories: [
      { title: "Revolutionary AGI breakthrough superhuman", source: "Feed A", link: "https://a/1", publishedAt: "2026-08-02T10:00:00Z", summary: "Unprecedented." },
      { title: "Boring eval release", source: "Feed A", link: "https://a/2", publishedAt: "2026-08-01T10:00:00Z", summary: "Tables only." },
      { title: "Revolutionary AGI breakthrough superhuman (dup)", source: "Feed A", link: "https://a/3", publishedAt: "2026-08-01T09:00:00Z", summary: "Same story." },
    ],
  },
  {
    source: "Feed B",
    stories: [
      { title: "Middle story", source: "Feed B", link: "https://b/1", publishedAt: "2026-08-02T12:00:00Z", summary: "Okay." },
    ],
  },
];

test("composeStories dedupes, scores, sorts newest first, caps at 50", () => {
  const out = composeStories(results);
  assert.equal(out.length, 3);
  assert.equal(out[0].title, "Middle story");
  assert.equal(out[0].spin, "Measured");
  assert.ok(out[1].spinScore > out[2].spinScore);
  assert.ok(Array.isArray(out[0].flags));
  for (const s of out) assert.ok(typeof s.id === "string" && s.id.length > 0);
});

test("dailyStats computes hype percent and breakdown", () => {
  const stories = composeStories(results);
  const stats = dailyStats(stories);
  assert.equal(stats.total, 3);
  assert.equal(typeof stats.hypePercent, "number");
  assert.ok(stats.hypePercent > 0);
  assert.ok(stats.bySpin.Measured >= 1);
  assert.ok(stats.bySpin["On Fire"] >= 1);
  assert.ok(Date.parse(stats.generatedAt) > 0);
});

test("sourceStats aggregates count, avg hype, and distribution per source", () => {
  const stories = composeStories(results);
  const stats = sourceStats(stories);
  const byName = Object.fromEntries(stats.map((s) => [s.name, s]));
  assert.ok(byName["Feed A"]);
  assert.ok(byName["Feed B"]);
  assert.equal(byName["Feed A"].count, 2);
  assert.equal(byName["Feed B"].count, 1);
  assert.equal(typeof byName["Feed A"].avgHype, "number");
  assert.equal(typeof byName["Feed A"].bySpin["On Fire"], "number");
  // Loudest-first ordering.
  const descending = stats.every((s, i, arr) => i === 0 || arr[i - 1].avgHype >= s.avgHype);
  assert.ok(descending);
});

test("sourceStats ignores stories without a source and sorts deterministically", () => {
  const stats = sourceStats([{ title: "x", spinScore: 5, spin: "Warm" }]);
  assert.deepEqual(stats, []);
  const a = sourceStats([
    { source: "B", spinScore: 3, spin: "Warm" },
    { source: "A", spinScore: 3, spin: "Warm" },
  ]);
  assert.deepEqual(a.map((s) => s.name), ["A", "B"]);
});

test("editionNumber is deterministic per calendar day and increments daily", () => {
  const a = editionNumber(new Date(2026, 7, 9, 0, 0, 0));
  const b = editionNumber(new Date(2026, 7, 9, 23, 59, 0));
  const c = editionNumber(new Date(2026, 7, 10, 12, 0, 0));
  assert.equal(a, b);
  assert.equal(c, a + 1);
  assert.ok(a >= 1);
});

test("dailyShift reports deltas only when they differ", () => {
  const today = { hypePercent: 60, total: 25, bySpin: { Measured: 10, Warm: 5, Hot: 5, "On Fire": 5 } };
  const prev = { hypePercent: 55, total: 25, bySpin: { Measured: 12, Warm: 5, Hot: 5, "On Fire": 3 } };
  const shift = dailyShift(today, prev);
  const hype = shift.find((s) => s.label === "Hype");
  assert.equal(hype.delta, 5);
  const warm = shift.find((s) => s.label === "Warm stories");
  assert.equal(warm, undefined); // no delta -> filtered out
  const onFire = shift.find((s) => s.label === "On Fire stories");
  assert.equal(onFire.delta, 2);
  assert.equal(shift.find((s) => s.label === "Story volume"), undefined);
});

test("dailyShift returns empty when either day is missing", () => {
  assert.deepEqual(dailyShift(null, {}), []);
  assert.deepEqual(dailyShift({}, null), []);
});

test("isSmallSample flags editions too small to read firmly", () => {
  assert.equal(isSmallSample(0), false); // no edition at all
  assert.equal(isSmallSample(2), true);
  assert.equal(isSmallSample(7), true);
  assert.equal(isSmallSample(8), false); // at/above the minimum, read firmly
  assert.equal(isSmallSample(25), false);
  assert.equal(isSmallSample(undefined), false);
});
