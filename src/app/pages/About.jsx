import exportOPML from "../lib/exportOPML.js";

export default function About({ showToast }) {
  return (
    <section id="about" className="section">
      <h2 className="section-title">About</h2>
      <p className="about-copy">The Baseline aggregates RSS feeds from the AI industry and its chroniclers, verbatim. We add nothing but a rating, which is already more than some of these stories deserve. No summaries written by models. No clickbait of our own. Headlines as published, spin as detected, hype as measured.</p>
      <button id="opml-export" className="btn-outline" style={{ marginTop: 16 }} onClick={() => showToast(exportOPML())}>Export OPML</button>
    </section>
  );
}
