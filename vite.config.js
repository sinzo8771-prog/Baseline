import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Plain Vite + React. `vite build` emits static files to dist/, which the
// Cloudflare Worker (src/index.js) serves via the ASSETS binding (see
// wrangler.toml). The Worker also relays feed XML at /api/feed.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});