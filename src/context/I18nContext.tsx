"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { translations, SupportedLocale, LOCALES, DEFAULT_LOCALE } from "@/locales";
import Api from "@/services/interceptor";

const INTL_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: "en-US",
  pa: "pa-IN",
  fr: "fr-FR",
};

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (newLocale: SupportedLocale) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  availableLocales: typeof LOCALES;
}

const I18nContext = createContext<I18nContextType | null>(null);

function resolveTranslation(
  dict: any,
  keyPath: string[]
): string | undefined {
  let current = dict;
  for (const segment of keyPath) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

export const I18nProvider: React.FC<{
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (initialLocale && (initialLocale === "en" || initialLocale === "pa" || initialLocale === "fr")) {
      return initialLocale;
    }
    return DEFAULT_LOCALE;
  });

  useEffect(() => {
    // Detect saved locale from cookie or localStorage or navigator
    try {
      const savedCookie = Cookies.get("NEXT_LOCALE") as SupportedLocale | undefined;
      const savedLocal = typeof window !== "undefined" ? (localStorage.getItem("NEXT_LOCALE") as SupportedLocale | null) : null;
      
      let detected: SupportedLocale = DEFAULT_LOCALE;
      if (savedCookie && (savedCookie === "en" || savedCookie === "pa" || savedCookie === "fr")) {
        detected = savedCookie;
      } else if (savedLocal && (savedLocal === "en" || savedLocal === "pa" || savedLocal === "fr")) {
        detected = savedLocal;
      } else if (typeof navigator !== "undefined" && navigator.language) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("pa")) {
          detected = "pa";
        } else if (browserLang.startsWith("fr")) {
          detected = "fr";
        }
      }

      if (detected !== locale) {
        setLocaleState(detected);
      }

      if (typeof document !== "undefined") {
        document.documentElement.lang = detected;
      }
    } catch {
      // Fallback silently if storage access restricted
    }
  }, []);

  const setLocale = useCallback(async (newLocale: SupportedLocale) => {
    if (newLocale !== "en" && newLocale !== "pa" && newLocale !== "fr") return;

    setLocaleState(newLocale);

    try {
      Cookies.set("NEXT_LOCALE", newLocale, { expires: 365, path: "/" });
      if (typeof window !== "undefined") {
        localStorage.setItem("NEXT_LOCALE", newLocale);
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLocale;
      }

      // If user is authenticated, sync to backend user profile
      const token = Cookies.get("token");
      if (token) {
        Api.put("/user/profile", { preferredLanguage: newLocale }).catch(() => {
          // Non-critical, ignore sync failure
        });
      }
    } catch (e) {
      console.warn("Could not persist locale preference:", e);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const parts = key.split(".");
      
      // Look in current locale dictionary
      let resolved = resolveTranslation(translations[locale], parts);

      // Fallback to English dictionary
      if (resolved === undefined && locale !== DEFAULT_LOCALE) {
        resolved = resolveTranslation(translations[DEFAULT_LOCALE], parts);
      }

      // If still not found, return key
      if (resolved === undefined) {
        return key;
      }

      // Interpolate parameters {param}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          resolved = (resolved as string).replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            String(paramValue)
          );
        });
      }

      return resolved;
    },
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(INTL_LOCALE_MAP[locale] || "en-US", options).format(d);
      } catch {
        return String(date);
      }
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(INTL_LOCALE_MAP[locale] || "en-US", options).format(value);
      } catch {
        return String(value);
      }
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (value: number, currency: string = "USD"): string => {
      try {
        return new Intl.NumberFormat(INTL_LOCALE_MAP[locale] || "en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }).format(value);
      } catch {
        return `$${value}`;
      }
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      availableLocales: LOCALES,
    }),
    [locale, setLocale, t, formatDate, formatNumber, formatCurrency]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};

export default I18nContext;
