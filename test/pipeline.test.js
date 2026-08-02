import { test } from "node:test";
import assert from "node:assert/strict";
import { composeStories, dailyStats } from "../src/pipeline.js";

const results = [
  {
    source: "Feed A",
    stories: [
      { title: "Revolutionary AGI breakthrough superhuman", link: "https://a/1", publishedAt: "2026-08-02T10:00:00Z", summary: "Unprecedented." },
      { title: "Boring eval release", link: "https://a/2", publishedAt: "2026-08-01T10:00:00Z", summary: "Tables only." },
      { title: "Revolutionary AGI breakthrough superhuman (dup)", link: "https://a/3", publishedAt: "2026-08-01T09:00:00Z", summary: "Same story." },
    ],
  },
  {
    source: "Feed B",
    stories: [
      { title: "Middle story", link: "https://b/1", publishedAt: "2026-08-02T12:00:00Z", summary: "Okay." },
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
