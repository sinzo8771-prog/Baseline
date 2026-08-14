import { useCallback, useEffect, useRef } from "react";

// Global keyboard shortcuts with two guards baked in: never hijack a key while
// the user is typing in a text field, and never step on an open dialog (modal
// focus trap already owns Escape there). Handlers receive the KeyboardEvent
// and can return true to indicate they handled it.
//
// Usage:
//   useKeyboardShortcuts(
//     { j: () => move(1), k: () => move(-1), "/": () => focusSearch() },
//     { enabled: !modalOpen },
//   );
//
// A second optional `scoped` object lets callers register a different handler
// while a modal is open (e.g. Escape to close it) — the typing guard stays on
// for both.
export default function useKeyboardShortcuts(handlers, { enabled = true, scoped = null } = {}) {
  const handlersRef = useRef(handlers);
  const scopedRef = useRef(scoped);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    handlersRef.current = handlers;
    scopedRef.current = scoped;
    enabledRef.current = enabled;
  }, [handlers, scoped, enabled]);

  const onKey = useCallback((e) => {
    if (!enabledRef.current) return;
    const t = e.target;
    const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (typing) return;

    const active = scopedRef.current && document.querySelector('[role="dialog"]')
      ? scopedRef.current
      : handlersRef.current;
    const fn = active?.[e.key];
    if (typeof fn === "function") {
      if (fn(e)) e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);
}