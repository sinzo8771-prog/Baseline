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
    try {
      const finalResults = await fetchAllFeeds({
        onPartial: (partial) => {
          // Each arriving feed re-composes a rolling edition. Setting `loaded`
          // on the first partial swaps the skeletons for real content, so a
          // slow feed never holds the front page hostage.
          setLoaded(true);
          const storyList = composeStories(partial);
          setStories(storyList);
          setStats(dailyStats(storyList));
          setSources(partial.map((r) => ({ name: r.source, ok: !r.error, error: r.error })));
        },
      });
      const storyList = composeStories(finalResults);
      setStories(storyList);
      setStats(dailyStats(storyList));
      setSources(finalResults.map((r) => ({ name: r.source, ok: !r.error, error: r.error })));
      // Every relay failed => the network (or the relay) is down, not just the
      // feeds napping. This is the only signal that distinguishes "offline"
      // from a quiet morning, so derive it from the results.
      setOffline(finalResults.length > 0 && finalResults.every((r) => r.error));
      setLoaded(true);
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
    () => ({ stories, stats, sources, offline, loaded, reload: load }),
    [stories, stats, sources, offline, loaded, load],
  );
}