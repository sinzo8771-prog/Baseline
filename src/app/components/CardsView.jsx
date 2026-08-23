import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinBadge from "./SpinBadge.jsx";
import StoryModal from "./StoryModal.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { isNewSinceLastVisit } from "../lib/lastVisit.js";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Editorial wire-card view: a dense newsroom grid, not a generic SaaS card
// feed. Each card is source / time / verbatim headline / a score line / a
// "read original" affordance, separated by rules rather than gradients or
// shadow-boxes — matching the print identity of the Edition view.
export default function CardsView({ stories, lastVisit = null }) {
  const [selectedId, setSelectedId] = useState(null);
  const triggerRef = useRef(null);
  const selectedStory = stories.find((s) => s.id === selectedId) || null;

  useEffect(() => {
    if (!selectedStory) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [selectedStory]);

  const open = (story) => {
    triggerRef.current = document.activeElement;
    setSelectedId(story.id);
  };
  const close = () => setSelectedId(null);

  return (
    <div>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <li key={story.id} className="group relative flex min-h-0 flex-col bg-card p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {story.source}
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {fmtDate(story.publishedAt)}
              </span>
              {isNewSinceLastVisit(story.publishedAt, lastVisit) ? (
                <span className="rounded-[2px] border border-primary/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                  New
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 line-clamp-4 break-words font-serif text-lg font-bold leading-snug text-foreground">
              {story.title}
            </h3>

            <BookmarkButton
              story={story}
              className="absolute right-3 top-3 z-10 size-8 bg-card/80 backdrop-blur-sm"
            />

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                <SpinBadge
                  spin={story.spin}
                  flags={story.flags}
                  signals={story.signals}
                  hedged={story.hedged}
                  score={story.spinScore}
                />
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  Read <ExternalLink className="size-3" aria-hidden="true" />
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label={`Open story: ${story.title}`}
              aria-haspopup="dialog"
              onClick={() => open(story)}
              className={cn(
                "absolute inset-0 z-0 cursor-pointer rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            />
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {selectedStory ? <StoryModal key={selectedStory.id} story={selectedStory} onClose={close} /> : null}
      </AnimatePresence>
    </div>
  );
}
