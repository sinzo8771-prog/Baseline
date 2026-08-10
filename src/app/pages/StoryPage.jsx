import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import SpinBadge from "../components/SpinBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { copyText, storyUrl } from "../lib/copyLink.js";
import { cn } from "@/lib/utils";

const SITE = "https://the-baseline.baseline-news.workers.dev";

function fmtFull(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "Date unknown"
    : d.toLocaleString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

// Wire per-story metadata (title, canonical, OG, NewsArticle JSON-LD) into the
// head so a shared permalink opens as a real article, not a generic SPA shell.
// All values come from the story or its source; nothing is invented.
function useStoryMeta(story) {
  useEffect(() => {
    if (!story) return undefined;
    const url = storyUrl(story.id, SITE);
    const description = story.summary ? story.summary.slice(0, 155) : `A story from ${story.source}, hype measured by The Baseline.`;

    const prevTitle = document.title;
    document.title = `${story.title} — The Baseline`;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const prevCanonical = canonical.getAttribute("href");
    canonical.setAttribute("href", url);

    const setMeta = (prop, val) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", val);
      return prev;
    };
    const prevs = [
      setMeta("og:title", story.title),
      setMeta("og:description", description),
      setMeta("og:url", url),
    ];

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "story-jsonld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: story.title,
      url,
      datePublished: story.publishedAt,
      dateModified: story.publishedAt,
      description,
      inLanguage: "en",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      publisher: { "@type": "Organization", name: "The Baseline" },
      sourceOrganization: story.source ? { "@type": "Organization", name: story.source } : undefined,
    });
    const prevScript = document.getElementById("story-jsonld");
    if (prevScript) prevScript.remove();
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      canonical?.setAttribute("href", prevCanonical || "");
      const metas = [
        ["og:title", prevs[0]],
        ["og:description", prevs[1]],
        ["og:url", prevs[2]],
      ];
      for (const [prop, val] of metas) {
        const el = document.querySelector(`meta[property="${prop}"]`);
        if (el) el.setAttribute("content", val);
      }
      document.getElementById("story-jsonld")?.remove();
    };
  }, [story]);
}

export default function StoryPage({ allStories, loaded, offline, reload }) {
  const { id } = useParams();
  const story = useMemo(() => allStories.find((s) => s.id === id) || null, [allStories, id]);
  useStoryMeta(story);
  const [copied, setCopied] = useState(false);
  const href = safeHref(story?.link);

  const onCopy = async () => {
    if (!story) return;
    const ok = await copyText(storyUrl(story.id));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!loaded) {
    return (
      <section className="section">
        <div className="h-5 w-40 animate-pulse rounded skeleton" />
        <div className="mt-4 h-8 w-11/12 max-w-3xl animate-pulse rounded skeleton" />
        <div className="mt-3 h-8 w-7/12 max-w-2xl animate-pulse rounded skeleton" />
      </section>
    );
  }

  if (offline && !story) {
    return (
      <EmptyState
        kicker="PRESSES JAMMED"
        text="The wires could not be reached, and no saved copy of this story is on hand. Try the presses again."
        action={{ label: "Try again", onClick: reload }}
      />
    );
  }

  if (!story) {
    return (
      <EmptyState
        kicker="NOT IN THE FILES"
        text="This story isn't in today's edition. It may have aged out, or the permalink is mistyped. Browse the front page for what's printing now."
        action={{ label: "Back to the front page", onClick: () => (window.location.href = "/") }}
      />
    );
  }

  const reason = story.flags?.length ? story.flags.join(", ") : "no hype signals";

  return (
    <section className="section">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to the edition
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          {story.source}
        </span>
        <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Published {fmtFull(story.publishedAt)}
        </span>
      </div>

      <h1 className="mt-4 max-w-3xl font-serif text-3xl font-black leading-tight break-words text-foreground sm:text-4xl md:text-5xl">
        {story.title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SpinBadge spin={story.spin} flags={story.flags} />
        <span className="font-mono text-sm text-muted-foreground">
          {story.spinScore}/100 intensity
        </span>
      </div>

      <div className="mt-6 max-w-2xl rounded-md border border-border bg-card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Why this score
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground">
          Headline contains {reason}.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          The Baseline is a detector, not a judgment. Scores measure how loudly
          a headline is talking, not whether it is true.
        </p>
      </div>

      {story.summary ? (
        <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted-foreground">{story.summary}</p>
      ) : (
        <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
          The full article is published by {story.source}. Follow the link to read it in full.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Read original <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
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
      </div>
    </section>
  );
}
