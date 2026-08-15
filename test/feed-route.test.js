import { test } from "node:test";
import assert from "node:assert/strict";
import { extractStories } from "../src/lib/xmlStories.js";
import { buildJsonFeed, buildRssFeed } from "../src/lib/feedBuilders.js";
import { composeStories } from "../src/lib/pipeline.js";
import worker from "../src/index.js";

// Must match RATE_LIMIT_PER_WINDOW in src/index.js (kept in sync with the
// worker's fixed-window counter so the 429 assertion stays meaningful).
const RATE_LIMIT_PER_WINDOW = 90;
const TEST_IP = "203.0.113.7";
const ORIGIN = "https://the-baseline.baseline-news.workers.dev";

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>Example</title>
<item>
  <title><![CDATA[OpenAI ships <b>a model</b>]]></title>
  <link>https://example.com/1</link>
  <pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate>
  <description><![CDATA[<p>A measured update.</p>]]></description>
  <enclosure url="https://cdn.example.com/photo.jpg" type="image/jpeg" />
</item>
<item>
  <title>Broken</title>
  <link>https://example.com/2</link>
  <pubDate>not a date</pubDate>
  <description>x</description>
</item>
<item>
  <title></title>
  <link>https://example.com/3</link>
  <pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate>
</item>
</channel></rss>`;

const ATOM_FIXTURE = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Example Atom</title>
<entry>
  <title>Atom entry title</title>
  <link href="https://example.com/atom"/>
  <updated>2026-08-04T10:00:00Z</updated>
  <summary>An atom summary.</summary>
</entry>
</feed>`;

test("extractStories parses RSS 2.0 items with CDATA and tags", () => {
  const stories = extractStories(RSS_FIXTURE, "Example");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].title, "OpenAI ships a model");
  assert.equal(stories[0].link, "https://example.com/1");
  assert.equal(stories[0].summary, "A measured update.");
  assert.equal(stories[0].source, "Example");
  assert.equal(stories[0].image, "https://cdn.example.com/photo.jpg");
  assert.ok(Date.parse(stories[0].publishedAt) > 0);
});

test("extractStories parses Atom entries with href links", () => {
  const stories = extractStories(ATOM_FIXTURE, "Example");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].title, "Atom entry title");
  assert.equal(stories[0].link, "https://example.com/atom");
  assert.equal(stories[0].summary, "An atom summary.");
});

test("extractStories drops items without a valid date or title", () => {
  const stories = extractStories(RSS_FIXTURE, "Example");
  for (const s of stories) {
    assert.ok(s.title.length > 0);
    assert.ok(s.link.length > 0);
    assert.ok(Date.parse(s.publishedAt) > 0);
  }
});

test("extractStories returns [] for garbage", () => {
  assert.equal(extractStories("<not xml at all", "Example").length, 0);
  assert.equal(extractStories("", "Example").length, 0);
});

test("extractStories extracts media:thumbnail image", () => {
  const xml = `<rss version="2.0"><channel>
    <item>
      <title>With a thumbnail</title>
      <link>https://example.com/t</link>
      <pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate>
      <media:thumbnail url="https://cdn.example.com/thumb.jpg" xmlns:media="http://search.yahoo.com/mrss/" />
    </item>
  </channel></rss>`;
  const stories = extractStories(xml, "Example");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].image, "https://cdn.example.com/thumb.jpg");
});

test("extractStories rejects non-http images", () => {
  const xml = `<rss version="2.0"><channel>
    <item>
      <title>With a sketchy image</title>
      <link>https://example.com/img</link>
      <pubDate>Mon, 03 Aug 2026 10:00:00 GMT</pubDate>
      <enclosure url="data:image/svg+xml;base64,AAAA" type="image/svg+xml" />
    </item>
  </channel></rss>`;
  const stories = extractStories(xml, "Example");
  assert.equal(stories.length, 1);
  assert.equal(stories[0].image, null);
});

test("extractStories output flows through the shared composeStories pipeline", () => {
  const results = [
    { source: "Example", stories: extractStories(RSS_FIXTURE, "Example") },
    { source: "Example Atom", stories: extractStories(ATOM_FIXTURE, "Example Atom") },
  ];
  const composed = composeStories(results);
  assert.ok(composed.length >= 2);
  for (const s of composed) {
    assert.ok(s.id);
    assert.ok(s.spin);
    assert.ok(Number.isFinite(s.spinScore));
  }
});

test("buildJsonFeed produces a JSON Feed 1.1 document with _spin", () => {
  const results = [
    { source: "Example", stories: extractStories(RSS_FIXTURE, "Example") },
    { source: "Example Atom", stories: extractStories(ATOM_FIXTURE, "Example Atom") },
  ];
  const edition = composeStories(results).slice(0, 2);
  const baseUrl = "https://the-baseline.baseline-news.workers.dev";
  const feed = JSON.parse(buildJsonFeed(edition, { baseUrl, feedUrl: `${baseUrl}/feed.json` }));
  assert.equal(feed.version, "https://jsonfeed.org/version/1.1");
  assert.equal(feed.feed_url, `${baseUrl}/feed.json`);
  assert.equal(feed.home_page_url, `${baseUrl}/`);
  assert.ok(feed.items.length >= 1);
  for (const item of feed.items) {
    assert.ok(item.id);
    assert.ok(item.title);
    assert.ok(item.url.startsWith(`${baseUrl}/story/`));
    assert.ok(Array.isArray(item._spin.flags));
    assert.equal(typeof item._spin.score, "number");
    assert.ok(["Measured", "Warm", "Hot", "On Fire"].includes(item._spin.tier));
    assert.ok(item.authors[0].name);
  }
});

test("buildRssFeed produces RSS 2.0 with escaped content and spin category", () => {
  const results = [
    { source: "Example", stories: extractStories(RSS_FIXTURE, "Example") },
    { source: "Example Atom", stories: extractStories(ATOM_FIXTURE, "Example Atom") },
  ];
  const edition = composeStories(results).slice(0, 2);
  const baseUrl = "https://the-baseline.baseline-news.workers.dev";
  const xml = buildRssFeed(edition, { baseUrl, feedUrl: `${baseUrl}/feed.xml` });

  assert.ok(xml.startsWith("<?xml version=\"1.0\""));
  assert.ok(xml.includes("<rss version=\"2.0\""));
  assert.ok(xml.includes("<item>"));
  assert.ok(xml.includes("<guid isPermaLink=\"false\">"));
  assert.ok(xml.includes("<category>"));
  assert.ok(xml.includes("<ns:score>"));
  // RSS 2.0 has no <items> wrapper — <item> is a direct child of <channel>
  assert.ok(!xml.includes("<items>"));
  // <item> count matches the edition length
  const itemCount = (xml.match(/<item>/g) || []).length;
  assert.equal(itemCount, edition.length);
  // Ampersands in any summary must be escaped (no bare &)
  assert.ok(!/<description>.*&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml));
});

test("feed serializers escape XML-injection content", () => {
  const evil = {
    id: "evil",
    title: "<script>alert(1)</script> & \"quotes\"",
    summary: "a & b < c",
    publishedAt: "2026-08-04T10:00:00Z",
    source: "Evil <feed>",
    spin: "Hot",
    spinScore: 30,
    flags: ["x"],
  };
  const baseUrl = "https://the-baseline.baseline-news.workers.dev";
  const xml = buildRssFeed([evil], { baseUrl, feedUrl: `${baseUrl}/feed.xml` });
  assert.ok(xml.includes("&lt;script&gt;"));
  assert.ok(!xml.includes("<script>"));
  assert.ok(xml.includes("&amp;"));
});

// The worker's rate limiter (allowRequest) backs onto Cloudflare's
// `caches.default` and real upstream `fetch`, neither of which exists under
// plain `node --test`. Swap in an in-memory cache and a fetch that makes every
// upstream look unreachable (so buildEdition degrades to an empty edition
// instead of hitting the network), run, then restore the globals.
async function withWorkerGlobals(run) {
  const store = new Map();
  const realCaches = globalThis.caches;
  const realFetch = globalThis.fetch;
  globalThis.caches = {
    default: {
      async match(req) {
        const hit = store.get(req.url);
        return hit ? hit.clone() : undefined;
      },
      async put(req, res) {
        store.set(req.url, res.clone());
      },
    },
  };
  globalThis.fetch = async () => new Response("", { status: 503 });
  try {
    return await run();
  } finally {
    if (realCaches) globalThis.caches = realCaches;
    else delete globalThis.caches;
    if (realFetch) globalThis.fetch = realFetch;
    else delete globalThis.fetch;
  }
}

async function hit(path) {
  const res = await worker.fetch(
    new Request(`${ORIGIN}${path}`, { headers: { "CF-Connecting-IP": TEST_IP } }),
    { ASSETS: { fetch: async () => new Response("", { status: 200 }) } },
  );
  return res.status;
}

async function statuses(path, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(await hit(path));
  return out;
}

// The feed routes must answer 429 once a single IP exceeds the window's
// request budget, exactly like the API routes already do — the fixed-window
// counter is scoped per path, so the three routes never share a bucket.
for (const path of ["/feed.xml", "/feed.json", "/api/feed"]) {
  test(`rate limits ${path} like the API routes (429 past the window)`, async () => {
    await withWorkerGlobals(async () => {
      const statusesBelow = await statuses(path, RATE_LIMIT_PER_WINDOW);
      assert.equal(statusesBelow.length, RATE_LIMIT_PER_WINDOW);
      assert.ok(statusesBelow.every((s) => s !== 429), "requests under the limit must not be refused");
      assert.equal(await hit(path), 429, "the request past the window must be refused");
    });
  });
}
