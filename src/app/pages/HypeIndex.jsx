import { useMemo } from "react";
import { Link } from "react-router-dom";
import HypeMeter from "../components/HypeMeter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { readHypeHistory, hypeTrend } from "../lib/hypeHistory.js";
import { signalShares, biggestSignalShift, TIER_RANGES, CATEGORY_ORDER, CATEGORY_LABEL } from "@/lib/hype";
import { isSmallSample } from "@/lib/pipeline";

// Plain-English gloss for the dominant signal family, used by "WHY TODAY?" so
// the reading says what is doing the shouting, not just which row is longest.
const CATEGORY_READ = {
  language: "Unusually aggressive language",
  superlatives: "Superlative claims",
  benchmark: "Benchmark-beating claims",
  numerical: "Promotional multipliers",
  formatting: "Shouty formatting",
  emotional: "Emotional language",
};

function weekdayLabel(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);
}

function TrendBars({ series }) {
  const max = Math.max(...series.map((e) => e.hypePercent), 1);
  return (
    <div
      className="mt-3 flex h-20 items-end gap-1.5"
      role="img"
      aria-label={`Hype Index over the last ${series.length} days: ${series.map((e) => `${e.date}: ${e.hypePercent}%`).join(", ")}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0 calc(25% - 1px), var(--rule) calc(25% - 1px) 25%)",
      }}
    >
      {series.map((entry, i) => {
        const isToday = i === series.length - 1;
        const h = Math.max(6, Math.round((entry.hypePercent / max) * 52));
        return (
          <div key={entry.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-[2px]"
              style={{
                height: `${h}px`,
                background: isToday ? "var(--vermillion)" : "var(--ink-soft)",
                opacity: isToday ? 1 : 0.55,
              }}
              title={`${entry.date}: ${entry.hypePercent}%`}
            />
            <span className="text-center text-[9px] uppercase leading-tight tracking-[0.12em] text-muted-foreground">
              {isToday ? "today" : weekdayLabel(entry.date)}
              <span className="hidden tabular-nums normal-case tracking-normal text-foreground/70 sm:block">
                {entry.hypePercent}%
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Stat block: TODAY / YESTERDAY / CHANGE / 7-DAY AVG / STORY COUNT. Every value
// is measured from the day's edition and the browser-local history — nothing
// here is fabricated, and missing history renders an em dash, not a guess.
function StatBlock({ stats, history, series }) {
  const yesterday = history.length >= 2 ? history[1].hypePercent : null;
  const change = yesterday === null ? null : stats.hypePercent - yesterday;
  const avg = series.length ? Math.round(series.reduce((sum, e) => sum + e.hypePercent, 0) / series.length) : null;

  const cells = [
    { label: "Yesterday", value: yesterday === null ? "—" : `${yesterday}%` },
    {
      label: "Change",
      value: change === null ? "—" : change > 0 ? `+${change}` : `${change}`,
      highlight: change !== null && change !== 0,
      up: change !== null && change > 0,
    },
    { label: "7-day avg", value: avg === null ? "—" : `${avg}%` },
    { label: "Stories", value: stats.total },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-serif text-6xl font-black leading-none tracking-tight text-foreground sm:text-7xl">
          {stats.hypePercent}<span className="text-3xl font-bold text-muted-foreground sm:text-4xl">%</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          of today's stories are enthusiastic
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {change === null ? (
          "No baseline yet — today is your first reading."
        ) : (
          <>
            {change > 0 ? "Up" : change < 0 ? "Down" : "Flat"} {Math.abs(change)} points from yesterday's {yesterday}%.
          </>
        )}
      </div>
      {isSmallSample(stats.total) && (
        <p className="mt-2 text-xs text-muted-foreground">
          Small edition — {stats.total} stories isn't enough for this percentage to mean much yet.
        </p>
      )}
      {series.length > 0 ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Calibrated against {series.length} recorded {series.length === 1 ? "day" : "days"} in this browser.
        </p>
      ) : null}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-5">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-card p-4">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{cell.label}</div>
            <div
              className={
                "font-serif font-bold text-foreground " +
                "text-2xl " +
                (cell.highlight ? (cell.up ? "text-primary" : "") : "")
              }
            >
              {cell.value}
            </div>
          </div>
        ))}
      </div>
      <HypeMeter percent={stats.hypePercent} className="mt-4" />
    </div>
  );
}

function WeekInHype({ series }) {
  if (series.length < 2) return null;
  const values = series.map((e) => e.hypePercent);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peak = series.reduce((a, b) => (b.hypePercent > a.hypePercent ? b : a), series[0]);
  const low = series.reduce((a, b) => (b.hypePercent < a.hypePercent ? b : a), series[0]);
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Average</div>
        <div className="font-serif text-2xl font-bold text-foreground">{avg}%</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Peak</div>
        <div className="font-serif text-2xl font-bold text-foreground">
          {peak.hypePercent}% <span className="text-sm font-medium text-muted-foreground">· {weekdayLabel(peak.date)}</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Low</div>
        <div className="font-serif text-2xl font-bold text-foreground">
          {low.hypePercent}% <span className="text-sm font-medium text-muted-foreground">· {weekdayLabel(low.date)}</span>
        </div>
      </div>
    </div>
  );
}

const TIERS = ["Measured", "Warm", "Hot", "On Fire"];

// Distribution of the day's stories across the four tiers, with counts,
// percentages, and the score range each tier covers.
function Distribution({ stats }) {
  const total = stats?.total ?? 0;
  const bySpin = stats?.bySpin ?? {};
  return (
    <div>
      <div className="mt-4 space-y-2">
        {TIERS.map((tier) => {
          const n = bySpin[tier] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const width = total ? Math.max(2, pct) : 0;
          return (
            <div key={tier} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {tier}
                <span className="ml-1 block normal-case tracking-normal text-muted-foreground">{TIER_RANGES[tier]}</span>
              </span>
              <div
                className="h-3 flex-1 overflow-hidden rounded-[2px] bg-accent"
                role="meter"
                aria-label={`${tier}: ${n} stories (${pct}%)`}
                aria-valuenow={n}
                aria-valuemin={0}
                aria-valuemax={Math.max(1, total)}
              >
                <div className="h-full bg-primary/70" style={{ width: `${width}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right tabular-nums text-sm text-foreground">
                {n}<span className="text-muted-foreground"> · {pct}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// "WHY TODAY?" — answers the question with the day's real data, not a repeat
// of the score. Two honest readings are derived and only shown when true: which
// signal family is doing the shouting (from the edition's own breakdown), and
// the single loudest headline (from the edition's stories). If the saved
// edition predates the breakdown, the panel says so instead of inventing one.
function WhyToday({ stats, allStories }) {
  const breakdown = stats?.signalBreakdown;
  const shares = useMemo(() => signalShares(breakdown), [breakdown]);
  const keys = breakdown ? CATEGORY_ORDER.filter((k) => shares[k] !== undefined) : [];

  const dominant = keys.length
    ? [...keys].sort((a, b) => shares[b] - shares[a])[0]
    : null;

  const loudest = useMemo(() => {
    if (!Array.isArray(allStories) || allStories.length === 0) return null;
    return [...allStories].sort((a, b) => (b.spinScore ?? 0) - (a.spinScore ?? 0))[0];
  }, [allStories]);

  const readings = [];
  if (dominant && shares[dominant] > 0) {
    readings.push(
      <li key="dominant" className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{CATEGORY_READ[dominant]}</span> is doing most of the
        shouting — {shares[dominant]}% of today's signals.
      </li>,
    );
  }
  if (loudest && loudest.spinScore > 0) {
    readings.push(
      <li key="loudest" className="text-sm text-muted-foreground">
        Loudest headline: <span className="font-serif font-bold text-foreground">“{loudest.title}”</span> at{" "}
        {loudest.spinScore}/100.
      </li>,
    );
  }

  if (keys.length === 0 && readings.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">DATA UNAVAILABLE — the saved edition predates the signal breakdown.</p>;
  }

  return (
    <div>
      {readings.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {readings}
          <li className="border-t border-border/50 pt-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Signal mix
          </li>
        </ul>
      ) : null}
      <ul className="mt-1.5 space-y-1.5">
        {keys.map((key) => (
          <li key={key} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
            <span className="text-sm text-foreground">{CATEGORY_LABEL[key]}</span>
            <span className="tabular-nums text-sm text-muted-foreground">{shares[key]}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// "BIGGEST SHIFT" — the categories whose share moved most vs the previous
// recorded day. Compares real recorded days only; without two days of signal
// data it renders "NOT ENOUGH HISTORY" rather than a fabricated number.
function BiggestShift({ stats, history }) {
  const today = stats?.signalBreakdown;
  const prev = history.length >= 2 ? history[1]?.signals : null;
  const shifts = useMemo(() => biggestSignalShift(today, prev), [today, prev]);
  if (!shifts) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        NOT ENOUGH HISTORY — the signal breakdown needs two recorded days before a shift can be measured.
      </p>
    );
  }
  return (
    <ul className="mt-3 space-y-1.5">
      {shifts.map((s) => (
        <li key={s.category} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
          <span className="text-sm text-foreground">{s.label}</span>
          <span className={"tabular-nums text-sm " + (s.delta > 0 ? "text-primary" : "text-foreground")}>
            {s.delta > 0 ? "↑" : "↓"} {Math.abs(s.delta)} pts
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

export default function HypeIndex({ stats, allStories, loaded, offline, reload }) {
  const history = useMemo(() => readHypeHistory(), [loaded, stats]);
  const { series } = useMemo(() => hypeTrend(history), [history]);

  return (
    <section id="hype-index" className="section">
      <h1 className="section-title">The Hype Index</h1>
      <p className="section-note">Share of today's stories that are, let's say, enthusiastic.</p>

      {loaded && !offline && stats ? (
        <div className="space-y-6">
          {/* Stat block + meter */}
          <Panel title="Today's reading">
            <StatBlock stats={stats} history={history} series={series} />
          </Panel>

          {/* Last 7 days */}
          <Panel title="Last 7 days">
            {series.length > 1 ? (
              <>
                <TrendBars series={series} />
                <WeekInHype series={series} />
              </>
            ) : (
              <p className="mt-3 max-w-[62ch] text-sm text-muted-foreground">
                The baseline starts the day you read your first edition. Come back tomorrow and we'll tell you whether the presses are getting louder.
              </p>
            )}
          </Panel>

          {/* WHY TODAY + BIGGEST SHIFT */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Why today?"> <WhyToday stats={stats} allStories={allStories} /> </Panel>
            <Panel title="Biggest hype shift"> <BiggestShift stats={stats} history={history} /> </Panel>
          </div>

          {/* Distribution */}
          <Panel title="Hype distribution">
            <Distribution stats={stats} />
          </Panel>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">How the score works</Link>
            <span aria-hidden="true">·</span>
            <span>Hype measures loudness, not truth. History stays in your browser.</span>
          </p>
        </div>
      ) : offline ? (
        <EmptyState
          kicker="THE PRESSES ARE JAMMED"
          text="The latest wires could not be reached, and there is no saved edition on hand. Try the presses again."
          action={{ label: "TRY AGAIN", onClick: reload }}
        />
      ) : (
        <div className="h-6 w-60 animate-pulse rounded skeleton" />
      )}
    </section>
  );
}
