"use client";

import React from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { GlobeIcon, DownArrowIcon } from "@/utils/icons";
import { useTranslation } from "@/context/I18nContext";
import { SupportedLocale, LOCALES } from "@/locales";
import { CheckOutlined } from "@ant-design/icons";

interface LanguageSwitcherProps {
  variant?: "header" | "footer" | "select" | "mobile";
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "header",
  className = "",
}) => {
  const { locale, setLocale, t } = useTranslation();

  const currentMeta = LOCALES[locale] || LOCALES.en;

  const menuItems: MenuProps["items"] = (
    Object.keys(LOCALES) as SupportedLocale[]
  ).map((code) => {
    const item = LOCALES[code];
    const isSelected = code === locale;

    return {
      key: code,
      label: (
        <div className="flex items-center justify-between gap-3 py-1 px-1 min-w-[150px]">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">{item.flag}</span>
            <div className="flex flex-col">
              <span
                className={`text-[13px] ${
                  isSelected ? "font-semibold text-[#4F46E5]" : "text-slate-700"
                }`}
              >
                {item.nativeName}
              </span>
              <span className="text-[11px] text-slate-400">{item.label}</span>
            </div>
          </div>
          {isSelected && (
            <CheckOutlined className="text-xs text-[#4F46E5] font-bold" />
          )}
        </div>
      ),
      onClick: () => {
        setLocale(code);
      },
    };
  });

  if (variant === "select") {
    return (
      <div className={`relative inline-block w-full ${className}`}>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as SupportedLocale)}
          aria-label={t("common.languages.select")}
          className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all cursor-pointer appearance-none pr-10"
        >
          <option value="en">🇬🇧 English</option>
          <option value="pa">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
          <option value="fr">🇫🇷 Français (French)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <DownArrowIcon />
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Dropdown
          menu={{ items: menuItems }}
          placement="topRight"
          trigger={["click"]}
        >
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors shadow-xs cursor-pointer"
            aria-label={t("common.languages.select")}
          >
            <span className="text-sm">{currentMeta.flag}</span>
            <span>{currentMeta.nativeName}</span>
            <DownArrowIcon />
          </button>
        </Dropdown>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className={`flex items-center justify-between w-full py-1 ${className}`}>
        <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
          <GlobeIcon />
          <span>{t("common.languages.title")}:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(LOCALES) as SupportedLocale[]).map((code) => {
            const isSelected = code === locale;
            const item = LOCALES[code];
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.flag} {code.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: header
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <button
          type="button"
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          aria-label={t("common.languages.select")}
        >
          <span className="text-sm leading-none">{currentMeta.flag}</span>
          <span className="uppercase tracking-wider">{currentMeta.code}</span>
          <DownArrowIcon />
        </button>
      </Dropdown>
    </div>
  );
};

export default LanguageSwitcher;
