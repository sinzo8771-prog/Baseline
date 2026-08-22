// Feed fetching and parsing, browser-side.
// The Worker cannot parse feeds (free-tier CPU cap), so the browser does:
//   fetchAllFeeds() -> /api/feeds (source list) -> /api/feed?name= (same-origin relay) -> parse.
// Parsing uses the native DOMParser (namespace-aware, CDATA-aware), so summaries are
// always plain strings and never "[object Object]" by construction.

// Feed URLs mirror the Worker's FEEDS map in src/index.js. Keep the two in sync.
// Anthropic has no official RSS; the Olshansk/rss-feeds GitHub mirror is updated hourly.
// `mirror` marks sources whose feed is a community-run mirror rather than the
// outlet's own channel, so the UI can label them transparently instead of
// pretending they are first-party.
export const SOURCES = [
  { name: "OpenAI",          feed: "https://openai.com/blog/rss.xml" },
  { name: "Anthropic",       feed: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml", mirror: true },
  { name: "Google DeepMind", feed: "https://deepmind.google/blog/feed/basic/" },
  { name: "Hugging Face",    feed: "https://huggingface.co/blog/feed.xml" },
  { name: "The Verge AI",    feed: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { name: "MIT Tech Review AI", feed: "https://www.technologyreview.com/topic/artificial-intelligence/feed" },
  { name: "Ars Technica AI", feed: "https://arstechnica.com/ai/feed/" },
  { name: "VentureBeat AI",  feed: "https://venturebeat.com/category/ai/feed/" },
  { name: "TechCrunch AI",   feed: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "Wired AI",        feed: "https://www.wired.com/feed/tag/ai/latest/rss" },
];

// A source is a mirror when its SOURCES entry says so. Derived rather than
// hand-listed so the label can never drift from the source of truth.
export function isMirroredFeed(name) {
  return Boolean(SOURCES.find((s) => s.name === name)?.mirror);
}

// Keep only the newest stories per feed; the page shows at most 50 total, so this
// bounds the client-side dedupe (O(n^2)) without missing anything that would make the cut.
export const MAX_PER_FEED = 40;
export const SUMMARY_MAX = 500;
// Per-feed fetch cap. Streaming (onPartial) already lets the edition render as
// feeds land, so this only bounds how long a single hung feed can delay the
// final tally — not first paint.
export const FEED_TIMEOUT_MS = 6000;
// The /api/feeds source list should answer fast; a stale list is a fallback
// prompt, not a reason to block the whole page.
export const SOURCE_LIST_TIMEOUT_MS = 4000;

// XML payloads often bury HTML inside CDATA (e.g. <description><![CDATA[<p>...<b>...</p>]]>).
// Different parsers expose that differently: the browser's DOMParser builds child elements
// (whose textContent flattens the tags away), but some DOM implementations return the raw
// CDATA string verbatim. Strip any residual tags so summaries are always plain text.
const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

export function decodeEntities(text) {
  return String(text).replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos|nbsp);/g, (match, entity) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X"
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES.hasOwnProperty(entity) ? NAMED_ENTITIES[entity] : match;
  });
}

export function stripTags(text) {
  const input = String(text);
  const plain = input.replace(/<[^>]*>/g, "");
  return decodeEntities(plain.trim());
}

// Only http(s) images are allowed into a story. Rejects data:, javascript:,
// blob:, or any other scheme at parse time, so a hostile feed can't smuggle a
// markup payload or a local-file reference into an <img src>. Also rejects
// relative URLs (feeds should carry absolute image URLs). Mirrors the safeHref
// pattern used for story links.
export function sanitizeImageUrl(url) {
  if (typeof url !== "string" || !url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\/\S+$/i.test(trimmed)) return trimmed;
  return null;
}

function firstByTag(root, tag) {
  const nodes = root.getElementsByTagName(tag);
  return nodes.length > 0 ? nodes[0] : null;
}

function firstByTagNS(root, ns, tag) {
  const nodes = root.getElementsByTagNameNS(ns, tag);
  return nodes.length > 0 ? nodes[0] : null;
}

function getImageFromNode(node) {
  // Check enclosure (RSS 2.0)
  const enclosures = node.getElementsByTagName("enclosure");
  for (let i = 0; i < enclosures.length; i++) {
    const type = enclosures[i].getAttribute("type") || "";
    const url = enclosures[i].getAttribute("url") || "";
    if (type.startsWith("image/") && url) return url;
  }
  // Check media:content (Media RSS)
  const mediaContents = node.getElementsByTagNameNS("http://search.yahoo.com/mrss/", "content");
  for (let i = 0; i < mediaContents.length; i++) {
    const medium = mediaContents[i].getAttribute("medium") || "";
    const url = mediaContents[i].getAttribute("url") || "";
    if (medium === "image" && url) return url;
  }
  // Check media:thumbnail (Media RSS)
  const mediaThumbs = node.getElementsByTagNameNS("http://search.yahoo.com/mrss/", "thumbnail");
  for (let i = 0; i < mediaThumbs.length; i++) {
    const url = mediaThumbs[i].getAttribute("url") || "";
    if (url) return url;
  }
  // Check atom:link rel="enclosure"
  const atomLinks = node.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "link");
  for (let i = 0; i < atomLinks.length; i++) {
    const rel = atomLinks[i].getAttribute("rel") || "";
    const type = atomLinks[i].getAttribute("type") || "";
    const href = atomLinks[i].getAttribute("href") || "";
    if (rel === "enclosure" && type.startsWith("image/") && href) return href;
  }
  // Fallback: extract first <img> from description/summary/content HTML
  const htmlContent = node.getElementsByTagName("description")[0]?.textContent ||
    node.getElementsByTagName("summary")[0]?.textContent ||
    node.getElementsByTagName("content")[0]?.textContent ||
    node.getElementsByTagName("encoded")[0]?.textContent;
  if (htmlContent) {
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) return imgMatch[1];
  }
  return null;
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

      const image = sanitizeImageUrl(getImageFromNode(node));

      return {
        title,
        link,
        summary,
        publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
        source: sourceName,
        image,
      };
    })
    .filter((s) => s.title && s.link && !Number.isNaN(Date.parse(s.publishedAt)));
}

export async function fetchAllFeeds({ base = "", DOMParserCtor = globalThis.DOMParser, onPartial = null } = {}) {
  let sources = SOURCES;
  try {
    const listRes = await fetch(`${base}/api/feeds`, { signal: AbortSignal.timeout(SOURCE_LIST_TIMEOUT_MS) });
    const list = await listRes.json();
    if (Array.isArray(list.sources)) sources = list.sources;
  } catch {
    // Fall back to the bundled list if the API is unreachable.
  }

  const tasks = sources.map((source) => ({
    name: source.name,
    promise: (async () => {
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
    })(),
  }));

  if (!onPartial) return Promise.all(tasks.map((t) => t.promise));

  // Streaming mode: resolve results in completion order and hand each growing
  // set to onPartial so the page can render a rolling edition instead of
  // waiting for the slowest feed. Final return value equals Promise.all.
  const results = [];
  let remaining = tasks;
  while (remaining.length > 0) {
    const settled = await Promise.race(
      remaining.map((t) => t.promise.then((value) => ({ name: t.name, value }))),
    );
    remaining = remaining.filter((t) => t.name !== settled.name);
    results.push(settled.value);
    onPartial([...results]);
  }
  return results;
}
