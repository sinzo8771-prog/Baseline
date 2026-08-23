import { test } from "node:test";
import assert from "node:assert/strict";
import { relUpdated } from "../src/app/lib/freshness.js";

const NOW = Date.parse("2026-08-23T12:00:00Z");
const minsAgo = (n) => new Date(NOW - n * 60_000).toISOString();

test("relUpdated: under a minute reads 'just now'", () => {
  assert.equal(relUpdated(minsAgo(0.2), NOW), "just now");
});

test("relUpdated: minutes", () => {
  assert.equal(relUpdated(minsAgo(1), NOW), "1 min ago");
  assert.equal(relUpdated(minsAgo(42), NOW), "42 min ago");
  assert.equal(relUpdated(minsAgo(59), NOW), "59 min ago");
});

test("relUpdated: hours", () => {
  assert.equal(relUpdated(minsAgo(60), NOW), "1 hr ago");
  assert.equal(relUpdated(minsAgo(90), NOW), "1 hr ago");
  assert.equal(relUpdated(minsAgo(23 * 60), NOW), "23 hr ago");
});

test("relUpdated: days pluralize", () => {
  assert.equal(relUpdated(minsAgo(24 * 60), NOW), "1 day ago");
  assert.equal(relUpdated(minsAgo(3 * 24 * 60), NOW), "3 days ago");
});

test("relUpdated: garbage and future timestamps stay calm", () => {
  assert.equal(relUpdated("not a date", NOW), "just now");
  assert.equal(relUpdated(new Date(NOW + 60_000).toISOString(), NOW), "just now");
});
