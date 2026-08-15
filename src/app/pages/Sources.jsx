import { useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import TrendCell from "../components/TrendCell.jsx";
import { readSourceHistory, sourceTrendReading, sourceSeries } from "../lib/hypeHistory.js";
import { isMirroredFeed } from "../../lib/feeds.js";
import exportOPML from "../lib/exportOPML.js";

function Leaderboard({ stats, history }) {
  if (!stats || stats.length === 0) {
    return <p className="text-sm text-muted-foreground">No edition to measure yet.</p>;
  }
  const rows = [...stats].sort((a, b) => b.avgHype - a.avgHype || b.count - a.count);
  return (
    <table className="mt-4 w-full border-collapse text-left" role="table" aria-label="Who's shouting — average headline intensity by source">
      <caption className="sr-only">Average headline intensity by source</caption>
      <thead>
        <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          <th className="py-2 pr-4 font-medium">Source</th>
          <th className="py-2 pr-4 text-right font-medium">Stories</th>
          <th className="py-2 pr-4 text-right font-medium">Avg. hype</th>
          <th className="py-2 text-right font-medium">Trend</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => (
          <tr key={s.name} className="border-b border-border/60">
            <td className="py-2.5 pr-4">
              <Link
                to={`/sources/${encodeURIComponent(s.name)}`}
                className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {s.name}
              </Link>
              {isMirroredFeed(s.name) ? (
                <span className="ml-2 inline-block rounded-sm border border-border/70 px-1.5 py-px text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                  mirrored feed
                </span>
              ) : null}
            </td>
            <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">{s.count}</td>
            <td className="py-2.5 pr-4 text-right tabular-nums text-foreground">{s.avgHype}</td>
            <td className="py-2.5 text-right">
              <TrendCell reading={sourceTrendReading(history, s.name)} series={sourceSeries(history, s.name)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FeedStatus({ sources }) {
  const sorted = useMemo(() => {
    return [...(sources || [])].sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? 1 : -1;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [sources]);
  return (
    <ul id="source-list" className="source-list mt-6">
      {sorted.map((s) => (
        <li key={s.name}>
          <Link
            to={`/sources/${encodeURIComponent(s.name)}`}
            className="source-link"
            title={`Browse ${s.name}`}
          >
            {s.name}
          </Link>
          <span className={s.ok ? "status ok" : "status err"}>{s.ok ? "live" : `down (${s.error ?? "no signal"})`}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Sources({ sources, sourceStats: stats, loaded, offline, reload }) {
  const history = readSourceHistory();
  return (
    <section id="sources" className="section">
      <h1 className="section-title">Who's Shouting?</h1>
      <p className="section-note">
        Average headline intensity per source — a measurement, not a judgment. The wire room reports who is talking, and how loud. Dead sources are skipped automatically.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-outline" onClick={exportOPML}>Download OPML</button>
        <a className="btn-outline" href="/feed.xml" type="application/rss+xml" rel="alternate">RSS feed</a>
        <a className="btn-outline" href="/feed.json" type="application/feed+json" rel="alternate">JSON Feed</a>
      </div>
      {loaded ? (
        offline && !stats?.length ? (
          <EmptyState
            kicker="THE PRESSES ARE JAMMED"
            text="The latest wires could not be reached, and there is no saved edition on hand. Try the presses again."
            action={{ label: "TRY AGAIN", onClick: reload }}
          />
        ) : (
          <>
            {offline ? (
              <p className="mb-4 border border-border/70 bg-card px-4 py-2.5 text-xs uppercase tracking-[0.08em] text-muted-foreground" role="status">
                The latest wires could not be reached — showing the saved edition.{" "}
                <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={reload}>
                  TRY AGAIN
                </button>
              </p>
            ) : null}
            <Leaderboard stats={stats} history={history} />
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Who's on the wire
            </h2>
            <FeedStatus sources={sources} />
          </>
        )
      ) : (
        <div className="h-6 w-60 animate-pulse rounded skeleton" />
      )}
    </section>
  );
}
