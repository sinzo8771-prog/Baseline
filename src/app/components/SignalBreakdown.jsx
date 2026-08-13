import { cn } from "@/lib/utils";

// Per-signal breakdown of one story's Hype score. Renders each fired signal
// with its exact point contribution, the hedged-framing note when present, and
// the site-wide disclaimer that intensity is not truth. Every value comes from
// the story's own `signals` (produced by src/lib/hype.js) — nothing is invented.
export default function SignalBreakdown({ signals, hedged = false, className }) {
  const list = signals?.filter((s) => s?.points > 0) ?? [];
  if (list.length === 0) {
    return (
      <div className={cn("text-sm text-foreground", className)}>
        <p>No hype signals detected — the headline reads as measured and matter-of-fact.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          A Hype score measures how loudly a headline talks, not whether the story is true.
        </p>
      </div>
    );
  }
  return (
    <div className={cn(className)}>
      <ul className="space-y-1">
        {list.map((s) => (
          <li key={s.id} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
            <span className="text-[13px] capitalize text-foreground">{s.label}</span>
            <span className="tabular-nums text-[13px] text-muted-foreground">+{s.points} pts</span>
          </li>
        ))}
      </ul>
      {hedged ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Hedged research framing ("researchers examine whether…") halves the weight of language signals.
        </p>
      ) : null}
      <p className="mt-3 border-t border-border/60 pt-2 text-xs text-muted-foreground">
        A Hype score measures how loudly a headline talks, not whether the story is true.
      </p>
    </div>
  );
}
