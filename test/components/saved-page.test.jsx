import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    location: { origin: "http://localhost" },
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

  it("downloads the saved list as a JSON Feed file with the right story count", async () => {
    const createObjectURL = vi.fn(() => "blob:mock");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    const clickSpy = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(clickSpy);

    saveStory(story);
    renderSaved([story]);
    fireEvent.click(screen.getByRole("button", { name: "Download saved stories" }));

    expect(clickSpy).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    const feed = JSON.parse(await blob.text());
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].title).toBe("A saved headline");
  });
});