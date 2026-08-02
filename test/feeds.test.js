import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed, SOURCES } from "../src/feeds.js";

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Example</title>
<item><title>OpenAI ships a model</title><link>https://example.com/1</link><pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate><description>A measured update.</description></item>
<item><title>Big News!</title><link>https://example.com/2</link><pubDate>Tue, 04 Aug 2026 10:00:00 GMT</pubDate><description>Revolutionary breakthrough.</description></item>
</channel></rss>`;

const ATOM_FIXTURE = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Example Atom</title>
<entry><title>Atom entry title</title><link href="https://example.com/atom"/><updated>2026-08-04T10:00:00Z</updated><summary>An atom summary.</summary></entry>
</feed>`;

test("SOURCES has the expected number of feeds", () => {
  assert.ok(SOURCES.length >= 8);
  for (const s of SOURCES) {
    assert.ok(s.name.length > 0);
    assert.ok(s.feed.startsWith("https://"));
  }
});

test("parseFeed parses RSS 2.0 items", () => {
  const stories = parseFeed(RSS_FIXTURE, "Example");
  assert.equal(stories.length, 2);
  assert.equal(stories[0].title, "OpenAI ships a model");
  assert.equal(stories[0].link, "https://example.com/1");
  assert.equal(stories[0].source, "Example");
  assert.ok(Date.parse(stories[0].publishedAt) > 0);
});

test("parseFeed parses Atom entries with href links", () => {
  const stories = parseFeed(ATOM_FIXTURE, "Example");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].title, "Atom entry title");
  assert.equal(stories[0].link, "https://example.com/atom");
  assert.equal(stories[0].summary, "An atom summary.");
});

test("parseFeed filters items without title or link", () => {
  const broken = `<rss version="2.0"><channel><item><title></title><link></link></item></channel></rss>`;
  assert.equal(parseFeed(broken, "Example").length, 0);
});

test("parseFeed returns empty array for garbage input", () => {
  assert.equal(parseFeed("<not xml at all", "Example").length, 0);
});
