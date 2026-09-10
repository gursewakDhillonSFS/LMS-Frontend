import enCommon from './en/common.json';
import enHome from './en/home.json';
import enBrowse from './en/browse.json';
import enCourse from './en/course.json';
import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enSettings from './en/settings.json';

import paCommon from './pa/common.json';
import paHome from './pa/home.json';
import paBrowse from './pa/browse.json';
import paCourse from './pa/course.json';
import paAuth from './pa/auth.json';
import paDashboard from './pa/dashboard.json';
import paSettings from './pa/settings.json';

import frCommon from './fr/common.json';
import frHome from './fr/home.json';
import frBrowse from './fr/browse.json';
import frCourse from './fr/course.json';
import frAuth from './fr/auth.json';
import frDashboard from './fr/dashboard.json';
import frSettings from './fr/settings.json';

export type SupportedLocale = 'en' | 'pa' | 'fr';

export interface LocaleMeta {
  code: SupportedLocale;
  label: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES: Record<SupportedLocale, LocaleMeta> = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
  },
  pa: {
    code: 'pa',
    label: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    dir: 'ltr',
  },
  fr: {
    code: 'fr',
    label: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
  },
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const translations = {
  en: {
    common: enCommon,
    home: enHome,
    browse: enBrowse,
    course: enCourse,
    auth: enAuth,
    dashboard: enDashboard,
    settings: enSettings,
  },
  pa: {
    common: paCommon,
    home: paHome,
    browse: paBrowse,
    course: paCourse,
    auth: paAuth,
    dashboard: paDashboard,
    settings: paSettings,
  },
  fr: {
    common: frCommon,
    home: frHome,
    browse: frBrowse,
    course: frCourse,
    auth: frAuth,
    dashboard: frDashboard,
    settings: frSettings,
  },
} as const;

export type TranslationNamespace = keyof typeof translations.en;
