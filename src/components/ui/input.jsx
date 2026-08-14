import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-vermillion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermillion/20 disabled:cursor-not-allowed disabled:opacity-50",
      type === "search" &&
        "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export default Input;