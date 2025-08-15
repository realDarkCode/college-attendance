import { cn } from "@/lib/utils";
import * as React from "react";

const Switch = React.forwardRef(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
    <button
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-primary border-primary shadow-lg"
          : "bg-input border-border hover:bg-muted",
        className
      )}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-all duration-300 ease-in-out",
          checked
            ? "translate-x-5 bg-primary-foreground"
            : "translate-x-0.5 bg-foreground"
        )}
      />
    </button>
  )
);

Switch.displayName = "Switch";

export { Switch };
