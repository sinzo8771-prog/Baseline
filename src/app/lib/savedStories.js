// Save-for-later / reading list, persisted to localStorage. A saved story is
// kept as a full snapshot (headline, summary, link, metadata) so the /saved
// page still renders it even after the story ages out of a source feed — the
// cache of last resort, in the same spirit as the saved edition. Mirrors the
// read/write pattern of hypeHistory.js.

const SAVED_KEY = "baseline-saved-stories-v1";

function snap(story) {
  return {
    id: story.id,
    title: story.title,
    summary: story.summary || "",
    link: story.link || "",
    source: story.source || "",
    spin: story.spin || "Measured",
    spinScore: typeof story.spinScore === "number" ? story.spinScore : 0,
    flags: Array.isArray(story.flags) ? story.flags : [],
    signals: Array.isArray(story.signals) ? story.signals : [],
    hedged: Boolean(story.hedged),
    publishedAt: story.publishedAt || "",
    image: story.image || "",
    savedAt: Date.now(),
  };
}

// Newest-saved first. Returns an empty array on first use / corruption.
export function readSavedStories() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e) => e && typeof e.id === "string" && typeof e.title === "string");
  } catch {
    return [];
  }
}

function write(stories) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(stories));
  } catch {
    // Quota or private-mode failure is non-fatal; the list just won't persist.
  }
}

export function isSaved(id) {
  return readSavedStories().some((s) => s.id === id);
}

export function saveStory(story) {
  if (typeof window === "undefined" || !story?.id) return;
  if (isSaved(story.id)) return;
  const next = [snap(story), ...readSavedStories()];
  write(next);
}

export function removeSavedStory(id) {
  if (typeof window === "undefined" || !id) return;
  write(readSavedStories().filter((s) => s.id !== id));
}

export function toggleSaved(story) {
  if (typeof window === "undefined" || !story?.id) return false;
  const already = isSaved(story.id);
  if (already) {
    removeSavedStory(story.id);
  } else {
    saveStory(story);
  }
  return !already;
}

// Merge a set of live fetched stories against the saved list: saved entries
// whose source feed still carries them get fresh data, entries that aged out
// keep their cached snapshot. Returned as an array of saved records.
export function reconcileSaved(liveStories) {
  const live = new Map(liveStories.map((s) => [s.id, s]));
  return readSavedStories().map((saved) => (live.has(saved.id) ? { ...saved, ...live.get(saved.id) } : saved));
}