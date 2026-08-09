import { useEffect, useState } from "react";

const THEME_KEY = "baseline-theme";

// Manages the site's light/dark theme, persisted to localStorage and honoring
// the OS preference on first load. Mirrors the original vanilla app.js logic.
export default function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return saved ? saved === "dark" : prefersDark;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      // Quota or private-mode failure is non-fatal; the theme still applies
      // for this visit.
    }
  }, [dark]);

  return { dark, toggle: () => setDark((v) => !v) };
}