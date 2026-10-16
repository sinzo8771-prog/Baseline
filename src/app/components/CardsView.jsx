import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
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
      <div className="wire-head">
        <span>The wires</span>
        <span>{stories.length} {stories.length === 1 ? "story" : "stories"} · newest first</span>
      </div>
      <ul className="wire-grid">
        {stories.map((story) => (
          <li key={story.id} className="group relative flex min-h-0 flex-col">
            <div className="wire-meta">
              <span className="src">{story.source}</span>
              <span>{fmtDate(story.publishedAt)}</span>
              {isNewSinceLastVisit(story.publishedAt, lastVisit) ? (
                <span className="flag">New</span>
              ) : null}
            </div>

            <h3 className="wire-headline">{story.title}</h3>

            <BookmarkButton story={story} className="wire-save" />

            <div className="mt-auto pt-3">
              <div className="wire-foot">
                <SpinBadge
                  spin={story.spin}
                  flags={story.flags}
                  signals={story.signals}
                  hedged={story.hedged}
                  score={story.spinScore}
                />
                <span className="wire-read">
                  Read <ExternalLink className="size-3" aria-hidden="true" />
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label={`Open story: ${story.title}`}
              aria-haspopup="dialog"
              onClick={() => open(story)}
              className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
