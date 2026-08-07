import { useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import useBaselineData from "./hooks/useBaselineData.js";
import useTheme from "./hooks/useTheme.js";
import exportOPML from "./lib/exportOPML.js";
import StoryFeed from "./components/StoryFeed.jsx";
import SelectorChips from "./components/SelectorChips.jsx";
import HypeMeter from "./components/HypeMeter.jsx";
import SpinBadge from "./components/SpinBadge.jsx";

const FILTERS = ["all", "Measured", "Warm", "Hot", "On Fire"];

function SkeletonCard() {
  return (
    <div className="rounded-md border border-border/70 bg-card p-5">
      <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-5 w-11/12 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-5 w-8/12 animate-pulse rounded bg-muted" />
    </div>
  );
}

function LeadSkeleton() {
  return (
    <div className="mb-8 rounded-md border border-border/80 bg-card p-6 sm:p-8">
      <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
      <div className="mt-4 h-8 w-9/12 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-6/12 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-7/12 animate-pulse rounded bg-muted" />
    </div>
  );
}

function EmptyState({ kicker, text }) {
  return (
    <div className="empty">
      <div className="kicker">{kicker}</div>
      <p>{text}</p>
    </div>
  );
}

function SourceList({ sources }) {
  const sorted = useMemo(() => {
    return [...(sources || [])].sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [sources]);
  return (
    <ul id="source-list" className="source-list">
      {sorted.map((s) => (
        <li key={s.name}>
          {s.name}
          <span className={s.ok ? "status ok" : "status err"}>{s.ok ? "reporting" : `down (${s.error ?? "no signal"})`}</span>
        </li>
      ))}
    </ul>
  );
}

function Toast({ message }) {
  return <div className="toast">{message}</div>;
}

export default function App() {
  const { stories, stats, sources, offline, loaded } = useBaselineData();
  const { dark, toggle } = useTheme();
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // The printed edition is capped at 25 stories (1 lead + 24 in the grid).
  // Everything downstream — filters, chip counts, and the feed itself —
  // operates on this same capped set so the numbers always match the cards.
  const edition = useMemo(() => stories.slice(0, 25), [stories]);

  const filtered = useMemo(
    () => (filter === "all" ? edition : edition.filter((s) => s.spin === filter)),
    [edition, filter],
  );

  const counts = useMemo(() => {
    const c = { all: edition.length };
    for (const f of FILTERS) if (f !== "all") c[f] = edition.filter((s) => s.spin === f).length;
    return c;
  }, [edition]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  // Clean up the toast timer on unmount.
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Announce the presses rolling once the edition is ready (matches the
  // original vanilla app.js intro toast). Uses the printed edition size so
  // the claim matches the cards on screen.
  useEffect(() => {
    if (loaded && !offline && stats && edition.length > 0) {
      showToast(`The presses are rolling — ${edition.length} stories, ${stats.hypePercent}% hype.`);
    }
  }, [loaded, offline, stats, edition]);

  // Date + edition
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const updatedLabel = stats?.generatedAt
    ? "Sourced " + new Date(stats.generatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) + " · refresh for the latest"
    : "";

  return (
    <MotionConfig reducedMotion="user">
      <header className="masthead">
        <div className="masthead-meta">
          <span id="masthead-date">{dateLabel}</span>
          <span className="masthead-rule" />
          <span id="masthead-edition">No. 1 — Free edition</span>
          <span className="masthead-rule" />
          <span id="masthead-updated">{updatedLabel}</span>
          <button className="theme-toggle" id="theme-toggle" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={dark ? "true" : "false"} onClick={toggle}>{dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}</button>
        </div>
        <h1 className="masthead-title">THE BASELINE</h1>
        <p className="masthead-tagline">AI news, hype removed.</p>
      </header>

      <nav className="nav">
        <a href="#latest">Latest</a>
        <a href="#hype-index">Hype Index</a>
        <a href="#sources">Sources</a>
        <a href="#about">About</a>
      </nav>

      <main>
          <section id="latest" aria-label="Latest stories">
            {!loaded ? (
              <>
                <LeadSkeleton />
                <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
                </div>
              </>
            ) : offline ? (
              <EmptyState kicker="OUT TO LUNCH" text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try again in a moment." />
            ) : (
              <>
                <div
                  className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
                  role="group"
                  aria-label="The spin scale"
                >
                  <span className="font-semibold text-foreground">The spin scale</span>
                  {FILTERS.filter((f) => f !== "all").map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5">
                      <SpinBadge spin={f} />
                    </span>
                  ))}
                </div>
                <SelectorChips
                  className="mb-6"
                  options={FILTERS}
                  value={filter}
                  counts={counts}
                  onChange={setFilter}
                />
                {stories.length === 0 ? (
                  <EmptyState kicker="EXTRA! EXTRA!" text="The presses are cold. No stories to report. Our sources may be napping, or the feeds are down. In this line of work, silence is usually a feature, not a bug. Reload to try again." />
                ) : filtered.length === 0 ? (
                  <EmptyState kicker="NO MATCHES" text={`Nothing filed under "${filter}". Switch back to All to see the full edition.`} />
                ) : (
                  <StoryFeed stories={filtered} />
                )}
              </>
            )}
          </section>

          <section id="hype-index" className="section">
            <h2 className="section-title">The Hype Index</h2>
            <p className="section-note">Share of today's stories that are, let's say, enthusiastic.</p>
            {loaded && !offline && stats ? <HypeMeter percent={stats.hypePercent} className="mb-5" /> : <div className="h-6 w-60 animate-pulse rounded bg-muted" />}
          </section>

          <section id="sources" className="section">
            <h2 className="section-title">Sources</h2>
            {loaded ? <SourceList sources={sources} /> : null}
          </section>

          <section id="about" className="section">
            <h2 className="section-title">About</h2>
            <p className="about-copy">The Baseline aggregates RSS feeds from the AI industry and its chroniclers, verbatim. We add nothing but a rating, which is already more than some of these stories deserve. No summaries written by models. No clickbait of our own. Headlines as published, spin as detected, hype as measured.</p>
            <button id="opml-export" className="btn-outline" style={{ marginTop: 16 }} onClick={() => showToast(exportOPML())}>Export OPML</button>
          </section>
        </main>

      <footer className="footer">
        <p>© {now.getFullYear()} The Baseline. Hand-built, not generated. RSS in, judgment out.</p>
      </footer>

      <div id="toast-region" className="toast-region" aria-live="polite" aria-atomic="true">
        {toast ? <Toast message={toast} /> : null}
      </div>
    </MotionConfig>
  );
}
