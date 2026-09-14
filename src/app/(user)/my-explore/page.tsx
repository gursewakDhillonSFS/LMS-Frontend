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
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto">
      {/* 1. Exploration Controls Toolbar (No redundant title/description) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
          <button
            type="button"
            onClick={() => {
              setActiveTag("");
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 ${
              activeTag === ""
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "bg-white text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-2xs"
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-white text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-2xs"
                }`}
              >
                {cat.category_name}
              </button>
            );
          })}
        </div>

        {/* Search Bar & Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-xl p-1 shadow-2xs border border-[var(--border)] w-full sm:w-60 lg:w-72 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition-all"
          >
            <div className="relative flex-1 flex items-center pl-2.5">
              <SearchOutlined className="text-slate-400 text-sm mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, skills..."
                className="w-full py-1.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer mr-1"
                >
                  <CloseCircleFilled />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] shrink-0">
            <button
              type="button"
              onClick={() => setSortBy("featured")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sortBy === "featured"
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => setSortBy("rating")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sortBy === "rating"
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Top Rated
            </button>
            <button
              type="button"
              onClick={() => setSortBy("newest")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sortBy === "newest"
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Newest
            </button>
          </div>
        </div>
      </div>

      {/* 2. Course Catalog Grid - Immediately Visible */}
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
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[var(--border)] text-center shadow-xs flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border)] text-slate-400 flex items-center justify-center text-2xl">
            <SearchOutlined />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">No Courses Found</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm">
              We couldn't find any courses matching your search criteria or selected category.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <ReloadOutlined />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* 3. Proper Paginated Data Bar */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Showing <span className="font-semibold text-[var(--text-primary)]">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-semibold text-[var(--text-primary)]">{total}</span> courses
          </p>

          {total > limit ? (
            <div className="flex justify-center">
              <Pagination
                page={page}
                limit={limit}
                setPage={setPage}
                total={total}
              />
            </div>
          ) : (
            <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-subtle)] px-3 py-1 rounded-md">
              Page 1 of 1
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MyExplore;
