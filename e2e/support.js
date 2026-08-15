import { test as base } from "@playwright/test";

// Deterministic feed fixtures for the browser E2E run. Stories deliberately
// carry no images: a missing image would hit the network in the test browser
// and spam the console with net::ERR resource errors, which would drown out
// the "no console errors" assertion in the navigation smoke test.
export const FIXTURES = {
  OpenAI: [
    ["OpenAI ships a faster model", 12],
    ["OpenAI publishes a quiet research note", 45],
  ],
  Anthropic: [
    ["Anthropic releases a smaller model", 60],
    ["Anthropic updates its safety policy", 150],
  ],
  "The Verge AI": [["The Verge AI reviews the new hardware", 240]],
};

function slug(name) {
  return name.toLowerCase().replace(/[^a-z]+/g, "");
}

function rssFeed(name, items) {
  const entries = items
    .map(([title, minutesAgo]) => {
      const date = new Date(Date.now() - minutesAgo * 60_000).toUTCString();
      return [
        "<item>",
        `<title><![CDATA[${title}]]></title>`,
        `<link>https://${slug(name)}.example/story</link>`,
        `<pubDate>${date}</pubDate>`,
        `<description><![CDATA[<p>A measured update from ${name}.</p>]]></description>`,
        "</item>",
      ].join("");
    })
    .join("\n    ");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${name}</title>${entries}</channel></rss>`;
}

export const SOURCES = Object.keys(FIXTURES).map((name) => ({
  name,
  feed: `https://${slug(name)}.example/rss.xml`,
}));

// Swallow the production service-worker registration: the shell cache would
// otherwise intercept /api and navigation fetches and muddy the mocks.
const DISABLE_SW = () => {
  if ("serviceWorker" in navigator) {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: () => new Promise(() => {}) },
    });
  }
};

// A test whose page boots with the feed API mocked and the service worker
// disabled, so the edition renders from deterministic fixtures on every route.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(DISABLE_SW);
    const byName = new Map(SOURCES.map((s) => [s.name, rssFeed(s.name, FIXTURES[s.name])]));
    await page.route("**/api/feeds", (route) =>
      route.fulfill({ status: 200, json: { sources: SOURCES } }),
    );
    await page.route("**/api/feed*", (route) => {
      const name = new URL(route.request().url()).searchParams.get("name");
      const xml = byName.get(name);
      if (!xml) {
        return route.fulfill({ status: 404, contentType: "text/plain", body: "not found" });
      }
      return route.fulfill({ status: 200, contentType: "text/xml; charset=utf-8", body: xml });
    });
    await use(page);
  },
});

// Collect real JavaScript failures, ignoring resource-load noise (fonts,
// favicon) that the test browser may not reach but a real browser would fetch
// without issue.
export function trackPageErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/Failed to load resource|net::ERR|favicon/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}