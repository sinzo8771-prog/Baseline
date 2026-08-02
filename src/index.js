import { fetchAllFeeds } from "./feeds.js";
import { composeStories, dailyStats } from "./pipeline.js";
import { getStories, setStories, setStats } from "./store.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/news") {
      return handleApi(env);
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(_, env, ctx) {
    ctx.waitUntil(refresh(env));
  },
};

async function handleApi(env) {
  let payload = await getStories(env);
  if (!payload || !Array.isArray(payload.stories)) {
    await refresh(env);
    payload = await getStories(env);
    if (!payload || payload.stories.length === 0) {
      return json(
        {
          error: "cold_presses",
          message: "The presses are warming up. Nothing cached yet; check back in a minute.",
        },
        503,
      );
    }
  }
  return json(payload, 200, { "cache-control": "public, max-age=120" });
}

async function refresh(env) {
  const results = await fetchAllFeeds();
  const stories = composeStories(results);
  const stats = dailyStats(stories);
  const payload = {
    stories,
    stats,
    sources: results.map((r) => ({ name: r.source, ok: !r.error, error: r.error ?? null })),
    refreshedAt: new Date().toISOString(),
  };
  await setStories(env, payload);
  await setStats(env, stats);
  return payload;
}

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}
