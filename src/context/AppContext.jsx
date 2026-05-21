import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useToast } from "../hooks/useToast";

const AppContext = createContext(null);

function getInitialTheme() {
  try {
    const storedTheme = localStorage.getItem("lira-theme");
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  } catch {
    // Keep the default theme when storage is not available.
  }
  return "dark";
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const { toast, showToast } = useToast();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("lira-theme", theme);
    } catch {
      // Theme still works for the current session.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    toast,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
