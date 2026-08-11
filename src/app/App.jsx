import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import useBaselineData from "./hooks/useBaselineData.js";
import { editionNumber } from "@/lib/pipeline";
import Home from "./pages/Home.jsx";
import SiteNav from "./components/SiteNav.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import Asciify from "@/components/canvasui/Asciify.jsx";
import DecryptReveal from "@/components/canvasui/DecryptReveal.jsx";
import VHS from "@/components/canvasui/VHS.jsx";

// Secondary pages are code-split so /about, /sources, and /hype-index don't
// ship their bytes to a visitor who only reads the front page. Home stays
// eager (it's the landing route and streams the feed).
const HypeIndex = lazy(() => import("./pages/HypeIndex.jsx"));
const Sources = lazy(() => import("./pages/Sources.jsx"));
const SourceProfile = lazy(() => import("./pages/SourceProfile.jsx"));
const StoryPage = lazy(() => import("./pages/StoryPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Methodology = lazy(() => import("./pages/Methodology.jsx"));
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

const ROUTE_META = {
  "/": {
    title: "The Baseline — AI news, hype removed.",
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
  useSeo();

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  // Clean up the toast timer on unmount.
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

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
        <header className="masthead">
          <MastheadMeta dateLabel={dateLabel} storyCount={stories.length} updatedLabel={updatedLabel} />
          <Asciify baseStrength={0.2} radius={0.45} charset="ascii" background="auto" glow={0.5} aberration={0.5}>
            <h1 className="masthead-title">
              <Link to="/" className="masthead-link">THE BASELINE</Link>
            </h1>
          </Asciify>
          <DecryptReveal color="#D94A2B" background="auto" scramble={0.12} cell={8} radius={320} colored={0.6}>
            <p className="masthead-tagline">AI news, hype removed.</p>
          </DecryptReveal>
        </header>

        <SiteNav />

        <main>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home stories={stories} offline={offline} loaded={loaded} reload={reload} servedFromCache={servedFromCache} savedAt={savedAt} />} />
              <Route path="/hype-index" element={<HypeIndex stats={stats} sourceStats={sourceStats} allStories={allStories} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/sources" element={<Sources sources={sources} sourceStats={sourceStats} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/sources/:name" element={<SourceProfile allStories={allStories} sources={sources} sourceStats={sourceStats} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/story/:id" element={<StoryPage allStories={allStories} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/about" element={<About showToast={showToast} />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <VHS wave={0.25} jitter={0.08} crease={0.02} bloom={0} grain={0.04} scanlines={0.04} switching={0.01} speed={0.25}>
          <SiteFooter />
        </VHS>

        <div id="toast-region" className="toast-region" aria-live="polite" aria-atomic="true">
          {toast ? <Toast message={toast} /> : null}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
