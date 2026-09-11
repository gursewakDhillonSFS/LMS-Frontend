"use client";

import React, { useState } from "react";
import { Popover } from "antd";
import { useTheme, THEMES, AppTheme, ThemeMeta } from "@/context/ThemeContext";
import { CheckOutlined, BgColorsOutlined } from "@ant-design/icons";

interface ThemePickerProps {
  variant?: "header" | "settings" | "floating";
  className?: string;
}

const ThemePicker: React.FC<ThemePickerProps> = ({
  variant = "header",
  className = "",
}) => {
  const { theme: currentTheme, setTheme, themes, activeTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: AppTheme) => {
    setTheme(id);
    setOpen(false);
  };

  const themeListContent = (
    <div className="w-[300px] p-1 flex flex-col gap-2">
      <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Color Themes
          </span>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {activeTheme.name}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Select a palette to style the entire application
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {themes.map((t: ThemeMeta) => {
          const isSelected = currentTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <div className="flex flex-col gap-1 min-w-0 pr-2">
                <span className={`text-[13px] font-bold truncate ${isSelected ? "text-primary" : "text-slate-800"}`}>
                  {t.name}
                </span>

                {/* Color Swatch Dots */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.primary }}
                    title={`Primary: ${t.primary}`}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.secondary }}
                    title={`Secondary: ${t.secondary}`}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.accent }}
                    title={`Accent: ${t.accent}`}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: t.bg }}
                    title={`Background: ${t.bg}`}
                  />
                </div>
              </div>

              <div className="shrink-0 pl-1">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-xs">
                    <CheckOutlined className="text-xs" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (variant === "settings") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {themes.map((t: ThemeMeta) => {
          const isSelected = currentTheme === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col justify-between p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-xs ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-slate-900">{t.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                      <CheckOutlined className="text-[10px]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 shadow-xs"
                    style={{ backgroundColor: t.primary }}
                  />
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 shadow-xs"
                    style={{ backgroundColor: t.secondary }}
                  />
                  <div
                    className="w-7 h-7 rounded-lg border border-black/10 shadow-xs"
                    style={{ backgroundColor: t.accent }}
                  />
                  <div
                    className="w-7 h-7 rounded-lg border border-black/15 shadow-xs"
                    style={{ backgroundColor: t.bg }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{t.paletteName}</span>
                <span className="font-mono text-[11px] font-medium">{t.primary}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Popover
      content={themeListContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="theme-picker-popover"
    >
      <button
        type="button"
        aria-label="Choose color theme"
        className={`relative h-9 px-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 text-slate-700 transition-all duration-150 cursor-pointer shadow-2xs ${className}`}
      >
        <BgColorsOutlined className="text-base text-primary" />
        <span className="hidden md:inline-block text-xs font-semibold text-slate-700">
          Theme
        </span>
        <div className="flex items-center -space-x-1 ml-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: activeTheme.primary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: activeTheme.secondary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: activeTheme.accent }}
          />
        </div>
      </button>
    </Popover>
  );
};

export default ThemePicker;
