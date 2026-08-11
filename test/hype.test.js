import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scoreHype,
  spinLabel,
  spinFromStory,
  signalStats,
  signalShares,
  biggestSignalShift,
} from "../src/lib/hype.js";

test("measured headline scores low", () => {
  const { score, flags } = scoreHype({ title: "Model eval results published", summary: "Benchmark tables and methodology." });
  assert.ok(score < 12);
  assert.equal(flags.length, 0);
});

test("hype words push score up", () => {
  const { score, flags, signals } = scoreHype({ title: "Revolutionary AGI breakthrough announced", summary: "Unprecedented game-changing results." });
  assert.ok(score >= 12);
  assert.ok(flags.includes("high-intensity language"));
  // Stacking three heavy words in one family accumulates, bounded per signal.
  const language = signals.find((s) => s.id === "language");
  assert.equal(language.points, 30);
});

test("all-caps and exclamations add score", () => {
  const { score, flags } = scoreHype({ title: "BREAKTHROUGH!!!", summary: "" });
  assert.ok(flags.includes("all-caps"));
  assert.ok(flags.includes("punctuation"));
  assert.ok(score > 0);
});

test("short words like AGI match on word boundaries, not substrings", () => {
  // "imaging" and "imagination" contain the letters "agi" but must not trip it.
  const { score: score1, flags: flags1 } = scoreHype({ title: "New imaging model from OpenAI", summary: "" });
  assert.equal(flags1.includes("high-intensity language"), false);
  assert.equal(score1, 0);
  const { score: score2, flags: flags2 } = scoreHype({ title: "AGI breakthrough announced", summary: "" });
  assert.ok(flags2.includes("high-intensity language"));
  assert.ok(score2 >= 8);
});

test("cross-category stacking is louder than a single family", () => {
  const { score, signals } = scoreHype({ title: "Revolutionary new AI destroys every benchmark", summary: "" });
  assert.ok(score >= 25, `expected stacked score >= 25, got ${score}`);
  const cats = new Set(signals.map((s) => s.category));
  assert.ok(cats.has("language"));
  assert.ok(cats.has("benchmark"));
  assert.ok(cats.has("emotional"));
  assert.ok(signals.some((s) => s.id === "stacked"));
});

test("hedged research framing halves word weight instead of boosting it", () => {
  const { score, hedged } = scoreHype({ title: "Researchers examine whether AI could become superhuman", summary: "" });
  assert.equal(hedged, true);
  // Superhuman alone would be 10; hedged it is 5 (Measured).
  assert.equal(score, 5);
});

test("quoted words are reporting a claim, not making it", () => {
  const { score } = scoreHype({ title: "Lab calls its model a \"breakthrough\" after quiet release", summary: "" });
  // "breakthrough" is in quotes, so only "quiet" adds nothing: Measured.
  assert.equal(score, 0);
});

test("facts and money do not fire the hype detector", () => {
  const { score, flags } = scoreHype({ title: "Company reports $1 billion investment and 3 million users", summary: "" });
  assert.equal(score, 0);
  assert.deepEqual(flags, []);
});

test("signalStats counts each story once per category", () => {
  const stories = [
    { signals: [{ category: "language" }, { category: "language" }] },
    { signals: [{ category: "language" }, { category: "benchmark" }, { category: "combo" }] },
    { signals: [] },
  ];
  assert.deepEqual(signalStats(stories), { language: 2, benchmark: 1 });
});

test("signalShares converts counts to rounded percentages", () => {
  const shares = signalShares({ language: 2, benchmark: 1 });
  assert.equal(shares.language, 67);
  assert.equal(shares.benchmark, 33);
  assert.deepEqual(signalShares({}), {});
});

test("biggestSignalShift ranks the loudest category moves and guards history", () => {
  const today = { language: 5, benchmark: 1 };
  const prev = { language: 2, benchmark: 3 };
  const shifts = biggestSignalShift(today, prev);
  assert.ok(shifts.length <= 3);
  assert.equal(shifts[0].category, "language");
  assert.equal(shifts[0].delta, 43); // 83% - 40%
  assert.equal(biggestSignalShift(null, prev), null);
  assert.equal(biggestSignalShift(today, null), null);
  assert.equal(biggestSignalShift({}, {}), null);
});

test("score is capped at 100", () => {
  const long = Array.from({ length: 40 }, (_, i) => `hype${i}`).join(" ");
  const { score } = scoreHype({ title: "Revolutionary AGI singularity breakthrough", summary: long });
  assert.ok(score <= 100);
});

test("spinLabel thresholds", () => {
  assert.equal(spinLabel(0), "Measured");
  assert.equal(spinLabel(12), "Warm");
  assert.equal(spinLabel(25), "Hot");
  assert.equal(spinLabel(40), "On Fire");
  assert.equal(spinLabel(100), "On Fire");
});

test("spinFromStory attaches spin fields", () => {
  const result = spinFromStory({ title: "A plain title", summary: "" });
  assert.equal(result.spin, "Measured");
  assert.equal(typeof result.spinScore, "number");
  assert.ok(Array.isArray(result.flags));
});
