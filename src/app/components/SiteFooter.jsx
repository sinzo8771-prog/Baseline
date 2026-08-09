import { Link } from "react-router-dom";

// Print-editorial footer: a colophon that mirrors the masthead's double-rule
// border and serif voice. Columns for navigation, the spin scale, and the
// sources, then a final rule with the copyright. The App root wraps this in
// the (calmed) VHS effect, so this component stays markup + classes.

const NAV_LINKS = [
  { to: "/", label: "Latest" },
  { to: "/hype-index", label: "Hype Index" },
  { to: "/sources", label: "Sources" },
  { to: "/about", label: "About" },
];

const SPIN_LABELS = [
  { label: "Measured", note: "claims sourced, no spin detected" },
  { label: "Warm", note: "leaning language creeping in" },
  { label: "Hot", note: "loaded words, strong framing" },
  { label: "On Fire", note: "max hype, read with care" },
];

export default function SiteFooter({ year = new Date().getFullYear() }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-col site-footer-about">
          <Link to="/" className="site-footer-wordmark">THE BASELINE</Link>
          <p className="site-footer-tagline">AI news, hype removed.</p>
          <p className="site-footer-copy">
            A daily, human-edited digest of what AI outlets are actually saying
            — with the spin called out, not swallowed.
          </p>
        </div>
        <div className="site-footer-col">
          <h2 className="site-footer-heading">Sections</h2>
          <ul className="site-footer-list">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="site-footer-link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="site-footer-col">
          <h2 className="site-footer-heading">The spin scale</h2>
          <ul className="site-footer-list">
            {SPIN_LABELS.map(({ label, note }) => (
              <li key={label}>
                <span className="site-footer-term">{label}</span>
                <span className="site-footer-note">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="site-footer-legal">
        <p>© {year} The Baseline. Hand-built, not generated. RSS in, judgment out.</p>
        <p>Read every story with the hype called out. Then decide what's news.</p>
      </div>
    </footer>
  );
}
