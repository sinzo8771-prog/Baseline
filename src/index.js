// The Baseline Worker: static host + same-origin feed relay.
//
// Cloudflare's free tier enforces a sub-millisecond CPU budget per invocation, so no
// server-side RSS parsing or aggregation can run here. The Worker instead does two
// trivially-cheap jobs:
//   1. serve the static frontend from ./dist (the browser does all parsing/scoring),
//   2. relay feed XML from an allowlisted set of sources to the browser (pure I/O).
//
// Feed URLs must stay in sync with `SOURCES` in src/lib/feeds.js; a unit test
// (test/feeds.test.js) guards against drift.

// Several publisher RSS feeds block Cloudflare Workers egress IPs as bot traffic.
// Using a real browser User-Agent bypasses most of those blocks.
// Anthropic has no official RSS; the Olshansk/rss-feeds GitHub mirror is updated hourly.
export const FEEDS = {
  "OpenAI":          "https://openai.com/blog/rss.xml",
  "Anthropic":       "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml",
  "Google DeepMind": "https://deepmind.google/blog/rss.xml",
  "Hugging Face":    "https://huggingface.co/blog/feed.xml",
  "The Verge AI":    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  "MIT Tech Review AI": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
  "Ars Technica AI": "https://arstechnica.com/ai/feed/",
  "VentureBeat AI":  "https://venturebeat.com/category/ai/feed/",
  "TechCrunch AI":   "https://techcrunch.com/category/artificial-intelligence/feed/",
  "Wired AI":        "https://www.wired.com/feed/tag/ai/latest/rss",
};

// Must stay at or below the browser-side FEED_TIMEOUT_MS (src/lib/feeds.js), or the
// relay holds upstream connections the browser has already abandoned.
const UPSTREAM_TIMEOUT_MS = 8000;
// A malformed or hostile upstream could otherwise hand back an enormous body and
// eat the request budget (and the free-tier bill). Feeds are small (tens of KB);
// anything past this cap is refused instead of buffered wholesale.
const MAX_RELAY_BYTES = 1_000_000;
// Lightweight abuse protection for the public relay (spec §5.5): a per-IP
// fixed-window counter parked in the edge cache, with no auth system. A normal
// page load is ~11 relay requests, so the window is generous for humans while
// still making scripted scraping painful. Fails open: a cache hiccup never
// blocks a legitimate reader.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 90;
// A real browser UA lets most publisher RSS endpoints pass the request through.
// A custom bot UA (e.g. "TheBaseline/1.0") causes many feeds to return 403/503.
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/feeds" || url.pathname === "/api/feed") {
      if (!(await allowRequest(request, url.pathname))) {
        return json({ error: "rate_limited", message: "Too many requests from this address. Take a breath, then try again." }, 429);
      }
    }

    if (url.pathname === "/api/feeds") {
      return json(
        { sources: Object.entries(FEEDS).map(([name, feed]) => ({ name, feed })) },
        200,
        { "cache-control": "public, max-age=300, stale-while-revalidate=600" },
      );
    }

    if (url.pathname === "/api/feed") {
      return relayFeed(url.searchParams.get("name"), request);
    }

    if (url.pathname === "/api/news") {
      return json(
        {
          error: "moved_to_the_browser",
          message: "The presses moved into your browser. This edition is now printed live on every load; the API is retired.",
        },
        410,
      );
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};

async function relayFeed(name, request) {
  const upstream = name ? FEEDS[name] : undefined;
  if (!upstream) {
    return json({ error: "unknown_feed", message: `No feed named "${name ?? ""}".` }, 404);
  }
  // Short-lived edge cache on top of the cache-control header: a popular
  // edition can hit the same feed dozens of times, so serving a 5-minute-old
  // copy spares upstream (and your quota) without ever going stale. Bounded
  // TTL enforced via the max-age below — nothing is cached forever.
  const cacheKey = new Request(`https://the-baseline-cache.local/feed?name=${encodeURIComponent(name)}`, request);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(upstream, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT },
    });
    if (!res.ok) {
      return json({ error: `upstream HTTP ${res.status}`, message: `"${name}" returned ${res.status}.` }, 502);
    }
    // Read the body with a hard byte cap so an enormous or malformed feed can't
    // consume unbounded resources (spec §5.4). Feeds are small; this never
    // penalizes a real source.
    let body;
    try {
      body = await readBodyBounded(res, MAX_RELAY_BYTES);
    } catch {
      return json(
        { error: "fetch_failed", message: `"${name}" returned an oversized feed and was refused.` },
        504,
      );
    }
    const relayed = new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/xml; charset=utf-8",
        "access-control-allow-origin": originOf(request),
        "cache-control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
    // Only cache successful relays; failures must not poison the edge copy.
    // Keyed per feed name (not by upstream URL) so the allowlist stays the
    // single source of truth.
    const toCache = relayed.clone();
    await cache.put(cacheKey, toCache);
    return relayed;
  } catch (err) {
    return json(
      { error: "fetch_failed", message: `Could not reach "${name}": ${String(err?.message ?? err)}` },
      504,
    );
  }
}

// Read a Response body into a string, throwing if it exceeds `maxBytes`.
// Works whether or not the upstream declared a Content-Length.
async function readBodyBounded(res, maxBytes) {
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new Error("oversized response");
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) throw new Error("oversized response");
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(buf);
}

// Per-IP fixed-window rate limiter backed by the edge cache. Returns false (and
// the caller answers 429) once a client exceeds RATE_LIMIT_PER_WINDOW requests
// in RATE_WINDOW_MS. Any cache failure fails open.
async function allowRequest(request, scope) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bucket = Math.floor(Date.now() / RATE_WINDOW_MS);
  const key = new Request(`https://the-baseline-cache.local/ratelimit/${scope}/${ip}/${bucket}`, request);
  try {
    const cache = caches.default;
    const cached = await cache.match(key);
    let count = 0;
    if (cached) {
      const text = await cached.text();
      count = Number.parseInt(text, 10) || 0;
    }
    if (count >= RATE_LIMIT_PER_WINDOW) return false;
    const entry = new Response(String(count + 1), {
      headers: { "cache-control": `public, max-age=${Math.ceil(RATE_WINDOW_MS / 1000)}` },
    });
    await cache.put(key, entry);
    return true;
  } catch {
    return true;
  }
}

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

// Strict Content-Security-Policy for the app shell. The frontend is fully
// self-hosted except the Fraunces/Inter webfonts (styles from fonts.googleapis,
// font files from fonts.gstatic). Inline styles are required by the canvas
// effects (they set per-frame style attributes) and the theme toggle; inline
// scripts are not allowed — the theme-init script was extracted to a static
// file so no hash needs to be maintained. Feed images are remote https URLs.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

// Apply the CSP to document responses served from the ASSETS binding. Assets
// (js/css/images) don't enforce it, but adding it to HTML is the goal; the
// header is simply merged onto any text/html response.
function withSecurityHeaders(response) {
  const type = (response.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.set("content-security-policy", CSP);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// The browser calls /api/feed same-origin, so a wildcard ACAO only helps
// third parties turn this Worker into a free open proxy for the 10 feeds.
// Echo the requesting origin only when it matches this Worker's own origin;
// anything else gets no CORS header and is blocked by the browser.
function originOf(request) {
  const self = new URL(request.url).origin;
  const incoming = request.headers.get("origin");
  return incoming && new URL(incoming).origin === self ? incoming : self;
}