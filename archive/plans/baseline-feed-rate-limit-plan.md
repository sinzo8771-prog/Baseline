# The Baseline — Rate-limit the self-published feed routes

**Repo:** https://github.com/sinzo8771-prog/Baseline
One item, one file.

---

## Rate-limit `/feed.xml` and `/feed.json`

- **File:** `src/index.js`
- **Problem:** every other dynamic route (`/api/feed`, `/api/feeds`) checks `allowRequest(request, scope)` before doing work (see lines 67-71). `/feed.xml` and `/feed.json` go straight to `serveFeed()` with no check at all. The edge cache (`caches.default`, 15 min TTL) absorbs most repeat traffic, but that cache is per-Cloudflare-PoP, not global — so the "cache miss" cost (`buildEdition()`: 8 parallel upstream fetches + XML parse + scoring) can be triggered repeatedly from different regions within the same TTL window, uncapped in frequency. The per-request protections (`UPSTREAM_TIMEOUT_MS`, `readBodyBounded` byte caps) are already correctly reused from `relayFeed` — this is purely a missing frequency cap at the route entry point, not a resource-exhaustion-per-request issue.
- **Fix:** add the same `allowRequest()` gate the API routes already use, before the cache lookup in `serveFeed`'s caller.

  Current (lines 85-87):
  ```js
  if (url.pathname === "/feed.xml" || url.pathname === "/feed.json") {
    return serveFeed(url.pathname, request);
  }
  ```

  Change to:
  ```js
  if (url.pathname === "/feed.xml" || url.pathname === "/feed.json") {
    if (!(await allowRequest(request, url.pathname))) {
      return json({ error: "rate_limited", message: "Too many requests from this address. Take a breath, then try again." }, 429);
    }
    return serveFeed(url.pathname, request);
  }
  ```
  Reuses the existing `allowRequest`/`RATE_LIMIT_PER_WINDOW`/`json()` helpers verbatim — no new logic, just applying the existing pattern to a route that was missed.

- **Consider (optional, don't block the fix above on this):** RSS readers legitimately poll on a fixed schedule and a feed URL is often shared/subscribed by more than one person behind the same IP (corporate NAT, VPN). `RATE_LIMIT_PER_WINDOW` (90 per window — check `RATE_WINDOW_MS` in the same file for the window length) was tuned for the API routes' interactive traffic pattern. If feed-reader polling from a shared IP looks like it'd realistically bump into that limit, consider a separate, higher threshold via a second constant (e.g. `FEED_RATE_LIMIT_PER_WINDOW`) rather than reusing the interactive-traffic number as-is — but only add this complexity if there's a real reason to think the default would false-positive on legitimate polling; don't speculate a new constant into existence without that signal.

- **Test:** `test/feed-route.test.js` already covers `extractStories`, both serializers, and XML injection. Add one test confirming a request that exceeds the rate limit for `/feed.xml` or `/feed.json` gets a 429 — mirror however the existing `/api/feed` rate-limit test (if one exists in the suite) simulates repeated requests; if no such test currently exists for the API routes either, this is a good place to establish the pattern for both.

- **Done when:** `/feed.xml` and `/feed.json` return 429 after `RATE_LIMIT_PER_WINDOW` requests within a window, exactly like `/api/feed` does; `npm run test:all` green.
