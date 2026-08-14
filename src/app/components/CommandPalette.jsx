import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { CornerDownLeft, ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankMatches } from "../lib/fuzzyMatch.js";

// Global command palette (Cmd/Ctrl+K). A fuzzy search over the edition's
// stories plus the site's pages — the quickest way to jump anywhere without
// touching the mouse. Distinct from the Edition's "/" search, which narrows
// the feed in place; this opens a story's permalink or navigates to a page.
// Reuses the StoryModal focus-trap pattern: Tab stays inside, Escape closes,
// and focus returns to the trigger after close.
export default function CommandPalette({ open, onClose, stories }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const pages = [
    { id: "page-/edition", label: "Go to the Edition", keywords: "edition latest stories home", to: "/edition" },
    { id: "page-/hype-index", label: "The Hype Index", keywords: "hype index today score", to: "/hype-index" },
    { id: "page-/sources", label: "All Sources", keywords: "sources feeds outlets", to: "/sources" },
    { id: "page-/saved", label: "Saved Stories", keywords: "saved bookmarks reading list", to: "/saved" },
    { id: "page-/week-in-review", label: "The Week in Review", keywords: "week review recap", to: "/week-in-review" },
    { id: "page-/about", label: "About", keywords: "about the baseline", to: "/about" },
    { id: "page-/methodology", label: "Methodology", keywords: "methodology how the score works", to: "/methodology" },
  ];

  const storyResults = useMemo(() => {
    if (!stories?.length) return [];
    return stories.map((s) => ({
      id: `story-${s.id}`,
      label: s.title,
      keywords: `${s.source} ${s.summary ?? ""}`,
      story: s,
    }));
  }, [stories]);

  const results = useMemo(() => {
    const all = [
      ...pages.map((p) => ({ ...p, kind: "page" })),
      ...storyResults.map((r) => ({ ...r, kind: "story" })),
    ];
    return rankMatches(query, all);
  }, [query, pages, storyResults]);

  // Reset the query and cursor whenever the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCursor(0);
  }, [query, open]);

  const run = (result) => {
    if (!result) return;
    onClose();
    if (result.kind === "story") {
      navigate(`/story/${encodeURIComponent(result.story.id)}`);
    } else {
      navigate(result.to);
    }
  };

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Focus trap (same as StoryModal): Tab stays within the dialog.
      const focusables = [
        ...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <m.div
        className="fixed inset-0 z-40 bg-background/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed inset-x-4 top-24 z-50 mx-auto max-h-[70vh] w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-lg sm:inset-x-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label className="sr-only" htmlFor="command-palette-input">Search stories and pages</label>
          <input
            id="command-palette-input"
            ref={inputRef}
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            type="search"
            placeholder="Search stories and pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => (results.length ? (c + 1) % results.length : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(results[cursor]);
              }
            }}
          />
          <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" aria-hidden="true">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox" aria-label="Results">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No stories or pages match “{query}”.
            </li>
          ) : (
            results.slice(0, 12).map((result, i) => (
              <li key={result.id} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => run(result)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    i === cursor ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 shrink-0 items-center rounded px-1.5 font-mono text-[10px] uppercase tracking-[0.08em]",
                      result.kind === "story" ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {result.kind === "story" ? "story" : "page"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{result.label}</span>
                    {result.kind === "story" ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.story.source}
                      </span>
                    ) : (
                      <span className="block truncate text-xs text-muted-foreground">{result.to}</span>
                    )}
                  </span>
                  {i === cursor ? (
                    <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : result.kind === "story" ? (
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-border bg-accent px-1 font-mono text-[10px] text-foreground">↑↓</kbd> navigate</span>
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-border bg-accent px-1 font-mono text-[10px] text-foreground">↵</kbd> open</span>
          <span className="ml-auto">Covers today's edition stories</span>
        </div>
      </m.div>
    </>
  );
}