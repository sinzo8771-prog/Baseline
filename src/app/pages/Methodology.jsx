import { Link } from "react-router-dom";
import { TIER_RANGES, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/hype";

// The public account of the scoring algorithm. Every claim here is the real
// behavior of src/lib/hype.js — nothing invented, and the limits stated as
// plainly as the method itself.

const TIERS = ["Measured", "Warm", "Hot", "On Fire"];

const SIGNAL_NOTES = {
  language: "Revolutionary, breakthrough, unprecedented, superhuman, AGI, era of… Stacking several heavy words is louder than one.",
  superlatives: "Fastest, largest, world-first, unbeatable, best-in-class… Measured collocations like “best practices” never fire.",
  benchmark: "Outperforms, surpasses, shatters the record, state-of-the-art… “Benchmark” as a noun is neutral; beating it is not.",
  numerical: "10x, 3× faster, 40% better — promotional multipliers only. “$1 billion investment” is a fact, not spin.",
  formatting: "All-caps words, exclamation marks, emoji. Mechanical signals: if it shouts, it scores.",
  emotional: "Amazing, incredible, stunning, destroys, crushes…",
};

const NOT_COUNTED = [
  "Facts and figures: “Company reports $1 billion investment” adds no hype points. Money is not spin.",
  "“Benchmark” as a noun (“benchmark tables”, “model eval”) — only claims of beating, shattering, or topping benchmarks count.",
  "Hedged research framing: “Researchers examine whether AI could become superhuman” is a question under study, so the weight of hype words is halved.",
  "Words inside quotation marks: a headline quoting someone else’s “breakthrough” is reporting on the claim, not making it.",
  "“Best practices”, “best of”, and similar measured collocations do not fire the superlative signal.",
];

const DAY_NUMBER = [
  "The reading is measured on today's edition: the most recent 25 stories across the tracked feeds. Because the mix is by recency, a prolific outlet can nudge the day's number — the Index reports the mix as it was, rather than rebalancing it.",
  "Near-duplicate and syndicated headlines are collapsed into a single story, so one announcement reported across many outlets is counted once, not once per outlet.",
  "On mornings when only a handful of stories have landed, the page says so: a small edition is flagged instead of presented as a firm reading.",
];

const LIMITS = [
  "The detector is heuristic — it reads words, not meaning. Sarcasm, irony, and understatement can fool it.",
  "Slang and acronyms not in the word lists are invisible to it.",
  "Two headlines can score the same while one is honest and the other false; the score measures intensity, not truth.",
  "History is stored in your browser. Nothing is sent to a server, and the index rebuilds from your own reads.",
];

export default function Methodology() {
  return (
    <div className="ed">
      <header className="page-head pt-10">
        <span className="fp-kicker">Methodology</span>
        <h1 className="page-title">How the Hype Index works</h1>
        <p className="page-deck">
          Verbatim in. Hype measured out. The score is a measurement of language, not a judgment on the story.
        </p>
      </header>

      {/* Loudness is not truth */}
      <section className="reading" aria-label="What the score means">
        <div className="sp-callout">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Hype measures loudness, not truth.
          </p>
          <p className="mt-2 font-serif text-lg font-black leading-snug text-foreground">
            A high Hype score does not mean a story is false.
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            It means the headline is intense. The Baseline measures how loudly an announcement talks — not whether it
            is true, useful, or trustworthy. An honest, accurate story can score "On Fire"; a false one can score
            "Measured".
          </p>
        </div>
      </section>

      <section className="reading" aria-label="The premise">
        <p>
          The Baseline does not write news. It aggregates headlines verbatim from RSS feeds and measures one thing:
          how loudly a headline is shouting. Every story receives an intensity score from 0 to 100, and every score
          can be explained from the headline alone — see the "Why this score" breakdown on any story.
        </p>
      </section>

      {/* The scale */}
      <section className="numbered" aria-label="The scale" style={{ marginTop: "clamp(24px, 3vw, 36px)" }}>
        <h2 className="section-kicker">The scale</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {TIERS.map((t) => (
            <div key={t} className="border-t border-[color:var(--rule)] pt-3">
              <div className="font-serif text-xl font-bold text-foreground">{t}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{TIER_RANGES[t]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is counted */}
      <section className="numbered" aria-label="Signal families">
        <h2 className="section-kicker">What is counted</h2>
        <p className="-mt-3 max-w-[62ch] font-serif text-sm italic text-[color:var(--ink-soft)]">
          Six families of signals are detected. Headlines that stack different families score louder than headlines
          that lean on a single word.
        </p>
        {CATEGORY_ORDER.map((key, i) => (
          <div key={key} className="item">
            <div className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <h3 style={{ fontSize: "clamp(19px, 2.4vw, 24px)" }}>{CATEGORY_LABEL[key]}</h3>
              <p>{SIGNAL_NOTES[key]}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="reading" aria-label="What is not counted">
        <div className="sp-callout">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            What is not counted
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            {NOT_COUNTED.map((note) => (
              <li key={note.slice(0, 32)}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* How the day's number is composed */}
      <section className="reading" aria-label="How the day's number is composed">
        <div className="sp-callout">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            What the day's number actually measures
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            {DAY_NUMBER.map((note) => (
              <li key={note.slice(0, 32)}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Known limits */}
      <section className="reading" aria-label="Known limits">
        <div className="sp-callout">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Known limits, stated plainly
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            {LIMITS.map((note) => (
              <li key={note.slice(0, 32)}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

      <p className="pb-10 text-center text-xs text-muted-foreground">
        <Link to="/hype-index" className="underline underline-offset-4 hover:text-foreground">Back to the Hype Index</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/" className="underline underline-offset-4 hover:text-foreground">Today's edition</Link>
      </p>
    </div>
  );
}
