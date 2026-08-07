import { cn } from "@/lib/utils";

// Astryx-style semantic badge (pill + status dot), mapped onto the site's
// paper / ink / vermillion palette via the shadcn theme tokens.
const VARIANT = {
  Measured: "border-border text-foreground",
  Warm: "border-primary/60 text-primary",
  Hot: "bg-primary text-primary-foreground border-transparent",
  "On Fire": "bg-foreground text-background border-transparent",
};

export default function SpinBadge({ spin, flags, className }) {
  return (
    <span
      className={cn(
        "spin-badge inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        VARIANT[spin] || VARIANT.Measured,
        className,
      )}
      title={flags?.length ? flags.join(", ") : "no hype signals"}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {spin}
    </span>
  );
}
