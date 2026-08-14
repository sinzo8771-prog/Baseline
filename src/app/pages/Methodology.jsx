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

export default function Methodology() {
  return (
    <section id="methodology" className="section">
      <h2 className="section-title">Methodology</h2>
      <p className="section-note">Verbatim in. Hype measured out. The score is a measurement of language, not a judgment on the story.</p>

      <div className="mb-8 rounded-md border-2 border-primary/60 bg-card p-5">
        <p className="font-serif text-lg font-black leading-snug text-foreground">
          A high Hype score does not mean a story is false.
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          It means the headline is intense. The Baseline measures how loudly an announcement talks — not whether it is
          true, useful, or trustworthy. An honest, accurate story can score "On Fire"; a false one can score "Measured".
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="about-copy text-sm leading-relaxed">
          The Baseline does not write news. It aggregates headlines verbatim from RSS feeds and measures one thing:
          how loudly a headline is shouting. Every story receives an intensity score from 0 to 100, and every score can be
          explained from the headline alone — see the “Why this score” breakdown on any story.
        </div>

        {/* The scale */}
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">The scale</h3>
          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {TIERS.map((t) => (
              <div key={t}>
                <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t}</div>
                <div className="font-serif text-xl font-bold text-foreground">{TIER_RANGES[t]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What is counted */}
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">What is counted</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Six families of signals are detected. Headlines that stack different families score louder than headlines that lean
            on a single word.
          </p>
          <ul className="mt-3 space-y-2">
            {CATEGORY_ORDER.map((key) => (
              <li key={key} className="flex gap-3 border-b border-border/50 py-2 last:border-0">
                <span className="w-32 shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                  {CATEGORY_LABEL[key]}
                </span>
                <span className="text-sm text-muted-foreground">{SIGNAL_NOTES[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What is not counted */}
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">What is not counted</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            <li>Facts and figures: “Company reports $1 billion investment” adds no hype points. Money is not spin.</li>
            <li>“Benchmark” as a noun (“benchmark tables”, “model eval”) — only claims of beating, shattering, or topping benchmarks count.</li>
            <li>Hedged research framing: “Researchers examine whether AI could become superhuman” is a question under study, so the weight of hype words is halved.</li>
            <li>Words inside quotation marks: a headline quoting someone else’s “breakthrough” is reporting on the claim, not making it.</li>
            <li>“Best practices”, “best of”, and similar measured collocations do not fire the superlative signal.</li>
          </ul>
        </div>

        {/* How the day's number is composed */}
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">What the day's number actually measures</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            <li>The reading is measured on today's edition: the most recent 25 stories across the tracked feeds. Because the mix is by recency, a prolific outlet can nudge the day's number — the Index reports the mix as it was, rather than rebalancing it.</li>
            <li>Near-duplicate and syndicated headlines are collapsed into a single story, so one announcement reported across many outlets is counted once, not once per outlet.</li>
            <li>On mornings when only a handful of stories have landed, the page says so: a small edition is flagged instead of presented as a firm reading.</li>
          </ul>
        </div>

        {/* Known limits */}
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Known limits, stated plainly</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            <li>The detector is heuristic — it reads words, not meaning. Sarcasm, irony, and understatement can fool it.</li>
            <li>Slang and acronyms not in the word lists are invisible to it.</li>
            <li>Two headlines can score the same while one is honest and the other false; the score measures intensity, not truth.</li>
            <li>History is stored in your browser. Nothing is sent to a server, and the index rebuilds from your own reads.</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          <Link to="/hype-index" className="underline underline-offset-4 hover:text-foreground">Back to the Hype Index</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/" className="underline underline-offset-4 hover:text-foreground">Today's edition</Link>
        </p>
      </div>
    </section>
  );
}
