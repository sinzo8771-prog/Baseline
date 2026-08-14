import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSaved, toggleSaved } from "../lib/savedStories.js";

// Save-for-later toggle, shared by every story surface (feed card, cards view,
// modal, permalink page). Reads the saved state once on mount; the localStorage
// write is synchronous so the checked state is accurate immediately after a tap.
export default function BookmarkButton({ story, className }) {
  const [saved, setSaved] = useState(() => (story ? isSaved(story.id) : false));

  if (!story) return null;

  const onToggle = () => {
    const nowSaved = toggleSaved(story);
    setSaved(nowSaved);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove from saved: ${story.title}` : `Save for later: ${story.title}`}
      title={saved ? "Saved — tap to remove" : "Save for later"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        saved && "border-primary text-primary",
        className,
      )}
    >
      {saved ? <BookmarkCheck className="size-3.5" aria-hidden="true" /> : <Bookmark className="size-3.5" aria-hidden="true" />}
    </button>
  );
}