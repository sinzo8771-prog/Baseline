import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Saved from "../../src/app/pages/Saved.jsx";
import { saveStory, readSavedStories } from "../../src/app/lib/savedStories.js";

const story = {
  id: "a",
  title: "A saved headline",
  summary: "Saved for later.",
  link: "https://example.com/a",
  source: "Wired",
  spin: "Hot",
  spinScore: 42,
  flags: [],
  signals: [],
  hedged: false,
  publishedAt: "2026-08-13T09:00:00Z",
};

beforeEach(() => {
  const store = new Map();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function renderSaved(stories = []) {
  return render(
    <MemoryRouter>
      <Saved stories={stories} />
    </MemoryRouter>,
  );
}

describe("Saved page", () => {
  it("shows the empty state when nothing is saved", () => {
    renderSaved();
    expect(screen.getByText(/the file is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing saved yet/i)).toBeInTheDocument();
  });

  it("renders saved stories even when they are not in today's edition", () => {
    saveStory(story);
    renderSaved([]); // live edition doesn't contain it
    expect(screen.getByText("A saved headline")).toBeInTheDocument();
    expect(screen.queryByText(/nothing saved yet/i)).not.toBeInTheDocument();
  });

  it("counts the saved stories", () => {
    saveStory(story);
    renderSaved([story]);
    expect(screen.getByText(/1 saved\./)).toBeInTheDocument();
  });
});