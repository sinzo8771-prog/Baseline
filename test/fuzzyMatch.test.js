import { test } from "node:test";
import assert from "node:assert/strict";
import { fuzzyScore, rankMatches } from "../src/app/lib/fuzzyMatch.js";

test("fuzzyScore returns a high score for an empty query", () => {
  assert.equal(fuzzyScore("", "anything"), 1000);
});

test("fuzzyScore returns null for no match", () => {
  assert.equal(fuzzyScore("xyz", "The Hype Index"), null);
  assert.equal(fuzzyScore("zzz", "abc"), null);
});

test("fuzzyScore matches a substring subsequence in order", () => {
  assert.ok(fuzzyScore("hype", "The Hype Index") !== null);
  assert.ok(fuzzyScore("hpi", "The Hype Index") !== null); // h...p...i in order
  assert.ok(fuzzyScore("iph", "The Hype Index") === null); // wrong order
});

test("fuzzyScore rewards consecutive runs and boundaries", () => {
  const scattered = fuzzyScore("ai", "alphabet inc");
  const adjacent = fuzzyScore("ai", "ai news");
  assert.ok(adjacent > scattered);
});

test("fuzzyScore guards bad input", () => {
  assert.equal(fuzzyScore(null, "x"), null);
  assert.equal(fuzzyScore("x", null), null);
});

test("rankMatches returns best matches first, favoring shorter labels on ties", () => {
  const candidates = [
    { id: "story-1", label: "A very long headline about saved tokenization strategies" },
    { id: "page", label: "Saved" },
    { id: "story-2", label: "Silicon saved the day" },
  ];
  const ranked = rankMatches("saved", candidates);
  assert.equal(ranked[0].id, "page"); // short exact-ish label wins the tie
  assert.ok(ranked.length >= 2);
});

test("rankMatches searches keywords alongside the label", () => {
  const candidates = [
    { id: "story-1", label: "Something unrelated", keywords: "hype index score" },
    { id: "story-2", label: "Also unrelated", keywords: "nothing here" },
  ];
  const ranked = rankMatches("index", candidates);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].id, "story-1");
});

test("rankMatches returns empty for a query matching nothing", () => {
  assert.deepEqual(rankMatches("zzz", [{ id: "a", label: "hi" }]), []);
});

test("rankMatches returns everything for an empty query", () => {
  const candidates = [
    { id: "a", label: "one" },
    { id: "b", label: "two" },
  ];
  assert.equal(rankMatches("", candidates).length, 2);
});