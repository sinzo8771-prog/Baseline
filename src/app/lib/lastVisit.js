// Last-visit timestamp for the "NEW since your last visit" badge. Written on
// visibility-hidden / unmount (the same lightweight pattern as the hype
// history), read on each load. A missing timestamp (first visit, cleared
// storage) means "no baseline" — nothing is badged, because badging the whole
// edition on someone's first read would be noise, not signal.

const LAST_VISIT_KEY = "baseline-last-visit-v1";

// Read the ISO timestamp of the previous session, or null on a first visit
// (or when storage is unavailable).
export function readLastVisit() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_VISIT_KEY);
    if (!raw) return null;
    const ts = Date.parse(raw);
    return Number.isNaN(ts) ? null : ts;
  } catch {
    return null;
  }
}

// Persist "now" as the last-visit timestamp. Silently no-ops on quota or
// private-mode failures.
export function writeLastVisit(ts = Date.now()) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_VISIT_KEY, new Date(ts).toISOString());
  } catch {
    // Non-fatal: the next visit just won't have a baseline to badge against.
  }
}

// True when the story was published strictly after the previous visit. Without
// a baseline (first visit) nothing is new, and a story with no usable
// publishedAt can never be "new".
export function isNewSinceLastVisit(publishedAt, lastVisit) {
  if (lastVisit === null || lastVisit === undefined) return false;
  const t = typeof publishedAt === "string" ? Date.parse(publishedAt) : NaN;
  if (Number.isNaN(t)) return false;
  return t > lastVisit;
}