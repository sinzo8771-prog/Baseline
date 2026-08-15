import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const ORIGIN = "https://the-baseline.baseline-news.workers.dev";

// withSecurityHeaders only decorates text/html responses, so the ASSETS stub
// controls the content-type to exercise both the "document" and "static asset"
// branches of the Worker's last route.
async function fetchThrough({ path, contentType, body = "<!DOCTYPE html><title>t</title>" }) {
  return worker.fetch(new Request(`${ORIGIN}${path}`), {
    ASSETS: {
      fetch: async () =>
        new Response(body, {
          status: 200,
          headers: { "content-type": contentType },
        }),
    },
  });
}

test("document responses carry CSP (incl. frame-ancestors), nosniff, and referrer-policy", async () => {
  const res = await fetchThrough({ path: "/", contentType: "text/html; charset=utf-8" });
  const csp = res.headers.get("content-security-policy");
  assert.ok(csp.includes("frame-ancestors 'none'"));
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
});

test("security headers stay scoped to text/html — static assets get none of them", async () => {
  const res = await fetchThrough({
    path: "/app.js",
    contentType: "text/javascript; charset=utf-8",
    body: "console.log(1);",
  });
  assert.equal(res.headers.get("content-security-policy"), null);
  assert.equal(res.headers.get("x-content-type-options"), null);
  assert.equal(res.headers.get("referrer-policy"), null);
});