// Edition ranking. The default "Edited" order is a news judgment, not a
// timestamp dump: freshness (a story stops being front-page news after ~a day),
// then hype, then a source-diversity cap so one prolific publisher cannot own
// the entire front page. The other sorts are the pure views a power user wants.
//
// Spec §27/§29: freshness + diversity + relevance + hype, and hype must never
// become a proxy for importance — a calm but important story stays visible
// because the score is dominated by freshness, not hype.

const RECENCY_MS = 3.6e6; // one hour in ms

function publishedAt(story) {
  return new Date(story?.publishedAt).getTime();
}

function recency(a, b) {
  return publishedAt(b) - publishedAt(a);
}

// Base "edited" score: a story loses ~5 points per hour of age and gains its
// hype score, so a 4-hour-old calm story (20 − 4 + 0 = 16) still beats a
// brand-new hype story with a middling score. Hype tilts ties, never decides.
export function editedScore(story, now = Date.now()) {
  const ageH = Math.max(0, (now - publishedAt(story)) / RECENCY_MS);
  const freshness = Math.max(0, 20 - ageH);
  return freshness * 5 + (story?.spinScore ?? 0);
}

// Greedy ranking with a sliding-window diversity cap. Stories are processed in
// edited-score order, but a source is skipped while `maxPerSource` of its
// stories already sit in the trailing `windowSize` slots; when every remaining
// source is at the cap (a genuinely single-source day), fall back to the next
// best story so the edition still fills.
export function editedRank(stories, { now = Date.now(), windowSize = 6, maxPerSource = 2 } = {}) {
  const pending = [...stories].sort((a, b) => editedScore(b, now) - editedScore(a, now) || recency(a, b));
  const placed = [];
  while (pending.length > 0) {
    const window = placed.slice(-windowSize);
    const idx = pending.findIndex((s) => window.filter((p) => p.source === s.source).length < maxPerSource);
    const chosen = idx === -1 ? 0 : idx;
    placed.push(pending[chosen]);
    pending.splice(chosen, 1);
  }
  return placed;
}

export function sortStories(stories, sort, opts = {}) {
  const arr = [...stories];
  if (sort === "newest") return arr.sort(recency);
  if (sort === "hottest") {
    return arr.sort((a, b) => (b.spinScore ?? 0) - (a.spinScore ?? 0) || recency(a, b));
  }
  if (sort === "source") {
    return arr.sort((a, b) => (a.source ?? "").localeCompare(b.source ?? "") || recency(a, b));
  }
  return editedRank(arr, opts);
}
