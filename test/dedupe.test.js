import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTitle, titleSimilarity, dedupeStories } from "../src/dedupe.js";

test("normalizeTitle lowercases and strips punctuation", () => {
  assert.equal(normalizeTitle("Hello, World!!"), "hello world");
});

test("titleSimilarity is high for near duplicates", () => {
  const a = normalizeTitle("OpenAI announces new model");
  const b = normalizeTitle("OpenAI announces new model today");
  assert.ok(titleSimilarity(a, b) >= 0.8);
});

test("titleSimilarity is low for different titles", () => {
  const a = normalizeTitle("OpenAI releases model");
  const b = normalizeTitle("Anthropic hires new CFO");
  assert.ok(titleSimilarity(a, b) < 0.5);
});

test("dedupeStories removes exact and near duplicates, keeps first", () => {
  const stories = [
    { id: "1", title: "OpenAI announces new model" },
    { id: "2", title: "OpenAI announces new model today" },
    { id: "3", title: "Something entirely different" },
    { id: "4", title: "" },
  ];
  const out = dedupeStories(stories);
  assert.equal(out.length, 2);
  assert.equal(out[0].id, "1");
  assert.equal(out[1].id, "3");
});
