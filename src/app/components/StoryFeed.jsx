import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinBadge from "./SpinBadge.jsx";
import StoryModal from "./StoryModal.jsx";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts.js";
import BookmarkButton from "./BookmarkButton.jsx";
import { isNewSinceLastVisit } from "../lib/lastVisit.js";

// The Glitch effect only ever runs on the lead "On Fire" card — a single card
// that most editions don't even have. Its WebGL setup is deferred until that
// card is actually about to render, so the edition page's initial load doesn't
// pay for a shader that may never appear. The card itself renders in the
// fallback the moment the feed arrives.
const Glitch = lazy(() => import("@/components/canvasui/Glitch.jsx"));

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Monochrome pip meter from the OpenDesign edition pass — a quiet visual
// read of the same score the number states, kept out of the accessibility
// tree because the score text already carries it.
function IntensityPips({ score }) {
  const filled = Math.max(1, Math.min(4, Math.ceil((score ?? 0) / 25)));
  return (
    <span className="intensity-pips" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={cn("pip", i <= filled && "on")} />
      ))}
    </span>
  );
}

// Identity line — who published it, and when. The source carries weight
// (semibold ink); the timestamp stays quiet, so the eye reads headline,
// then source, then time — not one flat strip of equal-weight metadata.
function SourceLine({ story, isNew = false }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] uppercase tracking-[0.08em]">
      <span className="font-semibold text-foreground">{story.source}</span>
      <span className="text-muted-foreground">{fmtDate(story.publishedAt)}</span>
      {isNew ? (
        <span className="rounded-[2px] border border-primary/60 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-primary">
          New
        </span>
      ) : null}
    </div>
  );
}

// The hype signal lives in its own row below the identity line, so the
// measurement reads as one quiet instrument panel — badge, pips, number —
// rather than competing with the headline for first glance.
function SignalLine({ story }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
      <SpinBadge spin={story.spin} flags={story.flags} signals={story.signals} hedged={story.hedged} score={story.spinScore} />
      <IntensityPips score={story.spinScore} />
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{story.spinScore}/100</span>
    </div>
  );
}

function CardImage({ story, isLead = false }) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(story.image) && !failed;
  return (
    <div
      className={cn(
        "card-img-slot mb-4 -mx-5 -mt-5 rounded-t-[2px] sm:-mx-6 sm:-mt-6 sm:rounded-t-[2px]",
        !show && "card-img-placeholder",
      )}
    >
      {show ? (
        <img
          src={story.image}
          alt=""
          loading={isLead ? "eager" : "lazy"}
          fetchPriority={isLead ? "high" : undefined}
          className="transition-opacity duration-200 group-hover:opacity-90"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}

function CardShell({ story, isLead = false, onOpen, active = false, isNew = false }) {
  return (
    <m.article
      id={`story-${story.id}`}
      layoutId={`story-${story.id}`}
      className={cn(
        "group relative block rounded-[2px] border border-border/70 bg-card p-5 text-left transition-colors duration-150 sm:p-6",
        "hover:border-primary/50 hover:bg-accent/40 hover:shadow-sm",
        isLead && "mb-10 border-t-2 border-border/80 p-6 sm:p-8",
        active && "border-primary ring-2 ring-primary/30",
      )}
      style={isLead ? { borderTopColor: "var(--vermillion)" } : undefined}
    >
            <CardImage story={story} isLead={isLead} />
      <h2
        className={cn(
          "break-words font-serif font-bold leading-snug tracking-[-0.01em] text-foreground",
          isLead ? "text-3xl sm:text-4xl" : "line-clamp-3 text-lg sm:text-xl",
        )}
      >
        {story.title}
      </h2>
      <div className="mt-2.5">
        <SourceLine story={story} isNew={isNew} />
      </div>
      <SignalLine story={story} />
      {isLead && story.summary ? (
        <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{story.summary}</p>
      ) : null}
      <BookmarkButton
        story={story}
        className="absolute right-3 top-3 z-10 size-8 bg-card/80 backdrop-blur-sm"
      />
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        Read <ExternalLink className="size-3" aria-hidden="true" />
      </span>
      <button
        type="button"
        aria-label={`Open story: ${story.title}`}
        aria-haspopup="dialog"
        onClick={onOpen}
        className="absolute inset-0 z-0 cursor-pointer rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </m.article>
  );
}

export default function StoryFeed({ stories, lastVisit = null }) {
  const [selectedId, setSelectedId] = useState(null);
  const [activeId, setActiveId] = useState(null);
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

  // j / k move a visual selection between stories, Enter opens it, Escape
  // closes. Never hijack keys while the user is typing in an input. While the
  // modal is open, only Escape (scoped) stays live; the dialog's focus trap
  // owns everything else.
  useKeyboardShortcuts(
    {
      j: () => move("j"),
      J: () => move("j"),
      k: () => move("k"),
      K: () => move("k"),
      Enter: () => {
        const idx = activeId ? stories.findIndex((s) => s.id === activeId) : -1;
        if (idx >= 0) {
          open(stories[idx]);
          return true;
        }
        return false;
      },
    },
    {
      scoped: {
        Escape: () => {
          close();
          return true;
        },
      },
    },
  );

  function move(dir) {
    const idx = activeId ? stories.findIndex((s) => s.id === activeId) : -1;
    const next =
      dir === "j"
        ? Math.min(stories.length - 1, Math.max(0, idx + 1))
        : Math.max(0, idx - 1);
    if (stories.length === 0 || next === idx) return false;
    setActiveId(stories[next].id);
    document.getElementById(`story-${stories[next].id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return true;
  }

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
    const isNew = isNewSinceLastVisit(story.publishedAt, lastVisit);
    const card = <CardShell story={story} isLead={isLead} active={story.id === activeId} isNew={isNew} onOpen={() => open(story)} />;
    if (isLead && story.spin === "On Fire") {
      return (
        <Suspense fallback={<div key={story.id}>{card}</div>}>
          <Glitch key={story.id} intensity={0.85} interval={4} duration={0.3} slices={20} rgbShift={5}>
            {card}
          </Glitch>
        </Suspense>
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
