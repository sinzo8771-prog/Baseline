import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WeekInReview from "../../src/app/pages/WeekInReview.jsx";

function dayKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seedHistory() {
  const entries = [
    { date: dayKey(0), hypePercent: 62, total: 20, bySpin: {}, signals: { language: 8, superlatives: 4, benchmark: 3 } },
    { date: dayKey(1), hypePercent: 55, total: 18, bySpin: {}, signals: { language: 5, superlatives: 7, benchmark: 3 } },
    { date: dayKey(2), hypePercent: 48, total: 16, bySpin: {}, signals: { language: 3, superlatives: 4, benchmark: 6 } },
  ];
  window.localStorage.setItem("baseline-hype-history-v1", JSON.stringify(entries));
}

describe("Week in review theme panel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the theme mix from recorded signal history", () => {
    seedHistory();
    render(
      <MemoryRouter>
        <WeekInReview />
      </MemoryRouter>,
    );
    expect(screen.getByText(/theme mix, week's end vs week's start/i)).toBeInTheDocument();
    expect(screen.getByText("Superlatives")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /partial week/i })).toBeInTheDocument();
  });

  it("renders no theme claim without recorded history", () => {
    render(
      <MemoryRouter>
        <WeekInReview />
      </MemoryRouter>,
    );
    expect(screen.getByText(/the baseline hasn't settled/i)).toBeInTheDocument();
    expect(screen.queryByText(/theme mix/i)).not.toBeInTheDocument();
  });
});
