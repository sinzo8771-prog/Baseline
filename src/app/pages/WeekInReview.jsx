import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { readHypeHistory, weekSummary } from "../lib/hypeHistory.js";
import { biggestSignalShift } from "@/lib/hype";

function weekdayLabel(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { weekday: "long" });
}

function fmtDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function Panel({ title, children }) {
  return (
    <div className="sp-callout p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function BigNumber({ value, label, sub }) {
  return (
    <div>
      <div className="font-serif text-3xl font-black leading-none tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

// Week-over-week delta with a sign, styled like the edition's trend language
// ("Louder by 8 points" vs "Quieter by 5 points"), honest about ties.
function WoWDirection({ weekOverWeek }) {
  if (!weekOverWeek) return null;
  const diff = weekOverWeek.current - weekOverWeek.previous;
  const label =
    diff > 0 ? `Louder than last week by ${diff} points` : diff < 0 ? `Quieter than last week by ${Math.abs(diff)} points` : "Same intensity as last week";
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "—";
  return (
    <p className="mt-3 text-sm text-foreground">
      <span className={diff === 0 ? "" : "text-primary"}>{arrow}</span> {label}
    </p>
  );
}

export default function WeekInReview() {
  const history = useMemo(() => readHypeHistory(), []);
  const summary = useMemo(() => weekSummary(history), [history]);

  // "Which themes became louder this week?" — answered from the recorded
  // signal breakdowns only: the newest day's mix vs the oldest day inside
  // the 7-day window. No history, no claim.
  const themeShift = useMemo(() => {
    if (!history.length) return null;
    const window = history.slice(0, 7);
    const newest = window[0]?.signals ?? null;
    const oldest = window[window.length - 1]?.signals ?? null;
    return biggestSignalShift(newest, oldest);
  }, [history]);

  // Rendered in both the full-week and partial-week layouts; the panel only
  // exists when two recorded days with signal breakdowns back it.
  const themePanel = themeShift ? (
    <Panel title="Theme mix, week's end vs week's start">
      <ul className="mt-3 space-y-1.5">
        {themeShift.map((s) => (
          <li key={s.category} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
            <span className="text-sm text-foreground">{s.label}</span>
            <span className={"tabular-nums text-sm " + (s.delta > 0 ? "text-primary" : "text-foreground")}>
              {s.delta > 0 ? "↑" : "↓"} {Math.abs(s.delta)} pts
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 max-w-[62ch] text-xs text-muted-foreground">
        Each category's share of that day's recorded hype signals — latest recorded day against the oldest inside the
        week.
      </p>
    </Panel>
  ) : null;

  return (
    <section className="section" aria-label="Week in review">
      <Link
        to="/edition"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to the edition
      </Link>

      <header className="ed page-head pt-8 pb-6">
        <span className="fp-kicker">The week, measured</span>
        <h1 className="page-title" style={{ fontSize: "clamp(36px, 6vw, 68px)" }}>Week in Review</h1>
        <p className="page-deck">
          What the past seven recorded days did to the Hype Index — measured from the baseline your browser keeps.
        </p>
      </header>

      {!summary ? (
        <div className="mt-6">
          <EmptyState
            kicker="THE BASELINE HASN'T SETTLED"
            text="A week in review needs at least one recorded reading. Read the edition today — and come back tomorrow — and the presses will have a history to summarize."
            action={{ label: "Go to the edition", onClick: () => (window.location.href = "/edition") }}
          />
        </div>
      ) : summary.days < 7 ? (
        <div className="mt-6 space-y-6">
          <Panel title="Partial week">
            <p className="max-w-[62ch] text-sm text-muted-foreground">
              Only {summary.days} recorded day{summary.days === 1 ? "" : "s"} so far. The review is honest about a partial week: the numbers below cover what your browser has actually observed — no invented averages, no fabricated days.
            </p>
          </Panel>
          <PartialFacts summary={summary} />
          {themePanel}
          <p className="text-xs text-muted-foreground">
            <Link to="/hype-index" className="underline underline-offset-4 hover:text-foreground">Track the daily Hype Index</Link>
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Panel title="Week average">
              <BigNumber value={`${summary.average}%`} label="average headline intensity" />
            </Panel>
            <Panel title="Loudest day">
              <BigNumber
                value={`${summary.loudestDay.hypePercent}%`}
                label={weekdayLabel(summary.loudestDay.date)}
                sub={fmtDate(summary.loudestDay.date)}
              />
            </Panel>
            <Panel title="Calmest day">
              <BigNumber
                value={`${summary.calmestDay.hypePercent}%`}
                label={weekdayLabel(summary.calmestDay.date)}
                sub={fmtDate(summary.calmestDay.date)}
              />
            </Panel>
            <Panel title="Week over week">
              {summary.weekOverWeek ? (
                <>
                  <BigNumber
                    value={`${summary.weekOverWeek.current}%`}
                    label="vs last week's average"
                    sub={`${summary.weekOverWeek.previous}% last week`}
                  />
                  <WoWDirection weekOverWeek={summary.weekOverWeek} />
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Not enough history to compare against last week — eight recorded days needed.
                </p>
              )}
            </Panel>
          </div>

          {summary.biggestSwing ? (
            <Panel title="Biggest day-over-day swing">
              <p className="mt-3 text-sm text-foreground">
                {summary.biggestSwing.delta} points between {weekdayLabel(summary.biggestSwing.from.date)} ({summary.biggestSwing.from.hypePercent}%)
                and {weekdayLabel(summary.biggestSwing.to.date)} ({summary.biggestSwing.to.hypePercent}%).
              </p>
              <p className="mt-2 max-w-[62ch] text-xs text-muted-foreground">
                The Hype Index swings on the mix of stories, not on whether any individual story is true — loud headlines move it, quiet ones don't.
              </p>
            </Panel>
          ) : null}

          {themePanel}

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">How the score works</Link>
            <span aria-hidden="true">·</span>
            <span>History stays in your browser; this page is a read of it, never a fabrication.</span>
          </p>
        </div>
      )}
    </section>
  );
}

// Partial week: show the few real facts available (average + extremes) without
// pretending the week is complete.
function PartialFacts({ summary }) {
  const facts = [
    summary.days >= 1 ? { label: "Average so far", value: `${summary.average}%` } : null,
    summary.days >= 2 ? { label: "Loudest day", value: `${summary.loudestDay.hypePercent}% · ${weekdayLabel(summary.loudestDay.date)}` } : null,
    summary.days >= 2 ? { label: "Calmest day", value: `${summary.calmestDay.hypePercent}% · ${weekdayLabel(summary.calmestDay.date)}` } : null,
    summary.biggestSwing ? { label: "Biggest swing", value: `${summary.biggestSwing.delta} pts` } : null,
  ].filter(Boolean);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((f) => (
        <Panel key={f.label} title={f.label}>
          <BigNumber value={f.value} label="" />
        </Panel>
      ))}
    </div>
  );
}