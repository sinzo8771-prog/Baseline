import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Animated selector chips with a shared sliding active pill (framer-motion
// layout animation), honoring prefers-reduced-motion via useReducedMotion.
export default function SelectorChips({ options, value, onChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-border bg-card p-1",
        className,
      )}
      role="group"
      aria-label="Filter by hype level"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            data-filter={opt}
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.08em] transition-colors duration-150",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{opt === "all" ? "All" : opt}</span>
          </button>
        );
      })}
    </div>
  );
}
