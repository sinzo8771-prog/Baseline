import { spinFromStory } from "./hype.js";
import { dedupeStories } from "./dedupe.js";

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
    generatedAt: new Date().toISOString(),
  };
}
