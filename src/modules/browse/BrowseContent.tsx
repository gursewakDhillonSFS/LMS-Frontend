"use client";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import NoDataFound from "@/components/NoDataFound";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { RootState } from "@/redux/store";
import { getAllCoursesApi } from "@/services/collections";
import { CategoryEnum, RoutePaths } from "@/utils/enums";
import {
  BrowseCreativity,
  BrowseHeroTech,
  DataNotFound,
} from "@/utils/images";
import { courseData } from "@/utils/interface";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryCourses from "./CategoryCourses";
import { getCategoryIcon } from "./CategoriesSideBar";

const BrowseContent = () => {
  const activeCategory = useSelector(
    (state: RootState) => state?.categories?.activeCategory
  );
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );
  const [courses, setCourses] = useState<courseData[]>([]);
  const [popularCourses, setPopularCourses] = useState<courseData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const courseRedirect = (value: courseData | undefined) => {
    router.push("/browse/course-details");
    dispatch(setCourseData(value));
  };

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", "8");
      params.append("page", "1");
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }
      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        const list = response?.data?.course_list || [];
        setCourses(list.slice(0, 4));
        setPopularCourses(list.length > 4 ? list.slice(4, 8) : list.slice(0, 4));
      }
    } catch (err) {
      console.log(err || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [organization_id]);

  const handleSignup = () => {
    dispatch(setSignup(true));
  };

  useEffect(() => {
    if (activeCategory === CategoryEnum?.ALL_Classes || !activeCategory) {
      fetchCourseData();
    }
  }, [activeCategory, fetchCourseData]);

  const isAllClasses =
    activeCategory === CategoryEnum?.ALL_Classes || !activeCategory;

  return (
    <div className="flex flex-col gap-10 flex-1 min-w-0">
      {isAllClasses ? (
        <>
          {/* ========================================================
              1. Hero Promotional Banner (Matching Reference Image)
             ======================================================== */}
          <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#0A1931] via-[#122A53] to-[#18396D] border border-white/10 shadow-[0_8px_30px_rgba(10,25,49,0.18)] p-6 md:p-8 lg:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Ambient Lighting Accents */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-4 max-w-xl z-10">
              <span className="text-[#60A5FA] text-[11px] font-bold tracking-[0.14em] uppercase">
                ONLINE LEARNING PLATFORM
              </span>

              <h1 className="text-[26px] md:text-[34px] xl:text-[38px] font-extrabold text-white tracking-tight leading-[115%]">
                Learn New Skills, <br />
                Build Your Future
              </h1>

              <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                Explore expert-led courses in technology, design, marketing and
                more. Learn at your own pace, anytime, anywhere.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSignup}
                  className="bg-[var(--primary)] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] hover:bg-[#254CD9] shadow-[0_2px_8px_rgba(49,92,255,0.35)] transition-all hover:-translate-y-px active:translate-y-0"
                >
                  Start Learning Free →
                </button>

                <button
                  type="button"
                  onClick={() => router.push(RoutePaths?.Browse)}
                  className="bg-white/5 border border-white/20 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] hover:bg-white/10 transition-all hover:-translate-y-px active:translate-y-0"
                >
                  Browse All Courses
                </button>
              </div>

              {/* 3 Feature Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-slate-300 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-white text-[12px]">Expert Instructors</span>
                    <span className="text-[11px] text-slate-400">Learn from industry pros</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-white text-[12px]">Certification</span>
                    <span className="text-[11px] text-slate-400">Showcase your skills</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-white text-[12px]">Lifetime Access</span>
                    <span className="text-[11px] text-slate-400">Learn at your own pace</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Tech Visual Illustration */}
            <div className="relative w-full lg:w-[380px] xl:w-[420px] h-[220px] md:h-[260px] rounded-[14px] overflow-hidden shadow-2xl border border-white/10 shrink-0">
              <Image
                src={BrowseHeroTech}
                alt="Tech Learning Platform"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          {/* ========================================================
              2. Browse by Category Grid (Matching Reference Image)
             ======================================================== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  <h2 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)] tracking-tight">
                    Browse by Category
                  </h2>
                </div>
                <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)]">
                  Find the perfect course for your career goals
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(setActiveCategory(categories?.[0]?.category_id))}
                className="text-[12px] md:text-[13px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>View All Categories</span>
                <span>→</span>
              </button>
            </div>

            {/* 6 Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* All Classes Card */}
              <div
                onClick={() => dispatch(setActiveCategory(CategoryEnum.ALL_Classes))}
                className="cursor-pointer rounded-[12px] bg-white border border-[var(--border)] p-4 flex flex-col items-center text-center gap-2.5 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08),0_12px_24px_-4px_rgba(49,92,255,0.12)] hover:-translate-y-1 hover:border-[#C7D7FE] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center">
                  {getCategoryIcon("classes")}
                </div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] leading-tight">
                  All Classes
                </span>
              </div>

              {/* Dynamic Category Cards */}
              {categories?.slice(0, 5).map((category) => (
                <div
                  key={category?.category_id}
                  onClick={() => dispatch(setActiveCategory(category?.category_id))}
                  className="cursor-pointer rounded-[12px] bg-white border border-[var(--border)] p-4 flex flex-col items-center text-center gap-2.5 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08),0_12px_24px_-4px_rgba(49,92,255,0.12)] hover:-translate-y-1 hover:border-[#C7D7FE] transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEF4FF] text-[var(--primary)] flex items-center justify-center">
                    {getCategoryIcon(category?.category_name)}
                  </div>
                  <span className="text-[12px] font-bold text-[var(--text-primary)] leading-tight truncate w-full">
                    {category?.category_name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              3. Featured Classes (4-Course Grid)
             ======================================================== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <span>★</span>
                  <h2 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)] tracking-tight">
                    Featured Classes
                  </h2>
                </div>
                <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)]">
                  Handpicked courses to help you get started
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(setActiveCategory(categories?.[0]?.category_id))}
                className="text-[12px] md:text-[13px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : courses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.map((course) => (
                  <CourseCard
                    key={course?.course_id}
                    data={course}
                    onClick={courseRedirect}
                  />
                ))}
              </div>
            ) : (
              <NoDataFound icon={DataNotFound} />
            )}
          </div>

          {/* ========================================================
              4. Popular This Week (4-Course Grid)
             ======================================================== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-red-500">
                  <span>🔥</span>
                  <h2 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)] tracking-tight">
                    Popular This Week
                  </h2>
                </div>
                <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)]">
                  Most enrolled courses right now
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(setActiveCategory(categories?.[0]?.category_id))}
                className="text-[12px] md:text-[13px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : popularCourses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularCourses.map((course) => (
                  <CourseCard
                    key={course?.course_id}
                    data={course}
                    onClick={courseRedirect}
                  />
                ))}
              </div>
            ) : (
              <NoDataFound icon={DataNotFound} />
            )}
          </div>

          {/* ========================================================
              5. Explore Your Creativity Banner (Matching Reference Image)
             ======================================================== */}
          <div className="relative rounded-[16px] bg-gradient-to-r from-[#EEF4FF] via-[#F3F7FF] to-[#FAF5FF] border border-[#D5E3FC] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_4px_16px_rgba(49,92,255,0.05)]">
            <div className="flex items-start gap-4 max-w-xl">
              <div className="w-11 h-11 rounded-[12px] bg-white border border-[#D5E3FC] text-[var(--primary)] flex items-center justify-center shadow-xs shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                </svg>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-[17px] md:text-[19px] font-bold text-[var(--text-primary)] tracking-tight">
                  Explore Your Creativity
                </h3>
                <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Unlock your potential with courses designed to inspire and
                  empower. Whether you&apos;re just starting out or refining your
                  craft, explore a wide range of creative topics — from
                  photography to design, and more.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
              <div className="relative w-48 h-28 rounded-[10px] overflow-hidden shadow-xs border border-white/80 hidden sm:block">
                <Image
                  src={BrowseCreativity}
                  alt="Creativity Tools"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => dispatch(setActiveCategory(categories?.[0]?.category_id))}
                className="bg-[var(--primary)] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] hover:bg-[#254CD9] shadow-sm transition-all whitespace-nowrap active:scale-95"
              >
                Explore Courses →
              </button>
            </div>
          </div>

          {/* ========================================================
              6. Bottom CTA Banner (Matching Reference Image)
             ======================================================== */}
          <div className="relative rounded-[16px] bg-gradient-to-r from-[#09152C] via-[#0E2042] to-[#142B59] p-6 md:p-8 text-white relative overflow-hidden border border-white/10 shadow-[0_8px_24px_rgba(9,21,44,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 z-10 max-w-lg">
              <span className="text-[#60A5FA] text-[11px] font-bold tracking-[0.12em] uppercase">
                READY TO START LEARNING?
              </span>
              <h3 className="text-[20px] md:text-[24px] font-bold text-white tracking-tight leading-snug">
                What will learning do for your personal life?
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 z-10">
              <button
                type="button"
                onClick={handleSignup}
                className="bg-[var(--primary)] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] hover:bg-[#254CD9] shadow-sm transition-all active:scale-95"
              >
                Sign Up for Free
              </button>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-white/10 border border-white/20 text-white text-[13px] font-semibold px-5 py-2.5 rounded-[8px] hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
              >
                Explore Courses
              </button>
            </div>

            {/* Decorative Graduation Graphic */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none hidden xl:block">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        /* Selected Category View */
        <CategoryCourses />
      )}
    </div>
  );
};

export default BrowseContent;
