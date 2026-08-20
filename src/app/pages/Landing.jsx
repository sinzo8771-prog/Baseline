import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { m } from "framer-motion";
import HypeMeter from "../components/HypeMeter.jsx";
import SpinBadge from "../components/SpinBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { readHypeHistory, hypeTrend } from "../lib/hypeHistory.js";
import { isSmallSample } from "@/lib/pipeline";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Restrained editorial reveal: a short fade + drift up, fired once when the
// section scrolls into view. MotionConfig(reducedMotion="user") already strips
// transform animation for users who prefer reduced motion, so the fade is all
// that remains there. The H1 is deliberately excluded from the fade — it is the
// LCP element, so it paints at the first frame instead of waiting for the
// observer + animation; the supporting copy below still gets the restrained
// reveal.
const fade = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.4, ease: "easeOut" },
};

function Kicker({ children }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
      <span className="inline-block h-px w-6 bg-primary" aria-hidden="true" />
      {children}
    </p>
  );
}

// ---- 01 HERO ----------------------------------------------------------------
// The masthead already carries the nameplate and the tagline, so the in-page
// hero is the value proposition, not a second copy of the masthead.
function Hero() {
  return (
    <section aria-label="Introduction" className="pb-10 pt-8 sm:pb-12 sm:pt-10">
      <h1 className="max-w-[15ch] font-serif text-5xl font-black leading-[0.98] tracking-[-0.02em] text-foreground sm:text-7xl">
        A quiet interface for a very loud industry.
      </h1>
      <m.div {...fade}>
        <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          The Baseline reads the AI press all day, prints the headlines verbatim, and measures how
          loudly each one is being told. No summary. No spin added. Just the news, and the signal
          underneath it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/edition" className="btn-outline inline-flex items-center gap-2">
            Enter the edition <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link to="/hype-index" className="btn-outline inline-flex items-center gap-2">
            Explore the Hype Index
          </Link>
        </div>
      </m.div>
    </section>
  );
}

// ---- 02 TODAY'S LIVE SNAPSHOT ----------------------------------------------
function Snapshot({ stats, stories, loaded, offline, history }) {
  const { delta } = useMemo(() => hypeTrend(history), [history]);

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading today's reading">
        <div className="h-20 w-48 animate-pulse rounded skeleton" />
        <div className="h-6 w-full animate-pulse rounded skeleton" />
      </div>
    );
  }
  if (offline && !stats) {
    return (
      <EmptyState
        kicker="THE PRESSES ARE JAMMED"
        text="The latest wires could not be reached. Your browser can do everything except fetch — come back when the presses are turning again."
      />
    );
  }
  if (!stats) {
    return <p className="text-sm text-muted-foreground">DATA TEMPORARILY UNAVAILABLE — the reading will appear once the wires are reached.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-serif text-7xl font-black leading-none tracking-tight text-foreground">
          {stats.hypePercent}
          <span className="text-4xl font-bold text-muted-foreground">%</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          of today's {stats.total} stories read as hype
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {delta === null ? (
          "Today is your first reading — come back tomorrow for a baseline."
        ) : delta > 0 ? (
          `Up ${delta} points from yesterday. The presses are getting louder.`
        ) : delta < 0 ? (
          `Down ${Math.abs(delta)} points from yesterday.`
        ) : (
          "Flat from yesterday."
        )}
      </p>
      {isSmallSample(stats.total) && (
        <p className="text-xs text-muted-foreground">
          Small edition — {stats.total} stories isn't enough for this percentage to mean much yet.
        </p>
      )}
      <HypeMeter percent={stats.hypePercent} />
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Link to="/hype-index" className="underline underline-offset-4 hover:text-foreground">See the full index</Link>
        <span aria-hidden="true">·</span>
        <span>Hype measures loudness, not truth.</span>
      </p>
    </div>
  );
}

// ---- 03 REAL STORY PREVIEW --------------------------------------------------
function StoryPreview({ stories, loaded, offline }) {
  const preview = stories.slice(0, 4);
  if (!loaded) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading the latest stories">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded skeleton" />
        ))}
      </div>
    );
  }
  if (offline && stories.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved stories on hand to preview.</p>;
  }
  if (preview.length === 0) {
    return <p className="text-sm text-muted-foreground">The edition is still settling. Check back shortly.</p>;
  }
  return (
    <div>
      <ol className="divide-y divide-border/60 border-y border-border/60">
        {preview.map((story) => (
          <li key={story.id} className="group py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <SpinBadge spin={story.spin} flags={story.flags} signals={story.signals} hedged={story.hedged} score={story.spinScore} />
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{story.spinScore}/100</span>
              <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {story.source} — {fmtDate(story.publishedAt)}
              </span>
            </div>
            <Link
              to={`/story/${story.id}`}
              className="mt-1.5 block font-serif text-lg font-bold leading-snug tracking-[-0.01em] text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-xl"
            >
              {story.title}
            </Link>
          </li>
        ))}
      </ol>
      <Link
        to="/edition"
        className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary hover:text-foreground"
      >
        Read the full edition <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

// ---- 04 WHY THE BASELINE ----------------------------------------------------
function Why() {
  const points = [
    {
      title: "Headlines verbatim",
      body: "The Baseline prints what the AI industry actually said — not a paraphrase. You see the claim exactly as its author chose to make it.",
    },
    {
      title: "Spin as detected",
      body: "Every headline gets scored for the language of enthusiasm: superlatives, absolutes, urgency, and hedges that quietly walk things back.",
    },
    {
      title: "Hype as measured",
      body: "The Hype Index is one number for how loudly today's coverage is shouting, plus a breakdown of what is doing the shouting.",
    },
  ];
  return (
    <ol className="divide-y divide-border/60 border-y border-border/60">
      {points.map((p, i) => (
        <li key={p.title} className="grid gap-3 py-6 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-7">
          <span className="font-serif text-3xl font-black leading-none text-muted-foreground/40 sm:pt-0.5" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">{p.title}</h2>
            <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---- 05 HOW LOUD IS THE STORY (illustrative) --------------------------------
// These are illustrative examples of the measurement scale, not today's
// headlines. They match the detector's own test fixtures so the illustration
// is honest to the underlying rules.
const ILLUSTRATIVE = [
  { spin: "Measured", headline: "Company releases a new model." },
  { spin: "Warm", headline: "New model delivers major performance gains." },
  { spin: "On Fire", headline: "Revolutionary AI destroys every benchmark." },
];

function HowLoud() {
  return (
    <div>
      <p className="mb-4 text-xs uppercase tracking-[0.08em] text-muted-foreground">
        Illustrative examples — not today's headlines
      </p>
      <ul className="space-y-3">
        {ILLUSTRATIVE.map((row) => (
          <li
            key={row.spin}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-border/60 bg-card px-4 py-3"
          >
            <SpinBadge spin={row.spin} />
            <span className="font-serif text-lg text-foreground">{row.headline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- 06 THE SIGNAL LOOP -----------------------------------------------------
const LOOP = [
  { step: "NEWS", body: "The headline, as published." },
  { step: "HYPE", body: "How loudly it's told." },
  { step: "WHY?", body: "Which signals did the work." },
  { step: "SOURCE", body: "Who's doing the telling." },
  { step: "TREND", body: "Louder or quieter over time." },
];

function SignalLoop() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-5">
      {LOOP.map((item, i) => (
        <li key={item.step} className="relative bg-card p-5">
          <span className="absolute right-3 top-3 font-serif text-2xl font-black leading-none text-muted-foreground/30" aria-hidden="true">
            {i + 1}
          </span>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{item.step}</h2>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}

// ---- 07 HYPE INDEX PREVIEW --------------------------------------------------
function weekdayLabel(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);
}

function MiniTrend({ series }) {
  if (series.length < 2) return null;
  const max = Math.max(...series.map((e) => e.hypePercent), 1);
  return (
    <div
      className="mt-4 flex h-20 items-end gap-1.5"
      role="img"
      aria-label={`Hype Index, last ${series.length} days: ${series.map((e) => `${e.date}: ${e.hypePercent}%`).join(", ")}`}
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
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              {isToday ? "today" : weekdayLabel(entry.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HypePreview({ stats, history }) {
  const { series } = useMemo(() => hypeTrend(history), [history]);
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-5xl font-black leading-none text-foreground">
          {stats ? stats.hypePercent : "—"}
          <span className="text-2xl font-bold text-muted-foreground">%</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">today</span>
      </div>
      <MiniTrend series={series} />
      <Link
        to="/hype-index"
        className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary hover:text-foreground"
      >
        Open the Hype Index <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

// ---- 08 SOURCE PREVIEW ------------------------------------------------------
function SourcePreview({ sourceStats }) {
  const top = (sourceStats || []).slice(0, 4);
  if (top.length === 0) {
    return <p className="text-sm text-muted-foreground">No sources measured yet.</p>;
  }
  return (
    <div>
      <ol className="space-y-3">
        {top.map((s, i) => (
          <li key={s.name} className="flex items-baseline gap-4">
            <span className="w-6 shrink-0 font-serif text-2xl font-black leading-none text-muted-foreground/40" aria-hidden="true">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link to={`/sources/${encodeURIComponent(s.name)}`} className="font-semibold text-foreground hover:text-primary">
                {s.name}
              </Link>
              <div
                className="mt-1 h-1.5 w-full overflow-hidden rounded-[2px] bg-accent"
                role="meter"
                aria-label={`${s.name}: average headline intensity ${s.avgHype} of 100`}
                aria-valuenow={s.avgHype}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full bg-primary/70" style={{ width: `${s.avgHype}%` }} />
              </div>
            </div>
            <span className="shrink-0 tabular-nums text-sm text-foreground">{s.avgHype}</span>
          </li>
        ))}
      </ol>
      <Link
        to="/sources"
        className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary hover:text-foreground"
      >
        Who's shouting? <ExternalLink className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

// ---- 09 FINAL CTA -----------------------------------------------------------
function FinalCta() {
  return (
    <div className="rounded-md border border-border bg-card p-8 text-center sm:p-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">The news is loud enough</p>
      <p className="mx-auto mt-4 max-w-[22ch] font-serif text-4xl font-black leading-tight tracking-[-0.02em] text-foreground sm:text-5xl">
        Read it differently.
      </p>
      <Link
        to="/edition"
        className="btn-outline mt-8 inline-flex items-center gap-2"
      >
        Enter today's edition <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

// ---- LANDING ----------------------------------------------------------------
export default function Landing({ stories, stats, sourceStats, offline, loaded }) {
  const history = useMemo(() => readHypeHistory(), [loaded, stats]);

  return (
    <div>
      <Hero />

      <section className="section" aria-label="Today's live snapshot">
        <Kicker>Today's live snapshot</Kicker>
        <Snapshot stats={stats} stories={stories} loaded={loaded} offline={offline} history={history} />
      </section>

      <section className="section" aria-label="Latest stories">
        <Kicker>Fresh off the wires</Kicker>
        <StoryPreview stories={stories} loaded={loaded} offline={offline} />
      </section>

      <section className="section" aria-label="Why The Baseline">
        <Kicker>Why The Baseline</Kicker>
        <Why />
      </section>

      <section className="section" aria-label="How loud is the story">
        <Kicker>How loud is the story</Kicker>
        <HowLoud />
      </section>

      <section className="section" aria-label="How the signal moves">
        <Kicker>From headline to trend</Kicker>
        <SignalLoop />
      </section>

      <section className="section" aria-label="Hype Index preview">
        <Kicker>The Hype Index</Kicker>
        <HypePreview stats={stats} history={history} />
      </section>

      <section className="section" aria-label="Sources preview">
        <Kicker>Who's shouting</Kicker>
        <SourcePreview sourceStats={sourceStats} />
      </section>

      <section className="section" aria-label="Get started">
        <FinalCta />
      </section>
    </div>
  );
}
