import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SourceProfile from "../../src/app/pages/SourceProfile.jsx";

// The edition is the unit every surface measures: a source page's story count,
// its "In today's edition" list, and the Hype Index all describe the same
// capped set (see the note in useBaselineData.composeEdition).
const edition = [
  {
    id: "a",
    title: "Wired alpha story",
    source: "Wired",
    spin: "Hot",
    spinScore: 30,
    flags: [],
    signals: [],
    publishedAt: "2026-08-10T09:00:00Z",
    link: "https://example.com/a",
  },
  {
    id: "b",
    title: "Wired bravo story",
    source: "Wired",
    spin: "Measured",
    spinScore: 4,
    flags: [],
    signals: [],
    publishedAt: "2026-08-10T08:00:00Z",
    link: "https://example.com/b",
  },
  {
    id: "c",
    title: "Someone else's story",
    source: "Reuters",
    spin: "Measured",
    spinScore: 3,
    flags: [],
    signals: [],
    publishedAt: "2026-08-10T07:00:00Z",
    link: "https://example.com/c",
  },
];

const stats = [
  {
    name: "Wired",
    count: 2,
    avgHype: 17,
    bySpin: { Measured: 1, Warm: 0, Hot: 1, "On Fire": 0 },
  },
];

const feeds = [{ name: "Wired", ok: true }];

function renderProfile(name, overrides = {}) {
  return render(
    <MemoryRouter initialEntries={[`/sources/${encodeURIComponent(name)}`]}>
      <Routes>
        <Route
          path="/sources/:name"
          element={
            <SourceProfile
              stories={edition}
              sources={feeds}
              sourceStats={stats}
              loaded
              settled
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

describe("SourceProfile count scope", () => {
  it("lists exactly the edition's stories and agrees with its own count", () => {
    renderProfile("Wired");
    expect(screen.getByText("In today's edition")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /wired (alpha|bravo) story/i })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: /someone else's story/i })).not.toBeInTheDocument();
    // The stat card describes the same edition as the list below it.
    expect(screen.getByText("Stories").closest("div").textContent).toContain("2");
  });
});

describe("SourceProfile lookup before declaring no such desk", () => {
  it("holds the loading state while feeds are still settling", () => {
    // A source's wire can still be in flight: feeds stream in, so a valid
    // source page must not flash "NO SUCH DESK" before the set has settled.
    const { container } = renderProfile("Unknown Wire", {
      stories: [],
      sourceStats: [],
      sources: [],
      settled: false,
    });
    expect(screen.queryByText(/no such desk/i)).not.toBeInTheDocument();
    expect(container.querySelector(".skeleton")).not.toBeNull();
  });

  it("reports no such desk once every feed has settled", () => {
    renderProfile("Unknown Wire", { stories: [], sourceStats: [], sources: [], settled: true });
    expect(screen.getByText(/no such desk/i)).toBeInTheDocument();
  });
});
