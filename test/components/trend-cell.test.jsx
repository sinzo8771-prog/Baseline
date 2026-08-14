import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrendCell from "../../src/app/components/TrendCell.jsx";

describe("TrendCell", () => {
  it("announces the direction and magnitude for screen readers", () => {
    render(<TrendCell reading={{ direction: "up", delta: 4, pct: 12 }} />);
    expect(screen.getByRole("img", { name: /louder than yesterday/i })).toBeInTheDocument();
  });

  it("shows the placeholder dot when there is no prior reading", () => {
    render(<TrendCell reading={null} />);
    expect(screen.getByText("No prior reading to compare against.")).toBeInTheDocument();
  });

  it("renders a decorative sparkline when a multi-day series is present", () => {
    const series = [
      { date: "2026-08-01", avgHype: 40 },
      { date: "2026-08-02", avgHype: 55 },
      { date: "2026-08-03", avgHype: 48 },
      { date: "2026-08-04", avgHype: 61 },
    ];
    const { container } = render(
      <TrendCell reading={{ direction: "up", delta: 6, pct: 11 }} series={series} />,
    );
    const spark = container.querySelector("svg[aria-hidden='true']");
    expect(spark).not.toBeNull();
    expect(spark.querySelector("polyline")).not.toBeNull();
  });

  it("omits the sparkline when fewer than two days exist", () => {
    const { container } = render(
      <TrendCell reading={{ direction: "down", delta: -2, pct: -5 }} series={[{ date: "2026-08-01", avgHype: 40 }]} />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });
});