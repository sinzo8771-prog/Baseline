import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinBadge from "./SpinBadge.jsx";
import Glitch from "@/components/canvasui/Glitch.jsx";

// Editorial story feed. Adapted from 21st.dev's News Cards pattern: cards
// lift on hover and expand into a shared-layout modal (framer-motion
// layoutId morph). Images/bookmarks are dropped — our data is typography +
// rating — and the card keeps the paper/ink/vermillion print look. The App
// root wraps this in <MotionConfig reducedMotion="user"> so the morph
// respects prefers-reduced-motion.
//
// Each card is an <article> with a stretched cover <button> rather than a
// button wrapping headings and the spin-reason <details>: the heading stays
// valid HTML, the ? popover is independently clickable, and keyboard users get
// one clear focus target per card.

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
    <m.article
      layoutId={`story-${story.id}`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative block rounded-md border border-border/70 bg-card p-5 text-left transition-colors duration-150 sm:p-6",
        "hover:border-primary/50 hover:bg-accent/40 hover:shadow-sm",
        isLead && "mb-10 border-t-2 border-border/80 p-6 sm:p-8",
      )}
      style={isLead ? { borderTopColor: "var(--vermillion)" } : undefined}
    >
      <Meta story={story} />
      <h2
        className={cn(
          "mt-3 break-words font-serif font-bold leading-snug tracking-[-0.01em] text-foreground",
          isLead ? "text-3xl sm:text-4xl" : "line-clamp-3 text-lg sm:text-xl",
        )}
      >
        {story.title}
      </h2>
      {isLead && story.summary ? (
        <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{story.summary}</p>
      ) : null}
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        Read <ExternalLink className="size-3" aria-hidden="true" />
      </span>
      <button
        type="button"
        aria-label={`Open story: ${story.title}`}
        aria-haspopup="dialog"
        onClick={onOpen}
        className="absolute inset-0 z-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </m.article>
  );
}

function StoryModal({ story, onClose }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const href = safeHref(story.link);

  useEffect(() => {
    closeRef.current?.focus();
    const dialog = dialogRef.current;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Focus trap: keep Tab cycling inside the dialog so keyboard users never
      // reach the page behind it (aria-modal is a hint, not a mechanism).
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
  }, [onClose]);

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
            <h2 className="font-serif text-2xl font-black leading-tight break-words text-foreground sm:text-3xl md:text-4xl">
              {story.title}
            </h2>
            {story.summary ? (
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted-foreground">{story.summary}</p>
            ) : (
              <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
                The full article is published by {story.source}. Follow the link to read it in full.
              </p>
            )}
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Read original <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">The original URL for this story isn't available.</p>
            )}
          </div>
        </div>
      </m.div>
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

  // A single filtered story is just a card — promoting it to the 4xl lead
  // slot when it's the whole result looks absurd. Lead treatment only earns
  // its weight above a 2-card edition.
  const showLead = stories.length > 1;
  const lead = showLead ? stories[0] : null;
  const grid = showLead ? stories.slice(1) : stories;

  // The Glitch is an editorial punctuation mark for the single hottest story;
  // wrapping every On Fire card in its own WebGL loop would pin the GPU on
  // mobile. Only the lead earns the effect.
  const renderCard = (story, { lead: isLead = false } = {}) => {
    const card = <CardShell story={story} isLead={isLead} onOpen={() => open(story)} />;
    if (isLead && story.spin === "On Fire") {
      return (
        <Glitch key={story.id} intensity={0.85} interval={4} duration={0.3} slices={20} rgbShift={5}>
          {card}
        </Glitch>
      );
    }
    return <div key={story.id}>{card}</div>;
  };

  return (
    <div>
      {lead ? renderCard(lead, { lead: true }) : null}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
        {grid.map((story) => (selectedId === story.id ? null : renderCard(story)))}
      </div>
      <AnimatePresence>
        {selectedStory ? <StoryModal key={selectedStory.id} story={selectedStory} onClose={close} /> : null}
      </AnimatePresence>
    </div>
  );
}
