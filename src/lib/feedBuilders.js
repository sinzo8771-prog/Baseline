// Feed serializers for the self-published editions: RSS 2.0 and JSON Feed 1.1.
//
// Pure functions over the already-composed, already-ranked edition (see the
// Worker's buildEdition in src/index.js). The spin score is carried as a
// non-standard extension (`_spin` in JSON Feed; a <category> plus an
// <ns:score> element in RSS) so subscribers get the site's actual measurement,
// not just the headline. Feed readers that don't know the extension simply
// ignore it.

import { editionNumber } from "./pipeline.js";

export const FEED_DESCRIPTION = "A daily RSS edition from the AI industry and its chroniclers. Headlines as published, spin as detected, hype as measured.";

function escapeXml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// https://validator.w3.org/feed/docs/rss2.html — RFC 822 date format.
function rssDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toUTCString();
}

export function buildJsonFeed(stories, { baseUrl, feedUrl, title = "The Baseline — AI news, hype removed" } = {}) {
  const items = (stories || []).map((s) => {
    const item = {
      id: s.id,
      url: `${baseUrl}/story/${s.id}`,
      title: s.title,
      content_text: s.summary || s.title,
      summary: s.summary || "",
      date_published: new Date(s.publishedAt).toISOString(),
      authors: [{ name: s.source }],
      tags: [s.source, s.spin].filter(Boolean),
      _spin: { score: s.spinScore ?? 0, tier: s.spin ?? "Measured", flags: s.flags ?? [] },
    };
    if (s.image) item.image = s.image;
    return item;
  });

  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title,
      home_page_url: `${baseUrl}/`,
      feed_url: feedUrl,
      description: `${FEED_DESCRIPTION} Edition No. ${editionNumber()}.`,
      language: "en",
      authors: [{ name: "The Baseline", url: `${baseUrl}/` }],
      items,
    },
    null,
    2,
  );
}

export function buildRssFeed(stories, { baseUrl, feedUrl, title = "The Baseline — AI news, hype removed" } = {}) {
  const items = (stories || [])
    .map((s) => {
      const description = s.summary ? `<description>${escapeXml(s.summary)}</description>` : "";
      const enclosure = s.image
        ? `<enclosure url="${escapeXml(s.image)}" type="image/jpeg" length="0" />`
        : "";
      return [
        "<item>",
        `<title>${escapeXml(s.title)}</title>`,
        `<link>${escapeXml(`${baseUrl}/story/${s.id}`)}</link>`,
        `<guid isPermaLink="false">${escapeXml(s.id)}</guid>`,
        rssDate(s.publishedAt) ? `<pubDate>${rssDate(s.publishedAt)}</pubDate>` : "",
        description,
        enclosure,
        `<dc:creator>${escapeXml(s.source)}</dc:creator>`,
        s.spin ? `<category>${escapeXml(s.spin)}</category>` : "",
        `<ns:score>${Number(s.spinScore ?? 0)}</ns:score>`,
        "</item>",
      ].filter(Boolean).join("");
    })
    .join("\n    ");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:ns="https://the-baseline.baseline-news.workers.dev/ns">`,
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(`${baseUrl}/`)}</link>`,
    `    <description>${escapeXml(`${FEED_DESCRIPTION} Edition No. ${editionNumber()}.`)}</description>`,
    `    <language>en</language>`,
    `    <lastBuildDate>${rssDate(new Date().toISOString())}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>`,
    `    ${items}`,
    "  </channel>",
    "</rss>",
  ].join("\n");
}