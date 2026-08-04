export function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function titleSimilarity(a, b) {
  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }
  return intersection / Math.max(setA.size, setB.size);
}

export function dedupeStories(stories) {
  const seenKeys = new Set();
  const kept = [];
  for (const story of stories) {
    const key = normalizeTitle(story.title);
    if (!key) continue;
    let isDuplicate = seenKeys.has(key);
    if (!isDuplicate) {
      for (const keptKey of seenKeys) {
        if (titleSimilarity(key, keptKey) >= 0.8) {
          isDuplicate = true;
          break;
        }
      }
    }
    if (isDuplicate) continue;
    seenKeys.add(key);
    kept.push(story);
  }
  return kept;
}
