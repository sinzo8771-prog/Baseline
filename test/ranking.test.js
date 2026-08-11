import { test } from "node:test";
import assert from "node:assert/strict";
import { editedScore, editedRank, sortStories } from "../src/lib/ranking.js";

const now = Date.UTC(2026, 7, 11, 12, 0, 0); // fixed "today"
const H = 3.6e6;

function story(overrides) {
  return {
    id: overrides.id ?? "s",
    title: overrides.title ?? "A story",
    source: overrides.source ?? "OpenAI",
    publishedAt: overrides.publishedAt ?? new Date(now - H).toISOString(),
    spinScore: overrides.spinScore ?? 0,
    spin: overrides.spin ?? "Measured",
    ...overrides,
  };
}

test("editedScore favors freshness over hype", () => {
  const freshCalm = story({ publishedAt: new Date(now - H).toISOString(), spinScore: 10 });
  const oldHype = story({ publishedAt: new Date(now - 24 * H).toISOString(), spinScore: 90 });
  assert.ok(editedScore(freshCalm, now) > editedScore(oldHype, now));
});

test("editedRank puts a calm but important story above a mediocre hype story", () => {
  const calm = story({ id: "calm", publishedAt: new Date(now - H).toISOString(), spinScore: 0 });
  const hype = story({ id: "hype", publishedAt: new Date(now - 30 * H).toISOString(), spinScore: 90 });
  const out = editedRank([hype, calm], { now });
  assert.equal(out[0].id, "calm");
});

test("editedRank caps one source in the top window", () => {
  const a1 = story({ id: "a1", source: "OpenAI", publishedAt: new Date(now - H).toISOString(), spinScore: 80 });
  const a2 = story({ id: "a2", source: "OpenAI", publishedAt: new Date(now - 2 * H).toISOString(), spinScore: 80 });
  const a3 = story({ id: "a3", source: "OpenAI", publishedAt: new Date(now - 3 * H).toISOString(), spinScore: 80 });
  const b = story({ id: "b1", source: "Anthropic", publishedAt: new Date(now - H).toISOString(), spinScore: 60 });
  const c = story({ id: "c1", source: "DeepMind", publishedAt: new Date(now - H).toISOString(), spinScore: 60 });
  const out = editedRank([a1, a2, a3, b, c], { now });
  // The two fresh hyped OpenAI stories lead, but the third is pushed past the
  // freshest story from another source instead of stacking three in a row.
  const at = (id) => out.findIndex((s) => s.id === id);
  assert.equal(at("a1"), 0);
  assert.equal(at("a2"), 1);
  assert.ok(at("a3") > at("b1"));
  assert.ok(at("a3") > at("c1"));
});

test("editedRank still includes every story on a single-source day", () => {
  const stories = [1, 2, 3, 4, 5, 6].map((n) =>
    story({ id: `a${n}`, source: "OpenAI", publishedAt: new Date(now - n * H).toISOString() }),
  );
  const out = editedRank(stories, { now });
  assert.equal(out.length, 6);
  assert.equal(new Set(out.map((s) => s.id)).size, 6);
});

test("sortStories maps views to the pure sorts", () => {
  const older = story({ id: "old", publishedAt: new Date(now - 5 * H).toISOString(), spinScore: 0 });
  const newer = story({ id: "new", publishedAt: new Date(now - H).toISOString(), spinScore: 0 });
  assert.equal(sortStories([older, newer], "newest")[0].id, "new");
  assert.equal(sortStories([older, newer], "hottest")[0].id, "new");
});

test("sortStories 'source' orders by source name", () => {
  const zed = story({ id: "zed", source: "Zeta", publishedAt: new Date(now - H).toISOString() });
  const alpha = story({ id: "alpha", source: "Alpha", publishedAt: new Date(now - H).toISOString() });
  assert.deepEqual(sortStories([zed, alpha], "source").map((s) => s.source), ["Alpha", "Zeta"]);
});
