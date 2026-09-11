"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

interface DashboardThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const DashboardThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    // Only set if no global app theme has been applied
    const appTheme = localStorage.getItem("app_color_theme");
    if (!appTheme) {
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
