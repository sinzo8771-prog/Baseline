import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ---- Main chart -------------------------------------------------------------
// The trend line is drawn from this browser's own recorded readings — nothing
// is invented. With fewer than two recorded days there is no line, only an
// honest invitation to come back tomorrow.
const W = 1000;
const H = 380;
const PL = 48;
const PR = 16;
const PT = 20;
const PB = 36;

function buildGeometry(series) {
  const n = series.length;
  const vals = series.map((e) => e.hypePercent);
  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);
  const span = Math.max(rawMax - rawMin, 4);
  const vMin = Math.max(0, Math.floor(rawMin - span * 0.15));
  const vMax = Math.min(100, Math.ceil(rawMax + span * 0.15));
  const sx = (i) => PL + (W - PL - PR) * (i / Math.max(n - 1, 1));
  const sy = (v) => PT + (H - PT - PB) - ((v - vMin) / (vMax - vMin)) * (H - PT - PB);
  return { n, vals, sx, sy };
}

function TrendChart({ series }) {
  const [hover, setHover] = useState(null);
  const geo = useMemo(() => buildGeometry(series), [series]);

  if (!geo || series.length < 2) {
    return (
      <p className="method">
        The baseline starts the day you read your first edition. The trend line draws itself from tomorrow — come back
        after your next visit.
      </p>
    );
  }

  const { sx, sy, vals } = geo;
  const line = series.map((e, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(e.hypePercent).toFixed(1)}`).join(" ");
  const area = `${line} L${sx(series.length - 1).toFixed(1)},${H - PB} L${PL},${H - PB} Z`;
  const ticks = [];
  for (let t = geo.vMin; t <= geo.vMax; t += Math.max(5, Math.round((geo.vMax - geo.vMin) / 4 / 5) * 5)) ticks.push(t);

  // First, middle, last date labels along the bottom axis.
  const axisIdx = [0, Math.floor((series.length - 1) / 2), series.length - 1];

  const onMove = (evt) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const vx = ((evt.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < series.length; i += 1) {
      const d = Math.abs(sx(i) - vx);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    setHover(best);
  };

  const tip = hover !== null
    ? {
        left: `${(sx(hover) / W) * 100}%`,
        top: `${(sy(vals[hover]) / H) * 100}%`,
        date: weekdayLabel(series[hover].date),
        val: `${series[hover].hypePercent}%`,
      }
    : null;

  return (
    <div className="chart-scroll">
      <div className="chart-wrap">
        <svg
          className="chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Hype Index over your last ${series.length} recorded ${series.length === 1 ? "day" : "days"}: ${series.map((e) => `${e.date}: ${e.hypePercent}%`).join(", ")}`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="hxAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--vermillion)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--vermillion)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g>
            {ticks.map((t) => (
              <g key={t}>
                <line className="grid" x1={PL} y1={sy(t)} x2={W - PR} y2={sy(t)} />
                <text className="axis" x={PL - 10} y={sy(t) + 4} textAnchor="end">{t}</text>
              </g>
            ))}
          </g>
          <g>
            {axisIdx.map((i) => (
              <text key={i} className="axis" x={sx(i)} y={H - PB + 22} textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}>
                {weekdayLabel(series[i].date)}
              </text>
            ))}
          </g>
          <path className="area" d={area} />
          <path className="line" d={line} />
          {series.map((e, i) => (
            <circle key={e.date} className="dot" cx={sx(i)} cy={sy(e.hypePercent)} r="2.6" />
          ))}
          {hover !== null ? (
            <g>
              <line className="crosshair" x1={sx(hover)} y1={PT} x2={sx(hover)} y2={H - PB} style={{ opacity: 1 }} />
              <circle className="cross-dot" cx={sx(hover)} cy={sy(vals[hover])} r="4" style={{ opacity: 1 }} />
            </g>
          ) : null}
        </svg>
        <div className={`chart-tooltip${tip ? " on" : ""}`} style={tip ? { left: tip.left, top: tip.top } : undefined} aria-hidden="true">
          <div className="t-date">{tip?.date}</div>
          <div className="t-val">{tip?.val}</div>
        </div>
      </div>
    </div>
  );
}

// ---- Calendar strip ----------------------------------------------------------
function CalendarStrip({ series }) {
  const days = series.slice(-14);
  if (days.length === 0) return null;
  return (
    <section className="cal-section" aria-label="Recent readings">
      <div className="section-kicker">Your recent readings</div>
      <div className="cal" role="list">
        {days.map((entry, i) => {
          const isToday = i === days.length - 1;
          return (
            <div key={entry.date} role="listitem" className={`cal-day${isToday ? " today" : ""}`}>
              <div className="d-num">{isToday ? "Today" : weekdayLabel(entry.date)}</div>
              <div className="d-val">{entry.hypePercent}%</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---- Leaderboard ---------------------------------------------------------------
function Leaderboard({ sourceStats, loaded }) {
  if (!loaded) {
    return (
      <div className="board-scroll" aria-busy="true">
        <div className="h-48 w-full animate-pulse rounded skeleton" />
      </div>
    );
  }
  if (!sourceStats || sourceStats.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">No sources measured yet.</p>;
  }
  return (
    <section className="board-section" aria-label="Loudest sources">
      <div className="section-kicker">Ranked sources · average headline intensity</div>
      <div className="board-scroll">
        <table className="board">
          <thead>
            <tr>
              <th className="rank">#</th>
              <th>Source</th>
              <th className="num">Stories</th>
              <th className="num" style={{ width: "38%" }}>Avg intensity</th>
            </tr>
          </thead>
          <tbody>
            {sourceStats.map((s, i) => (
              <tr key={s.name}>
                <td className="rank">{i + 1}</td>
                <td>
                  <Link className="name" to={`/sources/${encodeURIComponent(s.name)}`}>{s.name}</Link>
                </td>
                <td className="num">{s.count}</td>
                <td className="num">
                  <span className="sr-only">{`${s.avgHype} of 100`}</span>
                  <span
                    aria-hidden="true"
                    style={{ display: "inline-flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: 260, marginLeft: "auto" }}
                  >
                    <span className="fp-bar" style={{ flex: 1 }}>
                      <span style={{ width: `${s.avgHype}%` }} />
                    </span>
                    <span className="val" style={{ minWidth: 28 }}>{s.avgHype}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---- Analysis panels (kept from the previous design, print-styled) -------------
function WeekInHype({ series }) {
  if (series.length < 2) return null;
  const values = series.map((e) => e.hypePercent);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peak = series.reduce((a, b) => (b.hypePercent > a.hypePercent ? b : a), series[0]);
  const low = series.reduce((a, b) => (b.hypePercent < a.hypePercent ? b : a), series[0]);
  const short = (k) => {
    const [, mo, d] = k.split("-").map(Number);
    const date = new Date(2000, mo - 1, d);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Average</div>
        <div className="font-serif text-2xl font-bold text-foreground">{avg}%</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Peak</div>
        <div className="font-serif text-2xl font-bold text-foreground">
          {peak.hypePercent}% <span className="text-sm font-medium text-muted-foreground">· {short(peak.date)}</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Low</div>
        <div className="font-serif text-2xl font-bold text-foreground">
          {low.hypePercent}% <span className="text-sm font-medium text-muted-foreground">· {short(low.date)}</span>
        </div>
      </div>
    </div>
  );
}

const TIERS = ["Measured", "Warm", "Hot", "On Fire"];

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
                className="fp-bar h-3 flex-1"
                role="meter"
                aria-label={`${tier}: ${n} stories (${pct}%)`}
                aria-valuenow={n}
                aria-valuemin={0}
                aria-valuemax={Math.max(1, total)}
              >
                <span style={{ width: `${width}%` }} />
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

function WhyToday({ stats, allStories }) {
  const breakdown = stats?.signalBreakdown;
  const shares = useMemo(() => signalShares(breakdown), [breakdown]);
  const keys = breakdown ? CATEGORY_ORDER.filter((k) => shares[k] !== undefined) : [];

  const dominant = keys.length ? [...keys].sort((a, b) => shares[b] - shares[a])[0] : null;

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
    <div className="sp-callout rounded-none p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

// ---- The index mast -----------------------------------------------------------
// The signature treatment: the day's number set like a market indicator, with
// the LOW──HIGH intensity scale and the signal doing most of the shouting.
// Everything on it is derived from the real edition — the marker sits at the
// share of stories scored above Measured.
function dayWord(hypePercent) {
  if (hypePercent <= 0) return "A measured day";
  if (hypePercent < 25) return "A warm day";
  if (hypePercent < 50) return "A loud day";
  return "A very loud day";
}

function IndexMast({ stats, change, yesterday }) {
  const top = useMemo(() => {
    const breakdown = stats?.signalBreakdown;
    if (!breakdown) return null;
    const key = CATEGORY_ORDER.filter((k) => breakdown[k] > 0).sort((a, b) => breakdown[b] - breakdown[a])[0];
    return key ? { label: CATEGORY_LABEL[key], count: breakdown[key] } : null;
  }, [stats]);

  const hyped = (stats.bySpin?.Warm ?? 0) + (stats.bySpin?.Hot ?? 0) + (stats.bySpin?.["On Fire"] ?? 0);

  return (
    <section className="hx-mast" aria-label="Today's Hype Index">
      <div className="hx-mast-num">
        <span className="fp-eyebrow">Today's headline intensity</span>
        <p className="hx-big">
          {stats.hypePercent}
          <span className="hx-big-unit" aria-hidden="true">%</span>
        </p>
        <p className="hx-mast-word">
          {dayWord(stats.hypePercent)} — {hyped} of {stats.total} stories scored above Measured
        </p>
      </div>

      <div className="hx-mast-scale">
        <div
          className="hx-scale"
          role="meter"
          aria-label={`Headline intensity ${stats.hypePercent} of 100 — share of today's stories scored above Measured`}
          aria-valuenow={stats.hypePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="hx-scale-track" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((t) => (
              <i key={t} className="hx-tick" style={{ left: `${t}%` }} />
            ))}
            <i className="hx-marker" style={{ left: `${stats.hypePercent}%` }} />
          </span>
          <span className="hx-scale-ends" aria-hidden="true">
            <span>LOW</span>
            <span>HIGH</span>
          </span>
        </div>
        <div className="hx-mast-delta">
          {change === null ? (
            <span className="hx-delta-flat">First reading — no baseline yet</span>
          ) : (
            <span className={change === 0 ? "hx-delta-flat" : change > 0 ? "hx-delta-up" : "hx-delta-down"}>
              {change > 0 ? "▲" : change < 0 ? "▼" : "—"} {change === 0 ? "Flat" : `${Math.abs(change)} pts`} vs. yesterday ({yesterday}%)
            </span>
          )}
        </div>
      </div>

      <div className="hx-mast-signal">
        <span className="fp-eyebrow">Top signal</span>
        {top ? (
          <p className="hx-top-signal">
            {top.label} <span className="hx-top-count">· {top.count} {top.count === 1 ? "story" : "stories"}</span>
          </p>
        ) : (
          <p className="hx-top-signal hx-top-quiet">No hype signals fired today.</p>
        )}
        <p className="hx-mast-note">Hype measures headline intensity, not truth.</p>
      </div>
    </section>
  );
}

// ---- PAGE ---------------------------------------------------------------------
export default function HypeIndex({ stats, allStories, sourceStats, loaded, offline, reload }) {
  const history = useMemo(() => readHypeHistory(), [loaded, stats]);
  const { series } = useMemo(() => hypeTrend(history), [history]);

  const yesterday = history.length >= 2 ? history[1].hypePercent : null;
  const change = loaded && stats && yesterday !== null ? stats.hypePercent - yesterday : null;

  return (
    <div className="hx">
      {/* Page header */}
      <header className="page-head pt-10">
        <span className="fp-kicker">Data · Daily</span>
        <h1 className="page-title">The Hype Index</h1>
        <p className="page-deck">
          One number for how loudly today's AI press is shouting — measured in your own browser against the editions
          you have actually read.
        </p>
      </header>

      {loaded && !offline && stats ? (
        <>
          {/* The signature index mast */}
          <IndexMast stats={stats} change={change} yesterday={yesterday} />

          {/* Main chart */}
          <section className="chart-section" aria-label="Hype Index trend">
            <TrendChart series={series} />

            <p className="method">
              {isSmallSample(stats.total)
                ? `Small edition — ${stats.total} stories isn't enough for this percentage to mean much yet. `
                : ""}
              {series.length > 0
                ? `Calibrated against ${series.length} recorded ${series.length === 1 ? "day" : "days"} in this browser. `
                : ""}
              Hype measures loudness, not truth.
            </p>
          </section>

          <CalendarStrip series={series} />

          <Leaderboard sourceStats={sourceStats} loaded={loaded} />

          <section className="board-section" aria-label="Analysis">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Why today?"><WhyToday stats={stats} allStories={allStories} /></Panel>
              <Panel title="Biggest hype shift"><BiggestShift stats={stats} history={history} /></Panel>
            </div>
            <div className="mt-4">
              <Panel title="Hype distribution"><Distribution stats={stats} /></Panel>
            </div>
            {series.length >= 2 ? (
              <div className="sp-callout mt-4 p-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Your week so far
                </h2>
                <WeekInHype series={series} />
              </div>
            ) : null}
          </section>

          <p className="method pb-10">
            How the score works is described on the{" "}
            <Link to="/methodology">methodology page</Link>. History stays in your browser — nothing about your
            reading is sent anywhere.
          </p>
        </>
      ) : offline ? (
        <div className="pb-10">
          <EmptyState
            kicker="THE PRESSES ARE JAMMED"
            text="The latest wires could not be reached, and there is no saved edition on hand. Try the presses again."
            action={{ label: "TRY AGAIN", onClick: reload }}
          />
        </div>
      ) : (
        <div className="py-10" aria-busy="true">
          <div className="mx-auto h-20 w-60 animate-pulse rounded skeleton" />
          <div className="mx-auto mt-6 h-64 w-full max-w-3xl animate-pulse rounded skeleton" />
        </div>
      )}
    </div>
  );
}
