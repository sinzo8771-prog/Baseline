import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import useBaselineData from "./hooks/useBaselineData.js";
import { readLastVisit, writeLastVisit } from "./lib/lastVisit.js";
import { editionNumber } from "@/lib/pipeline";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import SiteNav from "./components/SiteNav.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import Asciify from "@/components/canvasui/Asciify.jsx";
import DecryptReveal from "@/components/canvasui/DecryptReveal.jsx";
import VHS from "@/components/canvasui/VHS.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

// Secondary pages are code-split so /about, /sources, and /hype-index don't
// ship their bytes to a visitor who only reads the front page. The landing and
// the edition stay eager (the landing streams the feed, and the edition is the
// core reading surface).
const HypeIndex = lazy(() => import("./pages/HypeIndex.jsx"));
const Sources = lazy(() => import("./pages/Sources.jsx"));
const SourceProfile = lazy(() => import("./pages/SourceProfile.jsx"));
const StoryPage = lazy(() => import("./pages/StoryPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Methodology = lazy(() => import("./pages/Methodology.jsx"));
const Saved = lazy(() => import("./pages/Saved.jsx"));
const WeekInReview = lazy(() => import("./pages/WeekInReview.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function RouteFallback() {
  return (
    <div className="section" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-40 animate-pulse rounded skeleton" />
      <div className="mt-4 h-4 w-72 max-w-full animate-pulse rounded skeleton" />
    </div>
  );
}

function Toast({ message }) {
  return <div className="toast">{message}</div>;
}

const BASE_URL = "https://the-baseline.baseline-news.workers.dev";

// The canvas effects need a concrete color string (canvas fillStyle cannot
// resolve CSS var()), but the tagline's decrypt reveal must stay on the site's
// own accent. Resolve --vermillion from the live theme (theme-init.js already
// set data-theme before this runs) so the canvas never drifts from the token.
function accentColor() {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--vermillion").trim();
    return v || "#b93c22";
  } catch {
    return "#b93c22";
  }
}

const ROUTE_META = {
  "/": {
    title: "The Baseline — AI news, hype removed.",
    description: "A quiet interface for a very loud industry. Headlines as published, spin as detected, hype as measured — in one daily edition.",
  },
  "/edition": {
    title: "Today's Edition — The Baseline",
    description: "A daily RSS edition from the AI industry and its chroniclers. Headlines as published, spin as detected, hype as measured.",
  },
  "/hype-index": {
    title: "The Hype Index — The Baseline",
    description: "Today's headline-intensity reading for AI news, with a signal-category breakdown and the biggest shifts vs yesterday.",
  },
  "/sources": {
    title: "Sources — The Baseline",
    description: "Who's shouting? Average headline intensity per outlet across the latest edition.",
  },
  "/about": {
    title: "About — The Baseline",
    description: "The Baseline is an AI-news measurement layer: headlines verbatim, spin detected, hype measured.",
  },
  "/methodology": {
    title: "Methodology — The Baseline",
    description: "How the Hype score works — what it measures, what it does not, and where the detector can be fooled.",
  },
  "/saved": {
    title: "Saved — The Baseline",
    description: "Your save-for-later reading list, kept in the browser.",
  },
  "/week-in-review": {
    title: "The Week in Review — The Baseline",
    description: "What the past seven days did to the Hype Index, computed from your browser's own baseline.",
  },
};

function useSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Story pages manage their own title/canonical/OG/JSON-LD (with cleanup);
    // never fight them here.
    if (pathname.startsWith("/story/")) return;
    const meta = ROUTE_META[pathname] ?? (pathname.startsWith("/sources/") ? ROUTE_META["/sources"] : ROUTE_META["/"]);
    document.title = meta.title;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", BASE_URL + pathname);

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    description.setAttribute("content", meta.description);
  }, [pathname]);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MastheadMeta({ dateLabel, storyCount, updatedLabel }) {
  return (
    <div className="masthead-meta">
      <span id="masthead-date">{dateLabel}</span>
      <span className="masthead-rule" />
      <span id="masthead-edition">No. {editionNumber()} — Free edition</span>
      {storyCount > 0 ? (
        <>
          <span className="masthead-rule" />
          <span id="masthead-count">{storyCount} stories</span>
        </>
      ) : null}
      <span className="masthead-rule" />
      <span id="masthead-updated">{updatedLabel}</span>
    </div>
  );
}

export default function App() {
  const { stories, allStories, stats, sourceStats, sources, offline, loaded, settled, servedFromCache, savedAt, reload } = useBaselineData();
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useSeo();

  // Baseline for the "NEW since your last visit" badge: the previous session's
  // timestamp, read once on mount. The visit is only recorded when the tab is
  // hidden or closed (so a reload mid-read doesn't swallow the badge), matching
  // the lightweight localStorage pattern used by the hype history.
  const lastVisitRef = useRef(readLastVisit());
  useEffect(() => {
    const persist = () => writeLastVisit();
    document.addEventListener("visibilitychange", persist);
    return () => {
      document.removeEventListener("visibilitychange", persist);
      writeLastVisit();
    };
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  // Clean up the toast timer on unmount.
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Cmd/Ctrl+K opens the command palette anywhere in the app. The guard skips
  // the shortcut while a dialog is already open so the modal's own trap keeps
  // ownership of keys; the palette's Escape handler closes it.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (!document.querySelector('[role="dialog"]')) {
          e.preventDefault();
          setPaletteOpen((o) => !o);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Announce the presses rolling once the edition is *settled* (the final
  // tally, not the first partial), so the claimed count matches the cards on
  // screen. Uses the printed edition size to keep the claim honest.
  useEffect(() => {
    if (settled && !offline && stats && stories.length > 0) {
      showToast(`The presses are rolling — ${stories.length} stories, ${stats.hypePercent}% hype.`);
    }
  }, [settled, offline, stats, stories]);

  // Date + edition
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const updatedLabel = stats?.generatedAt
    ? (servedFromCache && !settled ? "Showing saved edition, refreshing… · " : "")
      + "Sourced " + new Date(stats.generatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) + " · refresh for the latest"
    : "";

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <ScrollToTop />
        <a href="#main" className="skip-link">Skip to content</a>
        <header className="masthead">
          <MastheadMeta dateLabel={dateLabel} storyCount={stories.length} updatedLabel={updatedLabel} />
          <Asciify baseStrength={0.2} radius={0.45} charset="ascii" background="auto" glow={0.5} aberration={0.5}>
            <h1 className="masthead-title">
              <Link to="/" className="masthead-link">THE BASELINE</Link>
            </h1>
          </Asciify>
          <DecryptReveal color={accentColor()} background="auto" scramble={0.12} cell={8} radius={320} colored={0.6}>
            <p className="masthead-tagline">AI news, hype removed.</p>
          </DecryptReveal>
        </header>

        <SiteNav />

        <main id="main">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing stories={stories} stats={stats} sourceStats={sourceStats} offline={offline} loaded={loaded} />} />
              <Route path="/edition" element={<Home stories={stories} offline={offline} loaded={loaded} reload={reload} servedFromCache={servedFromCache} savedAt={savedAt} lastVisit={lastVisitRef.current} />} />
              <Route path="/hype-index" element={<HypeIndex stats={stats} sourceStats={sourceStats} allStories={allStories} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/sources" element={<Sources sources={sources} sourceStats={sourceStats} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/sources/:name" element={<SourceProfile allStories={allStories} sources={sources} sourceStats={sourceStats} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/story/:id" element={<StoryPage stories={stories} allStories={allStories} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/about" element={<About showToast={showToast} />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/saved" element={<Saved stories={stories} />} />
              <Route path="/week-in-review" element={<WeekInReview />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <VHS wave={0.25} jitter={0.08} crease={0.02} bloom={0} grain={0.04} scanlines={0.04} switching={0.01} speed={0.25}>
          <SiteFooter />
        </VHS>

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} stories={allStories} />

        <div id="toast-region" className="toast-region" aria-live="polite" aria-atomic="true">
          {toast ? <Toast message={toast} /> : null}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
