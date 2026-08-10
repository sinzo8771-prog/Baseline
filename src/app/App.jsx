import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import useBaselineData from "./hooks/useBaselineData.js";
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
const About = lazy(() => import("./pages/About.jsx"));
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

const PAGE_TITLES = {
  "/": "The Baseline — AI news, hype removed.",
  "/hype-index": "The Hype Index — The Baseline",
  "/sources": "Sources — The Baseline",
  "/about": "About — The Baseline",
};

function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? PAGE_TITLES["/"];
  }, [pathname]);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MastheadMeta({ dateLabel, updatedLabel }) {
  return (
    <div className="masthead-meta">
      <span id="masthead-date">{dateLabel}</span>
      <span className="masthead-rule" />
      <span id="masthead-edition">No. 1 — Free edition</span>
      <span className="masthead-rule" />
      <span id="masthead-updated">{updatedLabel}</span>
    </div>
  );
}

export default function App() {
  const { stories, stats, sources, offline, loaded, settled, servedFromCache, reload } = useBaselineData();
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  usePageTitle();

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
          <MastheadMeta dateLabel={dateLabel} updatedLabel={updatedLabel} />
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
              <Route path="/" element={<Home stories={stories} offline={offline} loaded={loaded} reload={reload} />} />
              <Route path="/hype-index" element={<HypeIndex stats={stats} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/sources" element={<Sources sources={sources} loaded={loaded} offline={offline} reload={reload} />} />
              <Route path="/about" element={<About showToast={showToast} />} />
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
