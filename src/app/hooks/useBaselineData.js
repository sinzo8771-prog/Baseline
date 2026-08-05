import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllFeeds } from "../../lib/feeds.js";
import { composeStories, dailyStats } from "../../lib/pipeline.js";

// Holds the site's data: stories, stats, source health, and an offline flag.
// Mirrors the original vanilla app.js flow (fetch -> parse -> score -> render).
export default function useBaselineData() {
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState(null);
  const [sources, setSources] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    let results;
    try {
      results = await fetchAllFeeds();
    } catch {
      // fetchAllFeeds rarely rejects (it catches per-feed errors), but if it
      // does the page can still stand up with its default empty state.
      setOffline(true);
      setLoaded(true);
      return;
    }
    const storyList = composeStories(results);
    setStories(storyList);
    setStats(dailyStats(storyList));
    setSources(results.map((r) => ({ name: r.source, ok: !r.error, error: r.error })));
    // Every relay failed => the network (or the relay) is down, not just the
    // feeds napping. This is the only signal that distinguishes "offline"
    // from a quiet morning, so derive it from the results.
    setOffline(results.length > 0 && results.every((r) => r.error));
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({ stories, stats, sources, offline, loaded, reload: load }),
    [stories, stats, sources, offline, loaded, load],
  );
}