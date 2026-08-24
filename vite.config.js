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
    rollupOptions: {
      output: {
        // Function-form manualChunks: the object form silently failed to
        // capture react-dom (its client runtime resolves through
        // react-dom/client), leaving a 540 KB module inside the app chunk.
        // Path-matched assignment puts the whole React stack + router in one
        // stable vendor chunk that caches independently of app code.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/]react-router[^\\/]*[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return "motion";
          return undefined;
        },
      },
    },
  },
});