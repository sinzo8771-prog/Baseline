import { SOURCES } from "../../lib/feeds.js";

// Builds an OPML file of the current sources and downloads it, mirroring the
// original vanilla app.js exportOPML flow.
export default function exportOPML() {
  const sources = SOURCES.map((s) => ({
    title: s.name,
    xmlUrl: s.feed,
  }));

  let opml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n' +
    '    <title>The Baseline — AI News Sources</title>\n' +
    '    <dateCreated>' +
    new Date().toUTCString() +
    "</dateCreated>\n  </head>\n  <body>\n";

  sources.forEach((s) => {
    opml += `    <outline text="${s.title}" title="${s.title}" type="rss" xmlUrl="${s.xmlUrl}" />\n`;
  });

  opml += "  </body>\n</opml>";

  const blob = new Blob([opml], { type: "text/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "the-baseline-sources.opml";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on a later tick: some browsers (Firefox) abort the download if the
  // object URL is revoked before the browser has started reading it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return `OPML exported — ${sources.length} sources, filed and sorted.`;
}