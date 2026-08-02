// Feed fetching and parsing, browser-side.
// The Worker cannot parse feeds (free-tier CPU cap), so the browser does:
//   fetchAllFeeds() -> /api/feeds (source list) -> /api/feed?name= (same-origin relay) -> parse.
// Parsing uses the native DOMParser (namespace-aware, CDATA-aware), so summaries are
// always plain strings and never "[object Object]" by construction.

export const SOURCES = [
  { name: "OpenAI", feed: "https://openai.com/news/rss.xml" },
  { name: "Anthropic", feed: "https://www.anthropic.com/rss.xml" },
  { name: "Google DeepMind", feed: "https://deepmind.google/blog/rss.xml" },
  { name: "Hugging Face", feed: "https://huggingface.co/blog/feed.xml" },
  { name: "The Verge AI", feed: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { name: "MIT Tech Review AI", feed: "https://www.technologyreview.com/topic/artificial-intelligence/feed" },
  { name: "Ars Technica AI", feed: "https://arstechnica.com/ai/feed/" },
  { name: "VentureBeat AI", feed: "https://venturebeat.com/category/ai/feed/" },
  { name: "TechCrunch AI", feed: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "Wired AI", feed: "https://www.wired.com/feed/tag/ai/latest/rss" },
];

// Keep only the newest stories per feed; the page shows at most 50 total, so this
// bounds the client-side dedupe (O(n^2)) without missing anything that would make the cut.
export const MAX_PER_FEED = 40;
export const SUMMARY_MAX = 500;
export const FEED_TIMEOUT_MS = 15000;

// XML payloads often bury HTML inside CDATA (e.g. <description><![CDATA[<p>...<b>...</p>]]>).
// Different parsers expose that differently: the browser's DOMParser builds child elements
// (whose textContent flattens the tags away), but some DOM implementations return the raw
// CDATA string verbatim. Strip any residual tags so summaries are always plain text.
export function stripTags(text) {
  return String(text)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function firstByTag(root, tag) {
  const nodes = root.getElementsByTagName(tag);
  return nodes.length > 0 ? nodes[0] : null;
}

export function parseFeed(xml, sourceName, DOMParserCtor = globalThis.DOMParser) {
  if (!DOMParserCtor) return [];
  // Accept either a DOMParser constructor (new DOMParser()) — as the browser passes
  // globalThis.DOMParser — or an already-instantiated parser (as Node tests often do).
  let parse;
  if (typeof DOMParserCtor === "function" && DOMParserCtor.prototype?.parseFromString) {
    parse = (x) => new DOMParserCtor().parseFromString(x, "text/xml");
  } else if (typeof DOMParserCtor?.parseFromString === "function") {
    parse = (x) => DOMParserCtor.parseFromString(x, "text/xml");
  } else {
    return [];
  }

  let doc;
  try {
    doc = parse(xml);
  } catch {
    return [];
  }
  if (!doc || doc.getElementsByTagName("parsererror").length > 0) return [];

  const isRss = doc.getElementsByTagName("rss").length > 0;
  const nodes = isRss
    ? Array.from(doc.getElementsByTagName("item"))
    : Array.from(doc.getElementsByTagName("entry"));
  if (nodes.length === 0) return [];

  return nodes
    .map((node) => {
      const titleEl = firstByTag(node, "title");
      const title = stripTags(titleEl?.textContent ?? "");

      let link = "";
      const linkEl = firstByTag(node, "link");
      if (linkEl) {
        link = isRss ? (linkEl.textContent ?? "").trim() : (linkEl.getAttribute("href") ?? "").trim();
      }

      const summaryEl =
        firstByTag(node, "description") ?? firstByTag(node, "summary") ?? firstByTag(node, "content") ?? firstByTag(node, "encoded");
      const summary = stripTags(summaryEl?.textContent ?? "").slice(0, SUMMARY_MAX);

      const dateEl =
        firstByTag(node, "pubDate") ?? firstByTag(node, "published") ?? firstByTag(node, "updated") ?? firstByTag(node, "date");
      const rawDate = (dateEl?.textContent ?? "").trim();
      const date = new Date(rawDate);

      return {
        title,
        link,
        summary,
        publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
        source: sourceName,
      };
    })
    .filter((s) => s.title && s.link && !Number.isNaN(Date.parse(s.publishedAt)));
}

export async function fetchAllFeeds({ base = "", DOMParserCtor = globalThis.DOMParser } = {}) {
  let sources = SOURCES;
  try {
    const listRes = await fetch(`${base}/api/feeds`, { signal: AbortSignal.timeout(FEED_TIMEOUT_MS) });
    const list = await listRes.json();
    if (Array.isArray(list.sources)) sources = list.sources;
  } catch {
    // Fall back to the bundled list if the API is unreachable.
  }

  return Promise.all(
    sources.map(async (source) => {
      try {
        const res = await fetch(
          `${base}/api/feed?name=${encodeURIComponent(source.name)}`,
          { signal: AbortSignal.timeout(FEED_TIMEOUT_MS) },
        );
        if (!res.ok) return { source: source.name, stories: [], error: `HTTP ${res.status}` };
        const xml = await res.text();
        const parsed = parseFeed(xml, source.name, DOMParserCtor);
        const stories = [...parsed]
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, MAX_PER_FEED);
        return { source: source.name, stories };
      } catch (err) {
        return { source: source.name, stories: [], error: String(err?.message ?? err) };
      }
    }),
  );
}
