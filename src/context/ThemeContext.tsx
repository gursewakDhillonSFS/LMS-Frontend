"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ThemeConfig as AntdThemeConfig } from "antd";

export type AppTheme = "light" | "terracotta" | "forest" | "plum";

export interface ThemeMeta {
  id: AppTheme;
  name: string;
  paletteName: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export const THEMES: Record<AppTheme, ThemeMeta> = {
  light: {
    id: "light",
    name: "Classic Blue",
    paletteName: "Modern SaaS",
    primary: "#315CFF",
    secondary: "#315CFF",
    accent: "#00D084",
    bg: "#F4F6FA",
    surface: "#FFFFFF",
    text: "#101828",
    muted: "#667085",
    border: "#E4E7EC",
  },
  terracotta: {
    id: "terracotta",
    name: "Terracotta & Warm Beige",
    paletteName: "Warm Terracotta",
    primary: "#C7654A",
    secondary: "#F3C7B7",
    accent: "#D5A63A",
    bg: "#F8F3ED",
    surface: "#FFFFFF",
    text: "#292929",
    muted: "#77716B",
    border: "#E8DFD5",
  },
  forest: {
    id: "forest",
    name: "Forest Green & Sage",
    paletteName: "Forest & Sage",
    primary: "#245C4A",
    secondary: "#A8C3B5",
    accent: "#D98262",
    bg: "#F7F4EC",
    surface: "#FFFFFF",
    text: "#20352E",
    muted: "#718078",
    border: "#DFD9CC",
  },
  plum: {
    id: "plum",
    name: "Deep Plum & Lavender",
    paletteName: "Deep Plum & Lavender",
    primary: "#5B3A70",
    secondary: "#EDE5F3",
    accent: "#E9826E",
    bg: "#F8F7F5",
    surface: "#FFFFFF",
    text: "#29252D",
    muted: "#77717D",
    border: "#E5E1E7",
  },
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  activeTheme: ThemeMeta;
  themes: ThemeMeta[];
  antdTheme: AntdThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  activeTheme: THEMES.light,
  themes: Object.values(THEMES),
  antdTheme: { token: { colorPrimary: "#315CFF" } },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("app_color_theme") as AppTheme | null;
    if (saved && THEMES[saved]) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      setThemeState("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const setTheme = (t: AppTheme) => {
    if (!THEMES[t]) return;
    setThemeState(t);
    localStorage.setItem("app_color_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const activeTheme = THEMES[theme] || THEMES.light;

  const antdTheme = useMemo<AntdThemeConfig>(() => {
    return {
      token: {
        colorPrimary: activeTheme.primary,
        colorSuccess: "#2E8B68",
        colorWarning: activeTheme.accent,
        colorError: "#D64545",
        colorInfo: activeTheme.primary,

        colorText: activeTheme.text,
        colorTextSecondary: activeTheme.muted,
        colorTextTertiary: activeTheme.muted,
        colorTextQuaternary: activeTheme.border,

        colorBgContainer: activeTheme.surface,
        colorBgLayout: activeTheme.bg,
        colorBgElevated: activeTheme.surface,
        colorBgTextHover: `${activeTheme.primary}0D`,

        colorBorder: activeTheme.border,
        colorBorderSecondary: activeTheme.border,

        borderRadius: 10,
        borderRadiusLG: 12,
        borderRadiusSM: 8,

        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,
        lineHeight: 1.5,
        controlHeight: 40,
        controlHeightLG: 46,
        controlHeightSM: 32,
      },
      components: {
        Button: {
          borderRadius: 10,
          controlHeight: 40,
          fontWeight: 600,
          primaryShadow: "none",
          defaultBorderColor: activeTheme.border,
          paddingInline: 18,
        },
        Input: {
          borderRadius: 10,
          controlHeight: 40,
          activeBorderColor: activeTheme.primary,
          hoverBorderColor: activeTheme.primary,
          activeShadow: `0 0 0 2px ${activeTheme.primary}25`,
        },
        Select: {
          borderRadius: 10,
          controlHeight: 40,
        },
        Table: {
          headerBg: activeTheme.surface,
          headerColor: activeTheme.muted,
          borderColor: activeTheme.border,
          rowHoverBg: `${activeTheme.primary}08`,
          headerSplitColor: "transparent",
          fontSize: 14,
        },
        Card: {
          borderRadiusLG: 12,
          paddingLG: 20,
          boxShadow: "none",
        },
        Modal: {
          borderRadiusLG: 16,
          paddingMD: 24,
        },
        Drawer: {
          paddingLG: 24,
        },
        Tabs: {
          inkBarColor: activeTheme.primary,
          itemActiveColor: activeTheme.primary,
          itemSelectedColor: activeTheme.primary,
          itemHoverColor: activeTheme.primary,
        },
        Menu: {
          itemBorderRadius: 10,
          itemHeight: 40,
          itemMarginInline: 8,
        },
        Collapse: {
          borderRadiusLG: 12,
          headerBg: activeTheme.surface,
        },
        Progress: {
          defaultColor: activeTheme.primary,
          remainingColor: activeTheme.border,
        },
      },
    };
  }, [activeTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        activeTheme,
        themes: Object.values(THEMES),
        antdTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
