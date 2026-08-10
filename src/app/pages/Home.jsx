import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import StoryFeed from "../components/StoryFeed.jsx";
import { NewsCards } from "@/components/ui/news-cards.jsx";
import SelectorChips from "../components/SelectorChips.jsx";
import SpinBadge from "../components/SpinBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "Measured", "Warm", "Hot", "On Fire"];

const VIEWS = [
  { key: "edition", label: "Edition" },
  { key: "cards", label: "Cards" },
];

// The Cards view feeds the 21st NewsCards component real stories: source is
// the category, spin the subcategory, and the lead gradient band is keyed to
// the hype tier (ink for sober, vermillion as it climbs). No photos exist in
// the data, so the component renders its gradient fallback.
const SPIN_GRADIENT = {
  Measured: ["from-foreground/10", "to-transparent"],
  Warm: ["from-chart-4/25", "to-transparent"],
  Hot: ["from-primary/30", "to-transparent"],
  "On Fire": ["from-primary/50", "to-chart-4/30"],
};

const SHORTCUTS = [
  { key: "j", what: "next story" },
  { key: "k", what: "previous story" },
  { key: "Enter", what: "open selected story" },
  { key: "Escape", what: "close story" },
  { key: "/", what: "search the edition" },
  { key: "?", what: "this help" },
];

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

function timeAgo(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recently";
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

function toNewsCard(story) {
  return {
    id: story.id,
    title: story.title,
    category: story.source,
    subcategory: story.spin,
    timeAgo: timeAgo(story.publishedAt),
    location: "",
    image: null,
    gradientColors: SPIN_GRADIENT[story.spin] ?? SPIN_GRADIENT.Measured,
    content: story.summary ? [story.summary] : [`The full article is published by ${story.source}.`],
    link: story.link,
  };
}

// The default "Edited" order is a news judgment, not a timestamp dump: it
// favors freshness (a story stops being front-page news after ~a day) and
// breaks ties toward the hyped, so today's big stories lead the edition. The
// other sorts are the pure views a power user wants.
const SORTS = [
  { key: "edited", label: "Edited" },
  { key: "newest", label: "Newest" },
  { key: "hottest", label: "Hottest" },
  { key: "source", label: "By Source" },
];

function sortStories(stories, sort) {
  const recency = (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  const arr = [...stories];
  if (sort === "newest") return arr.sort(recency);
  if (sort === "hottest") {
    return arr.sort((a, b) => (b.spinScore ?? 0) - (a.spinScore ?? 0) || recency(a, b));
  }
  if (sort === "source") {
    return arr.sort((a, b) => a.source.localeCompare(b.source) || recency(a, b));
  }
  const editedScore = (s) => {
    const ageH = Math.max(0, (Date.now() - new Date(s.publishedAt).getTime()) / 3.6e6);
    const freshness = Math.max(0, 20 - ageH);
    return freshness * 5 + (s.spinScore ?? 0);
  };
  return arr.sort((a, b) => editedScore(b) - editedScore(a) || recency(a, b));
}

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

export default function Home({ stories, offline, loaded, reload }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("edited");
  const [view, setView] = useState("edition");
  const [helpOpen, setHelpOpen] = useState(false);
  const searchRef = useRef(null);

  // "/" focuses search, "?" toggles the shortcuts help. Skip while typing in an
  // input or when a story dialog is open, so we never hijack the page.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
      {!loaded ? (
        <>
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
          kicker="OUT TO LUNCH"
          text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try the presses again."
          action={{ label: "Try the presses again", onClick: reload }}
        />
      ) : (
        <>
          {offline ? (
            <p
              className="mb-4 border border-border/70 bg-card px-4 py-2.5 text-xs uppercase tracking-[0.08em] text-muted-foreground"
              role="status"
            >
              Showing the saved edition — the live feeds are down.{" "}
              <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={reload}>
                Try again
              </button>
            </p>
          ) : null}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="search-box">
              <Search className="search-icon" aria-hidden="true" />
              <label className="sr-only" htmlFor="story-search">Search the edition</label>
              <input
                id="story-search"
                ref={searchRef}
                className="search-input"
                type="search"
                placeholder="Search the edition…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
              ) : null}
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
              <NewsCards
                newsCards={sorted.map(toNewsCard)}
                showHeader={false}
              />
            ) : (
              <StoryFeed stories={sorted} />
            )
          )}
        </>
      )}
    </section>
  );
}
