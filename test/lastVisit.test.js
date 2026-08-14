import { test } from "node:test";
import assert from "node:assert/strict";
import { readLastVisit, writeLastVisit, isNewSinceLastVisit } from "../src/app/lib/lastVisit.js";

function fakeWindow() {
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.window = { localStorage };
  return store;
}

test("readLastVisit returns null when nothing was stored", () => {
  fakeWindow();
  assert.equal(readLastVisit(), null);
});

test("writeLastVisit then readLastVisit roundtrips an ISO timestamp", () => {
  fakeWindow();
  const ts = Date.parse("2026-08-13T10:00:00Z");
  writeLastVisit(ts);
  assert.equal(readLastVisit(), ts);
});

test("readLastVisit ignores garbage in storage", () => {
  const store = fakeWindow();
  store.set("baseline-last-visit-v1", "not a timestamp");
  assert.equal(readLastVisit(), null);
});

test("isNewSinceLastVisit is false without a baseline (first visit)", () => {
  assert.equal(isNewSinceLastVisit("2026-08-13T10:00:00Z", null), false);
  assert.equal(isNewSinceLastVisit("2026-08-13T10:00:00Z", undefined), false);
});

test("isNewSinceLastVisit flags only stories published after the visit", () => {
  const visit = Date.parse("2026-08-13T10:00:00Z");
  assert.equal(isNewSinceLastVisit("2026-08-13T09:00:00Z", visit), false);
  assert.equal(isNewSinceLastVisit("2026-08-13T10:00:00Z", visit), false); // exactly on the boundary: not new
  assert.equal(isNewSinceLastVisit("2026-08-13T11:00:00Z", visit), true);
});

test("isNewSinceLastVisit never flags a story with an unusable date", () => {
  const visit = Date.parse("2026-08-13T10:00:00Z");
  assert.equal(isNewSinceLastVisit("", visit), false);
  assert.equal(isNewSinceLastVisit(null, visit), false);
  assert.equal(isNewSinceLastVisit(undefined, visit), false);
});