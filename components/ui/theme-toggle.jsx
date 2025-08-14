import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/theme-context";
import { Check } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, themes, changeTheme, mounted } = useTheme();

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="glass-card p-2 flex flex-wrap items-center gap-2 w-fit">
        <div className="text-sm font-medium text-muted-foreground">
          Loading themes...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-2 flex flex-wrap items-center gap-2 w-fit">
      {Object.values(themes).map((themeOption) => (
        <Tooltip key={themeOption.value}>
          <TooltipTrigger asChild>
            <button
              onClick={() => changeTheme(themeOption.value)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
                hover:bg-accent/50 focus:bg-accent/50 focus:outline-none border
                ${
                  theme === themeOption.value
                    ? "bg-primary/15 border-primary/50 text-primary shadow-sm scale-105"
                    : "border-border/30 hover:border-border/60 hover:scale-105"
                }
              `}
              aria-label={`Switch to ${themeOption.name} theme`}
            >
              <span className="text-base">{themeOption.icon}</span>
              <span className="font-medium whitespace-nowrap hidden sm:inline">
                {themeOption.name}
              </span>
              {theme === themeOption.value && (
                <Check className="h-3 w-3 text-primary ml-1" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="glass-card">
            <div className="text-center">
              <div className="font-medium">{themeOption.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {themeOption.description}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
