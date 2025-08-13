import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Sync with the theme that was already set by the blocking script
    const isDark = document.documentElement.classList.contains("dark");
    const savedTheme = localStorage.getItem("theme");
    
    let currentTheme;
    if (savedTheme) {
      currentTheme = savedTheme;
    } else {
      // If no saved preference, use device preference (should match the blocking script)
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      currentTheme = prefersDark ? "dark" : "light";
    }
    
    setTheme(currentTheme);
    
    // Ensure the DOM matches our state (should already be set by blocking script)
    if (isDark !== (currentTheme === "dark")) {
      document.documentElement.classList.toggle("dark", currentTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="glass-card p-1 flex items-center gap-1 w-fit">
      <button
        onClick={() => {
          if (theme !== "light") toggleTheme();
        }}
        className={`
          flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-300 ease-out cursor-pointer
          ${
            theme === "light"
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "hover:bg-accent/20 text-muted-foreground hover:text-foreground"
          }
        `}
        aria-label="Switch to light theme"
      >
        <Sun className="h-4 w-4" />
        <span className="ml-2 text-sm font-medium hidden sm:inline">Light</span>
      </button>

      <button
        onClick={() => {
          if (theme !== "dark") toggleTheme();
        }}
        className={`
          flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-300 ease-out cursor-pointer
          ${
            theme === "dark"
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "hover:bg-accent/20 text-muted-foreground hover:text-foreground"
          }
        `}
        aria-label="Switch to dark theme"
      >
        <Moon className="h-4 w-4" />
        <span className="ml-2 text-sm font-medium hidden sm:inline">Dark</span>
      </button>

      <span className="sr-only">Theme toggle - Currently {theme} mode</span>
    </div>
  );
};
