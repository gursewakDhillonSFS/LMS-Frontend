"use client";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface CategoryCardItem {
  id?: string;
  name: string;
  coursesCount: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function ExploreSkill() {
  const router = useRouter();
  const dispatch = useDispatch();
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );

  const handleCategoryClick = (categoryId?: string) => {
    if (categoryId) {
      dispatch(setActiveCategory(categoryId));
    }
    router.push(RoutePaths?.Browse);
  };

  const defaultCategoryData: CategoryCardItem[] = [
    {
      name: "Data Science",
      coursesCount: "120+ courses",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
      iconBg: "#EEF4FF",
      iconColor: "#315CFF",
    },
    {
      name: "Digital Marketing",
      coursesCount: "95+ courses",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a3 3 0 0 0 0-6H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2v4a1 1 0 0 0 1.7.7L13.4 16H18a3 3 0 0 0 3-3V8z" />
          <path d="M10 8h4" />
        </svg>
      ),
      iconBg: "#ECFDF5",
      iconColor: "#059669",
    },
    {
      name: "Mobile Development",
      coursesCount: "80+ courses",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
    },
    {
      name: "UI/UX Design",
      coursesCount: "65+ courses",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      ),
      iconBg: "#FFF7ED",
      iconColor: "#EA580C",
    },
    {
      name: "Web Development",
      coursesCount: "110+ courses",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      iconBg: "#EFF6FF",
      iconColor: "#2563EB",
    },
  ];

  // Map API categories to display cards
  const displayCards = defaultCategoryData.map((item) => {
    const matched = categories?.find(
      (c) =>
        c.category_name.toLowerCase().includes(item.name.toLowerCase().split(" ")[0]) ||
        item.name.toLowerCase().includes(c.category_name.toLowerCase())
    );
    return {
      ...item,
      id: matched?.category_id,
      name: matched?.category_name || item.name,
    };
  });

  return (
    <section className="py-12 md:py-16 px-6 md:px-12 xl:px-20 2xl:px-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[var(--primary)] text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-1.5">
              <span>✦</span>
              <span>EXPLORE CATEGORIES</span>
            </span>
            <h2 className="text-[26px] md:text-[32px] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Find the Perfect Course for Your Goals
            </h2>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)]">
              Explore top categories and start your learning journey today.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(RoutePaths?.Browse)}
            className="text-[13px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Categories</span>
            <span>→</span>
          </button>
        </div>

        {/* 5 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayCards.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleCategoryClick(cat.id)}
              className="cursor-pointer group rounded-[14px] bg-white border border-[var(--border)] p-5 flex flex-col justify-between gap-6 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_6px_20px_rgba(16,24,40,0.08),0_12px_28px_-4px_rgba(49,92,255,0.12)] hover:-translate-y-1 hover:border-[#C7D7FE] transition-all duration-200"
            >
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}
              >
                {cat.icon}
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[15px] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                  {cat.name}
                </h3>
                <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                  <span>{cat.coursesCount}</span>
                  <span className="text-[var(--primary)] font-bold transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
