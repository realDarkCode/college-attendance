import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    name: "Light",
    value: "light",
    icon: "☀️",
    description: "Classic light theme",
  },
  dark: {
    name: "Dark",
    value: "dark",
    icon: "🌙",
    description: "Classic dark theme",
  },
  dracula: {
    name: "Dracula",
    value: "dracula",
    icon: "🧛",
    description: "Dark theme with purple accents",
  },
  nord: {
    name: "Nord",
    value: "nord",
    icon: "❄️",
    description: "Arctic, north-bluish theme",
  },
  monokai: {
    name: "Monokai",
    value: "monokai",
    icon: "🔥",
    description: "Dark theme with vibrant colors",
  },
  darkcode: {
    name: "DarkCode",
    value: "darkcode",
    icon: "💻",
    description: "Official DarkCode brand theme",
  },
  ocean: {
    name: "Ocean",
    value: "ocean",
    icon: "🌊",
    description: "Deep blue oceanic theme",
  },
  forest: {
    name: "Forest",
    value: "forest",
    icon: "🌲",
    description: "Natural green forest theme",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme or default to dark theme
    const savedTheme = localStorage.getItem("theme");
    let currentTheme;

    if (savedTheme && themes[savedTheme]) {
      currentTheme = savedTheme;
    } else {
      // Default to dark theme instead of system preference
      currentTheme = "dark";
    }

    setTheme(currentTheme);
    applyTheme(currentTheme);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    // Remove all theme classes and data attributes
    Object.keys(themes).forEach((t) => {
      root.classList.remove(t);
      root.removeAttribute(`data-theme`);
    });

    // Apply new theme
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme !== "light") {
      root.setAttribute("data-theme", newTheme);
    }

    // Store theme preference
    localStorage.setItem("theme", newTheme);
  };

  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  const value = {
    theme,
    themes,
    changeTheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
