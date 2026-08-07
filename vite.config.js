import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Plain Vite + React. `vite build` emits static files to dist/, which the
// Cloudflare Worker (src/index.js) serves via the ASSETS binding (see
// wrangler.toml). The Worker also relays feed XML at /api/feed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});