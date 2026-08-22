// Feed health check: hits every source through the deployed relay and fails
// loudly if any of them is dead. Runs on a daily CI schedule so an upstream
// block or stale URL can never silently take sources offline again (the
// outage this guards against surfaced as "7 of 10 feeds down" with no alarm).
//
// Sources are enumerated from /api/feeds rather than hardcoded, so the check
// can never drift from the Worker's FEEDS allowlist.
//
// Usage: node scripts/feed-health.mjs [base-url]
//   base-url defaults to FEED_HEALTH_BASE_URL, then to the production Worker.

import { DOMParser } from "@xmldom/xmldom";
import { parseFeed } from "../src/lib/feeds.js";

const BASE = (
  process.argv[2] ||
  process.env.FEED_HEALTH_BASE_URL ||
  "https://the-baseline.baseline-news.workers.dev"
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 20_000;

// A source is alive when the relay answers 200 with something that is actually
// XML (an <rss> or <feed> root). A WAF block page or error JSON fails here
// even though it may ride on a 200. Parsed-story counts are informational: a
// momentarily empty-but-valid feed should not page anyone.
function looksLikeFeed(text) {
  return /^\s*(<\?xml[\s\S]*?)?\s*<(rss|rdf:rdf|feed)[\s>]/i.test(text.slice(0, 512));
}

const listRes = await fetch(`${BASE}/api/feeds`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
if (!listRes.ok) {
  console.error(`FATAL: /api/feeds returned HTTP ${listRes.status} from ${BASE}`);
  process.exit(1);
}
const { sources } = await listRes.json();
console.log(`Checking ${sources.length} sources against ${BASE}\n`);

const dead = [];
for (const source of sources) {
  const label = source.name.padEnd(20);
  try {
    const res = await fetch(`${BASE}/api/feed?name=${encodeURIComponent(source.name)}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      dead.push(`${label} HTTP ${res.status}`);
      console.log(`DOWN ${label} HTTP ${res.status}`);
      continue;
    }
    const text = await res.text();
    if (!looksLikeFeed(text)) {
      dead.push(`${label} HTTP 200 but body is not XML`);
      console.log(`DOWN ${label} HTTP 200 but body is not XML (${text.slice(0, 80)})`);
      continue;
    }
    const stories = parseFeed(text, source.name, DOMParser);
    console.log(`ok   ${label} ${stories.length} stories`);
  } catch (err) {
    dead.push(`${label} ${String(err?.cause?.message ?? err?.message ?? err)}`);
    console.log(`DOWN ${label} ${String(err?.cause?.message ?? err?.message ?? err)}`);
  }
}

console.log("");
if (dead.length > 0) {
  console.error(`FEED HEALTH CHECK FAILED — ${dead.length}/${sources.length} down:\n${dead.join("\n")}`);
  process.exit(1);
}
console.log(`All ${sources.length} sources healthy.`);
