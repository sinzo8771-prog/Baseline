import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllFeeds } from "../../lib/feeds.js";
import { composeStories, dailyStats } from "../../lib/pipeline.js";

// The printed edition is capped at 25 stories (1 lead + 24 in the grid).
// Applying the cap here means the front page, the Hype Index page, the toast,
// and the chip counts all measure the same edition.
const EDITION_CAP = 25;

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

function writeCachedEdition(edition, stats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), stories: edition, stats }),
    );
  } catch {
    // Quota or private-mode failure is non-fatal; we just skip the cache.
  }
}

function composeEdition(results) {
  const full = composeStories(results);
  const edition = full.slice(0, EDITION_CAP);
  return { edition, stats: dailyStats(edition) };
}

// Holds the site's data: stories, stats, source health, and an offline flag.
// Mirrors the original vanilla app.js flow (fetch -> parse -> score -> render).
export default function useBaselineData() {
  // Prime state from the last successful edition (painted before any fetch).
  const cached = useMemo(() => readCachedEdition(), []);
  const [stories, setStories] = useState(cached ? cached.stories : []);
  const [stats, setStats] = useState(cached ? cached.stats : null);
  const [sources, setSources] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [servedFromCache, setServedFromCache] = useState(Boolean(cached));

  const load = useCallback(async () => {
    try {
      const finalResults = await fetchAllFeeds({
        onPartial: (partial) => {
          // Each arriving feed re-composes a rolling edition. Setting `loaded`
          // on the first partial swaps the skeletons for real content, so a
          // slow feed never holds the front page hostage.
          setLoaded(true);
          setServedFromCache(false);
          const { edition, stats } = composeEdition(partial);
          setStories(edition);
          setStats(stats);
          setSources(partial.map((r) => ({ name: r.source, ok: !r.error, error: r.error })));
        },
      });
      const { edition, stats } = composeEdition(finalResults);
      setStories(edition);
      setStats(stats);
      setSources(finalResults.map((r) => ({ name: r.source, ok: !r.error, error: r.error })));
      // Persist the fresh edition for instant paint on the next load.
      writeCachedEdition(edition, stats);
      // Every relay failed => the network (or the relay) is down, not just the
      // feeds napping. This is the only signal that distinguishes "offline"
      // from a quiet morning, so derive it from the results.
      setOffline(finalResults.length > 0 && finalResults.every((r) => r.error));
      setLoaded(true);
      setServedFromCache(false);
    } catch {
      // fetchAllFeeds rarely rejects (it catches per-feed errors), but if it
      // does the page can still stand up with its default empty state.
      setOffline(true);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({ stories, stats, sources, offline, loaded, servedFromCache, reload: load }),
    [stories, stats, sources, offline, loaded, servedFromCache, load],
  );
}