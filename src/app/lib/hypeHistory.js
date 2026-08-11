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
    // Per-category signal counts feed the "WHY TODAY?" / "biggest shift"
    // panels. Recorded from real story data; absent on older entries, which
    // the UI must treat as "not enough history".
    signals: stats.signalBreakdown || undefined,
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

// Per-source daily averages, so the Sources page can show "who's getting
// louder" without pretending browser-local data is global. Stored separately
// from the global hype history so each reader's baseline stays honest.
const SOURCE_HISTORY_KEY = "baseline-source-history-v1";
const SOURCE_MAX_DAYS = 30;

export function readSourceHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SOURCE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e.date === "string" && Array.isArray(e.sources))
      .slice(0, SOURCE_MAX_DAYS);
  } catch {
    return [];
  }
}

// `sourceStats` is the output of pipeline.sourceStats (full edition). Records
// today's per-source averages, newest-first, one entry per calendar day.
export function recordSourceStats(sourceStats, d = new Date()) {
  if (typeof window === "undefined") return;
  const today = localDateKey(d);
  const entry = {
    date: today,
    sources: sourceStats.map((s) => ({ name: s.name, count: s.count, avgHype: s.avgHype })),
  };
  try {
    const history = readSourceHistory().filter((e) => e.date !== today);
    history.unshift(entry);
    window.localStorage.setItem(SOURCE_HISTORY_KEY, JSON.stringify(history.slice(0, SOURCE_MAX_DAYS)));
  } catch {
    // Non-fatal: the leaderboard just shows today without a trend.
  }
}

// Compare a source's average headline intensity against its previous available
// day. Returns "up" | "down" | "flat", or null when there's no prior reading.
export function sourceTrend(history, name) {
  const today = history.find((e) => e.sources.some((s) => s.name === name));
  if (!today) return null;
  const todayEntry = today.sources.find((s) => s.name === name);
  let prevEntry = null;
  for (const day of history.slice(1)) {
    const match = day.sources.find((s) => s.name === name);
    if (match) {
      prevEntry = match;
      break;
    }
  }
  if (!todayEntry || !prevEntry) return null;
  if (todayEntry.avgHype === prevEntry.avgHype) return "flat";
  return todayEntry.avgHype > prevEntry.avgHype ? "up" : "down";
}
