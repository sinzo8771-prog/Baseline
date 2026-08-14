import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// The a11y matcher is wired in test/components/a11y.test.jsx (module scope),
// not here — `expect.extend` in a vitest 4 setupFile trips an internal symbol
// (`__vitest_poll_takeover__`) before expect is fully initialized. Doing it at
// the top of the test file that actually uses axe is both the fix and the
// smallest blast radius.

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