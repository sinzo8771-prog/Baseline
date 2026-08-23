import { m } from "framer-motion";
import { cn } from "@/lib/utils";

// Animated selector chips with a shared sliding active pill (framer-motion
// layout animation), honoring prefers-reduced-motion via useReducedMotion.
// `counts` maps each option to a story count shown inside the pill.
export default function SelectorChips({ options, value, onChange, counts, className }) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-[2px] border border-border bg-card p-1.5",
        className,
      )}
      role="group"
      aria-label="Filter by hype level"
    >
      {options.map((opt) => {
        const active = opt === value;
        const label = opt === "all" ? "All" : opt;
        const count = counts?.[opt];
        return (
          <button
            key={opt}
            type="button"
            data-filter={opt}
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={cn(
              "relative rounded-[2px] px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-[2px] bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 inline-flex items-baseline gap-1.5">
              {label}
              {typeof count === "number" && (
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    active ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
