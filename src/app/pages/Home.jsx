import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import StoryFeed from "../components/StoryFeed.jsx";
import CardsView from "../components/CardsView.jsx";
import SelectorChips from "../components/SelectorChips.jsx";
import SpinBadge from "../components/SpinBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts.js";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/input";
import { sortStories } from "@/lib/ranking";

const FILTERS = ["all", "Measured", "Warm", "Hot", "On Fire"];

const VIEWS = [
  { key: "edition", label: "Edition" },
  { key: "cards", label: "Cards" },
];

const SHORTCUTS = [
  { key: "j", what: "next story" },
  { key: "k", what: "previous story" },
  { key: "Enter", what: "open selected story" },
  { key: "Escape", what: "close story" },
  { key: "/", what: "search the edition" },
  { key: "?", what: "this help" },
  { key: "Cmd+K", what: "jump anywhere (command palette)" },
];

// The visible "⌘K / Ctrl K" hint in the edition search box. Matches how the
// command palette's own hint and the help overlay label it; the plain key
// letter is enough on Mac ("⌘K"), otherwise "Ctrl K".
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");
const CMD_LABEL = IS_MAC ? "⌘K" : "Ctrl K";

function ShortcutsHelp({ onClose }) {
  return (
    <div className="mt-3 rounded-md border border-border bg-card p-5" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Keyboard</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shortcuts"
          className="inline-flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
        {SHORTCUTS.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-4">
            <span className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-xs text-foreground">{s.key}</span>
            <span>{s.what}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The default "Edited" order is a news judgment, not a timestamp dump: it
// favors freshness (a story stops being front-page news after ~a day), breaks
// ties toward the hyped, and caps how many stories any one source can hold in
// the top of the edition so a single outlet never owns the front page (spec
// §27/§29). The other sorts are the pure views a power user wants.
const SORTS = [
  { key: "edited", label: "Edited" },
  { key: "newest", label: "Newest" },
  { key: "hottest", label: "Hottest" },
  { key: "source", label: "By Source" },
];

function SkeletonCard() {
  return (
    <div className="rounded-md border border-border/70 bg-card p-5">
      <div className="h-4 w-24 animate-pulse rounded-full skeleton" />
      <div className="mt-3 h-5 w-11/12 animate-pulse rounded skeleton" />
      <div className="mt-2 h-5 w-8/12 animate-pulse rounded skeleton" />
    </div>
  );
}

function LeadSkeleton() {
  return (
    <div className="mb-8 rounded-md border border-border/80 bg-card p-6 sm:p-8">
      <div className="h-4 w-20 animate-pulse rounded-full skeleton" />
      <div className="mt-4 h-8 w-9/12 animate-pulse rounded skeleton" />
      <div className="mt-3 h-8 w-6/12 animate-pulse rounded skeleton" />
      <div className="mt-4 h-4 w-full animate-pulse rounded skeleton" />
      <div className="mt-2 h-4 w-7/12 animate-pulse rounded skeleton" />
    </div>
  );
}

// Editorial loading line — the press metaphor in the product's own voice,
// still backed by a real timeout and error path (never a substitute for them).
function PressingWires() {
  return (
    <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground" role="status" aria-live="polite">
      Pressing the wires…
    </p>
  );
}

export default function Home({ stories, offline, loaded, reload, servedFromCache, savedAt, lastVisit = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("edited");
  const [view, setView] = useState("edition");
  const [helpOpen, setHelpOpen] = useState(false);
  const searchRef = useRef(null);

  // "/" focuses search, "?" toggles the shortcuts help. The hook's typing and
  // dialog guards keep it from hijacking the page; the modal's own trap owns
  // Escape while a story is open.
  useKeyboardShortcuts({
    "/": () => {
      searchRef.current?.focus();
      return true;
    },
    "?": () => {
      setHelpOpen((o) => !o);
      return true;
    },
  });

  const sourceFilter = searchParams.get("source") || "";

  const edition = stories;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return edition.filter((s) => {
      if (filter !== "all" && s.spin !== filter) return false;
      if (sourceFilter && s.source !== sourceFilter) return false;
      if (q) {
        const haystack = `${s.title} ${s.summary ?? ""} ${s.source}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [edition, filter, sourceFilter, query]);

  const counts = useMemo(() => {
    const c = { all: edition.length };
    for (const f of FILTERS) if (f !== "all") c[f] = edition.filter((s) => s.spin === f).length;
    return c;
  }, [edition]);

  const sorted = useMemo(() => sortStories(filtered, sort), [filtered, sort]);

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
    if (sourceFilter) {
      setSearchParams({}, { replace: true });
    }
  };

  const clearSource = () => setSearchParams({}, { replace: true });

  const hasActiveFilters = Boolean(query.trim()) || sourceFilter || filter !== "all";

  return (
    <section id="latest" aria-label="Latest stories">
      <h1 className="sr-only">Today's Edition</h1>
      {!loaded ? (
        <>
          <PressingWires />
          <LeadSkeleton />
          <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <div className="h-6 w-16 animate-pulse rounded-full skeleton" />
            <div className="h-6 w-20 animate-pulse rounded-full skeleton" />
            <div className="h-6 w-16 animate-pulse rounded-full skeleton" />
            <div className="h-6 w-20 animate-pulse rounded-full skeleton" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : offline && edition.length === 0 ? (
        <EmptyState
          kicker="THE PRESSES ARE JAMMED"
          text="The latest wires could not be reached, and there is no saved edition on hand. Your browser can do everything except fetch — try the presses again."
          action={{ label: "TRY AGAIN", onClick: reload }}
        />
      ) : (
        <>
          {offline ? (
            <p
              className="mb-4 border border-border/70 bg-card px-4 py-2.5 text-xs uppercase tracking-[0.08em] text-muted-foreground"
              role="status"
            >
              {servedFromCache ? (
                <>
                  <span className="font-semibold text-foreground">SAVED EDITION</span>
                  {savedAt ? ` · LAST UPDATED ${new Date(savedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : null}
                  {" — "}the latest wires could not be reached. Showing the last saved edition.{" "}
                </>
              ) : (
                "The latest wires could not be reached. "
              )}
              <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={reload}>
                TRY AGAIN
              </button>
            </p>
          ) : null}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search className="search-icon" aria-hidden="true" />
              <label className="sr-only" htmlFor="story-search">Search the edition</label>
              <Input
                id="story-search"
                ref={searchRef}
                type="search"
                placeholder="Search the edition…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pe-11 ps-9"
              />
              {query ? (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : (
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
                  <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border bg-accent px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {CMD_LABEL}
                  </kbd>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="sort-control" role="group" aria-label="View the edition">
                <span className="sort-label">View</span>
                {VIEWS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={view === key}
                    className={cn(view === key && "active")}
                    onClick={() => setView(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="sort-control" role="group" aria-label="Sort the edition">
                <span className="sort-label">Sort</span>
                {SORTS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={sort === key}
                    className={cn(sort === key && "active")}
                    onClick={() => setSort(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {sourceFilter ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]">
              <span className="font-semibold text-foreground">{sourceFilter}</span>
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={`Stop filtering by ${sourceFilter}`}
                onClick={clearSource}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <div
            className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
            role="group"
            aria-label="The spin scale"
          >
            <span className="font-semibold text-foreground">The spin scale</span>
            {FILTERS.filter((f) => f !== "all").map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5">
                <SpinBadge spin={f} />
              </span>
            ))}
          </div>
          <SelectorChips
            className="mb-6"
            options={FILTERS}
            value={filter}
            counts={counts}
            onChange={setFilter}
          />

          {hasActiveFilters ? (
            <p className="mb-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground" role="status">
              {sorted.length === 1 ? "Searching 1 story" : `Searching ${sorted.length} stories`}
            </p>
          ) : null}

          {helpOpen ? <ShortcutsHelp onClose={() => setHelpOpen(false)} /> : null}

          {edition.length === 0 ? (
            <EmptyState
              kicker="EXTRA! EXTRA!"
              text="The presses are cold. No stories to report. Our sources may be napping, or the feeds are down. In this line of work, silence is usually a feature, not a bug."
              action={{ label: "Rattle the presses", onClick: reload }}
            />
          ) : sorted.length === 0 ? (
            <EmptyState
              kicker="NO MATCHES"
              text={`Nothing filed under the current search${sourceFilter ? ` for ${sourceFilter}` : ""}${filter !== "all" ? ` and "${filter}"` : ""}.`}
              action={hasActiveFilters ? { label: "Clear the filters", onClick: clearFilters } : undefined}
            />
          ) : (
            view === "cards" ? (
              <CardsView stories={sorted} lastVisit={lastVisit} />
            ) : (
              <StoryFeed stories={sorted} lastVisit={lastVisit} />
            )
          )}
        </>
      )}
    </section>
  );
}
