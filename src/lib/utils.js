import { clsx } from "clsx";

// Class joiner for conditional composition ("base", active && "on"). The
// call sites in this codebase never rely on tailwind-merge conflict
// resolution — conditionals are mutually exclusive — so clsx alone is enough
// and keeps ~100 KB of merge tables out of the initial bundle.
export function cn(...inputs) {
  return clsx(inputs);
}
