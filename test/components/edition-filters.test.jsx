import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../src/app/pages/Home.jsx";

const stories = [
  { id: "1", title: "A measured note", source: "Reuters", spin: "Measured", spinScore: 12, publishedAt: "2026-08-23T09:00:00Z", summary: "", link: "https://example.com/1", flags: [], signals: [], hedged: false },
  { id: "2", title: "A hot take on models", source: "Wired", spin: "Hot", spinScore: 71, publishedAt: "2026-08-23T08:00:00Z", summary: "", link: "https://example.com/2", flags: ["high-intensity language"], signals: [], hedged: false },
  { id: "3", title: "A warm analysis", source: "Reuters", spin: "Warm", spinScore: 38, publishedAt: "2026-08-23T07:00:00Z", summary: "", link: "https://example.com/3", flags: [], signals: [], hedged: false },
];

const sources = [
  { name: "Reuters", ok: true },
  { name: "Wired", ok: true },
  { name: "Quiet Blog", ok: false, error: "HTTP 503" },
];

function renderHome(props = {}, route = "/edition") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Home
        stories={stories}
        offline={false}
        loaded={true}
        reload={vi.fn()}
        servedFromCache={false}
        savedAt={null}
        lastVisit={null}
        sources={sources}
        settled={true}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("Edition filter disclosure", () => {
  it("keeps the spin controls collapsed until Filter is activated", () => {
    renderHome();
    const toggle = screen.getByRole("button", { name: /^Filter/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "edition-filters");
    expect(screen.queryByText(/the spin scale/i)).not.toBeInTheDocument();
  });

  it("opens the panel with legend and chips, and filters from inside it", () => {
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: /^Filter/ }));
    const panel = document.getElementById("edition-filters");
    expect(panel).not.toBeNull();
    expect(within(panel).getByText(/the spin scale/i)).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole("button", { name: /^Hot/ }));
    expect(screen.getByRole("button", { name: /^Filter/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/searching 1 story/i)).toBeInTheDocument();
  });

  it("counts active filters in the toggle, including a ?source= deep link", () => {
    renderHome({}, "/edition?source=Reuters");
    const toggle = screen.getByRole("button", { name: /^Filter/ });
    expect(toggle.textContent).toContain("1");
    expect(screen.getByRole("button", { name: /stop filtering by Reuters/i })).toBeInTheDocument();
  });
});

describe("Partial ingestion notice", () => {
  it("surfaces failed sources calmly once the edition has settled", () => {
    renderHome();
    expect(screen.getByText(/1 of 3 sources did not respond today/i)).toBeInTheDocument();
  });

  it("stays hidden while results are still streaming in", () => {
    renderHome({ settled: false });
    expect(screen.queryByText(/did not respond today/i)).not.toBeInTheDocument();
  });

  it("stays hidden when every source reported", () => {
    renderHome({ sources: sources.map((s) => ({ ...s, ok: true })) });
    expect(screen.queryByText(/did not respond today/i)).not.toBeInTheDocument();
  });
});
