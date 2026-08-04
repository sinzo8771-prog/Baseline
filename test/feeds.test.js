import { test } from "node:test";
import assert from "node:assert/strict";
import { DOMParser } from "@xmldom/xmldom";
import { parseFeed, stripTags, decodeEntities, SOURCES, MAX_PER_FEED, SUMMARY_MAX } from "../src/lib/feeds.js";
import { FEEDS } from "../src/index.js";

// DOMParser (class) passed to parseFeed so the same tests run in Node and would run in a browser.

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Example</title>
<item><title>OpenAI ships a model</title><link>https://example.com/1</link><pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate><description>A measured update.</description></item>
<item><title>Big News!</title><link>https://example.com/2</link><pubDate>Tue, 04 Aug 2026 10:00:00 GMT</pubDate><description>Revolutionary breakthrough.</description></item>
</channel></rss>`;

const ATOM_FIXTURE = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Example Atom</title>
<entry><title>Atom entry title</title><link href="https://example.com/atom"/><updated>2026-08-04T10:00:00Z</updated><summary>An atom summary.</summary></entry>
</feed>`;

const CDATA_NS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>
<item>
  <title><![CDATA[A <b>bold</b> claim & more]]></title>
  <link>https://example.com/3</link>
  <pubDate>Wed, 05 Aug 2026 10:00:00 GMT</pubDate>
  <description><![CDATA[<p>Para with <em>markup</em>.</p>]]></description>
  <content:encoded><![CDATA[<p>Longer content body.</p>]]></content:encoded>
</item>
</channel></rss>`;

test("SOURCES has the expected number of feeds", () => {
  assert.ok(SOURCES.length >= 8);
  for (const s of SOURCES) {
    assert.ok(s.name.length > 0);
    assert.ok(s.feed.startsWith("https://"));
  }
});

test("worker feed allowlist matches the browser SOURCES list", () => {
  assert.equal(Object.keys(FEEDS).length, SOURCES.length);
  for (const s of SOURCES) {
    assert.equal(FEEDS[s.name], s.feed, `FEEDS["${s.name}"] must match SOURCES`);
  }
});

test("parseFeed parses RSS 2.0 items", () => {
  const stories = parseFeed(RSS_FIXTURE, "Example", DOMParser);
  assert.equal(stories.length, 2);
  assert.equal(stories[0].title, "OpenAI ships a model");
  assert.equal(stories[0].link, "https://example.com/1");
  assert.equal(stories[0].source, "Example");
  assert.ok(Date.parse(stories[0].publishedAt) > 0);
});

test("parseFeed parses Atom entries with href links", () => {
  const stories = parseFeed(ATOM_FIXTURE, "Example", DOMParser);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].title, "Atom entry title");
  assert.equal(stories[0].link, "https://example.com/atom");
  assert.equal(stories[0].summary, "An atom summary.");
});

test("parseFeed handles CDATA, namespaced content, and markup in text", () => {
  const stories = parseFeed(CDATA_NS_FIXTURE, "Example", DOMParser);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].title, "A bold claim & more");
  // textContent flattens markup inside the summary into plain text.
  assert.equal(stories[0].summary, "Para with markup.");
});

test("parseFeed always returns string summaries, never [object Object]", () => {
  const stories = parseFeed(RSS_FIXTURE, "Example", DOMParser);
  for (const s of stories) {
    assert.equal(typeof s.summary, "string");
    assert.ok(!s.summary.includes("[object Object]"));
  }
});

test("parseFeed truncates summaries to SUMMARY_MAX", () => {
  const long = "x".repeat(SUMMARY_MAX + 200);
  const xml = `<rss version="2.0"><channel><item><title>Long</title><link>https://example.com/long</link><pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate><description>${long}</description></item></channel></rss>`;
  const stories = parseFeed(xml, "Example", DOMParser);
  assert.equal(stories.length, 1);
  assert.equal(stories[0].summary.length, SUMMARY_MAX);
});

test("parseFeed filters items without title or link", () => {
  const broken = `<rss version="2.0"><channel><item><title></title><link></link></item></channel></rss>`;
  assert.equal(parseFeed(broken, "Example", DOMParser).length, 0);
});

test("parseFeed returns empty array for garbage input", () => {
  assert.equal(parseFeed("<not xml at all", "Example", DOMParser).length, 0);
});

test("MAX_PER_FEED bounds client-side dedupe work", () => {
  assert.ok(MAX_PER_FEED >= 20);
  assert.ok(MAX_PER_FEED <= 50);
});

test("decodeEntities decodes numeric and common named entities", () => {
  assert.equal(decodeEntities("China&#8217;s Alibaba"), "China’s Alibaba");
  assert.equal(decodeEntities("A &amp; B &#x27;c&#x27; &lt;x&gt;"), "A & B 'c' <x>");
  assert.equal(decodeEntities("non&nbsp;breaking"), "non\u00a0breaking");
  assert.equal(decodeEntities("a &bogus; b"), "a &bogus; b");
});

test("stripTags decodes entities that survive CDATA", () => {
  assert.equal(stripTags("China&#8217;s <b>Alibaba</b>"), "China’s Alibaba");
  assert.equal(stripTags("<p>Para &amp; more</p>"), "Para & more");
});
