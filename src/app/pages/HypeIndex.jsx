import { useMemo } from "react";
import { Link } from "react-router-dom";
import HypeMeter from "../components/HypeMeter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { readHypeHistory, hypeTrend } from "../lib/hypeHistory.js";
import { signalShares, biggestSignalShift, TIER_RANGES, CATEGORY_ORDER, CATEGORY_LABEL } from "@/lib/hype";

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
      className="mt-3 flex h-14 items-end gap-1.5"
      role="img"
      aria-label={`Hype Index over the last ${series.length} days: ${series.map((e) => `${e.date}: ${e.hypePercent}%`).join(", ")}`}
    >
      {series.map((entry, i) => {
        const isToday = i === 0;
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
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              {isToday ? "today" : weekdayLabel(entry.date)}
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
    { label: "Today", value: `${stats.hypePercent}%`, big: true },
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
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-5">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-card p-4">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{cell.label}</div>
            <div
              className={
                "font-serif font-bold text-foreground " +
                (cell.big ? "text-3xl " : "text-2xl ") +
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
                <span className="ml-1 block normal-case tracking-normal text-muted-foreground/60">{TIER_RANGES[tier]}</span>
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

// "WHY TODAY?" — the share of today's detected signals by category, computed
// from the real stories in the edition. If the day's data has no breakdown
// (older cache), the panel says so instead of inventing shares.
function WhyToday({ stats }) {
  const breakdown = stats?.signalBreakdown;
  const shares = useMemo(() => signalShares(breakdown), [breakdown]);
  const keys = breakdown ? CATEGORY_ORDER.filter((k) => shares[k] !== undefined) : [];
  if (keys.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">DATA UNAVAILABLE — the saved edition predates the signal breakdown.</p>;
  }
  const sorted = [...keys].sort((a, b) => shares[b] - shares[a]);
  return (
    <ul className="mt-3 space-y-1.5">
      {sorted.map((key) => (
        <li key={key} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
          <span className="text-sm text-foreground">{CATEGORY_LABEL[key]}</span>
          <span className="tabular-nums text-sm text-muted-foreground">{shares[key]}%</span>
        </li>
      ))}
    </ul>
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
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

export default function HypeIndex({ stats, loaded, offline, reload }) {
  const history = useMemo(() => readHypeHistory(), [loaded, stats]);
  const { series } = useMemo(() => hypeTrend(history), [history]);

  return (
    <section id="hype-index" className="section">
      <h2 className="section-title">The Hype Index</h2>
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
            <Panel title="Why today?"> <WhyToday stats={stats} /> </Panel>
            <Panel title="Biggest hype shift"> <BiggestShift stats={stats} history={history} /> </Panel>
          </div>

          {/* Distribution */}
          <Panel title="Hype distribution">
            <Distribution stats={stats} />
          </Panel>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">How the score works</Link>
            <span aria-hidden="true">·</span>
            <span>The Hype Index measures headlines, not the stories behind them. History stays in your browser.</span>
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
