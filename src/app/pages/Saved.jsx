import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookmarkCheck, ExternalLink } from "lucide-react";
import SpinBadge from "./../components/SpinBadge.jsx";
import StoryModal from "../components/StoryModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { cn } from "@/lib/utils";
import { reconcileSaved } from "../lib/savedStories.js";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "saved recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Reading list. Saved stories are snapshots in localStorage, so an entry whose
// source feed no longer carries it still renders from the cached headline,
// summary, and link rather than 404ing. Live stories (still in today's edition)
// are reconciled against the saved records so the freshest data wins.
export default function Saved({ stories }) {
  // Bump this when the modal closes so a bookmark removed inside the dialog
  // is reflected in the list immediately (reconcileSaved re-reads storage).
  const [revision, setRevision] = useState(0);
  const savedList = useMemo(() => reconcileSaved(stories || []), [stories, revision]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = savedList.find((s) => s.id === selectedId) || null;

  const closeModal = () => {
    setSelectedId(null);
    setRevision((r) => r + 1);
  };

  return (
    <section className="section" aria-label="Saved stories">
      <Link
        to="/edition"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to the edition
      </Link>

      <div className="flex items-center gap-2">
        <BookmarkCheck className="size-4 text-primary" aria-hidden="true" />
        <h1 className="font-serif text-2xl font-black tracking-[-0.01em] text-foreground sm:text-3xl">
          Saved for later
        </h1>
      </div>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Kept in your browser. {savedList.length > 0 ? `${savedList.length} saved.` : "Nothing saved yet."}
      </p>

      {savedList.length === 0 ? (
        <EmptyState
          kicker="THE FILE IS EMPTY"
          text="Tap the bookmark on any story to keep it here — even after it ages out of today's edition."
          action={{ label: "Go to the edition", onClick: () => (window.location.href = "/edition") }}
        />
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {savedList.map((story) => (
            <li key={story.id} className="group relative flex min-h-0 flex-col bg-card p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {story.source || "Unknown source"}
                </span>
                <span className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {fmtDate(story.publishedAt)}
                </span>
              </div>

              <h2 className="mt-3 line-clamp-4 break-words font-serif text-lg font-bold leading-snug text-foreground">
                {story.title}
              </h2>

              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                  <SpinBadge
                    spin={story.spin}
                    flags={story.flags}
                    signals={story.signals}
                    hedged={story.hedged}
                    score={story.spinScore}
                  />
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    Read <ExternalLink className="size-3" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label={`Open saved story: ${story.title}`}
                aria-haspopup="dialog"
                onClick={() => setSelectedId(story.id)}
                className={cn(
                  "absolute inset-0 z-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              />
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {selected ? <StoryModal key={selected.id} story={selected} onClose={() => setSelectedId(null)} /> : null}
      </AnimatePresence>
    </section>
  );
}