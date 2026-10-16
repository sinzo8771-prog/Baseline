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

function fmtRank(n) {
  return String(n).padStart(2, "0");
}

// Monochrome pip meter — a quiet visual read of the same score the number
// states, kept out of the accessibility tree because the score text already
// carries it.
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
        <span className=" border border-primary/60 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-primary">
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

function CardImage({ story, isLead = false, className }) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(story.image) && !failed;
  return (
    <div className={cn("card-img-slot", className, !show && "card-img-placeholder")}>
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

// The lead story gets a real newspaper shape: kicker, big serif headline,
// italic deck, mono byline rule. The article element IS the two-column grid
// so the score rail stays inside it (the permalink anchors and the save
// control both hang off `story-<id>`).
function LeadStory({ story, isNew, active, onOpen }) {
  const hot = story.spinScore >= 60;
  return (
    <m.article
      id={`story-${story.id}`}
      layoutId={`story-${story.id}`}
      className={cn("lead group relative", active && "is-active")}
      tabIndex={-1}
    >
      <div className="lead-body">
        <CardImage story={story} isLead className="mb-5" />
        <p className="lead-kicker">Lead story</p>
        <h2 className="lead-headline">{story.title}</h2>
        {story.summary ? <p className="lead-deck">{story.summary}</p> : null}
        <div className="lead-byline">
          <span>
            Filed by <b>{story.source}</b>
          </span>
          <span>{fmtDate(story.publishedAt)}</span>
          {isNew ? <span className="text-primary">New</span> : null}
        </div>
        <SignalLine story={story} />
      </div>

      <div className="lead-rail">
        <div className={cn("lead-score", hot && "is-hot")}>
          <span className="score-k">Hype index</span>
          <span className="score-v">{story.spinScore}</span>
          <span className="score-band">{story.spin} · of 100</span>
        </div>
        <div className="lead-actions">
          <button
            type="button"
            className="btn-solid"
            aria-haspopup="dialog"
            onClick={onOpen}
          >
            Read <ExternalLink className="size-3.5" aria-hidden="true" />
          </button>
          <BookmarkButton story={story} />
        </div>
      </div>

      {/* Full-article hit area. Sits under the rail's own buttons so those stay
          clickable; the headline and deck are text, not links, so the whole
          block is reachable by one target. */}
      <button
        type="button"
        aria-label={`Open story: ${story.title}`}
        aria-haspopup="dialog"
        onClick={onOpen}
        className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </m.article>
  );
}

// The rest of the edition is a ruled index: rank numeral in the left rail,
// headline and summary in the body, the measurement and the save control in
// the right rail. One hairline per story instead of a box per story, which is
// what lets a long edition stay scannable.
function IndexRow({ story, rank, isNew, active, onOpen }) {
  const hot = story.spinScore >= 60;
  return (
    <m.article
      id={`story-${story.id}`}
      layoutId={`story-${story.id}`}
      className={cn("index-row group", active && "is-active")}
      tabIndex={-1}
    >
      <span className="rank" aria-hidden="true">{fmtRank(rank)}</span>

      <div className="body">
        <span className="kicker">
          {story.source} <span className="spin">· {story.spin}</span>
        </span>
        <h2>{story.title}</h2>
        {story.summary ? <p className="summary">{story.summary}</p> : null}
        <div className="meta">
          <span className="src">{story.source}</span>
          <span>{fmtDate(story.publishedAt)}</span>
          {isNew ? <span className="spin-flag">New</span> : null}
        </div>
      </div>

      <div className="rail">
        <CardImage story={story} className="row-thumb" />
        <span className={cn("fig", hot && "is-hot")}>
          hype <b>{story.spinScore}</b>/100
        </span>
        <div className="rail-actions">
          <BookmarkButton story={story} />
        </div>
      </div>

      <button
        type="button"
        aria-label={`Open story: ${story.title}`}
        aria-haspopup="dialog"
        onClick={onOpen}
        className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

  // A single filtered story is just a row — promoting it to the lead slot when
  // it's the whole result looks absurd. Lead treatment only earns its weight
  // above a 2-card edition.
  const showLead = stories.length > 1;
  const lead = showLead ? stories[0] : null;
  const rest = showLead ? stories.slice(1) : stories;

  return (
    <div>
      {lead ? (
        (() => {
          const isNew = isNewSinceLastVisit(lead.publishedAt, lastVisit);
          const leadNode = (
            <LeadStory story={lead} isNew={isNew} active={lead.id === activeId} onOpen={() => open(lead)} />
          );
          // The Glitch is an editorial punctuation mark for the single hottest
          // story; wrapping every On Fire card in its own WebGL loop would pin
          // the GPU on mobile. Only the lead earns the effect.
          if (lead.spin === "On Fire") {
            return (
              <Suspense fallback={<div key={lead.id}>{leadNode}</div>}>
                <Glitch key={lead.id} intensity={0.85} interval={4} duration={0.3} slices={20} rgbShift={5}>
                  {leadNode}
                </Glitch>
              </Suspense>
            );
          }
          return <div key={lead.id}>{leadNode}</div>;
        })()
      ) : null}

      {rest.length > 0 ? (
        <>
          <p className="index-head">
            <span>In this edition</span>
            <span>
              {fmtRank(1)}–{fmtRank(stories.length)} · ranked by filing order
            </span>
          </p>
          <div className="index">
            {rest.map((story, i) =>
              selectedId === story.id ? null : (
                <IndexRow
                  key={story.id}
                  story={story}
                  rank={i + 2}
                  isNew={isNewSinceLastVisit(story.publishedAt, lastVisit)}
                  active={story.id === activeId}
                  onOpen={() => open(story)}
                />
              ),
            )}
          </div>
        </>
      ) : null}

      <AnimatePresence>
        {selectedStory ? <StoryModal key={selectedStory.id} story={selectedStory} onClose={close} /> : null}
      </AnimatePresence>
    </div>
  );
}