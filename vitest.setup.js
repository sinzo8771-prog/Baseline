import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// jsdom lacks these browser APIs that the app's components touch; stub them so
// the real components render instead of crashing on mount.
if (!window.matchMedia) {
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

if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!AbortSignal.timeout) {
  AbortSignal.timeout = (ms) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(new DOMException("Timeout", "TimeoutError")), ms);
    t.unref?.();
    return ctrl.signal;
  };
}

beforeEach(() => {
  window.localStorage.clear();
});