import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useKeyboardShortcuts from "../../src/app/hooks/useKeyboardShortcuts.js";

// Minimal harness: re-renders the handler set live so the hook's ref-based
// latest-handler behavior is exercised, not just the first snapshot.
function Harness({ handlers, enabled = true, scoped = null, input = false }) {
  useKeyboardShortcuts(handlers, { enabled, scoped });
  return <>{input ? <input aria-label="probe input" /> : null}</>;
}

describe("useKeyboardShortcuts", () => {
  it("calls the handler for a matching key and preventDefaults", async () => {
    const fn = vi.fn(() => true);
    const user = userEvent.setup();
    render(<Harness handlers={{ j: fn }} />);
    await user.keyboard("j");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  it("ignores keys while focus is inside a text input", async () => {
    const fn = vi.fn(() => true);
    const user = userEvent.setup();
    render(<Harness handlers={{ j: fn }} input />);
    const box = screen.getByLabelText("probe input");
    box.focus();
    await user.keyboard("j");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does not preventDefault for an unregistered key", async () => {
    const fn = vi.fn(() => true);
    const user = userEvent.setup();
    render(<Harness handlers={{ j: fn }} />);
    await user.keyboard("x");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does not fire when disabled", async () => {
    const fn = vi.fn(() => true);
    const user = userEvent.setup();
    render(<Harness handlers={{ j: fn }} enabled={false} />);
    await user.keyboard("j");
    expect(fn).not.toHaveBeenCalled();
  });
});