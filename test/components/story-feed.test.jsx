import { describe, it, expect, vi, beforeEach } from "vitest";
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
