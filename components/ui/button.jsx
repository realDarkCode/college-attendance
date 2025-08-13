import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive backdrop-blur-sm cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:scale-105 border border-primary/20",
        destructive:
          "bg-destructive/80 text-white shadow-sm hover:bg-destructive/90 hover:shadow-md hover:scale-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 border border-destructive/30",
        outline:
          "border border-border/60 bg-background/30 backdrop-blur-md shadow-sm hover:bg-primary/50 hover:text-primary-foreground hover:border-border/80 hover:scale-105 hover:shadow-md",
        secondary:
          "bg-secondary/60 text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:scale-105 border border-secondary/30 hover:shadow-md",
        ghost:
          "hover:bg-accent/30 hover:text-accent-foreground hover:backdrop-blur-md hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
