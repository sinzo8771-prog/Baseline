import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTitle, stripSourcePrefix, titleSimilarity, dedupeStories } from "../src/lib/dedupe.js";

test("normalizeTitle lowercases and strips punctuation", () => {
  assert.equal(normalizeTitle("Hello, World!!"), "hello world");
});

test("normalizeTitle collapses punctuation/case variations", () => {
  assert.equal(normalizeTitle("  GPT-5:  the 'super model' — IS HERE!! "), "gpt 5 the super model is here");
});

test("stripSourcePrefix removes a leading known-source prefix", () => {
  assert.equal(stripSourcePrefix("OpenAI: GPT-5 is here", ["OpenAI"]), "GPT-5 is here");
  assert.equal(stripSourcePrefix("Anthropic — Claude 4 ships", ["Anthropic"]), "Claude 4 ships");
  assert.equal(stripSourcePrefix("The Verge AI | GPT-5", ["The Verge AI"]), "GPT-5");
  assert.equal(stripSourcePrefix("OpenAI - GPT-5", ["OpenAI"]), "GPT-5");
});

test("stripSourcePrefix only strips known source names", () => {
  assert.equal(stripSourcePrefix("OpenAI announces GPT-5", ["OpenAI"]), "OpenAI announces GPT-5");
  assert.equal(stripSourcePrefix("MIT is not a prefix here", ["MIT Tech Review AI"]), "MIT is not a prefix here");
  assert.equal(stripSourcePrefix("OpenAI:", ["OpenAI"]), "OpenAI:");
});

test("stripSourcePrefix is case-insensitive", () => {
  assert.equal(stripSourcePrefix("openai: GPT-5", ["OpenAI"]), "GPT-5");
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

test("dedupeStories collapses source-prefixed syndication", () => {
  const stories = [
    { id: "1", title: "GPT-5 is here", source: "OpenAI" },
    { id: "2", title: "OpenAI: GPT-5 is here", source: "The Verge AI" },
  ];
  const out = dedupeStories(stories);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, "1");
});

test("dedupeStories collapses punctuation/case variants", () => {
  const stories = [
    { id: "1", title: "GPT-5: the 'super model' — IS HERE!!", source: "OpenAI" },
    { id: "2", title: "gpt 5, the super model is here", source: "Anthropic" },
  ];
  const out = dedupeStories(stories);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, "1");
});

test("dedupeStories keeps unrelated headlines that mention the same company", () => {
  const stories = [
    { id: "1", title: "OpenAI reports record revenue", source: "TechCrunch AI" },
    { id: "2", title: "OpenAI: the inside story of the board", source: "Wired AI" },
  ];
  const out = dedupeStories(stories);
  assert.equal(out.length, 2);
});
