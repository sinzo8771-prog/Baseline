# The Baseline

AI news, hype removed. A free, editorial-print AI news site with live RSS
aggregation and a hype meter. Built on Cloudflare Workers + KV, no AI-generated
content anywhere.

## Local development

```bash
npm install
npm run dev
```

`wrangler dev` emulates KV locally. The first hit to `/api/news` fetches all
feeds (takes a few seconds), then serves from the local cache. Visit
`http://localhost:8787`.

## Test

```bash
npm test
```

Runs the unit suite with `node --test` (hype scoring, dedupe, RSS parsing,
pipeline).

## Deploy (free tier)

Requires a free Cloudflare account.

```bash
npm install
npx wrangler login
npx wrangler kv namespace create BASELINE_KV
```

Copy the printed `id` into `wrangler.toml` (`[[kv_namespaces]] id`),
then:

```bash
npm run deploy
```

The Worker serves both the API and the static site. Cron refreshes feeds
every 20 minutes. Your live URL is printed by `wrangler deploy` (usually
`https://the-baseline.<your-subdomain>.workers.dev`).

## Adding or changing sources

Edit the `SOURCES` array in `src/feeds.js`. Dead feeds are skipped
automatically and shown as "down" on the site's Sources list.

## Hype scoring

Heuristics live in `src/hype.js`: hype words, emotion words, ALL CAPS,
exclamation marks, emoji, and number-bragging. Score maps to
Measured / Warm / Hot / On Fire. It is a detector, not a judge. Mostly.
