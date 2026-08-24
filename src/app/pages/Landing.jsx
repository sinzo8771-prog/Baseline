import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { m } from "framer-motion";
import EmptyState from "../components/EmptyState.jsx";
import Plate from "../components/EditorialPlates.jsx";
import SpinBadge from "../components/SpinBadge.jsx";
import { readHypeHistory, hypeTrend } from "../lib/hypeHistory.js";
import { isSmallSample } from "@/lib/pipeline";
import { SOURCES } from "@/lib/feeds";
import { TIER_RANGES } from "@/lib/hype";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Restrained editorial reveal: a short fade + drift up, fired once when the
// section scrolls into view. MotionConfig(reducedMotion="user") already strips
// transform animation for users who prefer reduced motion, so the fade is all
// that remains there. The lead headline is deliberately excluded from the
// fade — it is the LCP element, so it paints at the first frame.
const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45, ease: "easeOut" },
};

// ---- 00 TODAY AT A GLANCE -----------------------------------------------------
// The hero puts the Hype Index — the product's signature number — in the first
// viewport, next to an explicit definition so it can't be mistaken for a truth
// or quality score. Deliberately static: no reveal animation on the score,
// CTAs, or copy (the masthead above already animates the brand).
function Hero({ stats, loaded, offline }) {
  const hasScore = loaded && !!stats;
  const meta = hasScore
    ? `${stats.total} stories · ${SOURCES.length} sources tracked`
    : !loaded
      ? "Setting today's type…"
      : "No reading available right now.";

  return (
    <section className="fp-hero" aria-label="Today's Hype Index">
      <div className="fp-hero-grid">
        <div className="fp-hero-copy">
          <p className="fp-kicker">A quiet interface for a very loud industry</p>
          <p className="fp-hero-lede">
            Baseline reprints today's AI headlines exactly as published and measures how loudly
            their language runs. The score tracks wording — not truth, quality, or importance.
          </p>
          <div className="fp-hero-actions">
            <Link to="/edition" className="fp-btn-primary fp-btn-link">
              Read today's edition <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link to="/methodology" className="btn-outline inline-flex items-center gap-2">
              Why this score?
            </Link>
          </div>
        </div>
        <div className="fp-hero-score">
          <span className="fp-eyebrow">Today's Hype Index</span>
          <p className="val">
            {hasScore ? stats.hypePercent : "—"}
            {hasScore ? <span className="unit" aria-hidden="true">%</span> : null}
          </p>
          <p className="descriptor">Headline intensity across today's tracked AI news.</p>
          <p className="meta">{meta}</p>
        </div>
      </div>
    </section>
  );
}

// ---- Decorative editorial artwork ------------------------------------------
// Plates live in components/EditorialPlates.jsx so the story page can share
// them. See LeadCover below for the landing's own fixed illustration.

// The lead cover — a fixed editorial illustration about the product itself:
// one loud wire loosening into measured signals. Kept as artwork so no story
// ever gets a misleading "photo".
function LeadCover() {
  return (
    <aside className="fp-lead-cover">
      <svg viewBox="0 0 400 460" role="img" aria-label="Editorial illustration: a loud wire loosening into many small measured signals">
        <rect width="400" height="460" fill="var(--paper-dim)" />
        <text x="40" y="50" fontFamily="Fraunces, Georgia, serif" fontSize="20" fontWeight="700" fill="var(--ink)">No. 04</text>
        <text x="360" y="50" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11" letterSpacing="2" fill="var(--ink-soft)">EDITION</text>
        <circle cx="86" cy="120" r="48" fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 5" opacity="0.55" />
        <g fill="var(--ink)">
          <circle cx="74" cy="108" r="5" />
          <circle cx="100" cy="110" r="5" />
          <circle cx="88" cy="134" r="5" />
          <circle cx="66" cy="130" r="4" />
          <circle cx="108" cy="134" r="4" />
        </g>
        <g fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.45">
          <path d="M120 150 C 180 170, 200 190, 250 210" />
          <path d="M128 158 C 200 150, 250 140, 300 150" />
          <path d="M122 165 C 160 230, 175 270, 200 308" />
          <path d="M250 210 C 290 250, 310 270, 332 300" />
          <path d="M200 308 C 250 350, 270 365, 300 384" />
        </g>
        <g fill="var(--ink)">
          <circle cx="250" cy="210" r="7" />
          <circle cx="300" cy="150" r="6" />
          <circle cx="200" cy="308" r="6" />
          <circle cx="332" cy="300" r="7" />
          <circle cx="300" cy="384" r="6" />
        </g>
        <line x1="128" y1="158" x2="162" y2="250" stroke="var(--vermillion)" strokeWidth="1.5" opacity="0.7" />
        <circle cx="162" cy="250" r="9" fill="var(--vermillion)" />
        <g stroke="var(--ink)" strokeWidth="1">
          <line x1="40" y1="424" x2="360" y2="424" />
          <line x1="40" y1="440" x2="284" y2="440" />
        </g>
      </svg>
      <div className="cap">Illustration · Loudness, plotted</div>
    </aside>
  );
}

// ---- 01 LEAD ----------------------------------------------------------------
function Lead({ story, loaded, offline }) {
  if (!loaded) {
    return (
      <div className="fp-lead-grid" aria-busy="true" aria-label="Loading the lead story">
        <div>
          <div className="h-5 w-40 animate-pulse rounded skeleton" />
          <div className="mt-4 h-16 w-full animate-pulse rounded skeleton" />
          <div className="mt-4 h-24 w-full animate-pulse rounded skeleton" />
        </div>
        <div className="h-72 w-full animate-pulse rounded skeleton" />
      </div>
    );
  }
  if (!story) {
    return (
      <EmptyState
        kicker={offline ? "THE PRESSES ARE JAMMED" : "THE EDITION IS SETTLING"}
        text={
          offline
            ? "The latest wires could not be reached. Come back when the presses are turning again."
            : "The first story of the day is still being set in type. Check back shortly."
        }
      />
    );
  }

  const deck =
    story.summary?.trim() ||
    "As published by the wires this hour. Open the story to read it exactly as its author chose to tell it.";

  return (
    <section id="lead" aria-label="Lead story">
      <div className="fp-lead-grid">
        <div>
          <span className="fp-kicker">The Lead · {story.source}</span>
          <h1 className="fp-lead-headline">
            <Link to={`/story/${story.id}`}>{story.title}</Link>
          </h1>
          <m.p {...fade} className="fp-lead-deck">
            {deck}
          </m.p>
          <m.div {...fade}>
            <div className="fp-byline">
              By <b>{story.source}</b> · {fmtDate(story.publishedAt)}
            </div>
            <div className="fp-byline-spin">
              <SpinBadge spin={story.spin} score={story.spinScore} flags={story.flags} signals={story.signals} hedged={story.hedged} />
              <span className="fp-byline-score">{story.spinScore}/100</span>
            </div>
            <Link to={`/story/${story.id}`} className="btn-outline inline-flex items-center gap-2">
              Read the full story <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </m.div>
        </div>
        <LeadCover />
      </div>
    </section>
  );
}

// ---- 02 THE DAY'S DISPATCH ---------------------------------------------------
function Dispatch({ stories, loaded, offline }) {
  const feature = stories[1];
  const mid = stories[2];
  const briefs = stories.slice(3, 7);
  const stds = stories.slice(7, 10);

  if (!loaded) {
    return (
      <section aria-label="Latest stories" aria-busy="true">
        <div className="section-head">
          <h2>The Day's Dispatch</h2>
        </div>
        <div className="fp-feed-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 w-full animate-pulse rounded skeleton" />
          ))}
        </div>
      </section>
    );
  }
  if (stories.length === 0 && offline) {
    return null;
  }

  return (
    <section id="feed" aria-label="Latest stories">
      <div className="section-head">
        <h2>The Day's Dispatch</h2>
        <Link className="more" to="/edition">All stories →</Link>
      </div>

      <div className="fp-feed-grid">
        {feature ? (
          <m.article {...fade} className="fp-card fp-card-feature">
            <Link className="block" to={`/story/${feature.id}`}>
              <Plate index={0} />
              <span className="fp-kicker">Longer Read</span>
              <h3>{feature.title}</h3>
              <div className="meta">{feature.source} · {fmtDate(feature.publishedAt)}</div>
              {feature.summary ? <p>{feature.summary}</p> : null}
              <div className="fp-card-spin">
                <SpinBadge spin={feature.spin} score={feature.spinScore} flags={feature.flags} signals={feature.signals} hedged={feature.hedged} />
              </div>
            </Link>
          </m.article>
        ) : null}

        {mid ? (
          <m.article {...fade} className="fp-card fp-card-mid">
            <Link className="block" to={`/story/${mid.id}`}>
              <Plate index={1} />
              <span className="fp-kicker">From the Wires</span>
              <h3>{mid.title}</h3>
              <div className="meta">{mid.source} · {fmtDate(mid.publishedAt)}</div>
              <div className="fp-card-spin">
                <SpinBadge spin={mid.spin} score={mid.spinScore} flags={mid.flags} signals={mid.signals} hedged={mid.hedged} />
              </div>
            </Link>
          </m.article>
        ) : null}

        {briefs.length > 0 ? (
          <m.div {...fade} className="fp-list-col">
            <span className="fp-eyebrow">In Brief</span>
            {briefs.map((s, i) => (
              <div key={s.id} className="item">
                <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <Link to={`/story/${s.id}`}>
                  <h3>{s.title}</h3>
                </Link>
              </div>
            ))}
          </m.div>
        ) : null}

        {stds.map((s, i) => (
          <m.article key={s.id} {...fade} className="fp-card fp-card-std">
            <Link className="block" to={`/story/${s.id}`}>
              <Plate index={i + 2} />
              <span className="fp-kicker">Dispatch</span>
              <h3>{s.title}</h3>
              <div className="meta">{s.source} · {fmtDate(s.publishedAt)}</div>
              <div className="fp-card-spin">
                <SpinBadge spin={s.spin} score={s.spinScore} flags={s.flags} signals={s.signals} hedged={s.hedged} />
              </div>
            </Link>
          </m.article>
        ))}
      </div>
    </section>
  );
}

// ---- 03 WHY THIS EXISTS ------------------------------------------------------
// The problem, in editorial language. No feature tiles, no icons — the argument
// is the design.
function WhySection() {
  return (
    <section className="fp-why" aria-label="Why The Baseline exists">
      <div className="fp-why-grid">
        <p className="fp-why-statement">
          Every launch is "revolutionary". Every benchmark is "shattered". Every demo changes everything.
        </p>
        <div className="fp-why-body">
          <p>
            AI coverage competes for the same finite attention, so the language ratchets up: the loudest headline
            wins the click, and the loudest day wins the narrative.
          </p>
          <p>
            Loud is not the same as important. Intensity is a property of <em>wording</em> — and wording can be
            measured, the way a paper measures column inches or a market measures volume.
          </p>
          <p>
            The Baseline reprints every headline exactly as published, scores only its language, and shows the
            receipts. You see the noise. You read past it.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---- 04 HOW HYPE WORKS -------------------------------------------------------
// The scoring concept, demonstrated on the day's loudest real headline — never
// a fabricated one. If no story crossed the Warm threshold today, the example
// column says so instead of inventing one.
const TIERS = ["Measured", "Warm", "Hot", "On Fire"];

function HowHype({ stories, loaded }) {
  const example = useMemo(() => {
    let best = null;
    for (const s of stories) {
      if (!s.flags?.length) continue;
      if (!best || s.spinScore > best.spinScore) best = s;
    }
    return best;
  }, [stories]);

  return (
    <section className="fp-how" aria-label="How the Hype score works">
      <div className="section-head">
        <h2>How a score is built</h2>
        <Link className="more" to="/methodology">Full methodology →</Link>
      </div>
      <div className="fp-how-grid">
        <div className="fp-how-scale">
          <span className="fp-eyebrow">The scale</span>
          <p className="fp-how-lede">
            Six families of language are detected — intensity words, superlatives, benchmark claims, promotional
            numbers, shouting punctuation, emotional verbs. Each detected signal adds points; the total, 0–100,
            sets the story's tier.
          </p>
          <ul className="fp-tiers">
            {TIERS.map((t) => (
              <li key={t}>
                <span className="tier-name">{t}</span>
                <span className="tier-range">{TIER_RANGES[t]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="fp-example">
          <span className="fp-eyebrow">{example ? "Today's loudest headline, itemized" : "Today's edition, itemized"}</span>
          {!loaded ? (
            <div className="mt-4 h-40 w-full animate-pulse rounded skeleton" />
          ) : example ? (
            <>
              <Link to={`/story/${example.id}`} className="fp-example-headline">{example.title}</Link>
              <p className="fp-example-source">{example.source} · scored {example.spinScore}/100</p>
              <ul className="fp-example-signals">
                {example.signals.map((sig, i) => (
                  <li key={`${sig.id}-${i}`}>
                    <span className="sig-label">{sig.label}</span>
                    <span className="sig-dots" aria-hidden="true" />
                    <span className="sig-points">+{sig.points}</span>
                  </li>
                ))}
              </ul>
              <div className="fp-example-total">
                <SpinBadge spin={example.spin} score={example.spinScore} flags={example.flags} signals={example.signals} hedged={example.hedged} />
                <Link to={`/story/${example.id}`} className="fp-example-link">
                  See the full breakdown <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </>
          ) : (
            <p className="fp-example-quiet">
              Today's edition is running measured — no headline crossed the Warm threshold. The scale on the left is
              how every story is graded, and any flagged story will show its itemized signals right here.
            </p>
          )}
          <p className="fp-example-foot">
            A high score measures wording, not truth. Honest stories can run hot.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---- 05 THE SIGNAL LOOP ------------------------------------------------------
// What happens between a feed and your screen, printed as a colophon rather
// than drawn as a process graphic.
const LOOP = [
  ["Headline", "Reprinted verbatim from the source feed. Never rewritten, never summarized."],
  ["Language", "The detector reads the wording only — the words, not the facts in them."],
  ["Intensity", "Detected signals add points. The total becomes the story's Hype score."],
  ["Context", "Scores sit against the day's edition and against your own running baseline."],
  ["Original story", "Every card links out to the source. The measurement never replaces the reading."],
];

function SignalLoop() {
  return (
    <section className="fp-loop" aria-label="From headline to original story">
      <div className="fp-loop-grid">
        <div>
          <span className="fp-kicker">The signal loop</span>
          <p className="fp-loop-lede">
            One pass, in the open. The same five steps run on every story, every load — and each step is inspectable
            on the page it produces.
          </p>
          <Link to="/methodology" className="fp-loop-link">
            Read the methodology <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <ol className="fp-loop-steps">
          {LOOP.map(([title, text], i) => (
            <li key={title}>
              <span className="step-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---- 06 THE WIRES ------------------------------------------------------------
// The range of tracked sources. A listing is coverage, not an endorsement.
function WiresStrip() {
  return (
    <section className="fp-wires" aria-label="Tracked sources">
      <div className="fp-wires-head">
        <span className="fp-eyebrow">The wires we read</span>
        <Link className="more" to="/sources">Compare the sources →</Link>
      </div>
      <ul className="fp-wires-list">
        {SOURCES.map((s) => (
          <li key={s.name}>
            <Link to={`/sources/${encodeURIComponent(s.name)}`}>{s.name}</Link>
          </li>
        ))}
      </ul>
      <p className="fp-wires-note">
        {SOURCES.length} feeds, fetched fresh on every load. Listing is coverage, not endorsement — intensity is
        measured, credibility is not.
      </p>
    </section>
  );
}


// ---- 07 HYPE INDEX BAND ------------------------------------------------------
const CHART_W = 640;
const CHART_H = 260;
const PAD_X = 12;
const PAD_TOP = 28;
const PAD_BOT = 30;

function buildChart(series) {
  const n = series.length;
  const vals = series.map((e) => e.hypePercent);
  const min = Math.min(...vals);
  const max = Math.max(...vals, min + 1);
  const x = (i) => PAD_X + (i * (CHART_W - 2 * PAD_X)) / Math.max(n - 1, 1);
  const y = (v) => PAD_TOP + (1 - (v - min) / (max - min)) * (CHART_H - PAD_TOP - PAD_BOT);
  const line = series.map((e, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(e.hypePercent).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${CHART_H - PAD_BOT} L${PAD_X} ${CHART_H - PAD_BOT} Z`;
  return { line, area, lastX: x(n - 1), lastY: y(vals[n - 1]) };
}

function weekdayLabel(dateKey) {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);
}

function HypeBand({ stats, sourceStats, history, loaded }) {
  const { delta, series } = useMemo(() => hypeTrend(history), [history]);
  const top = (sourceStats || []).slice(0, 5);

  if (!loaded || !stats) {
    return (
      <section className="fp-hype" aria-label="Hype Index preview" aria-busy="true">
        <div className="fp-cols">
          <div className="h-64 w-full animate-pulse rounded skeleton" />
          <div className="h-64 w-full animate-pulse rounded skeleton" />
        </div>
      </section>
    );
  }

  const chart = series.length >= 2 ? buildChart(series) : null;

  return (
    <section className="fp-hype" aria-label="Hype Index preview">
      <div className="fp-cols">
        <m.div {...fade}>
          <div className="fp-chart-card">
            <div className="fp-chart-head">
              <div>
                <div className="fp-eyebrow">Baseline Hype Index</div>
                <div className="val">
                  {stats.hypePercent}
                  <span className="text-xl font-semibold text-[color:var(--ink-soft)]">%</span>
                </div>
              </div>
              {delta === null || delta === 0 ? (
                <span className="delta" style={{ color: "var(--ink-soft)" }}>
                  {delta === 0 ? "Flat / 24h" : "First reading"}
                </span>
              ) : (
                <span className="delta">{delta > 0 ? "▲" : "▼"} {Math.abs(delta)} pts / 24h</span>
              )}
            </div>
            {chart ? (
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                role="img"
                aria-label={`Hype Index over the last ${series.length} days: ${series.map((e) => `${e.date}: ${e.hypePercent}%`).join(", ")}`}
              >
                <defs>
                  <linearGradient id="fpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--vermillion)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--vermillion)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="var(--rule)" strokeWidth="0.6" opacity="0.35">
                  <line x1={PAD_X} y1={PAD_TOP} x2={CHART_W - PAD_X} y2={PAD_TOP} />
                  <line x1={PAD_X} y1={(CHART_H - PAD_BOT + PAD_TOP) / 2} x2={CHART_W - PAD_X} y2={(CHART_H - PAD_BOT + PAD_TOP) / 2} />
                  <line x1={PAD_X} y1={CHART_H - PAD_BOT} x2={CHART_W - PAD_X} y2={CHART_H - PAD_BOT} />
                </g>
                <g fontFamily="Inter, sans-serif" fontSize="11" fill="var(--ink-soft)">
                  <text x={PAD_X} y={CHART_H - 8}>{weekdayLabel(series[0].date)}</text>
                  <text x={CHART_W - PAD_X} y={CHART_H - 8} textAnchor="end">today</text>
                </g>
                <path d={chart.area} fill="url(#fpFill)" />
                <path d={chart.line} fill="none" stroke="var(--vermillion)" strokeWidth="3" />
                <circle cx={chart.lastX} cy={chart.lastY} r="5" fill="var(--vermillion)" />
              </svg>
            ) : (
              <p className="fp-chart-foot">Today is your first reading — the trend line draws itself from tomorrow.</p>
            )}
            <p className="fp-chart-foot">
              Your own baseline, stored in this browser{isSmallSample(stats.total) ? ` · small edition (${stats.total} stories)` : ""}
            </p>
          </div>
        </m.div>

        <m.div {...fade}>
          <span className="fp-eyebrow">Loudest Sources Today</span>
          {top.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No sources measured yet.</p>
          ) : (
            <ul className="fp-rank mt-2">
              {top.map((s) => (
                <li key={s.name}>
                  <div className="top">
                    <Link className="name" to={`/sources/${encodeURIComponent(s.name)}`}>{s.name}</Link>
                    <span className="score">{s.avgHype}</span>
                  </div>
                  <div
                    className="fp-bar"
                    role="meter"
                    aria-label={`${s.name}: average headline intensity ${s.avgHype} of 100`}
                    aria-valuenow={s.avgHype}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${s.avgHype}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/hype-index"
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary hover:text-foreground"
          >
            Open the full Hype Index <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </m.div>
      </div>
    </section>
  );
}

// ---- 08 CLOSING BAND ---------------------------------------------------------
// The final CTA is the product itself — read today's edition. There is no email
// backend, so the honest subscription (the RSS feed, copied to the clipboard)
// sits beside it instead of a pretend signup form.
function ClosingBand({ showToast }) {
  const [status, setStatus] = useState({ text: "", err: false });

  const copyFeed = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed.xml`);
      setStatus({ text: "Feed link copied — paste it into your RSS reader.", err: false });
      showToast?.("RSS feed link copied");
    } catch {
      setStatus({
        text: (
          <>
            Couldn't reach the clipboard — open{" "}
            <a href="/feed.xml" type="application/rss+xml">/feed.xml</a> directly.
          </>
        ),
        err: true,
      });
    }
  };

  return (
    <section className="fp-final" aria-label="Read today's edition">
      <div className="fp-final-grid">
        <m.div {...fade} className="fp-final-cta">
          <span className="fp-kicker">The Morning Edition</span>
          <h2>Read today's edition.</h2>
          <p className="lede">
            Every story the wires filed — headlines verbatim, hype measured, sources linked.
          </p>
          <div className="fp-hero-actions">
            <Link to="/edition" className="fp-btn-primary fp-btn-link">
              Read today's edition <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link to="/hype-index" className="btn-outline inline-flex items-center gap-2">
              See the Hype Index
            </Link>
          </div>
        </m.div>
        <m.div {...fade} className="fp-final-rss">
          <span className="fp-eyebrow">Or take the whole paper with you</span>
          <form className="fp-signup" onSubmit={copyFeed}>
            <input
              type="text"
              readOnly
              value="/feed.xml"
              aria-label="RSS feed address"
              onFocus={(e) => e.target.select()}
            />
            <button className="fp-btn-primary" type="submit">Copy feed link</button>
          </form>
          <p className={`fp-news-status${status.err ? " err" : ""}`} role="status" aria-live="polite">
            {status.text}
          </p>
        </m.div>
      </div>
    </section>
  );
}

// ---- LANDING ----------------------------------------------------------------
export default function Landing({ stories, stats, sourceStats, offline, loaded, showToast }) {
  const history = useMemo(() => readHypeHistory(), [loaded, stats]);

  return (
    <div className="fp">
      <Hero stats={stats} loaded={loaded} offline={offline} />

      <Lead story={stories[0]} loaded={loaded} offline={offline} />

      <Dispatch stories={stories} loaded={loaded} offline={offline} />

      <WhySection />

      <HowHype stories={stories} loaded={loaded} />

      <SignalLoop />

      <HypeBand stats={stats} sourceStats={sourceStats} history={history} loaded={loaded} />

      <WiresStrip />

      <ClosingBand showToast={showToast} />
    </div>
  );
}
