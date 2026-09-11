"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

interface DashboardThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const DashboardThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    // Default to clean white/light theme as requested
    const saved = localStorage.getItem("dashboard_theme");
    if (saved === "dark") {
      // If user specifically requests dark in future, but default clean white now
      setThemeState("light");
      localStorage.setItem("dashboard_theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      setThemeState("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem("dashboard_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </DashboardThemeContext.Provider>
  );
};

export const useDashboardTheme = () => useContext(DashboardThemeContext);
