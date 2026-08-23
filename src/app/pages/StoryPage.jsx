import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Copy, ExternalLink, Share2 } from "lucide-react";
import SignalBreakdown from "../components/SignalBreakdown.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import Plate, { PLATES } from "../components/EditorialPlates.jsx";
import { copyText, storyUrl } from "../lib/copyLink.js";
import { sortStories } from "@/lib/ranking";
import { SITE_URL as SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

function fmtFull(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "Date unknown"
    : d.toLocaleString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

// Deterministic plate index per story so artwork varies across stories but is
// stable for any given permalink.
function plateIndex(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

// Slim vermillion reading-progress bar pinned to the top of the viewport,
// mirroring the printed-page metaphor: the page fills as you read.
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setPct(p * 100);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <div className="sp-progress" style={{ width: `${pct}%` }} aria-hidden="true" />;
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
      setMeta("og:type", "article"),
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
        ["og:type", prevs[3]],
      ];
      for (const [prop, val] of metas) {
        const el = document.querySelector(`meta[property="${prop}"]`);
        if (el) el.setAttribute("content", val);
      }
      document.getElementById("story-jsonld")?.remove();
    };
  }, [story]);
}

export default function StoryPage({ allStories, stories, loaded, offline, reload }) {
  const { id } = useParams();
  const story = useMemo(() => allStories.find((s) => s.id === id) || null, [allStories, id]);

  // Prev/next follow the edition's default "Edited" ranking so paging through
  // a story reads like turning the pages of today's paper, in the same order
  // the front page prints them.
  const ranked = useMemo(() => sortStories(stories, "edited"), [stories]);
  const index = useMemo(
    () => (story ? ranked.findIndex((s) => s.id === story.id) : -1),
    [ranked, story],
  );
  const prev = index > 0 ? ranked[index - 1] : null;
  const next = index >= 0 && index < ranked.length - 1 ? ranked[index + 1] : null;

  // The related strip: everything else in today's ranking except this story
  // and its two neighbours, so the strip never repeats the pager above it.
  const related = useMemo(
    () =>
      ranked
        .filter((s) => s.id !== story?.id && s.id !== prev?.id && s.id !== next?.id)
        .slice(0, 4),
    [ranked, story, prev, next],
  );

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

  // Native share when the platform offers it (mobile, some desktops); the
  // copy button stays for everyone else. Preserves the story permalink either way.
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const onShare = async () => {
    if (!story) return;
    const url = storyUrl(story.id);
    if (canShare) {
      try {
        await navigator.share({ title: story.title, text: `${story.title} — via The Baseline`, url });
        return;
      } catch {
        // User dismissed the sheet or sharing failed; fall through to copy.
      }
    }
    await onCopy();
  };

  if (!loaded) {
    return (
      <section className="section" aria-busy="true">
        <div className="h-5 w-40 animate-pulse rounded skeleton" />
        <div className="mx-auto mt-8 h-12 w-11/12 max-w-3xl animate-pulse rounded skeleton" />
        <div className="mx-auto mt-3 h-12 w-7/12 max-w-2xl animate-pulse rounded skeleton" />
        <div className="mx-auto mt-10 h-72 w-full max-w-4xl animate-pulse rounded skeleton" />
      </section>
    );
  }

  if (offline && !story) {
    return (
      <EmptyState
        kicker="THE PRESSES ARE JAMMED"
        text="The latest wires could not be reached, and no saved copy of this story is on hand. Try the presses again."
        action={{ label: "TRY AGAIN", onClick: reload }}
      />
    );
  }

  if (!story) {
    return (
      <EmptyState
        kicker="NOT IN THE FILES"
        text="This story isn't in today's edition. It may have aged out, or the permalink is mistyped. Browse the front page for what's printing now."
        action={{ label: "Back to the front page", onClick: () => (window.location.href = "/edition") }}
      />
    );
  }

  return (
    <div className="sp">
      <ReadingProgress />

      <article className="sp-article">
        <div className="mb-6 text-center">
          <Link
            to="/edition"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to the edition
          </Link>
        </div>

        <header className="sp-article-head">
          <span className="fp-kicker">{story.source} · The Story File</span>
          <h1 className="sp-headline">{story.title}</h1>
        </header>

        <div className="sp-byline">
          <span>By <b>{story.source}</b></span>
          <span aria-hidden="true">·</span>
          <span>{fmtFull(story.publishedAt)}</span>
          <span aria-hidden="true">·</span>
          <span>Intensity <b>{story.spinScore}/100</b></span>
          <span aria-hidden="true">·</span>
          <span>Hype measures loudness, not truth</span>
        </div>

        <figure className="sp-hero-fig">
          <div className="frame">
            <Plate index={plateIndex(story.id)} />
          </div>
          <figcaption className="sp-fig-cap">
            Illustration · {PLATES[plateIndex(story.id) % PLATES.length].label}
          </figcaption>
        </figure>

        <blockquote className="sp-verdict">
          “{story.spin}.”
          <cite>Detector verdict · intensity {story.spinScore}/100</cite>
        </blockquote>

        <div className="sp-body">
          {story.summary?.trim() ? (
            <p>{story.summary}</p>
          ) : (
            <p>
              The full article is published by {story.source}. The Baseline reprints headlines verbatim and measures
              how loudly each one is told — follow the link below to read it at the source.
            </p>
          )}
        </div>

        <div className="sp-callout mx-auto mt-10 max-w-[68ch]">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Why this score
          </h2>
          <SignalBreakdown signals={story.signals} hedged={story.hedged} className="mt-2" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="fp-btn-primary inline-flex items-center gap-2"
            >
              Read original <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          {canShare ? (
            <button
              type="button"
              onClick={onShare}
              className="btn-outline inline-flex items-center gap-2"
            >
              <Share2 className="size-3.5" aria-hidden="true" />
              Share
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCopy}
            className={cn("btn-outline inline-flex items-center gap-2", copied && "border-primary text-primary")}
          >
            <Copy className="size-3.5" aria-hidden="true" />
            {copied ? "Link copied" : "Copy link"}
          </button>
          <BookmarkButton story={story} />
        </div>
      </article>

      {prev || next ? (
        <nav
          className="mx-auto grid max-w-5xl grid-cols-1 gap-4 border-t border-border px-0 pt-6 sm:grid-cols-2"
          aria-label="Story navigation"
        >
          {prev ? (
            <Link
              to={`/story/${prev.id}`}
              className="group flex min-w-0 flex-col gap-1 border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <ArrowLeft className="size-3" aria-hidden="true" /> Previous
              </span>
              <span className="line-clamp-2 font-serif text-[15px] font-bold leading-snug text-foreground group-hover:underline">
                {prev.title}
              </span>
            </Link>
          ) : <span />}
          {next ? (
            <Link
              to={`/story/${next.id}`}
              className="group flex min-w-0 flex-col gap-1 border border-border bg-card p-4 text-right transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:col-start-2"
            >
              <span className="inline-flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Next <ArrowRight className="size-3" aria-hidden="true" />
              </span>
              <span className="line-clamp-2 font-serif text-[15px] font-bold leading-snug text-foreground group-hover:underline">
                {next.title}
              </span>
            </Link>
          ) : <span />}
        </nav>
      ) : null}

      {related.length > 0 ? (
        <section className="fp mt-14" aria-label="Related stories" style={{ borderTop: "3px double var(--rule)", paddingTop: "clamp(44px, 6vw, 72px)" }}>
          <div className="section-head">
            <h2>Elsewhere in the edition</h2>
            <Link className="more" to="/edition">All stories →</Link>
          </div>
          <div className="fp-feed-grid">
            {related.map((s, i) => (
              <article key={s.id} className={`fp-card ${i === 0 ? "fp-card-feature" : i === 1 ? "fp-card-mid" : "fp-card-std"}`}>
                <Link className="block" to={`/story/${s.id}`}>
                  <Plate index={plateIndex(s.id)} />
                  <span className="fp-kicker">{s.source}</span>
                  <h3>{s.title}</h3>
                  <div className="meta">{fmtFull(s.publishedAt)}</div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
