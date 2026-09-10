"use client";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import { RootState } from "@/redux/store";
import { CategoryEnum } from "@/utils/enums";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/context/I18nContext";

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a3 3 0 0 0 0-6H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v4a1 1 0 0 0 1.7.7L13.4 16H18a3 3 0 0 0 3-3V8z" />
    <path d="M10 8h4" />
  </svg>
);

const SmartphoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

const CodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const GraduationIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const getCategoryIcon = (name?: string) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("data")) return <DatabaseIcon />;
  if (lower.includes("marketing")) return <MegaphoneIcon />;
  if (lower.includes("mobile")) return <SmartphoneIcon />;
  if (lower.includes("design") || lower.includes("ui")) return <PenIcon />;
  if (lower.includes("web") || lower.includes("code") || lower.includes("develop")) return <CodeIcon />;
  return <GridIcon />;
};

const CategoriesSideBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeCategory = useSelector(
    (state: RootState) => state?.categories?.activeCategory
  );
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCategory]);

  const handleOpenSignup = () => {
    dispatch(setSignup(true));
  };

  return (
    <div className="sticky top-[80px] flex flex-col gap-6 w-full lg:w-[210px] shrink-0">
      {/* Sidebar Navigation */}
      <div className="flex flex-col gap-1">
        {/* Home Item */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium rounded-[10px] transition-all duration-150 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white"
        >
          <HomeIcon />
          <span>{t("common.nav.home", { defaultValue: "Home" })}</span>
        </Link>

        {/* All Courses / All Classes */}
        <button
          type="button"
          onClick={() => dispatch(setActiveCategory(CategoryEnum?.ALL_Classes))}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] rounded-[10px] cursor-pointer transition-all duration-150 ${
            activeCategory === CategoryEnum?.ALL_Classes || !activeCategory
              ? "bg-[#EEF4FF] text-[var(--primary)] font-semibold shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white font-medium"
          }`}
        >
          <GridIcon />
          <span>{t("common.nav.allCourses", { defaultValue: "All Courses" })}</span>
        </button>

        {/* Category Items */}
        {categories?.map((category) => {
          const isActive = activeCategory === category?.category_id;
          return (
            <button
              key={category?.category_id}
              type="button"
              onClick={() => dispatch(setActiveCategory(category?.category_id))}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] rounded-[10px] cursor-pointer transition-all duration-150 ${
                isActive
                  ? "bg-[#EEF4FF] text-[var(--primary)] font-semibold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white font-medium"
              }`}
            >
              {getCategoryIcon(category?.category_name)}
              <span className="truncate">{category?.category_name}</span>
            </button>
          );
        })}
      </div>

      {/* Promotion Card — Matching Reference Image */}
      <div className="relative rounded-[14px] bg-gradient-to-b from-[#EEF4FF] to-[#E5EFFF] border border-[#D5E3FC] p-4 flex flex-col gap-3 shadow-[0_2px_8px_rgba(49,92,255,0.06)]">
        <div className="w-9 h-9 rounded-[10px] bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
          <GraduationIcon />
        </div>

        <div className="flex flex-col gap-1">
          <h4 className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">
            Learn Anytime, Anywhere
          </h4>
          <p className="text-[11px] text-[#475467] leading-relaxed">
            Build your skills and create a better future with Skillora.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenSignup}
          aria-label="Get Started"
          className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[#254CD9] shadow-xs transition-transform active:scale-90 hover:scale-105"
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default CategoriesSideBar;

