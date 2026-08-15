import { defineConfig, devices } from "@playwright/test";

// E2E runs against `vite preview` (the built dist/) rather than `wrangler dev`:
// it boots far faster in CI and, with the Worker /api routes mocked per-test,
// is fully deterministic. The real Worker layer (feed relay, rate limits,
// serializers, security headers) is covered by the node unit tests; this suite
// exercises the browser surface jsdom cannot: routing, keyboard behavior,
// focus traps, and the print stylesheet.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});