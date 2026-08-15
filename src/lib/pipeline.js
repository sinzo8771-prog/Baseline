import { spinFromStory, signalStats } from "./hype.js";
import { dedupeStories } from "./dedupe.js";

// The printed edition is capped at 25 stories (1 lead + 24 in the grid).
// Shared by the browser (useBaselineData) and the Worker feed route so the
// self-published feed reflects the exact same edition the front page shows.
export const EDITION_CAP = 25;

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export function composeStories(feedResults) {
  const scored = feedResults
    .flatMap((r) => r.stories)
    .map((story) => ({
      id: hashId(`${story.title}|${story.link}`),
      ...story,
      ...spinFromStory(story),
    }));
  const deduped = dedupeStories(scored);
  const sorted = [...deduped].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return sorted.slice(0, 50);
}

export function dailyStats(stories) {
  const bySpin = { Measured: 0, Warm: 0, Hot: 0, "On Fire": 0 };
  for (const story of stories) {
    bySpin[story.spin] = (bySpin[story.spin] ?? 0) + 1;
  }
  const hyped = stories.filter((s) => s.spin !== "Measured").length;
  const hypePercent = stories.length > 0 ? Math.round((hyped / stories.length) * 100) : 0;
  return {
    hypePercent,
    bySpin,
    total: stories.length,
    // Per-category signal counts drive the "WHY TODAY?" and "biggest shift"
    // panels; recordToday persists them with the day's entry.
    signalBreakdown: signalStats(stories),
    generatedAt: new Date().toISOString(),
  };
}

// A single headline can move a 5-story edition by 20 points but barely dent a
// 25-story one. Below this many stories the Hype percentage is too sensitive to
// read as a meaningful daily measurement, so the UI labels it honestly instead
// of presenting a small-sample figure as definitive.
export const MIN_SAMPLE = 8;

export function isSmallSample(total) {
  return Number.isFinite(total) && total > 0 && total < MIN_SAMPLE;
}

// Per-source analytics for the "Who's shouting?" leaderboard. `avgHype` is the
// mean headline-intensity score (0-100), so it is a measurement, not a
// judgment on the outlet. Sorted loudest-first.
export function sourceStats(stories) {
  const map = new Map();
  for (const story of stories) {
    if (!story?.source) continue;
    if (!map.has(story.source)) {
      map.set(story.source, { name: story.source, count: 0, totalScore: 0, bySpin: {} });
    }
    const entry = map.get(story.source);
    entry.count += 1;
    entry.totalScore += story.spinScore ?? 0;
    entry.bySpin[story.spin] = (entry.bySpin[story.spin] ?? 0) + 1;
  }
  return [...map.values()]
    .map((e) => ({ name: e.name, count: e.count, avgHype: Math.round(e.totalScore / e.count), bySpin: e.bySpin }))
    .sort((a, b) => b.avgHype - a.avgHype || b.count - a.count || a.name.localeCompare(b.name));
}

// A deterministic per-day edition number (No. N), anchored to a fixed epoch so
// the same calendar day always yields the same edition without any storage.
export function editionNumber(d = new Date()) {
  const epoch = Date.UTC(2025, 0, 1);
  const day = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(1, Math.floor((day - epoch) / 86400000) + 1);
}

// Compact "SINCE YESTERDAY" deltas computed only from collected metadata, never
// fabricated. `prev`/`today` are dailyStats-shaped objects; returns an ordered
// list of { label, delta, unit } changes, plus a stable leading item for hype.
export function dailyShift(today, prev) {
  if (!today || !prev) return [];
  const out = [];
  out.push({ label: "Hype", delta: today.hypePercent - prev.hypePercent, unit: "pts" });
  const tiers = ["Measured", "Warm", "Hot", "On Fire"];
  for (const tier of tiers) {
    const d = (today.bySpin?.[tier] ?? 0) - (prev.bySpin?.[tier] ?? 0);
    if (d !== 0) out.push({ label: `${tier} stories`, delta: d, unit: "" });
  }
  out.push({ label: "Story volume", delta: today.total - prev.total, unit: "stories" });
  return out.filter((x) => x.delta !== 0);
}
