import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SpinBadge from "../components/SpinBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { readSourceHistory, sourceTrendReading } from "../lib/hypeHistory.js";
import { isMirroredFeed } from "../../lib/feeds.js";

const TIERS = ["Measured", "Warm", "Hot", "On Fire"];

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Distribution({ bySpin }) {
  const max = Math.max(1, ...TIERS.map((t) => bySpin?.[t] ?? 0));
  return (
    <div className="mt-4 space-y-2">
      {TIERS.map((tier) => {
        const n = bySpin?.[tier] ?? 0;
        const width = n === 0 ? 0 : Math.max(4, Math.round((n / max) * 100));
        return (
          <div key={tier} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{tier}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-[2px] bg-accent" role="meter" aria-label={`${tier}: ${n} stories`} aria-valuenow={n} aria-valuemin={0} aria-valuemax={max}>
              <div className="h-full bg-primary/70" style={{ width: `${width}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right tabular-nums text-sm text-foreground">{n}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SourceProfile({ allStories, sources, sourceStats: stats, loaded, offline, reload }) {
  // useParams already percent-decodes the segment (react-router decodePath);
  // re-decoding here would corrupt names with literal "%" and throw URIError
  // on malformed input like "/sources/%".
  const { name: decoded } = useParams();

  const storyList = useMemo(() => allStories.filter((s) => s.source === decoded), [allStories, decoded]);
  const stat = useMemo(() => stats?.find((s) => s.name === decoded) || null, [stats, decoded]);
  const feed = useMemo(() => sources?.find((s) => s.name === decoded) || null, [sources, decoded]);

  const history = readSourceHistory();
  const trendReading = sourceTrendReading(history, decoded);

  useEffect(() => {
    if (decoded) document.title = `${decoded} — The Baseline`;
  }, [decoded]);

  if (!loaded) {
    return (
      <section className="section">
        <div className="h-5 w-48 animate-pulse rounded skeleton" />
        <div className="mt-4 h-6 w-72 animate-pulse rounded skeleton" />
      </section>
    );
  }

  if (offline && !stat && !feed) {
    return (
      <EmptyState
        kicker="THE PRESSES ARE JAMMED"
        text="The latest wires could not be reached, and no saved copy of this source is on hand."
        action={{ label: "TRY AGAIN", onClick: reload }}
      />
    );
  }

  if (!stat && !feed) {
    return (
      <EmptyState
        kicker="NO SUCH DESK"
        text={`No source named "${decoded}" is in the edition. It may have gone quiet, or the address is mistyped.`}
        action={{ label: "Back to sources", onClick: () => (window.location.href = "/sources") }}
      />
    );
  }

  const statusOk = feed ? feed.ok : true;
  const statusText = feed ? (feed.ok ? "reporting" : `down (${feed.error ?? "no signal"})`) : "reporting";

  return (
    <section className="section">
      <Link
        to="/sources"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> All sources
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-black text-foreground">{decoded}</h1>
        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.08em] ${statusOk ? "border-border text-muted-foreground" : "border-primary/50 text-primary"}`}>
          {statusText}
        </span>
        {isMirroredFeed(decoded) ? (
          <span className="rounded-[2px] border border-border/70 px-1.5 py-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            mirrored feed
          </span>
        ) : null}
      </div>

      {trendReading ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {trendReading.direction === "up"
            ? "Louder than yesterday"
            : trendReading.direction === "down"
              ? "Quieter than yesterday"
              : "Same intensity as yesterday"}
          {trendReading.direction !== "flat" && trendReading.pct !== null && trendReading.pct !== 0
            ? ` by ${Math.abs(trendReading.pct)}% (${trendReading.delta > 0 ? "+" : ""}${trendReading.delta} pts)`
            : trendReading.direction !== "flat"
              ? ` by ${Math.abs(trendReading.delta)} pts`
              : ""}
          . <span className="text-muted-foreground">Compared with the previous recorded day.</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No prior reading recorded for this source yet.</p>
      )}

      {isMirroredFeed(decoded) ? (
        <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
          This feed is a community-run mirror of {decoded}'s announcements, not {decoded}'s own channel. It is updated on
          a delay and may occasionally differ from the official feed.
        </p>
      ) : null}

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-4">
        <div className="bg-card p-4">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Stories</dt>
          <dd className="mt-1 font-serif text-2xl font-bold text-foreground">{stat?.count ?? storyList.length}</dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Avg. hype</dt>
          <dd className="mt-1 font-serif text-2xl font-bold text-foreground">{stat ? `${stat.avgHype}/100` : "—"}</dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Trend</dt>
          <dd className="mt-1 font-serif text-2xl font-bold text-foreground">
            {!trendReading
              ? "·"
              : trendReading.direction === "up"
                ? "↑"
                : trendReading.direction === "down"
                  ? "↓"
                  : "→"}
          </dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Hot copy</dt>
          <dd className="mt-1 font-serif text-2xl font-bold text-foreground">
            {(stat?.bySpin?.Hot ?? 0) + (stat?.bySpin?.["On Fire"] ?? 0)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Counts cover today's edition only. The trend compares the previous recorded day, kept in this browser.
      </p>

      {stat ? (
        <div className="mt-6 max-w-2xl rounded-[2px] border border-border bg-card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Hype distribution</h2>
          <Distribution bySpin={stat.bySpin} />
        </div>
      ) : null}

      {storyList.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">In today's edition</h2>
          <ul className="mt-4 space-y-4">
            {storyList.map((story) => (
              <li key={story.id} className="rounded-[2px] border border-border/70 bg-card p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <SpinBadge spin={story.spin} flags={story.flags} />
                  <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {fmtDate(story.publishedAt)}
                  </span>
                </div>
                <a
                  href={`/story/${encodeURIComponent(story.id)}`}
                  className="mt-2 block font-serif text-lg font-bold leading-snug text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {story.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          No stories from {decoded} in today's edition. The source may be quiet or unreachable.
        </p>
      )}
    </section>
  );
}
