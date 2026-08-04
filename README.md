# The Baseline

AI news, hype removed. A free, editorial-print AI news site with live RSS
aggregation and a hype meter. Built on Cloudflare Workers, **React 19 + Vite**,
with a canvas-ui lens upgrade. No AI-generated content anywhere.

## Stack

- **Frontend**: React 19 + Vite, static build output into `dist/`.
- **Hosting**: a Cloudflare Worker serves the built app (`env.ASSETS` →
  `dist/`) and relays feed XML at `/api/feed`.
- **Effects**: [canvas-ui](https://canvasui.dev) WebGL/glass components, wired
  for the experimental HTML-in-canvas API with a safe WebGL-overlay fallback.
- **RSS parsing** happens entirely in the browser (the Worker is pure I/O, so
  the free-tier CPU cap is respected).

## Local development

```bash
npm install
npm run dev
```

`npm run dev` builds the React app, then `wrangler dev` serves both the static
app and the feed relay locally. The first visit to `/` fetches all feeds in the
browser (a few seconds on a cold cache), then renders the front page. Visit
`http://localhost:8787` (whatever port `wrangler dev` reports).

For a fast React-only dev loop without the Worker relay (no live feed data),
use:

```bash
npm run dev:react
```

## Test

```bash
npm test
```

Runs the unit suite with `node --test` (hype scoring, dedupe, RSS parsing,
pipeline, and a guard that the local allowlist matches the Worker's).

## Build

```bash
npm run build
```

Emits the production React app and assets into `dist/`.

## Architecture

This site runs on Cloudflare's free tier, which enforces a sub-millisecond CPU
budget per invocation — too small for server-side RSS parsing. So the work is
split:

- **Worker** (`src/index.js`): serves the built React app from `dist/` and
  relays feed XML from an allowlisted set of sources. Pure I/O, trivial CPU.
- **Browser**: fetches each feed through the Worker, parses it with the native
  `DOMParser`, scores hype, dedupes, and renders the front page. Fresh on every
  load.

## Deploy (free tier)

Requires a free Cloudflare account.

```bash
npm install
npx wrangler login
npm run deploy
```

`npm run deploy` builds the React app, then uploads the Worker and the static
assets. The Worker serves both the site and the feed relay on your
`workers.dev` URL. No KV namespace is required.

## Canvas UI

The site uses [canvas-ui](https://canvasui.dev) components via its
shadcn-compatible registry. The Glass lens wraps the page: it captures the live
DOM into a source canvas (`layoutsubtree`) and draws a WebGL effect on an
overlay canvas. When the experimental HTML-in-canvas API is unavailable, the
component falls back to plain rendering — content is never hidden. It also
self-respects `prefers-reduced-motion`.

The lens components live in `src/components/canvasui/` and the React wrappers
in `src/app/components/` (`GlassLens.jsx`, `RippleLens.jsx`).

## Adding or changing sources

Edit the `SOURCES` array in `src/lib/feeds.js` **and** the `FEEDS` map in
`src/index.js` together (they must match — a test checks for drift). Dead feeds
are skipped automatically and shown as "down" on the site's Sources list.

## Hype scoring

Heuristics live in `src/lib/hype.js`: hype words, emotion words, ALL CAPS,
exclamation marks, emoji, and number-bragging. Score maps to
Measured / Warm / Hot / On Fire. It is a detector, not a judge. Mostly.