import { cn } from "@/lib/utils";

// Accessible source-trend cell. `reading` is the shape from
// sourceTrendReading() in lib/hypeHistory.js:
//   { direction: "up"|"down"|"flat", delta, pct }
// or null when there's no prior reading to compare against.
// The direction is announced as a sentence for screen readers, and the visible
// glyph is decorative (aria-hidden), so the meaning never depends on a title
// attribute that touch users can't reach.
export default function TrendCell({ reading, series, className }) {
  if (!reading) {
    return (
      <span className={cn("text-muted-foreground/50", className)}>
        <span aria-hidden="true">·</span>
        <span className="sr-only">No prior reading to compare against.</span>
      </span>
    );
  }
  const { direction, delta, pct } = reading;
  const glyph = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  const sentence =
    direction === "up"
      ? "Louder than yesterday"
      : direction === "down"
        ? "Quieter than yesterday"
        : "Same as yesterday";
  // Prefer the relative percent when a previous reading exists; fall back to
  // raw points for a flat baseline (previous average of 0).
  const magnitude =
    direction === "flat"
      ? ""
      : pct !== null && pct !== 0
        ? ` ${Math.abs(pct)}%`
        : delta !== 0
          ? ` ${Math.abs(delta)} pts`
          : "";
  const fullLabel = sentence + (magnitude ? `, by${magnitude}` : "");

  // Decorative 7-day sparkline: a bounded 36×14 viewBox with a normalized
  // polyline. It carries no aria semantics of its own — the reading glyph above
  // already states the direction and magnitude for screen readers.
  const spark = series?.length >= 2 ? <Sparkline values={series.map((e) => e.avgHype)} /> : null;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(direction === "up" ? "text-primary" : "text-muted-foreground")}
        role="img"
        aria-label={fullLabel}
      >
        <span aria-hidden="true">{glyph}</span>
        {magnitude ? <span aria-hidden="true">{magnitude}</span> : null}
      </span>
      {spark}
    </span>
  );
}

// A tiny, intentionally quiet sparkline. Bounded so a source with a flat or
// extreme history can't blow past the cell; aria-hidden because it is a visual
// echo of the reading, not a second piece of meaning.
function Sparkline({ values }) {
  const W = 36;
  const H = 14;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = H - ((v - min) / span) * (H - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}
