import { buildJsonFeed } from "../../lib/feedBuilders.js";

// Downloads the reader's saved list as a JSON Feed file, mirroring the OPML
// export flow (Blob + object URL + temporary anchor, revoke on a later tick).
// buildJsonFeed is a pure serializer over data already in memory, so this is a
// client-side call with no Worker round-trip.
export default function exportSaved(stories) {
  const list = (stories || []).map((s) => ({
    ...s,
    // A cached snapshot may lack a valid published date; buildJsonFeed would
    // throw on an empty one, so fall back to the save timestamp.
    publishedAt:
      s.publishedAt && !Number.isNaN(new Date(s.publishedAt).getTime())
        ? s.publishedAt
        : new Date(s.savedAt ?? Date.now()).toISOString(),
  }));

  const baseUrl = window.location.origin;
  const feed = buildJsonFeed(list, {
    baseUrl,
    feedUrl: `${baseUrl}/feed.json`,
    title: "The Baseline — Saved for later",
  });

  const blob = new Blob([feed], { type: "application/feed+json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "the-baseline-saved.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on a later tick: some browsers (Firefox) abort the download if the
  // object URL is revoked before the browser has started reading it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return `Saved list exported — ${list.length} stories.`;
}