import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Landing from "../../src/app/pages/Landing.jsx";

const stats = { hypePercent: 42, total: 12, bySpin: {}, generatedAt: new Date().toISOString() };

function renderLanding(props = {}) {
  return render(
    <MemoryRouter>
      <Landing
        stories={[]}
        stats={stats}
        sourceStats={[]}
        offline={false}
        loaded={true}
        showToast={() => {}}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("Landing hero", () => {
  it("puts the Hype Index in the hero with the intensity descriptor", () => {
    renderLanding();
    expect(screen.getByText("Today's Hype Index")).toBeInTheDocument();
    expect(screen.getByText("Headline intensity across today's tracked AI news.")).toBeInTheDocument();
    expect(screen.getByText(/not truth, quality, or importance/)).toBeInTheDocument();
  });

  it("shows the score and the tracked-source metadata", () => {
    const { container } = renderLanding();
    expect(container.querySelector(".fp-hero-score .val")?.textContent).toContain("42");
    expect(screen.getByText(/12 stories · 10 sources tracked/i)).toBeInTheDocument();
  });

  it("routes the primary CTA to the edition and the secondary to methodology", () => {
    renderLanding();
    // "Read today's edition" is both the hero CTA and the closing band's CTA;
    // every instance must route to the edition.
    const ctas = screen.getAllByRole("link", { name: /read today's edition/i });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/edition");
    }
    expect(screen.getByRole("link", { name: /why this score\?/i })).toHaveAttribute("href", "/methodology");
  });

  it("explains the score with the tier scale and an itemized live example when a flagged story exists", () => {
    const scored = [
      {
        id: "s1",
        title: "Startup unveils revolutionary breakthrough",
        source: "Wired AI",
        publishedAt: new Date().toISOString(),
        spin: "Hot",
        spinScore: 30,
        flags: ["boastful phrasing"],
        signals: [{ id: "boast", category: "language", label: "boastful phrasing", points: 12 }],
        hedged: false,
      },
    ];
    renderLanding({ stories: scored });
    expect(screen.getByText("How a score is built")).toBeInTheDocument();
    expect(screen.getByText("Today's loudest headline, itemized")).toBeInTheDocument();
    // The story is both the Lead and the example, so its headline links twice.
    const headlineLinks = screen.getAllByRole("link", { name: /revolutionary breakthrough/i });
    expect(headlineLinks.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("boastful phrasing").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("+12")).toBeInTheDocument();
  });

  it("admits the edition is quiet instead of inventing an example", () => {
    renderLanding({ stories: [] });
    expect(screen.getByText(/running measured/i)).toBeInTheDocument();
  });

  it("shows an honest placeholder while the wires are still arriving", () => {
    renderLanding({ loaded: false, stats: null });
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText(/setting today's type/i)).toBeInTheDocument();
    expect(screen.queryByText(/42/)).not.toBeInTheDocument();
  });

  it("admits when no reading is available offline", () => {
    renderLanding({ loaded: true, offline: true, stats: null });
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText(/no reading available right now/i)).toBeInTheDocument();
  });
});
