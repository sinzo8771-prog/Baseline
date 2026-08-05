import { useEffect, useMemo, useRef, useState } from "react";
import useBaselineData from "./hooks/useBaselineData.js";
import useTheme from "./hooks/useTheme.js";
import exportOPML from "./lib/exportOPML.js";
import GlassLens from "./components/GlassLens.jsx";

const FILTERS = ["all", "Measured", "Warm", "Hot", "On Fire"];

function spinClass(spin) {
  return { Measured: "spin-measured", Warm: "spin-warm", Hot: "spin-hot", "On Fire": "spin-fire" }[spin] || "spin-measured";
}

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

function StoryCard({ story, isLead = false }) {
  return (
    <article className={isLead ? "story lead" : "story"}>
      <h2 className="story-title">
        <a href={safeHref(story.link)} target="_blank" rel="noopener noreferrer" data-glass-target>
          {story.title}
        </a>
      </h2>
      {story.summary && isLead ? <p className="story-summary">{story.summary}</p> : null}
      <div className="story-meta">
        <span className={"spin " + spinClass(story.spin)}>{story.spin}</span>
        <span>{story.source} — {fmtDate(story.publishedAt)}</span>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <article className="story skeleton-card">
      <div className="skeleton sk-title w-90" />
      <div className="skeleton sk-line w-70" />
      <div className="skeleton sk-meta w-40" />
    </article>
  );
}

function LeadSkeleton() {
  return (
    <div className="lead">
      <div className="skeleton sk-kicker" />
      <div className="skeleton sk-title w-90" />
      <div className="skeleton sk-title w-60" />
      <div className="skeleton sk-line w-95" />
      <div className="skeleton sk-line w-75" />
      <div className="skeleton sk-meta w-30" />
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

function Meter({ stats }) {
  if (!stats) return null;
  return (
    <div className="meter">
      <div className="meter-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={stats.hypePercent} aria-label="Share of today's stories that are enthusiastic">
        <div className="meter-fill" style={{ width: `${stats.hypePercent}%` }} />
      </div>
      <span className="meter-label">{stats.hypePercent}%</span>
    </div>
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

  const filtered = useMemo(
    () => (filter === "all" ? stories : stories.filter((s) => s.spin === filter)),
    [stories, filter],
  );

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  // Clean up the toast timer on unmount.
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Announce the presses rolling once the edition is ready (matches the
  // original vanilla app.js intro toast).
  useEffect(() => {
    if (loaded && !offline && stats && stats.total > 0) {
      showToast(`The presses are rolling — ${stats.total} stories, ${stats.hypePercent}% hype.`);
    }
  }, [loaded, offline, stats]);

  // Date + edition
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const updatedLabel = stats?.generatedAt
    ? "Sourced " + new Date(stats.generatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) + " · refresh for the latest"
    : "";

  const lead = filtered[0];
  const gridStories = filtered.slice(1, 25);

  return (
    <>
      <header className="masthead">
        <div className="masthead-meta">
          <span id="masthead-date">{dateLabel}</span>
          <span className="masthead-rule" />
          <span id="masthead-edition">No. 1 — Free edition</span>
          <span className="masthead-rule" />
          <span id="masthead-updated">{updatedLabel}</span>
          <button className="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode" aria-pressed={dark ? "true" : "false"} onClick={toggle}>{dark ? "☀" : "🌙"}</button>
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

      <GlassLens
        className="glass-lens page-lens"
        targets="h1, h2, a, button, .masthead-title"
        size={180}
        zoom={1.25}
        aberration={0.8}
        blur={0.1}
        shine={0.35}
        follow={0.28}
      >
        <main>
          <section id="latest" aria-label="Latest stories">
            {!loaded ? (
              <>
                <LeadSkeleton />
                <div id="filter-chips" className="filter-chips" role="group" aria-label="Filter by hype level" />
                <div id="grid" className="grid">
                  {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
                </div>
              </>
            ) : offline ? (
              <EmptyState kicker="OUT TO LUNCH" text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try again in a moment." />
            ) : filtered.length === 0 ? (
              stories.length > 0 ? (
                <EmptyState kicker="NO MATCHES" text={`Nothing filed under "${filter}". Switch back to All to see the full edition.`} />
              ) : (
                <EmptyState kicker="EXTRA! EXTRA!" text="The presses are cold. No stories to report. Our sources may be napping, or the feeds are down. In this line of work, silence is usually a feature, not a bug. Reload to try again." />
              )
            ) : (
              <>
                <div className="lead">
                  {lead ? <StoryCard story={lead} isLead /> : null}
                </div>
                <div id="filter-chips" className="filter-chips" role="group" aria-label="Filter by hype level">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={"filter-chip" + (f === filter ? " active" : "")}
                      data-filter={f}
                      aria-pressed={f === filter}
                      onClick={() => setFilter(f)}
                    >
                      {f === "all" ? "All" : f}
                    </button>
                  ))}
                </div>
                <div id="grid" className="grid">
                  {gridStories.map((s) => <StoryCard key={s.id} story={s} />)}
                </div>
              </>
            )}
          </section>

          <section id="hype-index" className="section">
            <h2 className="section-title">The Hype Index</h2>
            <p className="section-note">Share of today's stories that are, let's say, enthusiastic.</p>
            {loaded && !offline ? <Meter stats={stats} /> : <div className="skeleton sk-title w-60" />}
            <div className="spin-legend">
              <span className="spin spin-measured">Measured</span>
              <span className="spin spin-warm">Warm</span>
              <span className="spin spin-hot">Hot</span>
              <span className="spin spin-fire">On Fire</span>
            </div>
          </section>

          <section id="sources" className="section">
            <h2 className="section-title">Sources</h2>
            {loaded && !offline ? <SourceList sources={sources} /> : null}
          </section>

          <section id="about" className="section">
            <h2 className="section-title">About</h2>
            <p className="about-copy">The Baseline aggregates RSS feeds from the AI industry and its chroniclers, verbatim. We add nothing but a rating, which is already more than some of these stories deserve. No summaries written by models. No clickbait of our own. Headlines as published, spin as detected, hype as measured.</p>
            <button id="opml-export" className="theme-toggle" style={{ marginTop: 16 }} onClick={() => showToast(exportOPML())}>Export OPML</button>
          </section>
        </main>
      </GlassLens>

      <footer className="footer">
        <p>© {now.getFullYear()} The Baseline. Hand-built, not generated. RSS in, judgment out.</p>
      </footer>

      <div id="toast-region" className="toast-region" aria-live="polite" aria-atomic="true">
        {toast ? <Toast message={toast} /> : null}
      </div>
    </>
  );
}
