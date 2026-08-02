import { XMLParser } from "fast-xml-parser";

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

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
});

export function parseFeed(xml, sourceName) {
  let doc;
  try {
    doc = parser.parse(xml);
  } catch {
    return [];
  }
  const channel = doc?.rss?.channel;
  const items = Array.isArray(channel?.item)
    ? channel.item
    : channel?.item
      ? [channel.item]
      : [];
  const entries = Array.isArray(doc?.feed?.entry)
    ? doc.feed.entry
    : doc?.feed?.entry
      ? [doc.feed.entry]
      : [];
  const raw = items.length > 0 ? items : entries;

  return raw
    .map((it) => {
      const title = typeof it.title === "string" ? it.title : it.title?.["#text"] ?? "";
      const link = typeof it.link === "string" ? it.link : it.link?.["@_href"] ?? "";
      const summary = it.description ?? it.summary ?? it.encoded ?? "";
      const publishedAt = it.pubDate ?? it.published ?? it.updated ?? "";
      const date = new Date(publishedAt);
      return {
        title: String(title).trim(),
        link: String(link).trim(),
        summary: String(summary).slice(0, 500),
        publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
        source: sourceName,
      };
    })
    .filter((s) => s.title && s.link && !Number.isNaN(Date.parse(s.publishedAt)));
}

export async function fetchAllFeeds() {
  const results = [];
  for (const source of SOURCES) {
    try {
      const res = await fetch(source.feed, {
        signal: AbortSignal.timeout(10000),
        headers: { "user-agent": "TheBaseline/1.0 (https://the-baseline.example)" },
      });
      if (!res.ok) {
        results.push({ source: source.name, stories: [], error: `HTTP ${res.status}` });
        continue;
      }
      const xml = await res.text();
      results.push({ source: source.name, stories: parseFeed(xml, source.name) });
    } catch (err) {
      results.push({ source: source.name, stories: [], error: String(err?.message ?? err) });
    }
  }
  return results;
}
