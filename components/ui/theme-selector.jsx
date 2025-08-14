import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/lib/theme-context";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

export function ThemeSelector({ variant = "default", size = "default" }) {
  const { theme, themes, changeTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled>
        <Palette className="h-4 w-4" />
        <span className="ml-2 text-sm font-medium hidden sm:inline">Theme</span>
      </Button>
    );
  }

  const currentTheme = themes[theme];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className="glass-card">
          <span className="mr-2">{currentTheme?.icon}</span>
          <Palette className="h-4 w-4" />
          <span className="ml-2 text-sm font-medium hidden sm:inline">
            {currentTheme?.name}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 glass-card" side="bottom" align="end">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Choose Theme</h3>
          </div>
          <div className="grid gap-1">
            {Object.values(themes).map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  changeTheme(themeOption.value);
                  setOpen(false);
                }}
                className={`
                  flex items-center justify-between w-full p-3 rounded-lg text-left transition-all duration-200
                  hover:bg-accent/50 focus:bg-accent/50 focus:outline-none
                  ${
                    theme === themeOption.value
                      ? "bg-primary/15 border border-primary/30 text-primary"
                      : "border border-transparent"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{themeOption.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {themeOption.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </span>
                  </div>
                </div>
                {theme === themeOption.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
