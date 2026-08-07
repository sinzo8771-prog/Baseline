import { cn } from "@/lib/utils";

// Hype Index meter: an accessible progress bar whose fill darkens as the
// hype percentage climbs. Styled like a print measurement, with a tabular
// serif figure for the value.
export default function HypeMeter({ percent, className }) {
  const level = percent >= 60 ? "bg-foreground" : percent >= 30 ? "bg-primary" : "bg-primary/70";
  return (
    <div className={cn("hype-meter flex items-center gap-4", className)}>
      <div className="relative h-6 flex-1 overflow-hidden rounded-sm border border-border bg-muted">
        <div
          className={cn("h-full transition-[width] duration-700 ease-out", level)}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <span className="font-serif text-3xl font-black tabular-nums">{percent}%</span>
    </div>
  );
}
