import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readSavedStories,
  saveStory,
  removeSavedStory,
  toggleSaved,
  isSaved,
  reconcileSaved,
} from "../src/app/lib/savedStories.js";

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

const story = {
  id: "a",
  title: "Alpha headline",
  summary: "A summary.",
  link: "https://example.com/a",
  source: "Wired",
  spin: "Hot",
  spinScore: 42,
  flags: ["benchmark claim"],
  signals: [{ id: "benchmark", category: "benchmark", label: "benchmark claim", points: 6 }],
  hedged: false,
  publishedAt: "2026-08-13T09:00:00Z",
  image: "https://example.com/a.jpg",
};

test("savedStories starts empty", () => {
  fakeWindow();
  assert.deepEqual(readSavedStories(), []);
  assert.equal(isSaved("a"), false);
});

test("saveStory persists a snapshot and isSaved reflects it", () => {
  fakeWindow();
  saveStory(story);
  assert.equal(isSaved("a"), true);
  const list = readSavedStories();
  assert.equal(list.length, 1);
  assert.equal(list[0].title, "Alpha headline");
  assert.equal(typeof list[0].savedAt, "number");
});

test("saveStory is idempotent for the same id", () => {
  fakeWindow();
  saveStory(story);
  saveStory(story);
  assert.equal(readSavedStories().length, 1);
});

test("removeSavedStory drops only the requested id", () => {
  fakeWindow();
  saveStory(story);
  saveStory({ ...story, id: "b", title: "Bravo" });
  removeSavedStory("a");
  const list = readSavedStories();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "b");
});

test("toggleSaved toggles and returns the new state", () => {
  fakeWindow();
  assert.equal(toggleSaved(story), true);
  assert.equal(isSaved("a"), true);
  assert.equal(toggleSaved(story), false);
  assert.equal(isSaved("a"), false);
});

test("readSavedStories ignores corruption", () => {
  const store = fakeWindow();
  store.set("baseline-saved-stories-v1", "not json");
  assert.deepEqual(readSavedStories(), []);
});

test("savedStories ignores garbage entries", () => {
  const store = fakeWindow();
  store.set("baseline-saved-stories-v1", JSON.stringify([{ id: 5 }, "junk", { id: "ok", title: "Fine" }]));
  const list = readSavedStories();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "ok");
});

test("reconcileSaved keeps aged-out stories and refreshes live ones", () => {
  fakeWindow();
  saveStory(story); // "a" is still live
  saveStory({ ...story, id: "gone", title: "Aged out of the feed" });
  const live = [{ ...story, title: "Refreshed headline" }];
  const merged = reconcileSaved(live);
  assert.equal(merged.length, 2);
  const refreshed = merged.find((s) => s.id === "a");
  assert.equal(refreshed.title, "Refreshed headline");
  const aged = merged.find((s) => s.id === "gone");
  assert.equal(aged.title, "Aged out of the feed");
});