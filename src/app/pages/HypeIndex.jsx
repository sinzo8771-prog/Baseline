import { useMemo } from "react";
import { Link } from "react-router-dom";
import HypeMeter from "../components/HypeMeter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { readHypeHistory, hypeTrend } from "../lib/hypeHistory.js";
import { dailyShift } from "@/lib/pipeline";

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
      className="mt-2 flex h-14 items-end gap-1.5"
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

function WeekInHype({ series }) {
  if (series.length < 2) return null;
  const values = series.map((e) => e.hypePercent);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peak = series.reduce((a, b) => (b.hypePercent > a.hypePercent ? b : a), series[0]);
  const low = series.reduce((a, b) => (b.hypePercent < a.hypePercent ? b : a), series[0]);
  return (
    <div className="mt-6 rounded-md border border-border bg-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">The week in hype</h3>
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
    </div>
  );
}

function ShiftItem({ item }) {
  const arrow = item.delta > 0 ? "↑" : "↓";
  const verb = item.delta > 0 ? "up" : "down";
  const magnitude = Math.abs(item.delta);
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border/50 py-2 last:border-0">
      <span className="text-sm text-foreground">{item.label}</span>
      <span className="tabular-nums text-sm text-muted-foreground">
        <span className={item.delta > 0 ? "text-primary" : "text-foreground"}>{arrow}</span> {verb} {magnitude}
        {item.unit ? ` ${item.unit}` : ""}
      </span>
    </li>
  );
}

function SinceYesterday({ history }) {
  const prev = history[1];
  const today = history[0];
  const items = useMemo(() => dailyShift(today, prev), [today, prev]);
  if (items.length === 0) return null;
  return (
    <div className="mt-6 rounded-md border border-border bg-card p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Since yesterday</h3>
      <ul className="mt-2">
        {items.map((it) => (
          <ShiftItem key={it.label} item={it} />
        ))}
      </ul>
    </div>
  );
}

function LoudestSource({ sourceStats }) {
  const loudest = sourceStats?.[0];
  if (!loudest || loudest.count === 0) return null;
  return (
    <p className="mt-4 text-sm text-muted-foreground">
      Loudest desk today:{" "}
      <Link
        to={`/sources/${encodeURIComponent(loudest.name)}`}
        className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {loudest.name}
      </Link>{" "}
      ({loudest.count} stories, avg {loudest.avgHype}/100).
    </p>
  );
}

export default function HypeIndex({ stats, sourceStats, loaded, offline, reload }) {
  const history = readHypeHistory();
  const { delta, series } = hypeTrend(history);

  return (
    <section id="hype-index" className="section">
      <h2 className="section-title">The Hype Index</h2>
      <p className="section-note">Share of today's stories that are, let's say, enthusiastic.</p>
      {loaded && !offline && stats ? (
          <>
            <HypeMeter percent={stats.hypePercent} className="mb-5" />
            <p className="text-sm text-muted-foreground">
              {stats.bySpin.Measured} Measured · {stats.bySpin.Warm} Warm · {stats.bySpin.Hot} Hot · {stats.bySpin["On Fire"]} On Fire
            </p>
            {delta === null ? (
              <p className="mt-4 max-w-[62ch] text-sm text-muted-foreground">
                The baseline starts the day you read your first edition. Come back tomorrow and we'll tell you whether the presses are getting louder.
              </p>
            ) : (
              <p className="mt-4 text-sm text-foreground/80">
                <span className="font-semibold text-foreground">
                  {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)} pts
                </span>{" "}
                vs. yesterday. {series.length >= 2 ? `The last ${series.length} editions: ${series.map((e) => `${e.hypePercent}%`).join(" · ")}.` : ""}
              </p>
            )}
            {series.length > 1 ? <TrendBars series={series} /> : null}
            <LoudestSource sourceStats={sourceStats} />
            <WeekInHype series={series} />
            {history.length >= 2 ? <SinceYesterday history={history} /> : null}
          </>
        ) : offline ? (
          <EmptyState
            kicker="OUT TO LUNCH"
            text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try the presses again."
            action={{ label: "Try the presses again", onClick: reload }}
          />
        ) : (
          <div className="h-6 w-60 animate-pulse rounded skeleton" />
        )}
      </section>
  );
}
