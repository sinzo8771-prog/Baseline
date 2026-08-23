import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import StoryPage from "../../src/app/pages/StoryPage.jsx";

const stories = [
  {
    id: "a",
    title: "Alpha story in the edition",
    source: "Wired",
    spin: "Measured",
    spinScore: 12,
    flags: [],
    signals: [],
    hedged: false,
    publishedAt: "2026-08-10T09:00:00Z",
    link: "https://example.com/a",
  },
  {
    id: "b",
    title: "Bravo story with the highest score",
    source: "OpenAI",
    spin: "On Fire",
    spinScore: 88,
    flags: [],
    signals: [],
    hedged: false,
    publishedAt: "2026-08-10T10:00:00Z",
    link: "https://example.com/b",
  },
  {
    id: "c",
    title: "Charlie story, calm and new",
    source: "Reuters",
    spin: "Measured",
    spinScore: 8,
    flags: [],
    signals: [],
    hedged: false,
    publishedAt: "2026-08-10T11:00:00Z",
    link: "https://example.com/c",
  },
];

function renderStory(id, overrides = {}) {
  return render(
    <MemoryRouter initialEntries={[`/story/${id}`]}>
      <Routes>
        <Route
          path="/story/:id"
          element={
            <StoryPage
              stories={stories}
              allStories={stories}
              loaded
              offline={false}
              reload={() => {}}
              {...overrides}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("StoryPage prev/next navigation", () => {
  it("links to the previous and next stories in edited order", () => {
    // With every story well past the 20-hour freshness window, edited order
    // falls back to spinScore: Bravo (88) first, Alpha (12) second, Charlie
    // (8) third. Alpha, ranked middle, sees both neighbors.
    renderStory("a");
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Bravo story with the highest score")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Charlie story, calm and new")).toBeInTheDocument();
  });

  it("shows only a next link for the lead story", () => {
    // Bravo leads the edition, so it has no Previous, only Next (Alpha).
    renderStory("b");
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Alpha story in the edition")).toBeInTheDocument();
  });

  it("shows only a previous link for the trailing story", () => {
    // Charlie trails the edition, so it has no Next, only Previous (Alpha).
    renderStory("c");
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Alpha story in the edition")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("renders no nav when the story is alone in the edition", () => {
    const [only] = stories;
    renderStory("a", { stories: [only], allStories: [only] });
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("points back at the edition page", () => {
    renderStory("b");
    const back = screen.getByText("Back to the edition").closest("a");
    expect(back).not.toBeNull();
    expect(back.getAttribute("href")).toBe("/edition");
  });
});

describe("StoryPage share/copy buttons", () => {
  afterEach(() => {
    Reflect.deleteProperty(window.navigator, "share");
  });

  it("renders a single Copy link button and no Share button when navigator.share is unavailable", () => {
    // Desktop browsers mostly lack the Web Share API; the Share button must be
    // hidden entirely instead of relabeled to duplicate the copy action.
    Reflect.deleteProperty(window.navigator, "share");
    renderStory("a");

    const copyButtons = screen.getAllByRole("button", { name: /^copy link$/i });
    expect(copyButtons).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /^share$/i })).not.toBeInTheDocument();
  });

  it("renders distinct Share and Copy link buttons when navigator.share is available", async () => {
    // Mobile/PWA contexts expose navigator.share; both actions stay visible
    // and differently labeled, and Share opens the native sheet.
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "share", { configurable: true, value: share, writable: true });
    renderStory("a");

    const shareButton = screen.getByRole("button", { name: /^share$/i });
    expect(screen.getAllByRole("button", { name: /^copy link$/i })).toHaveLength(1);

    await shareButton.click();
    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Alpha story in the edition", url: expect.stringContaining("/story/a") }),
    );
  });
});