import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed } from "../src/feeds.js";

const ATOM_WITH_OBJECT_SUMMARY = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Atom</title>
<entry><title>An entry</title><link href="https://example.com/e"/><updated>2026-08-04T10:00:00Z</updated><summary>A plain atom summary.</summary></entry>
</feed>`;

test("parseFeed extracts #text from object summaries (Atom)", () => {
  const xml = ATOM_WITH_OBJECT_SUMMARY.replace(
    "<summary>A plain atom summary.</summary>",
    '<summary type="html">A rich atom summary.</summary>',
  );
  const stories = parseFeed(xml, "Example");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].summary, "A rich atom summary.");
});

test("parseFeed keeps plain string summaries verbatim (RSS)", () => {
  const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel><item>
<title>RSS item</title><link>https://example.com/r</link><pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate><description>A measured update.</description>
</item></channel></rss>`;
  const stories = parseFeed(xml, "Example");
  assert.equal(stories[0].summary, "A measured update.");
});

test("parseFeed flattens nested object summaries to text", () => {
  const xml = ATOM_WITH_OBJECT_SUMMARY.replace(
    "<summary>A plain atom summary.</summary>",
    "<summary><p>Para one.</p><p>Para two.</p></summary>",
  );
  const stories = parseFeed(xml, "Example");
  assert.equal(stories.length, 1);
  assert.match(stories[0].summary, /Para one/);
  assert.match(stories[0].summary, /Para two/);
  assert.doesNotMatch(stories[0].summary, /\[object Object\]/);
});
