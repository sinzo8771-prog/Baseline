import { useMemo, useState } from "react";
import StoryFeed from "../components/StoryFeed.jsx";
import SelectorChips from "../components/SelectorChips.jsx";
import SpinBadge from "../components/SpinBadge.jsx";

const FILTERS = ["all", "Measured", "Warm", "Hot", "On Fire"];

function SkeletonCard() {
  return (
    <div className="rounded-md border border-border/70 bg-card p-5">
      <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-5 w-11/12 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-5 w-8/12 animate-pulse rounded bg-muted" />
    </div>
  );
}

function LeadSkeleton() {
  return (
    <div className="mb-8 rounded-md border border-border/80 bg-card p-6 sm:p-8">
      <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
      <div className="mt-4 h-8 w-9/12 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-6/12 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-7/12 animate-pulse rounded bg-muted" />
    </div>
  );
}

function EmptyState({ kicker, text }) {
  return (
    <div className="empty">
      <div className="kicker">{kicker}</div>
      <p>{text}</p>
    </div>
  );
}

export default function Home({ stories, offline, loaded }) {
  const [filter, setFilter] = useState("all");

  // Stories arrive already capped to the printed edition (25) by the data
  // hook, so the filters, chip counts, and feed always match the cards.
  const edition = stories;

  const filtered = useMemo(
    () => (filter === "all" ? edition : edition.filter((s) => s.spin === filter)),
    [edition, filter],
  );

  const counts = useMemo(() => {
    const c = { all: edition.length };
    for (const f of FILTERS) if (f !== "all") c[f] = edition.filter((s) => s.spin === f).length;
    return c;
  }, [edition]);

  return (
    <section id="latest" aria-label="Latest stories">
      {!loaded ? (
        <>
          <LeadSkeleton />
          <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : offline ? (
        <EmptyState kicker="OUT TO LUNCH" text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try again in a moment." />
      ) : (
        <>
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
          {stories.length === 0 ? (
            <EmptyState kicker="EXTRA! EXTRA!" text="The presses are cold. No stories to report. Our sources may be napping, or the feeds are down. In this line of work, silence is usually a feature, not a bug. Reload to try again." />
          ) : filtered.length === 0 ? (
            <EmptyState kicker="NO MATCHES" text={`Nothing filed under "${filter}". Switch back to All to see the full edition.`} />
          ) : (
            <StoryFeed stories={filtered} />
          )}
        </>
      )}
    </section>
  );
}
