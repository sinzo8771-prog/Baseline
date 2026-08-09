import { Flame, MoveUpRight, Square, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Semantic badge mapped onto the site's paper / ink / vermillion palette via
// the shadcn theme tokens. Variants differ by more than hue so the scale stays
// legible to color-blind readers: a hollow mark for the sober bands and a
// filled mark as hype climbs.
const VARIANT = {
  Measured: { cls: "border-border text-foreground", icon: Square, filled: false },
  Warm: { cls: "border-primary/60 text-primary", icon: MoveUpRight, filled: false },
  Hot: { cls: "bg-primary text-primary-foreground border-transparent", icon: Triangle, filled: true },
  "On Fire": { cls: "bg-foreground text-background border-transparent", icon: Flame, filled: true },
};

export default function SpinBadge({ spin, flags, className }) {
  const variant = VARIANT[spin] || VARIANT.Measured;
  const Icon = variant.icon;
  const reason = flags?.length ? flags.join(", ") : "no hype signals";
  const hasFlags = Boolean(flags?.length);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "spin-badge inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.08em]",
          variant.cls,
        )}
        aria-hidden="true"
      >
        <Icon
          className="size-2.5 shrink-0"
          strokeWidth={variant.filled ? 1.5 : 2}
          fill={variant.filled ? "currentColor" : "none"}
        />
        {spin}
      </span>
      {/* Screen readers get the label + reason; the visual badge is decorative. */}
      <span className="sr-only">{`${spin} — ${reason}`}</span>
      {hasFlags ? (
        <details className="spin-reason group relative z-10">
          <summary className="inline-flex size-6 cursor-help list-none items-center justify-center rounded-full border border-border text-[10px] leading-none text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            ?
            <span className="sr-only">Why was this flagged {spin}?</span>
          </summary>
          <span
            className="absolute left-0 top-7 z-20 w-56 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-popover px-3 py-2 text-[11px] normal-case leading-snug tracking-normal text-popover-foreground shadow-md"
          >
            {reason}
          </span>
        </details>
      ) : null}
    </span>
  );
}
