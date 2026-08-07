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

export const FEEDS = {
  "OpenAI": "https://openai.com/news/rss.xml",
  "Anthropic": "https://www.anthropic.com/rss.xml",
  "Google DeepMind": "https://deepmind.google/blog/rss.xml",
  "Hugging Face": "https://huggingface.co/blog/feed.xml",
  "The Verge AI": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  "MIT Tech Review AI": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
  "Ars Technica AI": "https://arstechnica.com/ai/feed/",
  "VentureBeat AI": "https://venturebeat.com/category/ai/feed/",
  "TechCrunch AI": "https://techcrunch.com/category/artificial-intelligence/feed/",
  "Wired AI": "https://www.wired.com/feed/tag/ai/latest/rss",
};

// Must stay at or below the browser-side FEED_TIMEOUT_MS (src/lib/feeds.js), or the
// relay holds upstream connections the browser has already abandoned.
const UPSTREAM_TIMEOUT_MS = 8000;
const USER_AGENT = "TheBaseline/1.0 (+https://the-baseline.baseline-news.workers.dev)";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/feeds") {
      return json(
        { sources: Object.entries(FEEDS).map(([name, feed]) => ({ name, feed })) },
        200,
        { "cache-control": "public, max-age=300, stale-while-revalidate=600" },
      );
    }

    if (url.pathname === "/api/feed") {
      return relayFeed(url.searchParams.get("name"));
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

    return env.ASSETS.fetch(request);
  },
};

async function relayFeed(name) {
  const upstream = name ? FEEDS[name] : undefined;
  if (!upstream) {
    return json({ error: "unknown_feed", message: `No feed named "${name ?? ""}".` }, 404);
  }
  try {
    const res = await fetch(upstream, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT },
    });
    if (!res.ok) {
      return json({ error: `upstream HTTP ${res.status}`, message: `"${name}" returned ${res.status}.` }, 502);
    }
    return new Response(res.body, {
      status: 200,
      headers: {
        "content-type": "text/xml; charset=utf-8",
        "access-control-allow-origin": originOf(request),
        "cache-control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return json(
      { error: "fetch_failed", message: `Could not reach "${name}": ${String(err?.message ?? err)}` },
      504,
    );
  }
}

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
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