import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SignalBreakdown from "../../src/app/components/SignalBreakdown.jsx";
import SpinBadge from "../../src/app/components/SpinBadge.jsx";
import StoryFeed from "../../src/app/components/StoryFeed.jsx";

const storyWithSignals = {
  id: "s1",
  title: "Revolutionary AI breakthrough",
  source: "OpenAI",
  spin: "Hot",
  spinScore: 29,
  flags: ["high-intensity language", "benchmark claim", "stacked claims"],
  signals: [
    { id: "language", category: "language", label: "high-intensity language", points: 10 },
    { id: "benchmark", category: "benchmark", label: "benchmark claim", points: 6 },
    { id: "stacked", category: "combo", label: "stacked claims", points: 8 },
  ],
  hedged: false,
  publishedAt: "2026-08-09T10:00:00Z",
  link: "https://example.com/1",
};

describe("SignalBreakdown", () => {
  it("lists each fired signal with its exact points", () => {
    render(<SignalBreakdown signals={storyWithSignals.signals} hedged={false} />);
    expect(screen.getByText("high-intensity language")).toBeInTheDocument();
    expect(screen.getByText("benchmark claim")).toBeInTheDocument();
    expect(screen.getByText("+10 pts")).toBeInTheDocument();
    expect(screen.getByText("+6 pts")).toBeInTheDocument();
    expect(screen.getByText("+8 pts")).toBeInTheDocument();
  });

  it("always states the intensity-not-truth disclaimer", () => {
    render(<SignalBreakdown signals={storyWithSignals.signals} hedged={false} />);
    expect(screen.getByText(/not whether the story is true/i)).toBeInTheDocument();
  });

  it("notes when hedged research framing halves word weight", () => {
    render(<SignalBreakdown signals={storyWithSignals.signals} hedged />);
    expect(screen.getByText(/hedged research framing/i)).toBeInTheDocument();
  });

  it("renders a sober message when no signals fired", () => {
    render(<SignalBreakdown signals={[]} hedged={false} />);
    expect(screen.getByText(/no hype signals detected/i)).toBeInTheDocument();
  });
});

describe("SpinBadge", () => {
  it("renders the spin label and an sr-only reason", () => {
    render(<SpinBadge spin="Hot" flags={storyWithSignals.flags} />);
    expect(screen.getByText("Hot")).toBeInTheDocument();
    expect(screen.getByText(/Hot — .*stacked claims/)).toBeInTheDocument();
  });

  it("opens the breakdown on click (keyboard/touch reachable, not hover-only)", async () => {
    const user = userEvent.setup();
    render(
      <SpinBadge
        spin="Hot"
        flags={storyWithSignals.flags}
        signals={storyWithSignals.signals}
        hedged={storyWithSignals.hedged}
        score={storyWithSignals.spinScore}
      />,
    );
    // The breakdown is inside a closed <details>; open it by activating the
    // summary (keyboard/touch reachable, not hover-only).
    await user.click(screen.getByText(/why was this flagged/i));
    expect(await screen.findByText("high-intensity language")).toBeInTheDocument();
    expect(screen.getByText(/not whether the story is true/i)).toBeInTheDocument();
  });
});

describe("StoryModal (via StoryFeed)", () => {
  it("opens a story modal and closes on Escape", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <StoryFeed stories={[storyWithSignals]} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /open story: revolutionary/i }));

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: /revolutionary ai breakthrough/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("focuses the close button on open (focus management)", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <StoryFeed stories={[storyWithSignals]} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /open story: revolutionary/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /close story/i })).toHaveFocus();
  });
});

describe("StoryFeed consistent image slots", () => {
  const withImage = { ...storyWithSignals, image: "https://example.com/a.jpg" };
  const withoutImage = { ...storyWithSignals, id: "s2", title: "Text-only bulletin", image: undefined };

  it("renders an image inside a fixed-height slot", () => {
    const { container } = render(
      <MemoryRouter>
        <StoryFeed stories={[withImage]} />
      </MemoryRouter>,
    );
    const img = container.querySelector(".card-img-slot img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe("https://example.com/a.jpg");
    expect(img.getAttribute("alt")).toBe("");
  });

  it("renders the text-only placeholder when no image exists", () => {
    const { container } = render(
      <MemoryRouter>
        <StoryFeed stories={[withoutImage]} />
      </MemoryRouter>,
    );
    expect(container.querySelector(".card-img-placeholder")).not.toBeNull();
    expect(container.querySelector(".card-img-slot img")).toBeNull();
  });

  it("falls back to the placeholder when an image fails to load", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <StoryFeed stories={[withImage]} />
      </MemoryRouter>,
    );
    const img = container.querySelector(".card-img-slot img");
    act(() => {
      img.dispatchEvent(new Event("error"));
    });
    await waitFor(() => expect(container.querySelector(".card-img-placeholder")).not.toBeNull());
    expect(container.querySelector(".card-img-slot img")).toBeNull();
  });

  it("loads the lead story's image eagerly with high priority while cards stay lazy", () => {
    const lead = { ...withImage, id: "lead1", title: "Lead story" };
    const second = { ...withImage, id: "second1", title: "Second story" };
    const { container } = render(
      <MemoryRouter>
        <StoryFeed stories={[lead, second]} />
      </MemoryRouter>,
    );
    const leadImg = container.querySelector("#story-lead1 .card-img-slot img");
    const gridImg = container.querySelector("#story-second1 .card-img-slot img");
    expect(leadImg.getAttribute("loading")).toBe("eager");
    expect(leadImg.getAttribute("fetchpriority")).toBe("high");
    expect(gridImg.getAttribute("loading")).toBe("lazy");
  });
});

describe("StoryFeed NEW badges", () => {
  const visit = Date.parse("2026-08-13T10:00:00Z");
  const fresh = { ...storyWithSignals, id: "n1", title: "Filed after my last visit", publishedAt: "2026-08-13T12:00:00Z" };
  const old = { ...storyWithSignals, id: "o1", title: "Filed before my last visit", publishedAt: "2026-08-12T09:00:00Z" };

  it("badges stories published after the last visit", () => {
    render(
      <MemoryRouter>
        <StoryFeed stories={[fresh, old]} lastVisit={visit} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("New").length).toBe(1);
  });

  it("badges nothing on a first visit (no baseline)", () => {
    render(
      <MemoryRouter>
        <StoryFeed stories={[fresh]} lastVisit={null} />
      </MemoryRouter>,
    );
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });
});
