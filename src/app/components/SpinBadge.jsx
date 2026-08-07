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
  return (
    <span
      className={cn(
        "spin-badge inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        variant.cls,
        className,
      )}
      title={flags?.length ? flags.join(", ") : "no hype signals"}
    >
      <Icon
        className="size-2.5 shrink-0"
        strokeWidth={variant.filled ? 1.5 : 2}
        fill={variant.filled ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {spin}
    </span>
  );
}
