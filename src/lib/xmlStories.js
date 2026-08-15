// Worker-side story extraction for the self-published feed routes.
//
// The browser parses feed XML with DOMParser (src/lib/feeds.js `parseFeed`);
// workerd has no DOMParser, so this module pulls the same fields
// (title/link/summary/publishedAt/source/image) with a compact regex extractor
// tuned for the allowlisted RSS 2.0 / Atom sources in src/index.js `FEEDS`.
// It is deliberately *not* a general XML parser: it only reads story nodes
// (`<item>` / `<entry>`), and the feed route caches at the edge, so this only
// runs once per cache window.
//
// Field extraction mirrors `parseFeed` so the Worker feed and the in-browser
// edition agree on what a story is. Scoring/ranking are NOT reimplemented here —
// the shared pipeline (src/lib/pipeline.js) runs after this.

import { stripTags, sanitizeImageUrl, SUMMARY_MAX } from "./feeds.js";

function stripCdata(text) {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

// First occurrence of an element (optionally namespaced) with its inner text.
// `<content:encoded>…</content:encoded>` matches via the optional prefix.
function field(node, tag) {
  const re = new RegExp(`<[a-zA-Z0-9_-]*:?${tag}\\b[^>]*>([\\s\\S]*?)<\\/[a-zA-Z0-9_-]*:?${tag}>`, "i");
  const m = node.match(re);
  return m ? stripCdata(m[1]).trim() : "";
}

// First value of an attribute on an element (optionally namespaced).
function attr(node, tag, name) {
  const re = new RegExp(`<[a-zA-Z0-9_-]*:?${tag}\\b[^>]*\\b${name}=["']([^"']*)["']`, "i");
  const m = node.match(re);
  return m ? m[1].trim() : "";
}

function firstImageUrl(node) {
  const enclosure = node.match(/<enclosure\b[^>]*>/i);
  if (enclosure) {
    const type = attr(enclosure[0], "enclosure", "type");
    const url = attr(enclosure[0], "enclosure", "url");
    if (type.startsWith("image/") && url) return sanitizeImageUrl(url);
  }
  const mediaContent = node.match(/<media:content\b[^>]*>/i);
  if (mediaContent) {
    const medium = attr(mediaContent[0], "media:content", "medium");
    const url = attr(mediaContent[0], "media:content", "url");
    if (medium === "image" && url) return sanitizeImageUrl(url);
  }
  const mediaThumb = node.match(/<media:thumbnail\b[^>]*>/i);
  if (mediaThumb) {
    const url = attr(mediaThumb[0], "media:thumbnail", "url");
    if (url) return sanitizeImageUrl(url);
  }
  const desc = field(node, "description") || field(node, "summary") || field(node, "content:encoded") || field(node, "content");
  const img = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (img?.[1]) return sanitizeImageUrl(img[1]);
  return null;
}

export function extractStories(xml, sourceName) {
  if (typeof xml !== "string" || !xml) return [];
  const isRss = /<rss\b/i.test(xml) || /<channel\b/i.test(xml);
  const nodePattern = isRss ? /<item\b[\s\S]*?<\/item>/gi : /<entry\b[\s\S]*?<\/entry>/gi;
  const nodes = String(xml).match(nodePattern) || [];
  const stories = [];

  for (const node of nodes) {
    const title = stripTags(field(node, "title"));
    if (!title) continue;
    const link = isRss ? stripTags(field(node, "link")) : attr(node, "link", "href");
    if (!link) continue;

    const rawSummary = field(node, "description") || field(node, "summary") || field(node, "content:encoded") || field(node, "content");
    const summary = stripTags(rawSummary).slice(0, SUMMARY_MAX);

    const rawDate = field(node, "pubDate") || field(node, "published") || field(node, "updated") || field(node, "date");
    const date = new Date(stripTags(rawDate));
    if (Number.isNaN(date.getTime())) continue;

    stories.push({
      title,
      link,
      summary,
      publishedAt: date.toISOString(),
      source: sourceName,
      image: firstImageUrl(node),
    });
  }

  return stories;
}