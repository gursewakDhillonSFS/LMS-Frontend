"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HomeOutlined,
  CompassOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  FireOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { HeaderLogoIcon } from "@/utils/icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/context/I18nContext";

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  const quickLinks = [
    {
      title: t("common.notFound.allCourses"),
      description: t("common.notFound.allCoursesDesc"),
      href: "/browse",
      icon: <BookOutlined className="text-xl text-blue-600" />,
      iconBg: "bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
      badge: "1,000+ Courses",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: t("common.notFound.trending"),
      description: t("common.notFound.trendingDesc"),
      href: "/browse",
      icon: <FireOutlined className="text-xl text-amber-500" />,
      iconBg: "bg-amber-50 border-amber-100 group-hover:bg-amber-500 group-hover:text-white",
      badge: "Hot Skills",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: t("common.notFound.help"),
      description: t("common.notFound.helpDesc"),
      href: "/#faq",
      icon: <CustomerServiceOutlined className="text-xl text-emerald-600" />,
      iconBg: "bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
      badge: "24/7 Support",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: t("common.notFound.becomeInstructor"),
      description: t("common.notFound.becomeInstructorDesc"),
      href: "/becomeInstructor",
      icon: <TeamOutlined className="text-xl text-purple-600" />,
      iconBg: "bg-purple-50 border-purple-100 group-hover:bg-purple-600 group-hover:text-white",
      badge: "Earn & Inspire",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-indigo-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/4 w-[420px] h-[420px] rounded-full bg-purple-400/10 blur-3xl"
      />

      {/* Subtle dot pattern grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
      />

      {/* ─── TOP BRAND BAR ────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
            aria-label="Skillora Home"
          >
            <HeaderLogoIcon width="160" height="38" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/browse"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              <CompassOutlined />
              <span>{t("common.notFound.exploreCourses")}</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            <LanguageSwitcher variant="header" />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-200/60"
            >
              <HomeOutlined />
              <span className="hidden sm:inline">{t("common.notFound.backHome")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN HERO CONTENT ────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-5xl mx-auto w-full text-center">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-sm mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          {t("common.notFound.badge")}
        </div>

        {/* Dynamic 404 Centerpiece with Mortarboard Emblem */}
        <div className="relative mb-6 select-none flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 font-black tracking-tight leading-none text-slate-900">
            {/* First "4" */}
            <span className="text-7xl sm:text-9xl md:text-[9.5rem] font-black tracking-tighter bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">
              4
            </span>

            {/* Orbit Center Badge with Mortarboard Hat */}
            <div className="relative mx-1 sm:mx-3 group">
              {/* Outer pulsing glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/30 blur-xl group-hover:blur-2xl transition-all" />

              {/* Orbit concentric ring */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-blue-500/10 flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                {/* Decorative orbit ring line */}
                <div className="absolute inset-2 rounded-2xl border border-dashed border-blue-200/70 pointer-events-none" />

                {/* College Graduation Mortarboard SVG */}
                <svg
                  viewBox="0 0 48 48"
                  className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 drop-shadow-md text-blue-600"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="mortar404-grad" x1="4" y1="8" x2="44" y2="28" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#315CFF" />
                      <stop offset="50%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="cap404-base" x1="10" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                  </defs>
                  {/* Skull cap / Head base */}
                  <path
                    d="M13 22.5V31.5C13 35.8 17.9 39 24 39C30.1 39 35 35.8 35 31.5V22.5"
                    fill="url(#cap404-base)"
                  />
                  {/* Diamond Mortarboard Top */}
                  <polygon
                    points="24,8 44,18 24,28 4,18"
                    fill="url(#mortar404-grad)"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Center button */}
                  <circle cx="24" cy="18" r="2.2" fill="#FBBF24" />
                  {/* Tassel cord & fob */}
                  <path
                    d="M24 18.5C28 20 34 23 35.5 28.5"
                    stroke="#FBBF24"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="35.8" cy="29.2" r="2" fill="#F59E0B" />
                  <path
                    d="M35.8 29.5V36"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Floating micro accent sparkle */}
                <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-full p-1 shadow-md">
                  <span className="text-xs leading-none">✦</span>
                </div>
              </div>
            </div>

            {/* Second "4" */}
            <span className="text-7xl sm:text-9xl md:text-[9.5rem] font-black tracking-tighter bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
              4
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-2xl mb-4 leading-snug">
          {t("common.notFound.title")}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed">
          {t("common.notFound.description")}
        </p>

        {/* Integrated Search Bar */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-md mb-8 relative flex items-center"
        >
          <div className="relative w-full flex items-center shadow-lg shadow-blue-500/5 rounded-2xl">
            <SearchOutlined className="absolute left-4 text-slate-400 text-lg pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.notFound.searchPlaceholder")}
              className="w-full pl-11 pr-24 py-3.5 text-sm sm:text-base bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              {t("common.notFound.searchButton")}
            </button>
          </div>
        </form>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14 w-full">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-sm sm:text-base shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <HomeOutlined className="text-base" />
            <span>{t("common.notFound.backHome")}</span>
          </Link>

          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200/90 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <CompassOutlined className="text-base text-blue-600" />
            <span>{t("common.notFound.exploreCourses")}</span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
          >
            <ArrowLeftOutlined className="text-xs" />
            <span>{t("common.notFound.goBack")}</span>
          </button>
        </div>

        {/* ─── QUICK RECOVERY DESTINATIONS GRID ────────────────── */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/70 pb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              {t("common.notFound.quickLinksTitle")}
            </h2>
            <Link
              href="/browse"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>{t("common.notFound.allCourses")}</span>
              <RightOutlined className="text-[10px] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 hover:border-blue-300 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${item.iconBg}`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Explore</span>
                  <RightOutlined className="text-[10px] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* ─── COMPACT FOOTER ───────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-slate-200/70 bg-white/60 backdrop-blur-sm py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Skillora Inc.</span>
            <span>•</span>
            <span>Master In-Demand Tech, Design & Business Skills</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t("common.footer.privacy")}
            </Link>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t("common.footer.terms")}
            </Link>
            <Link href="/#faq" className="hover:text-blue-600 transition-colors">
              {t("common.footer.contactUs")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
