import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import useTheme from "../hooks/useTheme.js";

// Print-editorial navbar: a sticky utility bar under the masthead with the
// small serif wordmark, uppercase section links, and the theme toggle. The
// double-rule bottom border echoes the masthead so the whole chrome reads as
// one newspaper. Sticky keeps the section links reachable while the edition
// streams in.

// Primary destinations are the product itself: the edition to read, the Hype
// Index to measure, the sources to judge. Secondary links stay one row back,
// visually quieter — the objective is hierarchy, not feature deletion.
const PRIMARY_LINKS = [
  { to: "/edition", label: "Edition", end: true },
  { to: "/hype-index", label: "Hype Index" },
  { to: "/sources", label: "Sources" },
];

const SECONDARY_LINKS = [
  { to: "/saved", label: "Saved" },
  { to: "/week-in-review", label: "Review" },
  { to: "/methodology", label: "Methodology" },
  { to: "/about", label: "About" },
];

export default function SiteNav() {
  const { dark, toggle } = useTheme();
  const listRef = useRef(null);
  const [scroll, setScroll] = useState({ overflowing: false, atStart: true, atEnd: true });

  // The link row is a single horizontal strip, and on a phone the secondary
  // sections sit offscreen. A clipped link is a weak cue to that, so measure the
  // strip and expose a real scroll button whenever part of it is out of view —
  // reachable by keyboard and screen reader, not just by a lucky sideways swipe.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const measure = () => {
      const overflowing = el.scrollWidth - el.clientWidth > 1;
      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      // Bail out of re-rendering when nothing changed (scroll fires often).
      setScroll((prev) =>
        prev.overflowing === overflowing && prev.atStart === atStart && prev.atEnd === atEnd
          ? prev
          : { overflowing, atStart, atEnd },
      );
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Point at the direction that still has sections to show; at the far end the
  // same button walks back so nothing stranded stays stranded.
  const forward = !scroll.atEnd;
  const nudge = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: (forward ? 1 : -1) * Math.max(120, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <nav className="site-nav" aria-label="Primary">
      <Link to="/" className="site-nav-wordmark">
        THE BASELINE
      </Link>
      <div className="site-nav-links" ref={listRef}>
        {PRIMARY_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            {label}
          </NavLink>
        ))}
        <span className="site-nav-divider" aria-hidden="true" />
        <span className="site-nav-secondary">
          {SECONDARY_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {label}
            </NavLink>
          ))}
        </span>
      </div>
      {scroll.overflowing ? (
        <button
          type="button"
          className="site-nav-more"
          onClick={nudge}
          aria-label={forward ? "Scroll to more sections" : "Scroll back to earlier sections"}
          title={forward ? "More sections" : "Earlier sections"}
        >
          {forward ? (
            <ChevronRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="size-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
      <button
        className="theme-toggle"
        type="button"
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={dark ? "true" : "false"}
        onClick={toggle}
      >
        {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      </button>
    </nav>
  );
}
