"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  SearchOutlined,
  CloseCircleFilled,
  FireOutlined,
  CompassOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import DashboardCourseCard from "@/components/DashboardCourseCard";
import Pagination from "@/components/Pagination";
import useCategories from "@/hooks/useCategories";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  addToFavorite,
  getAllCoursesApi,
  removeFromFavorite,
} from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { courseData } from "@/utils/interface";
import { RootState } from "@/redux/store";
import { toast } from "@/utils/toast";

const MyExplore = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "rating" | "newest">("featured");

  const [limit] = useState(12);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [courses, setCourses] = useState<courseData[]>([]);
  const [loading, setLoading] = useState(false);

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", String(limit));
      params.append("page", String(page));
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }
      if (activeTag) {
        params.append("category_id", activeTag);
      }
      if (submittedSearch.trim()) {
        params.append("search", submittedSearch.trim());
      }

      const response = await getAllCoursesApi(params);

      if (response?.status === true) {
        let courseList = response?.data?.course_list || [];

        // Frontend sort if requested
        if (sortBy === "rating") {
          courseList = [...courseList].sort(
            (a, b) => (b.average_rating || 0) - (a.average_rating || 0)
          );
        } else if (sortBy === "newest") {
          courseList = [...courseList].sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          );
        }

        setCourses(courseList);
        setTotal(response?.data?.total_courses || 0);
      } else {
        setCourses([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [limit, page, activeTag, organization_id, submittedSearch, sortBy]);

  useEffect(() => {
    fetchCourseData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchCourseData]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSubmittedSearch("");
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setActiveTag("");
    setSortBy("featured");
    setPage(1);
  };

  const handleAddFavorite = async (id: string) => {
    if (!id) return;
    try {
      const res = await addToFavorite({ course_id: id, favorite: true });
      if (res.status) {
        toast.success(res.message || "Added to favorites");
        setCourses((prev) =>
          prev.map((item) =>
            item.course_id === id
              ? { ...item, favorite_status: true, favorite: true }
              : item
          )
        );
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!id) return;
    try {
      const param = new URLSearchParams();
      param.append("course_id", id);
      const res = await removeFromFavorite(param);
      if (res.status) {
        toast.success(res.message || "Removed from favorites");
        setCourses((prev) =>
          prev.map((item) =>
            item.course_id === id
              ? { ...item, favorite_status: false, favorite: false }
              : item
          )
        );
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRedirect = (data: courseData) => {
    dispatch(setCourseData(data));
    router.push(`${RoutePaths.MyExplore}/checkout`);
  };

  const veiwDetail = (data: courseData) => {
    dispatch(setCourseData(data));
    router.push(`${RoutePaths.MyExplore}/course-detail`);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Hero Exploration Banner */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#101828] via-[#1E293B] to-[#0F172A] p-6 sm:p-10 text-white overflow-hidden shadow-md">
        {/* Decorative blur elements */}
        <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-[#315CFF]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
            <CompassOutlined className="text-sm" />
            <span>Discover Knowledge & Master In-Demand Skills</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Explore Accredited Online Classes
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Gain mastery in technology, design, and business with hands-on curriculums, live mentorship, and verified certificates recognized across the industry.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl mt-3 flex items-center bg-white rounded-2xl p-1.5 shadow-lg border border-white/20"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <SearchOutlined className="text-slate-400 text-base mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, skills, or instructors..."
                className="w-full py-2 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer mr-2"
                >
                  <CloseCircleFilled />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTag("");
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 ${
                activeTag === ""
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
              }`}
            >
              All Categories
            </button>

            {categories?.map((cat) => {
              const isSelected = activeTag === cat.category_id;
              return (
                <button
                  key={cat.category_id}
                  type="button"
                  onClick={() => {
                    setActiveTag(cat.category_id);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
                  }`}
                >
                  {cat.category_name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Catalog Section Header & Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight">
            Featured Courses For You
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            {submittedSearch
              ? `Results matching "${submittedSearch}"`
              : activeTag
              ? `Filtered by selected category`
              : `Curated learning pathways recommended for your career goals`}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-xl border border-[#E4E7EC]">
            <button
              type="button"
              onClick={() => setSortBy("featured")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sortBy === "featured"
                  ? "bg-white text-[#101828] shadow-xs"
                  : "text-[#667085] hover:text-[#101828]"
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => setSortBy("rating")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sortBy === "rating"
                  ? "bg-white text-[#101828] shadow-xs"
                  : "text-[#667085] hover:text-[#101828]"
              }`}
            >
              Top Rated
            </button>
            <button
              type="button"
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sortBy === "newest"
                  ? "bg-white text-[#101828] shadow-xs"
                  : "text-[#667085] hover:text-[#101828]"
              }`}
            >
              Newest
            </button>
          </div>
        </div>
      </div>

      {/* 3. Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course) => (
            <DashboardCourseCard
              key={course.course_id}
              courseData={course}
              handleAddFavorite={handleAddFavorite}
              handleRemoveFavorite={handleRemoveFavorite}
              handleRedirect={handleRedirect}
              veiwDetail={veiwDetail}
            />
          ))}
        </div>
      ) : (
        /* Empty Search / Filter Results */
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#E4E7EC] text-center shadow-xs flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] border border-[#E4E7EC] text-slate-400 flex items-center justify-center text-2xl">
            <SearchOutlined />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#101828]">No Courses Found</h3>
            <p className="text-xs sm:text-sm text-[#667085] max-w-sm">
              We couldn't find any courses matching your search criteria or selected category.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#2547D0] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <ReloadOutlined />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* 4. Pagination */}
      {total > limit && (
        <div className="flex justify-center pt-4">
          <Pagination
            page={page}
            limit={limit}
            setPage={setPage}
            total={total}
          />
        </div>
      )}
    </div>
  );
};

export default MyExplore;
