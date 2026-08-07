import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllFeeds } from "../../lib/feeds.js";
import { composeStories, dailyStats } from "../../lib/pipeline.js";

// The printed edition is capped at 25 stories (1 lead + 24 in the grid).
// Applying the cap here means the front page, the Hype Index page, the toast,
// and the chip counts all measure the same edition.
const EDITION_CAP = 25;

function composeEdition(results) {
  const full = composeStories(results);
  const edition = full.slice(0, EDITION_CAP);
  return { edition, stats: dailyStats(edition) };
}

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