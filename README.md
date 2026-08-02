# The Baseline

AI news, hype removed. A free, editorial-print AI news site with live RSS
aggregation and a hype meter. Built on Cloudflare Workers + KV, no AI-generated
content anywhere.

## Local development

```bash
npm install
npm run dev
```

`wrangler dev` serves the static site and the feed relay locally. The first
visit to `/` fetches all feeds in the browser (takes a few seconds on a cold
cache), then renders the front page. Visit `http://localhost:8787`.

## Test

```bash
npm test
```

Runs the unit suite with `node --test` (hype scoring, dedupe, RSS parsing,
pipeline, and a guard that the local allowlist matches the Worker's).

## Architecture

This site runs on Cloudflare's free tier, which enforces a sub-millisecond CPU
budget per invocation — too small for server-side RSS parsing. So the work is
split:

- **Worker** (`src/index.js`): serves the static frontend and relays feed XML
  from an allowlisted set of sources. Pure I/O, trivial CPU. No KV, no cron.
- **Browser**: fetches each feed through the Worker, parses it with the native
  `DOMParser`, scores hype, dedupes, and renders the front page. Fresh on every
  load.

This keeps the whole site free to host with no API keys, no background builds,
and no server-side parsing limits. Headlines are still shown verbatim from the
sources; the browser adds only the rating.

## Deploy (free tier)

Requires a free Cloudflare account.

```bash
npm install
npx wrangler login
npm run deploy
```

`wrangler deploy` uploads the Worker and the static assets. The Worker serves
both the site and the feed relay on your `workers.dev` URL (usually
`https://the-baseline.<your-subdomain>.workers.dev`). A workers.dev subdomain
is auto-allocated on first deploy if you don't already have one.

No KV namespace is required.

## Adding or changing sources

Edit the `SOURCES` array in `public/lib/feeds.js` **and** the `FEEDS` map in
`src/index.js` together (they must match — a test checks for drift). Dead feeds
are skipped automatically and shown as "down" on the site's Sources list.

## Hype scoring

Heuristics live in `public/lib/hype.js`: hype words, emotion words, ALL CAPS,
exclamation marks, emoji, and number-bragging. Score maps to
Measured / Warm / Hot / On Fire. It is a detector, not a judge. Mostly.
