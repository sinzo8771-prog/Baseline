import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllFeeds } from "../../lib/feeds.js";
import { composeStories, dailyStats, sourceStats, EDITION_CAP } from "../../lib/pipeline.js";
import { signalStats } from "../../lib/hype.js";
import { recordToday, recordSourceStats } from "../lib/hypeHistory.js";

// The printed edition is capped at 25 stories (1 lead + 24 in the grid).
// Applying the cap here means the front page, the Hype Index page, the toast,
// and the chip counts all measure the same edition. The full deduped list
// (allStories) is kept alongside so story permalinks can resolve any story
// that was in today's composed set, not just the front-page 25. The cap lives
// in src/lib/pipeline.js so the Worker feed route uses the same number.
// Stale-while-revalidate cache of the last good edition so a returning visitor
// sees content instantly instead of waiting on all 10 feeds again. Keyed by a
// version so a breaking shape change doesn't replay a poison pill.
const CACHE_KEY = "baseline-edition-v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — long enough to feel instant, short enough to stay fresh

function readCachedEdition() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || typeof cached.savedAt !== "number" || !Array.isArray(cached.stories)) return null;
    if (Date.now() - cached.savedAt > CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCachedEdition(edition, all, stats, sourceStats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), stories: edition, all, stats, sourceStats }),
    );
  } catch {
    // Quota or private-mode failure is non-fatal; we just skip the cache.
  }
}

function composeEdition(results) {
  const all = composeStories(results);
  const edition = all.slice(0, EDITION_CAP);
  const stats = dailyStats(edition);
  // Signal-category breakdown powers the Hype Index "WHY TODAY?" panel and
  // day-over-day "biggest shift" — always derived from real stories.
  stats.signalBreakdown = signalStats(edition);
  return { edition, all, stats, sources: sourceStats(all) };
}

// Feed results -> the shape the Sources page renders. Each entry carries the
// source's display `name` (not the API's `source` field), its health, and the
// error text if the relay failed.
export function sourceStatuses(results) {
  return results.map((r) => ({ name: r.source, ok: !r.error, error: r.error }));
}

// Holds the site's data: stories, stats, source health, an offline flag, and a
// `settled` flag that flips only when the final tally is in (partial results
// stream in while `loaded` is already true).
export default function useBaselineData() {
  // Prime state from the last successful edition so a return visit paints the
  // cached edition immediately (loaded starts true when we have one), then
  // refreshes in the background. Mirrors the original vanilla app.js flow.
  const cached = useMemo(() => readCachedEdition(), []);
  const [stories, setStories] = useState(cached ? cached.stories : []);
  const [allStories, setAllStories] = useState(cached ? cached.all ?? [] : []);
  const [stats, setStats] = useState(cached ? cached.stats : null);
  const [sourceStatsList, setSourceStatsList] = useState(cached ? cached.sourceStats ?? [] : []);
  const [sources, setSources] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loaded, setLoaded] = useState(Boolean(cached));
  const [settled, setSettled] = useState(false);
  const [servedFromCache, setServedFromCache] = useState(Boolean(cached));
  const [savedAt, setSavedAt] = useState(cached ? cached.savedAt : null);

  const load = useCallback(async () => {
    setSettled(false);
    try {
      const finalResults = await fetchAllFeeds({
        onPartial: (partial) => {
          // Each arriving feed re-composes a rolling edition. Setting `loaded`
          // on the first partial swaps the skeletons for real content, so a
          // slow feed never holds the front page hostage.
          setLoaded(true);
          setServedFromCache(false);
          const { edition, all, stats, sources: srcStats } = composeEdition(partial);
          setStories(edition);
          setAllStories(all);
          setStats(stats);
          setSourceStatsList(srcStats);
          setSources(sourceStatuses(partial));
        },
      });
      const { edition, all, stats, sources: srcStats } = composeEdition(finalResults);
      setStories(edition);
      setAllStories(all);
      setStats(stats);
      setSourceStatsList(srcStats);
      setSources(sourceStatuses(finalResults));
      // Persist the fresh edition for instant paint on the next load.
      writeCachedEdition(edition, all, stats, srcStats);
      setSavedAt(Date.now());
      recordToday(stats);
      recordSourceStats(srcStats);
      // Every relay failed => the network (or the relay) is down, not just the
      // feeds napping. This is the only signal that distinguishes "offline"
      // from a quiet morning, so derive it from the results.
      setOffline(finalResults.length > 0 && finalResults.every((r) => r.error));
      setLoaded(true);
      setServedFromCache(false);
      setSettled(true);
    } catch {
      // fetchAllFeeds rarely rejects (it catches per-feed errors), but if it
      // does the page can still stand up with whatever it already has.
      setOffline(true);
      setLoaded(true);
      setSettled(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({ stories, allStories, stats, sourceStats: sourceStatsList, sources, offline, loaded, settled, servedFromCache, savedAt, reload: load }),
    [stories, allStories, stats, sourceStatsList, sources, offline, loaded, settled, servedFromCache, savedAt, load],
  );
}
