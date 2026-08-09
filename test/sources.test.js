import { test } from "node:test";
import assert from "node:assert/strict";
import { sourceStatuses } from "../src/app/hooks/useBaselineData.js";

test("sourceStatuses maps feed results to {name, ok, error}", () => {
  const results = [
    { source: "OpenAI", stories: [], error: undefined },
    { source: "Anthropic", stories: [], error: "HTTP 403" },
  ];
  const out = sourceStatuses(results);
  assert.equal(out[0].name, "OpenAI");
  assert.equal(out[0].ok, true);
  assert.equal(out[0].error, undefined);
  assert.equal(out[1].name, "Anthropic");
  assert.equal(out[1].ok, false);
  assert.equal(out[1].error, "HTTP 403");
});

test("sourceStatuses output sorts by name without crashing", () => {
  const sources = sourceStatuses([
    { source: "OpenAI", stories: [] },
    { source: "Anthropic", stories: [], error: "down" },
    { source: "Wired AI", stories: [] },
  ]);
  const sorted = [...sources].sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? 1 : -1;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
  assert.equal(sorted.length, 3);
  assert.equal(sorted[0].name, "Anthropic");
});
