import { cn } from "@/lib/utils";

// Accessible source-trend cell. `reading` is the shape from
// sourceTrendReading() in lib/hypeHistory.js:
//   { direction: "up"|"down"|"flat", delta, pct }
// or null when there's no prior reading to compare against.
// The direction is announced as a sentence for screen readers, and the visible
// glyph is decorative (aria-hidden), so the meaning never depends on a title
// attribute that touch users can't reach.
export default function TrendCell({ reading, className }) {
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
  return (
    <span
      className={cn(direction === "up" ? "text-primary" : "text-muted-foreground", className)}
      role="img"
      aria-label={fullLabel}
    >
      <span aria-hidden="true">{glyph}</span>
      {magnitude ? <span aria-hidden="true">{magnitude}</span> : null}
    </span>
  );
}
