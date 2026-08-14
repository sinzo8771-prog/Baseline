import { Link, NavLink } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
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
  return (
    <nav className="site-nav" aria-label="Primary">
      <Link to="/" className="site-nav-wordmark">
        THE BASELINE
      </Link>
      <div className="site-nav-links">
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
