"use client";
import { HomeStatsCap } from "@/utils/images";
import Image from "next/image";
import React from "react";
import { useTranslation } from "@/context/I18nContext";

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MedalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const ModernSkills = () => {
  const { t } = useTranslation();

  return (
    <section className="py-10 md:py-16 px-6 md:px-12 xl:px-20 2xl:px-24">
      <div className="max-w-7xl mx-auto rounded-[24px] bg-gradient-to-r from-[#EEF4FF] via-[#F3F7FF] to-[#FAF5FF] border border-[#D5E3FC] p-6 sm:p-10 lg:p-12 shadow-[0_6px_24px_rgba(49,92,255,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Headline */}
        <div className="flex flex-col gap-2 max-w-sm text-center lg:text-left">
          <h2 className="text-[26px] md:text-[32px] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
            {t("home.features.title")}
          </h2>
          <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-relaxed">
            {t("home.features.subtitle")}
          </p>
        </div>

        {/* Center 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1 max-w-xl w-full">
          {/* Stat Card 1 */}
          <div className="rounded-[16px] bg-white border border-[var(--border)] p-5 flex flex-col items-center text-center gap-2 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)] transition-all">
            <div className="w-11 h-11 rounded-[12px] bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center">
              <BookIcon />
            </div>
            <div className="text-[22px] md:text-[26px] font-extrabold text-[var(--primary)] tracking-tight">
              1,000+
            </div>
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              {t("home.features.totalCourses")}
            </span>
          </div>

          {/* Stat Card 2 */}
          <div className="rounded-[16px] bg-white border border-[var(--border)] p-5 flex flex-col items-center text-center gap-2 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)] transition-all">
            <div className="w-11 h-11 rounded-[12px] bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center">
              <UsersIcon />
            </div>
            <div className="text-[22px] md:text-[26px] font-extrabold text-[var(--primary)] tracking-tight">
              50,000+
            </div>
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              {t("home.hero.activeLearners")}
            </span>
          </div>

          {/* Stat Card 3 */}
          <div className="rounded-[16px] bg-white border border-[var(--border)] p-5 flex flex-col items-center text-center gap-2 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)] transition-all">
            <div className="w-11 h-11 rounded-[12px] bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center">
              <MedalIcon />
            </div>
            <div className="text-[22px] md:text-[26px] font-extrabold text-[var(--primary)] tracking-tight">
              25,000+
            </div>
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              {t("home.features.certified")}
            </span>
          </div>
        </div>

        {/* Right 3D Cap Graphic */}
        <div className="relative w-44 h-36 md:w-52 md:h-40 shrink-0 hidden xl:block">
          <Image
            src={HomeStatsCap}
            alt="Graduation Cap"
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default ModernSkills;
