# The Baseline — Fix Plan

Two live bugs found in review: 7/10 feeds down, every story scoring 0 hype.

---

## 1. Dead feeds (7 of 10 sources down)

**Root cause is likely two different things, not one** — treat separately:

### 1a. Stale feed URLs
- `Google DeepMind` — `deepmind.google/blog/rss.xml` looks outdated. Current working path is `deepmind.google/blog/feed/basic/`. Update in **both** `src/lib/feeds.js` and `src/index.js` `FEEDS` (they must match — a test already checks for drift).
- Re-verify each of the other 6 URLs by hand: open each feed URL directly in a browser. If it 200s in a browser but 404s through your Worker, it's not a stale-URL problem — it's #1b.

### 1b. Worker relay being blocked upstream
- `TechCrunch`, `Ars Technica`, `VentureBeat`, `Wired`, `MIT Tech Review`, `Hugging Face` all use URLs that are still correct/"working" per third-party feed directories — yet 404 through your relay. Strong signal the outlets (or a CDN/WAF in front of them, e.g. Cloudflare-fronted sites blocking other Cloudflare Worker egress IPs, or anti-bot rules keyed on UA/IP) are blocking the request before your code even parses it.
- Steps:
  1. Log the actual upstream status/body your Worker gets per source (not just pass-through 404 — capture what the upstream really returned).
  2. Try the fetch with a real browser UA string + standard `Accept: application/rss+xml, application/xml, text/xml` header if not already set.
  3. If a specific host consistently blocks Workers (this is common for Cloudflare-fronted news sites blocking other CF ranges), that source may need a fallback: a public mirror (like you already do for Anthropic via Olshansk's GitHub mirror), or drop it and note it as unavailable rather than silently showing "down."
- Add a scheduled check (even a simple daily CI job hitting `/api/feeds` and asserting each source is non-404) so this doesn't silently regress again.

**Priority:** do 1a first (cheap, immediate win), then 1b (needs actual request/response debugging).

---

## 2. Every story scores 0 hype ("Measured", 14/14, 100%)

Real AI headlines are not this uniformly neutral — this is almost certainly the detector not receiving real text, not the news genuinely being calm.

- Steps:
  1. Log the raw `title`/`summary` string that reaches `hype.js` for each story from the 3 currently-live sources (OpenAI, Anthropic, The Verge AI). Confirm it isn't empty, truncated, or CDATA-mangled before scoring.
  2. Re-run `hype.js`'s existing fixtures (`test/hype.test.js`) against those exact live strings, not just the test fixtures, to confirm the scorer itself is fine.
  3. If the strings look fine and score fine in isolation but still show 0 on the live site, the bug is between fetch → pipeline → render (check `pipeline.js` composition step for a field name mismatch or a default/fallback value overwriting the real score).
  4. Once fixed, re-verify against the Hype Index page distribution — you should see stories spread across Measured/Warm/Hot, not 100% in one bucket.

**Priority:** do this after 1a/1b, since more live feeds = more real headlines to verify the fix against.

---

## Suggested order
1. Fix DeepMind URL (5 min, board test passes)
2. Instrument/log actual upstream responses for the 6 still-failing sources
3. Fix or fallback each based on what the logs show
4. Debug the hype-scoring pipeline once more live data is flowing
5. Add a scheduled feed-health check so dead feeds don't go unnoticed again
