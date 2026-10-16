import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import SpinBadge from "./../components/SpinBadge.jsx";
import StoryModal from "../components/StoryModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { reconcileSaved } from "../lib/savedStories.js";
import exportSaved from "../lib/exportSaved.js";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "saved recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Reading list. Saved stories are snapshots in localStorage, so an entry whose
// source feed no longer carries it still renders from the cached headline,
// summary, and link rather than 404ing. Live stories (still in today's edition)
// are reconciled against the saved records so the freshest data wins.
export default function Saved({ stories }) {
  // Bump this when the modal closes so a bookmark removed inside the dialog
  // is reflected in the list immediately (reconcileSaved re-reads storage).
  const [revision, setRevision] = useState(0);
  const savedList = useMemo(() => reconcileSaved(stories || []), [stories, revision]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = savedList.find((s) => s.id === selectedId) || null;

  const closeModal = () => {
    setSelectedId(null);
    setRevision((r) => r + 1);
  };

  return (
    <section className="section" aria-label="Saved stories">
      <Link
        to="/edition"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to the edition
      </Link>

      <header className="ed page-head pt-8 pb-6">
        <span className="fp-kicker">The clipping file</span>
        <h1 className="page-title" style={{ fontSize: "clamp(36px, 6vw, 68px)" }}>Saved for Later</h1>
        <p className="page-deck">
          {savedList.length > 0
            ? `Kept in your browser. ${savedList.length} saved. Readable even after they age out of today's edition.`
            : "Kept in your browser. Nothing saved yet."}
        </p>
      </header>

      {savedList.length > 0 && (
        <div className="mb-4 text-center">
          <button type="button" className="btn-outline" onClick={() => exportSaved(savedList)}>
            Download saved stories
          </button>
        </div>
      )}

      {savedList.length === 0 ? (
        <EmptyState
          kicker="THE FILE IS EMPTY"
          text="Tap the bookmark on any story to keep it here — even after it ages out of today's edition."
          action={{ label: "Go to the edition", onClick: () => (window.location.href = "/edition") }}
        />
      ) : (
        <>
          <div className="wire-head" style={{ marginTop: 24 }}>
            <span>Kept for later</span>
            <span>
              {savedList.length} {savedList.length === 1 ? "story" : "stories"} · stored in this browser
            </span>
          </div>
          <ul className="wire-grid">
            {savedList.map((story) => (
              <li key={story.id} className="group relative flex min-h-0 flex-col">
                <div className="wire-meta">
                  <span className="src">{story.source || "Unknown source"}</span>
                  <span>{fmtDate(story.publishedAt)}</span>
                </div>

                <h2 className="wire-headline">{story.title}</h2>

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
                  aria-label={`Open saved story: ${story.title}`}
                  aria-haspopup="dialog"
                  onClick={() => setSelectedId(story.id)}
                  className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <AnimatePresence>
        {selected ? <StoryModal key={selected.id} story={selected} onClose={() => setSelectedId(null)} /> : null}
      </AnimatePresence>
    </section>
  );
}
