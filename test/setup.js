import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia; the app (useTheme, framer-motion reduced-motion,
// Asciify's prefers-reduced-motion) calls it on mount.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom has no ResizeObserver; canvas effects create one when they initialize.
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// AbortSignal.timeout is used by feed fetches; jsdom's window doesn't always
// expose it. Node's global one exists, but tests run in jsdom where `window`
// shadows it.
if (typeof AbortSignal !== "undefined" && !AbortSignal.timeout) {
  AbortSignal.timeout = (ms) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    ctrl.signal.addEventListener("abort", () => clearTimeout(id), { once: true });
    return ctrl.signal;
  };
}

// localStorage exists in jsdom but survives between tests within a file.
beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // Private-mode-style failures are non-fatal.
  }
});