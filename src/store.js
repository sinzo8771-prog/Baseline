const KEY_STORIES = "stories:latest";
const KEY_STATS = "stats:today";

export async function getStories(env) {
  return env.BASELINE_KV.get(KEY_STORIES, "json");
}

export async function setStories(env, payload) {
  await env.BASELINE_KV.put(KEY_STORIES, JSON.stringify(payload), { expirationTtl: 7 * 24 * 3600 });
}

export async function setStats(env, stats) {
  await env.BASELINE_KV.put(KEY_STATS, JSON.stringify(stats), { expirationTtl: 7 * 24 * 3600 });
}
