"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FileTextOutlined,
  BookOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SearchOutlined,
  TableOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  RightOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

import { getAllCoursesApi, getAssignmentsByCourseApi } from "@/services/collections";
import { toast } from "@/utils/toast";
import CustomDropdown from "@/components/CustomDropdown";
import { getImageUrl, isValidUrl } from "@/utils/comman";

export interface CourseAssignmentRow {
  course_id: string;
  course_name: string;
  course_image_url: string | null;
  batches: number;
  batchList: { _id: string; batchName: string }[];
  enrolled_user_count: number;
  totalAssignments: number;
  lastAssignmentDate: string | null;
}

interface BatchSelectModalProps {
  open: boolean;
  course: CourseAssignmentRow | null;
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
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {course.batchList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No batches available for this course.
            </div>
          ) : (
            course.batchList.map((batch) => {
              const isSelected = selectedBatch === batch._id;
              return (
                <div
                  key={batch._id}
                  onClick={() => setSelectedBatch(batch._id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#315CFF] bg-[#315CFF]/5 shadow-xs"
                      : "border-[#E4E7EC] hover:border-slate-300 hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "border-[#315CFF]" : "border-[#D0D5DD]"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#315CFF]" />}
                    </div>
                    <span className="font-semibold text-sm text-[#101828] truncate">
                      {batch.batchName}
                    </span>
                  </div>
                  <span className="text-xs text-[#667085] font-medium">Batch</span>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2F4F7]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#475467] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
            className="px-5 py-2 text-sm font-semibold text-white bg-[#315CFF] hover:bg-[#2547D0] rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            View Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

interface AssignmentsManagerViewProps {
  basePath: string; // e.g. RoutePaths.Assignments or RoutePaths.TeacherAssignments
}

const AssignmentsManagerView: React.FC<AssignmentsManagerViewProps> = ({ basePath }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseAssignmentRow[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseAssignmentRow | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      interface ApiBatchItem {
        _id: string;
        batchName: string;
      }
      interface ApiCourseItem {
        course_id: string;
        course_name: string;
        course_image_url: string | null;
        batch?: ApiBatchItem[];
        enrolled_user_count?: number;
      }

      const res = await getAllCoursesApi(params);
      if (res?.status) {
        const list = (res.data?.course_list || []) as ApiCourseItem[];
        const enriched: CourseAssignmentRow[] = await Promise.all(
          list.map(async (c: ApiCourseItem) => {
            let totalAssignments = 0;
            let lastAssignmentDate: string | null = null;
            try {
              const aRes = await getAssignmentsByCourseApi(c.course_id);
              if (aRes?.status) {
                totalAssignments = aRes.data?.totalAssignments || 0;
                lastAssignmentDate = aRes.data?.lastAssignmentDate || null;
              }
            } catch (_) {}
            return {
              course_id: c.course_id,
              course_name: c.course_name,
              course_image_url: c.course_image_url,
              batches: c.batch?.length || 0,
              batchList: (c.batch || []).map((b: ApiBatchItem) => ({
                _id: b._id,
                batchName: b.batchName,
              })),
              enrolled_user_count: c.enrolled_user_count || 0,
              totalAssignments,
              lastAssignmentDate,
            };
          })
        );
        setCourses(enriched);
        setTotal(res.data?.total_courses || 0);
      }
    } catch (err) {
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
    setOpenModal(false);
    router.push(
      `${basePath}/batch-details?course_id=${courseId}&batch_id=${batchId}`
    );
  };

  // Filtered rows
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (filterType === "with_assignments") return c.totalAssignments > 0;
      if (filterType === "no_assignments") return c.totalAssignments === 0;
      return true;
    });
  }, [courses, filterType]);

  // Aggregate KPI stats
  const stats = useMemo(() => {
    const totalAssignments = courses.reduce((acc, c) => acc + (c.totalAssignments || 0), 0);
    const activeCourses = courses.length;
    const totalStudents = courses.reduce((acc, c) => acc + (c.enrolled_user_count || 0), 0);
    const totalBatches = courses.reduce((acc, c) => acc + (c.batches || 0), 0);
    return {
      totalAssignments,
      activeCourses,
      totalStudents,
      totalBatches,
    };
  }, [courses]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <BatchSelectModal
        open={openModal}
        course={selectedCourse}
        onClose={() => setOpenModal(false)}
        onSelect={handleBatchSelect}
      />

      <div className="space-y-6">
        {/* TOP 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Assignments */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Total Assignments
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : stats.totalAssignments}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <ArrowUpOutlined className="text-[10px]" />
                <span>Across all cohorts</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl shrink-0">
              <FileTextOutlined />
            </div>
          </div>

          {/* Active Courses */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Active Courses
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : stats.activeCourses}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#315CFF] font-medium">
                <CheckCircleFilled className="text-[10px]" />
                <span>Published courses</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#315CFF]/10 flex items-center justify-center text-[#315CFF] text-xl shrink-0">
              <BookOutlined />
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Enrolled Students
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : stats.totalStudents}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <ArrowUpOutlined className="text-[10px]" />
                <span>Active learners</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl shrink-0">
              <TeamOutlined />
            </div>
          </div>

          {/* Cohorts / Batches */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Active Batches
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#101828]">
                {loading ? "..." : stats.totalBatches}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                <CheckCircleFilled className="text-[10px]" />
                <span>Cohort groups</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl shrink-0">
              <AppstoreOutlined />
            </div>
          </div>
        </div>

        {/* MAIN DATA SECTION */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden">
          {/* TOOLBAR HEADER */}
          <div className="p-5 border-b border-[#F2F4F7] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-[#101828]">All Courses</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2F4F7] text-[#475467]">
                {total} courses
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[220px] sm:min-w-[260px]">
                <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by course..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-[#E4E7EC] rounded-xl text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#315CFF] focus:ring-2 focus:ring-[#315CFF]/10 transition-all"
                />
              </div>

              {/* Status Filter CustomDropdown */}
              <CustomDropdown
                value={filterType}
                onChange={(val) => setFilterType(val)}
                options={[
                  { label: "All Courses", value: "all" },
                  { label: "With Assignments", value: "with_assignments" },
                  { label: "No Assignments", value: "no_assignments" },
                ]}
                placeholder="Filter Status"
                className="w-[170px]"
              />

              {/* View Mode Switcher */}
              <div className="flex items-center bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  <TableOutlined />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  <AppstoreOutlined />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT: TABLE OR CARDS */}
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-slate-100 animate-pulse w-full"
                />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                <FileTextOutlined />
              </div>
              <h4 className="text-base font-bold text-[#101828]">No courses found</h4>
              <p className="text-sm text-[#667085] mt-1 max-w-sm mx-auto">
                {search
                  ? "Try refining your search keyword or reset filters to see results."
                  : "No courses or assignments have been created yet."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className={`${viewMode === "table" ? "block" : "hidden"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-xs font-bold text-[#475467] uppercase tracking-wider">
                        <th className="py-3.5 px-5">Course</th>
                        <th className="py-3.5 px-4 text-center">Batches</th>
                        <th className="py-3.5 px-4 text-center">Enrolled Students</th>
                        <th className="py-3.5 px-4 text-center">Assignments</th>
                        <th className="py-3.5 px-4">Last Assignment Date</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4F7] text-sm">
                      {filteredCourses.map((course) => (
                        <tr
                          key={course.course_id}
                          onClick={() => {
                            setSelectedCourse(course);
                            setOpenModal(true);
                          }}
                          className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3.5 min-w-[240px]">
                              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#E4E7EC]">
                                {course.course_image_url &&
                                isValidUrl(getImageUrl(course.course_image_url)) ? (
                                  <Image
                                    src={getImageUrl(course.course_image_url)}
                                    alt="Course"
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <BookOutlined className="text-base" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors line-clamp-1">
                                  {course.course_name}
                                </span>
                                <span className="text-xs text-[#667085]">
                                  ID: {course.course_id.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                              {course.batches} {course.batches === 1 ? "Batch" : "Batches"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center font-semibold text-[#101828]">
                            {course.enrolled_user_count}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                course.totalAssignments > 0
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {course.totalAssignments}{" "}
                              {course.totalAssignments === 1 ? "Assignment" : "Assignments"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-[#667085] text-xs">
                            {course.lastAssignmentDate ? (
                              <div className="flex items-center gap-1.5">
                                <CalendarOutlined className="text-[#98A2B3]" />
                                <span>{course.lastAssignmentDate}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourse(course);
                                setOpenModal(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] group-hover:bg-[#315CFF] text-[#475467] group-hover:text-white text-xs font-semibold border border-[#E4E7EC] group-hover:border-[#315CFF] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span>View Batches</span>
                              <RightOutlined className="text-[10px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARDS / MOBILE VIEW */}
              <div
                className={`${
                  viewMode === "cards" ? "block" : "lg:hidden"
                } p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}
              >
                {filteredCourses.map((course) => (
                  <div
                    key={course.course_id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setOpenModal(true);
                    }}
                    className="bg-white rounded-xl border border-[#E4E7EC] p-4 flex flex-col justify-between gap-4 hover:shadow-md hover:border-[#315CFF]/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#E4E7EC]">
                        {course.course_image_url &&
                        isValidUrl(getImageUrl(course.course_image_url)) ? (
                          <Image
                            src={getImageUrl(course.course_image_url)}
                            alt="Course"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <BookOutlined className="text-lg" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-[#101828] group-hover:text-[#315CFF] transition-colors line-clamp-1">
                          {course.course_name}
                        </h4>
                        <p className="text-xs text-[#667085] mt-0.5">
                          ID: {course.course_id.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F2F4F7] text-center">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-[#667085] uppercase tracking-wider font-semibold">
                          Batches
                        </p>
                        <p className="font-bold text-xs text-[#101828]">{course.batches}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-[#667085] uppercase tracking-wider font-semibold">
                          Students
                        </p>
                        <p className="font-bold text-xs text-[#101828]">
                          {course.enrolled_user_count}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-[#667085] uppercase tracking-wider font-semibold">
                          Assignments
                        </p>
                        <p className="font-bold text-xs text-[#101828]">
                          {course.totalAssignments}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#667085]">
                      <span>
                        Last: {course.lastAssignmentDate ? course.lastAssignmentDate : "—"}
                      </span>
                      <span className="text-[#315CFF] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Select Batch <RightOutlined className="text-[9px]" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODERN CENTERED PAGINATION */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[#F2F4F7] flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-[#475467] hover:bg-slate-100 border border-[#E4E7EC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

export default AssignmentsManagerView;
