import { Link, NavLink } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import useTheme from "../hooks/useTheme.js";

// Print-editorial navbar: a sticky utility bar under the masthead with the
// small serif wordmark, uppercase section links, and the theme toggle. The
// double-rule bottom border echoes the masthead so the whole chrome reads as
// one newspaper. Sticky keeps the section links reachable while the edition
// streams in.

const NAV_LINKS = [
  { to: "/edition", label: "Edition", end: true },
  { to: "/hype-index", label: "Hype Index" },
  { to: "/sources", label: "Sources" },
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
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            {label}
          </NavLink>
        ))}
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
