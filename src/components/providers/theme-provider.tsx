"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemePolarity = "light" | "dark";

const THEME_STORAGE_KEY = "antigravity-theme";

interface ThemeContextValue {
  theme: ThemePolarity;
  setTheme: (next: ThemePolarity) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: ThemePolarity) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePolarity>("light");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted theme preference from localStorage (or existing DOM attribute)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") {
        setThemeState(saved);
        applyThemeToDocument(saved);
      } else {
        const attr = document.documentElement.getAttribute("data-theme");
        const initial: ThemePolarity = attr === "dark" ? "dark" : "light";
        setThemeState(initial);
        applyThemeToDocument(initial);
      }
    } catch {
      // Ignore storage access errors in restricted contexts
    }
    setHydrated(true);
  }, []);

  // Keep DOM and localStorage synchronised after hydration
  useEffect(() => {
    if (!hydrated) return;
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage access errors
    }
  }, [theme, hydrated]);

  const setTheme = useCallback((next: ThemePolarity) => {
    setThemeState(next);
    applyThemeToDocument(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemePolarity = prev === "dark" ? "light" : "dark";
      applyThemeToDocument(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage access errors
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
