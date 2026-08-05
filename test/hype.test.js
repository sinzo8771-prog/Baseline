import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreHype, spinLabel, spinFromStory } from "../src/lib/hype.js";

test("measured headline scores low", () => {
  const { score, flags } = scoreHype({ title: "Model eval results published", summary: "Benchmark tables and methodology." });
  assert.ok(score < 12);
  assert.equal(flags.length, 0);
});

test("hype words push score up", () => {
  const { score, flags } = scoreHype({ title: "Revolutionary AGI breakthrough announced", summary: "Unprecedented game-changing results." });
  assert.ok(score >= 12);
  assert.ok(flags.includes('"revolutionary"'));
});

test("all-caps and exclamations add score", () => {
  const { score, flags } = scoreHype({ title: "BREAKTHROUGH!!!", summary: "" });
  assert.ok(flags.includes("all-caps"));
  assert.ok(flags.includes("exclamation"));
  assert.ok(score > 0);
});

test("short words like AGI match on word boundaries, not substrings", () => {
  // "imaging" and "imagination" contain the letters "agi" but must not trip it.
  const { score: score1, flags: flags1 } = scoreHype({ title: "New imaging model from OpenAI", summary: "" });
  assert.equal(flags1.includes('"agi"'), false);
  assert.equal(score1, 0);
  const { score: score2, flags: flags2 } = scoreHype({ title: "AGI breakthrough announced", summary: "" });
  assert.ok(flags2.includes('"agi"'));
  assert.ok(score2 >= 8);
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
