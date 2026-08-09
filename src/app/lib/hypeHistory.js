// Daily Hype Index history, persisted to localStorage so the gauge has a
// baseline: "63% today" means nothing until you can say "up 8 from yesterday"
// and show where today sits in the last week. Stored as a date-keyed array,
// newest first, capped to keep the payload trivial.

const HISTORY_KEY = "baseline-hype-history-v1";
const MAX_DAYS = 30;

export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function readHypeHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e.date === "string" && typeof e.hypePercent === "number")
      .slice(0, MAX_DAYS);
  } catch {
    return [];
  }
}

export function recordToday(stats) {
  if (typeof window === "undefined" || !stats) return;
  const today = localDateKey();
  const entry = {
    date: today,
    hypePercent: stats.hypePercent,
    total: stats.total,
    bySpin: stats.bySpin,
  };
  try {
    const history = readHypeHistory().filter((e) => e.date !== today);
    history.unshift(entry);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_DAYS)));
  } catch {
    // Quota or private-mode failure is non-fatal; the index just has no baseline.
  }
}

export function hypeTrend(history) {
  if (history.length === 0) return { delta: null, series: [] };
  const today = history[0];
  const yesterday = history[1] ?? null;
  const delta =
    yesterday && today.date !== yesterday.date ? today.hypePercent - yesterday.hypePercent : null;
  return {
    delta,
    series: history.slice(0, 7).map((e) => ({ date: e.date, hypePercent: e.hypePercent })),
  };
}
