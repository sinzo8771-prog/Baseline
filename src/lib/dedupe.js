export function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Strip a leading source-brand prefix like "OpenAI: …", "Anthropic — …", or
// "The Verge AI | …" so a branded headline compares equal to the unbranded
// original it syndicates. Only tokens that match a known source name are ever
// removed, so a headline that merely *mentions* a company is never mangled.
export function stripSourcePrefix(title, sourceNames = []) {
  let t = String(title || "").trim();
  for (const name of sourceNames) {
    if (!name) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = t.match(new RegExp(`^${escaped}\\s*[:\\u2014\\u2013\\-|]\\s*(.+)$`, "i"));
    if (match?.[1]?.trim()) {
      t = match[1].trim();
      break;
    }
  }
  return t;
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
  // The corpus's own source names are the only prefix tokens we trust, so a
  // headline that merely mentions "OpenAI" is never stripped.
  const sourceNames = [...new Set(stories.map((s) => s?.source).filter(Boolean))];
  const seenKeys = new Set();
  const kept = [];
  for (const story of stories) {
    const stripped = stripSourcePrefix(story.title, sourceNames);
    const key = normalizeTitle(stripped);
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
