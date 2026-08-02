import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreHype, spinLabel, spinFromStory } from "../src/hype.js";

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
