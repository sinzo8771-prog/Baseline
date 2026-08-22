import { Link } from "react-router-dom";
import exportOPML from "../lib/exportOPML.js";

// The principles below are the product's real editorial commitments, not
// decoration: they describe what this app actually does with the wires.
const PRINCIPLES = [
  {
    title: "Verbatim, always",
    body: "Headlines are reprinted exactly as their authors wrote them. No summaries written by models, no paraphrase, no clickbait of our own — the claim stays in its author's words so you can judge it.",
  },
  {
    title: "Measurement, not judgment",
    body: "The detector scores how loudly a headline is told, never whether it is true or false. An honest story can read hot; a false one can read measured. The number describes language, full stop.",
  },
  {
    title: "Explainable by default",
    body: "Every score can be accounted for from the headline alone. Open any story and the signal breakdown shows which words did the work and what they added.",
  },
  {
    title: "Yours locally",
    body: "Your reading history, saved stories, and hype baseline live in your browser only. Nothing about how you read is sent to a server, and your sources export anytime as OPML.",
  },
];

export default function About({ showToast }) {
  return (
    <div className="ed">
      <header className="page-head pt-10">
        <span className="fp-kicker">About the publication</span>
        <h1 className="page-title">About The Baseline</h1>
        <p className="page-deck">
          A quiet interface for a very loud industry — headlines as published, spin as detected, hype as measured.
        </p>
      </header>

      <section className="reading has-cap" aria-label="What The Baseline does">
        <p>
          The Baseline aggregates RSS feeds from the AI industry and its chroniclers, verbatim. We add nothing but a
          rating — which is already more than some of these stories deserve. Each day's edition prints the headlines
          exactly as published, then measures one thing about them: how loudly they are being told.
        </p>
        <p>
          There is no summary written by a model and no commentary between you and the source. What there is instead
          is an instrument: an intensity score on every headline, a breakdown of the signals that produced it, and a{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" to="/hype-index">daily index</Link>{" "}
          of the press's overall volume — all computed in your browser against editions you have actually read.
        </p>
        <p>
          We are not nostalgic for print, but we borrow from it deliberately: the patience of a considered edit, the
          discipline of a clean page, and respect for a reader's attention. The screen is our press, and we treat it
          that way.
        </p>
      </section>

      <section className="numbered" aria-label="Editorial principles">
        <h2 className="section-kicker">What we hold to</h2>
        {PRINCIPLES.map((p, i) => (
          <div key={p.title} className="item">
            <div className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="reading" aria-label="Colophon">
        <h2 className="section-kicker">The colophon</h2>
        <p>
          Set in Fraunces &amp; Inter. Built on open web standards — React, Vite, and Cloudflare Workers. No trackers,
          no third-party analytics, no surveillance. The full account of how the rating works, including every place
          the detector can be fooled, is public:{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" to="/methodology">
            read the methodology
          </Link>
          .
        </p>
      </section>

      <section className="reading" aria-label="Stay close">
        <h2 className="section-kicker">Stay close</h2>
        <p>
          Take the edition with you — subscribe via{" "}
          <a className="underline underline-offset-4 hover:text-foreground" href="/feed.xml" type="application/rss+xml">
            the RSS feed
          </a>{" "}
          for every story as it lands, or browse{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" to="/sources">
            who's shouting today
          </Link>
          . If you use an OPML-compatible reader, you can take the source list with you:
        </p>
        <button id="opml-export" className="btn-outline mt-2" onClick={() => showToast(exportOPML())}>
          Export OPML
        </button>
      </section>
    </div>
  );
}
