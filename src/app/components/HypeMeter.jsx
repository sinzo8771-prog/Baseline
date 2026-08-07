import { cn } from "@/lib/utils";

// Hype Index meter: an accessible progress bar whose fill darkens as the
// hype percentage climbs. Styled like a print measurement gauge with tick
// marks and a restrained-to-relentless axis, plus a tabular serif figure.
export default function HypeMeter({ percent, className }) {
  const level = percent >= 60 ? "bg-foreground" : percent >= 30 ? "bg-primary" : "bg-primary/70";
  const width = `${Math.max(0, Math.min(100, percent))}%`;
  return (
    <div className={cn("hype-meter", className)}>
      <div className="flex items-center gap-4">
        <div
          className="relative h-6 flex-1 overflow-hidden rounded-[3px] border border-border bg-muted"
          role="progressbar"
          aria-label="Hype Index"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.max(0, Math.min(100, percent))}
          aria-valuetext={`${percent} percent of today's stories are hyped`}
        >
          <div
            className={cn("relative h-full transition-[width] duration-700 ease-out motion-reduce:transition-none", level)}
            style={{ width }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), var(--rule) calc(10% - 1px) 10%)",
            }}
            aria-hidden="true"
          />
        </div>
        <span className="w-16 shrink-0 text-right font-serif text-3xl font-black tabular-nums">{percent}%</span>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>Restrained</span>
        <span>Relentless</span>
      </div>
    </div>
  );
}
