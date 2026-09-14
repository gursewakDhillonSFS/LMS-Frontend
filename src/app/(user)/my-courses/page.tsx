"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  CompassOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import CommonButton from "@/components/CommonButton";
import { MyCoursesCard } from "@/components/MyCourseCard";
import Pagination from "@/components/Pagination";
import SkeletonCard from "@/components/SkeletonCard";
import { RootState } from "@/redux/store";
import { setCourseTab } from "@/redux/tabslice/UserCourseTabSlice";
import { userCourseList } from "@/services/collections";
import { RoutePaths, UserCourseTab } from "@/utils/enums";
import { ClockWheelIcon } from "@/utils/icons";
import { Live } from "@/utils/images";
import { EnrolledCourseProp } from "@/utils/interface";
import { toast } from "@/utils/toast";

const liveLessons = [
  {
    title: "UPSC Science Class Live Lesson",
    date: "Today",
    time: "6:00 PM - 6:45 PM",
    startAt: "17:50",
    isLiveNow: true,
  },
  {
    title: "Advanced Data Structures Workshop",
    date: "Tomorrow",
    time: "5:00 PM - 6:00 PM",
    startAt: "17:00",
    isLiveNow: false,
  },
  {
    title: "UI/UX Design Systems Q&A",
    date: "Friday",
    time: "4:00 PM - 5:00 PM",
    startAt: "16:00",
    isLiveNow: false,
  },
];

type TabType = "all" | "active" | "completed";
type SortOption = "recent" | "progress_desc" | "progress_asc" | "name_asc";

const MyCourses = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const activeKeyFromRedux = useSelector(
    (state: RootState) => state.coursetab.activeCourseTab
  );

  const [courses, setCourses] = useState<EnrolledCourseProp[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<TabType>(
    activeKeyFromRedux === UserCourseTab.Completed ? "completed" : "all"
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const getUserCourseData = async () => {
    setLoading(true);
    const param = new URLSearchParams();
    try {
      const response = await userCourseList(param);
      if (response?.status && response?.data?.courses) {
        setCourses(response.data.courses);
      } else {
        setCourses([]);
        if (response?.message) toast.warning(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.warning("Could not load your courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserCourseData();
  }, []);

  useEffect(() => {
    dispatch(
      setCourseTab(
        activeTab === "completed"
          ? UserCourseTab.Completed
          : UserCourseTab.Active
      )
    );
  }, [activeTab, dispatch]);

  // Statistics
  const totalCount = courses.length;
  const activeCount = useMemo(
    () => courses.filter((c) => (c.progress || 0) < 100).length,
    [courses]
  );
  const completedCount = useMemo(
    () => courses.filter((c) => (c.progress || 0) >= 100).length,
    [courses]
  );
  const avgProgress = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = courses.reduce((acc, c) => acc + (c.progress || 0), 0);
    return Math.round(sum / totalCount);
  }, [courses, totalCount]);

  // Filter & Sort
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by tab
    if (activeTab === "active") {
      result = result.filter((c) => (c.progress || 0) < 100);
    } else if (activeTab === "completed") {
      result = result.filter((c) => (c.progress || 0) >= 100);
    }

    // Filter by search
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          (c.course_name || "").toLowerCase().includes(query) ||
          (c.name || "").toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "progress_desc") {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === "progress_asc") {
        return (a.progress || 0) - (b.progress || 0);
      }
      if (sortBy === "name_asc") {
        return (a.course_name || "").localeCompare(b.course_name || "");
      }
      // default: recent
      return (
        new Date(b.enrolled_at || 0).getTime() -
        new Date(a.enrolled_at || 0).getTime()
      );
    });

    return result;
  }, [courses, activeTab, search, sortBy]);

  // Paginated slice
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredCourses.slice(start, start + limit);
  }, [filteredCourses, page, limit]);

  // Reset page when filter changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-16 max-w-7xl mx-auto">
      {/* 1. Overview Stat Cards */}
      <div className="flex flex-col gap-6">
        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center text-lg shrink-0">
              <BookOutlined />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Enrolled</p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {totalCount}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
              <ClockCircleOutlined />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">In Progress</p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {activeCount}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
              <CheckCircleOutlined />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Completed</p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {completedCount}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
              <TrophyOutlined />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Avg Completion</p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {avgProgress}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content & Sidebar Grid */}
      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Left Column (2/3): Controls, Course Cards & Pagination */}
        <div className="lg:w-2/3 flex flex-col gap-5">
          {/* Controls: Tabs, Search & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[var(--border)] shadow-2xs">
            {/* Functional Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  activeTab === "all"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                All Courses ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  activeTab === "active"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                In Progress ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("completed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  activeTab === "completed"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2">
              {/* Real-time Search */}
              <div className="relative flex-1 sm:w-48 flex items-center bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl px-2.5 py-1 focus-within:border-[var(--primary)] transition-all">
                <SearchOutlined className="text-slate-400 text-xs mr-2 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Filter courses..."
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-slate-400 focus:outline-hidden"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer ml-1"
                  >
                    <CloseCircleFilled />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)] text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="recent">Recently Enrolled</option>
                <option value="progress_desc">Highest Progress</option>
                <option value="progress_asc">Lowest Progress</option>
                <option value="name_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="flex flex-col gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : paginatedCourses.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {paginatedCourses.map((item) => (
                <MyCoursesCard {...item} key={item?.course_id} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-10 rounded-2xl bg-white border border-[var(--border)] text-center shadow-2xs flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--primary)] flex items-center justify-center text-2xl">
                {activeTab === "completed" ? (
                  <TrophyOutlined />
                ) : (
                  <BookOutlined />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {search
                    ? `No courses matching "${search}"`
                    : activeTab === "completed"
                    ? "No Completed Courses Yet"
                    : activeTab === "active"
                    ? "No Courses Currently In Progress"
                    : "You Haven't Enrolled in Any Courses Yet"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  {search
                    ? "Try adjusting your search terms or clearing the filter to find your courses."
                    : activeTab === "completed"
                    ? "Complete all lessons and quizzes in your enrolled courses to earn verified certificates."
                    : activeTab === "active"
                    ? "All your enrolled courses are completed! Find new courses to continue expanding your skills."
                    : "Browse our extensive catalog of accredited courses to kickstart your learning path."}
                </p>
              </div>

              {search ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ReloadOutlined />
                  <span>Clear Search Filter</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push(RoutePaths.MyExplore)}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CompassOutlined />
                  <span>Explore Course Catalog</span>
                </button>
              )}
            </div>
          )}

          {/* 3. Proper Paginated Data Bar */}
          {filteredCourses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Showing{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {Math.min(page * limit, filteredCourses.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {filteredCourses.length}
                </span>{" "}
                courses
              </p>

              {filteredCourses.length > limit ? (
                <div className="flex justify-center">
                  <Pagination
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    total={filteredCourses.length}
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

        {/* Right Sidebar Column (1/3): Live Classes & Certificate Banner */}
        <div className="lg:w-1/3 flex flex-col gap-5">
          {/* Live Classes Card */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--border)] shadow-2xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 flex items-center gap-2 tracking-tight">
              <Image alt="live" src={Live} width={20} height={20} className="shrink-0" />
              Live Interactive Classes
            </h2>

            <div className="flex flex-col divide-y divide-[var(--border)]">
              {liveLessons.map((lesson, index) => (
                <div
                  key={index}
                  className="py-3 flex justify-between items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {lesson.title}
                    </h3>
                    {lesson.isLiveNow ? (
                      <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                        Live Now • Starts at {lesson.startAt}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1">
                          <ClockWheelIcon />
                          <span>{lesson.date}</span>
                        </div>
                        <span>•</span>
                        <span>{lesson.time}</span>
                      </div>
                    )}
                  </div>
                  {lesson.isLiveNow && (
                    <CommonButton
                      text="Join"
                      className="!bg-[var(--error)] hover:!bg-red-700 !text-white !h-7 !text-xs !px-3 !rounded-lg shrink-0 shadow-2xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Quick Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 shadow-2xs flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-base">
              <TrophyOutlined />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Earn Course Certificates
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Complete 100% of course lessons, tests, and quizzes to earn verified certificates you can share and download.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(RoutePaths.MyCertificate)}
              className="mt-1 w-full py-2 rounded-xl bg-white hover:bg-blue-50 text-[var(--primary)] border border-blue-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs text-center"
            >
              View My Certificates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;

