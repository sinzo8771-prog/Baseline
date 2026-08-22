import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";

import { saveStory } from "../../src/app/lib/savedStories.js";
import CommandPalette from "../../src/app/components/CommandPalette.jsx";
import HypeIndex from "../../src/app/pages/HypeIndex.jsx";
import Saved from "../../src/app/pages/Saved.jsx";
import Sources from "../../src/app/pages/Sources.jsx";
import StoryModal from "../../src/app/components/StoryModal.jsx";
import TrendCell from "../../src/app/components/TrendCell.jsx";
import WeekInReview from "../../src/app/pages/WeekInReview.jsx";

// In jsdom, Tailwind doesn't produce real computed styles, so
// color-contrast returns artifact violations. Disable that one rule and
// assert the rest: run standalone with
// `npx vitest run test/components/a11y.test.jsx` per the plan.
async function assertNoViolations(container) {
  const { violations } = await axe(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(violations).toHaveLength(0);
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const fullStory = {
  id: "m0ck1",
  title: "A measured headline about a thing that happened",
  summary: "A short summary used to verify the modal renders the summary copy too.",
  link: "https://example.com/m0ck1",
  source: "Reuters",
  spin: "Measured",
  spinScore: 28,
  flags: [],
  signals: [],
  hedged: false,
  publishedAt: "2026-08-14T09:00:00Z",
  image: null,
};

const paletteStories = [
  { id: "p1", title: "OpenAI ships a quieter model", source: "TechCrunch", summary: "A calmer release cycle.", link: "https://example.com/1" },
  { id: "p2", title: "Regulators eye the frontier", source: "Reuters", summary: "Policy talk heats up.", link: "https://example.com/2" },
];

const series = [
  { date: "2026-08-11", avgHype: 40 },
  { date: "2026-08-12", avgHype: 55 },
  { date: "2026-08-13", avgHype: 48 },
  { date: "2026-08-14", avgHype: 61 },
];

function seedSourceHistory() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const payload = [{
    date: iso(today),
    sources: [{ name: "Reuters", count: 3, avgHype: 62 }, { name: "TechCrunch", count: 2, avgHype: 48 }],
  }, {
    date: iso(yesterday),
    sources: [{ name: "Reuters", count: 4, avgHype: 55 }, { name: "TechCrunch", count: 2, avgHype: 50 }],
  }];
  window.localStorage.setItem("baseline-source-history-v1", JSON.stringify(payload));
}

function seedHypeHistory(days = 5) {
  const today = new Date();
  const entries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    entries.push({
      date: iso(d),
      hypePercent: 40 + i * 4,
      total: 18,
      bySpin: { Measured: 6, Warm: 5, Hot: 4, "On Fire": 3 },
      signals: { language: 5, superlatives: 3, benchmark: 2 },
    });
  }
  window.localStorage.setItem("baseline-hype-history-v1", JSON.stringify(entries));
}

describe("axe accessibility", () => {
  it("StoryModal has no violations", async () => {
    const { container } = render(<StoryModal story={fullStory} onClose={() => {}} />);
    await assertNoViolations(container);
  });

  it("CommandPalette (open) has no violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <CommandPalette open={true} onClose={() => {}} stories={paletteStories} />
      </MemoryRouter>,
    );
    await assertNoViolations(container);
  });

  it("TrendCell (with sparkline) has no violations", async () => {
    const { container } = render(
      <TrendCell reading={{ direction: "up", delta: 4, pct: 12 }} series={series} />,
    );
    await assertNoViolations(container);
  });

  it("Sources page (leaderboard + sparklines + feed list) has no violations", async () => {
    seedSourceHistory();
    const { container } = render(
      <MemoryRouter>
        <Sources
          sources={[
            { name: "Reuters", ok: true },
            { name: "TechCrunch", ok: true },
            { name: "Down Blog", ok: false, error: "no signal" },
          ]}
          sourceStats={[
            { name: "Reuters", count: 3, avgHype: 62 },
            { name: "TechCrunch", count: 2, avgHype: 48 },
          ]}
          loaded={true}
          offline={false}
          reload={() => {}}
        />
      </MemoryRouter>,
    );
    await assertNoViolations(container);
  });

  it("HypeIndex (full reading, chart, why-today) has no violations", async () => {
    seedHypeHistory(5);
    const { container } = render(
      <MemoryRouter>
        <HypeIndex
          stats={{
            hypePercent: 56,
            total: 20,
            bySpin: { Measured: 6, Warm: 5, Hot: 5, "On Fire": 4 },
            signalBreakdown: { language: 8, superlatives: 5, benchmark: 3 },
          }}
          allStories={[fullStory]}
          loaded={true}
          offline={false}
          reload={() => {}}
        />
      </MemoryRouter>,
    );
    await assertNoViolations(container);
    // Regression guard for the 99b2de1 trend fix: the trend plots
    // oldest-first, so the newest reading sits at the end of both the SVG
    // series listing and the calendar strip, never at the front.
    const chart = container.querySelector('svg[role="img"][aria-label^="Hype Index over"]');
    expect(chart).not.toBeNull();
    const cal = container.querySelector('div[role="list"]');
    expect(cal).not.toBeNull();
    const days = [...cal.querySelectorAll('[role="listitem"]')];
    expect(days.length).toBeGreaterThan(1);
    expect(days[days.length - 1].textContent.toLowerCase()).toContain("today");
    expect(days[0].textContent.toLowerCase()).not.toContain("today");
  });

  it("WeekInReview (empty and partial-week) has no violations", async () => {
    seedHypeHistory(0);
    const empty = render(
      <MemoryRouter>
        <WeekInReview />
      </MemoryRouter>,
    );
    await assertNoViolations(empty.container);
    empty.unmount();

    seedHypeHistory(2);
    const partial = render(
      <MemoryRouter>
        <WeekInReview />
      </MemoryRouter>,
    );
    await assertNoViolations(partial.container);
  });

  it("Saved page (empty and populated) has no violations", async () => {
    const empty = render(
      <MemoryRouter>
        <Saved stories={[]} />
      </MemoryRouter>,
    );
    await assertNoViolations(empty.container);
    empty.unmount();

    saveStory({ ...fullStory, id: "saved-1" });
    const populated = render(
      <MemoryRouter>
        <Saved stories={[]} />
      </MemoryRouter>,
    );
    await assertNoViolations(populated.container);
  });
});