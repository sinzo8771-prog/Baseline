import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Component-test config. Shares the app's @ alias and React + Tailwind plugins
// with the Vite build so jsdom renders the real components (not mock copies).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    // Component tests live in test/components/. The pure-logic unit suite in
    // test/ is node --test only; jsdom would only slow it down.
    include: ["test/components/**/*.test.{jsx,js}"],
    exclude: ["**/node_modules/**"],
  },
});