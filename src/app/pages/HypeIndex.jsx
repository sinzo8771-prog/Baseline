import HypeMeter from "../components/HypeMeter.jsx";
import EmptyState from "../components/EmptyState.jsx";
import RetroDither from "@/components/canvasui/RetroDither.jsx";
import { readHypeHistory, hypeTrend } from "../lib/hypeHistory.js";

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

export default function HypeIndex({ stats, loaded, offline, reload }) {
  const history = readHypeHistory();
  const { delta, series } = hypeTrend(history);

  return (
    <RetroDither
      pattern="halftone"
      pixelSize={3}
      levels={4}
      darkColor={[0.1, 0.08, 0.05]}
      lightColor={[0.97, 0.94, 0.88]}
      contrast={0.7}
      strength={0.75}
    >
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
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)} pts
                </span>{" "}
                vs. yesterday. {series.length >= 2 ? `The last ${series.length} editions: ${series.map((e) => `${e.hypePercent}%`).join(" · ")}.` : ""}
              </p>
            )}
            {series.length > 1 ? <TrendBars series={series} /> : null}
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
    </RetroDither>
  );
}
