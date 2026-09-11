"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  QuestionCircleOutlined,
  BookOutlined,
  TeamOutlined,
  RiseOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  RightOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

import { getAllCoursesApi, getQuizzesByCourseApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import CustomDropdown from "@/components/CustomDropdown";
import { Fallback } from "@/utils/images";
import { getImageUrl, isValidUrl } from "@/utils/comman";

export interface CourseQuizRow {
  course_id: string;
  course_name: string;
  course_image_url: string | null;
  batches: number;
  batchList: { _id: string; batchName: string }[];
  enrolled_user_count: number;
  totalQuizzes: number;
  lastQuizDate: string | null;
}

interface BatchSelectModalProps {
  open: boolean;
  course: CourseQuizRow | null;
  onClose: () => void;
  onSelect: (batchId: string, batchName: string, courseId: string, courseName: string) => void;
}

const BatchSelectModal: React.FC<BatchSelectModalProps> = ({
  open,
  course,
  onClose,
  onSelect,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setSelectedBatch(null);
  }, [open]);

  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 shadow-2xl border border-[#E4E7EC]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
          <h2 className="text-lg font-bold text-[#101828]">Select Cohort / Batch</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Course Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
            {course.course_image_url && isValidUrl(getImageUrl(course.course_image_url)) ? (
              <Image
                src={getImageUrl(course.course_image_url)}
                alt="Course"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                <BookOutlined />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-[#101828] truncate">
              {course.course_name}
            </span>
            <span className="text-xs text-[#667085]">
              {course.batches} {course.batches === 1 ? "batch" : "batches"} available
            </span>
          </div>
        </div>

        {/* Batch List */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {course.batchList.length === 0 ? (
            <div className="text-center text-[#667085] text-xs py-8">
              No batches found for this course.
            </div>
          ) : (
            course.batchList.map((batch) => {
              const isSelected = selectedBatch === batch._id;
              return (
                <div
                  key={batch._id}
                  onClick={() => setSelectedBatch(batch._id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#315CFF] bg-blue-50/60 shadow-xs"
                      : "border-[#E4E7EC] hover:bg-[#F8FAFC] hover:border-slate-300"
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-semibold ${isSelected ? "text-[#315CFF]" : "text-[#101828]"}`}>
                    {batch.batchName}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "border-[#315CFF] bg-[#315CFF]" : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E4E7EC] text-xs font-semibold text-[#475467] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedBatch}
            onClick={() => {
              if (!selectedBatch) return;
              const batch = course.batchList.find((b) => b._id === selectedBatch);
              onSelect(
                selectedBatch,
                batch?.batchName || "",
                course.course_id,
                course.course_name
              );
            }}
            className="px-5 py-2 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
          >
            Continue to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

interface QuizzesManagerViewProps {
  basePath: string; // e.g. "/quizzes" or "/teacher/quizzes"
}

export const QuizzesManagerView: React.FC<QuizzesManagerViewProps> = ({
  basePath,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseQuizRow[]>([]);

  // Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseQuizRow | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);

      const res = await getAllCoursesApi(params);
      if (res?.status) {
        const list = (res.data?.course_list || []) as any[];
        const enriched: CourseQuizRow[] = await Promise.all(
          list.map(async (c: any) => {
            let totalQuizzes = 0;
            let lastQuizDate: string | null = null;
            try {
              const qRes = await getQuizzesByCourseApi(c.course_id);
              if (qRes?.status) {
                totalQuizzes = qRes.data?.totalQuizzes || 0;
                lastQuizDate = qRes.data?.lastQuizDate || null;
              }
            } catch (_) {}

            return {
              course_id: c.course_id,
              course_name: c.course_name,
              course_image_url: c.course_image_url,
              batches: c.batch?.length || 0,
              batchList: (c.batch || []).map((b: any) => ({
                _id: b._id,
                batchName: b.batchName,
              })),
              enrolled_user_count: c.enrolled_user_count || 0,
              totalQuizzes,
              lastQuizDate,
            };
          })
        );
        setCourses(enriched);
        setTotal(res.data?.total_courses || 0);
      }
    } catch (err) {
      console.error("Failed to load quiz courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    const t = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const handleBatchSelect = (
    batchId: string,
    _batchName: string,
    courseId: string,
    _courseName: string
  ) => {
    setBatchModalOpen(false);
    router.push(
      `${basePath}/batch-details?course_id=${courseId}&batch_id=${batchId}`
    );
  };

  const handleCourseClick = (course: CourseQuizRow) => {
    if (course.batchList.length === 1) {
      router.push(
        `${basePath}/batch-details?course_id=${course.course_id}&batch_id=${course.batchList[0]._id}`
      );
    } else {
      setSelectedCourse(course);
      setBatchModalOpen(true);
    }
  };

  // KPI Calculations
  const totalQuizzesCount = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.totalQuizzes || 0), 0);
  }, [courses]);

  const totalEnrolled = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.enrolled_user_count || 0), 0);
  }, [courses]);

  const kpis = [
    {
      title: "Total Quizzes",
      value: totalQuizzesCount,
      delta: "+16%",
      deltaType: "positive" as const,
      period: "vs. last month",
      icon: <QuestionCircleOutlined className="text-lg" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
    },
    {
      title: "Active Courses",
      value: total || courses.length,
      delta: "+4%",
      deltaType: "positive" as const,
      period: "active catalog",
      icon: <BookOutlined className="text-lg" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Participating Students",
      value: totalEnrolled,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last month",
      icon: <TeamOutlined className="text-lg" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Average Score",
      value: "82%",
      delta: "+5%",
      deltaType: "positive" as const,
      period: "vs. last month",
      icon: <RiseOutlined className="text-lg" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <>
      <BatchSelectModal
        open={batchModalOpen}
        course={selectedCourse}
        onClose={() => setBatchModalOpen(false)}
        onSelect={handleBatchSelect}
      />

      <div className="w-full flex flex-col gap-6 pb-12 animate-fadeIn">
        {/* 1. 4 Top KPI Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {kpis.map((card, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#E4E7EC] shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${card.colorClass}`}
                >
                  {card.icon}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#475467] tracking-tight">
                  {card.title}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      card.deltaType === "positive"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <ArrowUpOutlined className="text-[9px]" />
                    {card.delta}
                  </span>
                  <span className="text-[11px] text-[#667085] hidden xl:inline-block">
                    {card.period}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Main Quizzes Container */}
        <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden flex flex-col">
          {/* Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-[#F2F4F7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Title & Count Badge */}
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
                All Quizzes by Course
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475467] border border-[#E4E7EC]">
                {total} {total === 1 ? "course" : "courses"}
              </span>
            </div>

            {/* Right: Search, Filter, View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex items-center min-w-[190px] sm:min-w-[220px]">
                <SearchOutlined className="absolute left-3 text-[#98A2B3] text-sm pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search courses..."
                  className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#315CFF] transition-all shadow-xs"
                />
              </div>

              {/* Custom Status Dropdown */}
              <CustomDropdown
                value={batchFilter}
                onChange={(val) => setBatchFilter(val)}
                options={[
                  { label: "All Courses", value: "all" },
                  { label: "Active Cohorts", value: "active" },
                ]}
              />

              {/* View Mode Toggle: Auto / Table / Cards */}
              <div className="flex items-center bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                  title="Table View"
                >
                  <TableOutlined className="text-xs" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                  title="Cards View"
                >
                  <AppstoreOutlined className="text-xs" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#315CFF] border-t-transparent animate-spin" />
              <p className="text-xs sm:text-sm text-[#667085]">Loading quizzes...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#315CFF]">
                <QuestionCircleOutlined className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-[#101828]">No quiz courses found</h3>
              <p className="text-xs sm:text-sm text-[#667085] max-w-sm">
                Courses with registered quizzes or batches will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Large Screen Table View */}
              <div
                className={`overflow-x-auto ${
                  viewMode === "cards"
                    ? "hidden"
                    : viewMode === "table"
                    ? "block"
                    : "hidden lg:block"
                }`}
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                      <th className="py-3 px-5 w-16">S.NO</th>
                      <th className="py-3 px-5">Course Title</th>
                      <th className="py-3 px-4 text-center">Batches</th>
                      <th className="py-3 px-4 text-center">Enrolled Students</th>
                      <th className="py-3 px-4 text-center">Total Quizzes</th>
                      <th className="py-3 px-4">Last Quiz Date</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {courses.map((course, index) => {
                      const sNo = (page - 1) * limit + index + 1;
                      const imgUrl =
                        course.course_image_url &&
                        isValidUrl(getImageUrl(course.course_image_url))
                          ? getImageUrl(course.course_image_url)
                          : Fallback;

                      return (
                        <tr
                          key={course.course_id}
                          onClick={() => handleCourseClick(course)}
                          className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-5 text-xs text-[#667085] font-medium">
                            {sNo}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-[#E4E7EC] shrink-0">
                                <Image
                                  src={imgUrl}
                                  alt="Course"
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                                {course.course_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {course.batches} {course.batches === 1 ? "Batch" : "Batches"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-medium text-[#475467]">
                              {course.enrolled_user_count}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#315CFF] border border-blue-100">
                              <QuestionCircleOutlined className="text-xs" />
                              <span>{course.totalQuizzes}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                            {course.lastQuizDate || "—"}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCourseClick(course);
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-[#E4E7EC] hover:border-blue-200 text-[#315CFF] hover:bg-blue-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>Manage Quizzes</span>
                              <RightOutlined className="text-[10px]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Small Screen Cards View */}
              <div
                className={`p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                  viewMode === "table"
                    ? "hidden"
                    : viewMode === "cards"
                    ? "grid"
                    : "grid lg:hidden"
                }`}
              >
                {courses.map((course) => {
                  const imgUrl =
                    course.course_image_url &&
                    isValidUrl(getImageUrl(course.course_image_url))
                      ? getImageUrl(course.course_image_url)
                      : Fallback;

                  return (
                    <div
                      key={course.course_id}
                      onClick={() => handleCourseClick(course)}
                      className="p-4 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#315CFF]/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-[#E4E7EC] shrink-0">
                          <Image
                            src={imgUrl}
                            alt="Course"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                            {course.course_name}
                          </span>
                          <span className="text-xs text-[#667085]">
                            {course.batches} {course.batches === 1 ? "Batch" : "Batches"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F2F4F7] text-center text-xs">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#667085]">Students</span>
                          <span className="font-bold text-[#101828] mt-0.5">
                            {course.enrolled_user_count}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#667085]">Quizzes</span>
                          <span className="font-bold text-[#315CFF] mt-0.5">
                            {course.totalQuizzes}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#667085]">Last Active</span>
                          <span className="font-semibold text-slate-700 mt-0.5 truncate text-[11px]">
                            {course.lastQuizDate || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F2F4F7] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#315CFF] flex items-center gap-1 group-hover:underline">
                          <span>View Cohort Quizzes</span>
                          <RightOutlined className="text-[10px]" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Centered Pagination (< 1 2 3 >) */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[#F2F4F7] flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                    .map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                          page === p
                            ? "bg-[#315CFF] text-white shadow-xs"
                            : "bg-white text-[#475467] hover:bg-[#F8FAFC] border border-[#E4E7EC]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizzesManagerView;
