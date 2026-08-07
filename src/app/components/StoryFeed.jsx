import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinBadge from "./SpinBadge.jsx";

// Editorial story feed. Adapted from 21st.dev's News Cards pattern: cards
// lift on hover and expand into a shared-layout modal (framer-motion
// layoutId morph). Images/bookmarks are dropped — our data is typography +
// rating — and the card keeps the paper/ink/vermillion print look. The App
// root wraps this in <MotionConfig reducedMotion="user"> so the morph
// respects prefers-reduced-motion.

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

function Meta({ story }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <SpinBadge spin={story.spin} flags={story.flags} />
      <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {story.source} — {fmtDate(story.publishedAt)}
      </span>
    </div>
  );
}

function CardShell({ story, isLead = false, onOpen }) {
  return (
    <motion.button
      layoutId={`story-${story.id}`}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group block w-full rounded-md border border-border/70 bg-card p-5 text-left transition-colors duration-150",
        "hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isLead && "mb-8 border-border/80 p-6 sm:p-8",
      )}
    >
      {isLead ? (
        <div className="mb-3 font-sans text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Lead story</div>
      ) : null}
      <Meta story={story} />
      <h2
        className={cn(
          "mt-3 font-serif font-bold leading-tight text-foreground",
          isLead ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl",
        )}
      >
        {story.title}
      </h2>
      {isLead && story.summary ? (
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{story.summary}</p>
      ) : null}
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Read <ExternalLink className="size-3" aria-hidden="true" />
      </span>
    </motion.button>
  );
}

function StoryModal({ story, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-background/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId={`story-${story.id}`}
        role="dialog"
        aria-modal="true"
        aria-label={story.title}
        className="fixed inset-x-4 top-6 bottom-6 z-50 overflow-hidden rounded-lg border border-border bg-card sm:inset-x-8 md:inset-x-16 md:top-16 md:bottom-16"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <header className="flex items-center justify-between gap-4 border-b border-border p-4 sm:p-6">
            <Meta story={story} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close story"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>
          <div className="p-5 sm:p-8 md:p-10">
            <h1 className="font-serif text-2xl font-black leading-tight text-foreground sm:text-3xl md:text-4xl">
              {story.title}
            </h1>
            {story.summary ? (
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted-foreground">{story.summary}</p>
            ) : (
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
                The full article is published by {story.source}. Follow the link to read it in full.
              </p>
            )}
            <a
              href={safeHref(story.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Read original <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function StoryFeed({ stories }) {
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

  const lead = stories[0];
  const grid = stories.slice(1, 25);

  return (
    <div>
      {lead ? <CardShell story={lead} isLead onOpen={() => open(lead)} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {grid.map((story) =>
          selectedId === story.id ? null : <CardShell key={story.id} story={story} onOpen={() => open(story)} />,
        )}
      </div>
      <AnimatePresence>
        {selectedStory ? <StoryModal key={selectedStory.id} story={selectedStory} onClose={close} /> : null}
      </AnimatePresence>
    </div>
  );
}
