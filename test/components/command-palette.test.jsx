import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommandPalette from "../../src/app/components/CommandPalette.jsx";

const stories = [
  {
    id: "s1",
    title: "OpenAI ships a quieter model",
    source: "TechCrunch",
    summary: "A calmer release cycle.",
    link: "https://example.com/1",
  },
  {
    id: "s2",
    title: "Regulators eye the frontier",
    source: "Reuters",
    summary: "Policy talk heats up.",
    link: "https://example.com/2",
  },
];

function renderPalette({ open = true, onClose = vi.fn() } = {}) {
  return render(
    <MemoryRouter>
      <CommandPalette open={open} onClose={onClose} stories={stories} />
    </MemoryRouter>,
  );
}

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    renderPalette({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows pages and stories when open", () => {
    renderPalette();
    expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();
    expect(screen.getByText("Go to the Edition")).toBeInTheDocument();
    expect(screen.getByText("OpenAI ships a quieter model")).toBeInTheDocument();
    expect(screen.getByText("The Hype Index")).toBeInTheDocument();
  });

  it("filters results as the query narrows", () => {
    renderPalette();
    const input = screen.getByLabelText(/search stories and pages/i);
    fireEvent.change(input, { target: { value: "regulat" } });
    expect(screen.getByText("Regulators eye the frontier")).toBeInTheDocument();
    expect(screen.queryByText("OpenAI ships a quieter model")).not.toBeInTheDocument();
    expect(screen.queryByText("The Hype Index")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    renderPalette();
    const input = screen.getByLabelText(/search stories and pages/i);
    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(screen.getByText(/no stories or pages match/i)).toBeInTheDocument();
  });

  it("invokes onClose on Enter to open a matched story", () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    const input = screen.getByLabelText(/search stories and pages/i);
    fireEvent.change(input, { target: { value: "openai ships" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // The palette is controlled by its parent (App toggles `open`); closing is
    // the parent's job, so the handler must at least request it.
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    renderPalette({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when the overlay is clicked", () => {
    const onClose = vi.fn();
    const { container } = renderPalette({ onClose });
    const overlay = container.querySelector(".fixed.inset-0");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});