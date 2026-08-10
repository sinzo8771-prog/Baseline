import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinBadge from "./SpinBadge.jsx";
import Glitch from "@/components/canvasui/Glitch.jsx";
import { copyText, storyUrl } from "../lib/copyLink.js";

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

function CardShell({ story, isLead = false, onOpen, active = false }) {
  return (
    <m.article
      id={`story-${story.id}`}
      layoutId={`story-${story.id}`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative block rounded-md border border-border/70 bg-card p-5 text-left transition-colors duration-150 sm:p-6",
        "hover:border-primary/50 hover:bg-accent/40 hover:shadow-sm",
        isLead && "mb-10 border-t-2 border-border/80 p-6 sm:p-8",
        active && "border-primary ring-2 ring-primary/30",
      )}
      style={isLead ? { borderTopColor: "var(--vermillion)" } : undefined}
    >
      {story.image ? (
        <div className="mb-4 -mx-5 -mt-5 rounded-t-md overflow-hidden sm:-mx-6 sm:-mt-6 sm:rounded-t-md">
          <img
            src={story.image}
            alt=""
            loading="lazy"
            className="w-full h-auto max-h-[200px] object-cover transition-opacity duration-200 group-hover:opacity-90"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      ) : null}
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
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(storyUrl(story.id));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

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
            {story.image ? (
              <div className="-mx-5 -mt-5 mb-6 rounded-t-md overflow-hidden sm:-mx-8 sm:-mt-8 md:-mx-10 md:-mt-10 md:mb-8 sm:rounded-t-md md:rounded-t-lg">
                <img
                  src={story.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-auto max-h-[300px] object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            ) : null}
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
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onCopy}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  copied && "border-primary text-primary",
                )}
              >
                <Copy className="size-3.5" aria-hidden="true" />
                {copied ? "Link copied" : "Copy link"}
              </button>
              <a
                href={`/story/${encodeURIComponent(story.id)}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.08em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Open permalink
              </a>
            </div>
          </div>
        </div>
      </m.div>
    </>
  );
}

export default function StoryFeed({ stories }) {
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
  // closes. Never hijack keys while the user is typing in an input.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing) return;
      const list = stories;
      if (list.length === 0) return;
      if (selectedId) {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
        return;
      }
      const idx = activeId ? list.findIndex((s) => s.id === activeId) : -1;
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        const next = Math.min(list.length - 1, Math.max(0, idx + 1));
        setActiveId(list[next].id);
        document.getElementById(`story-${list[next].id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        const next = Math.max(0, Math.max(0, idx - 1));
        setActiveId(list[next].id);
        document.getElementById(`story-${list[next].id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else if (e.key === "Enter" && idx >= 0) {
        e.preventDefault();
        open(list[idx]);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [stories, activeId, selectedId]);

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
    const card = <CardShell story={story} isLead={isLead} active={story.id === activeId} onOpen={() => open(story)} />;
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
