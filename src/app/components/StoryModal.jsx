import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { Copy, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinBadge from "./SpinBadge.jsx";
import SignalBreakdown from "./SignalBreakdown.jsx";
import { copyText, storyUrl } from "../lib/copyLink.js";

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

// Shared story dialog used by both the Edition feed and the Cards view.
// Focus trap + Escape + focus restore live here once, not duplicated per view.
export default function StoryModal({ story, onClose, overlayColor = "bg-background/85" }) {
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
        className={cn("fixed inset-0 z-40 backdrop-blur-sm", overlayColor)}
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <SpinBadge spin={story.spin} flags={story.flags} signals={story.signals} hedged={story.hedged} score={story.spinScore} />
              <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {story.source} · {fmtTime(story.publishedAt)}
              </span>
            </div>
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
                  referrerpolicy="no-referrer"
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

            <div className="mt-6 max-w-2xl rounded-md border border-border bg-accent/40 p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Why this score
              </h3>
              <SignalBreakdown signals={story.signals} hedged={story.hedged} className="mt-2" />
            </div>

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

function fmtTime(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}