"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TeamOutlined,
  CheckCircleFilled,
  BookOutlined,
  RiseOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  MailOutlined,
  ApartmentOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import { getAllCoursesApi, getStudentsListApi } from "@/services/collections";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";

interface BatchItem {
  _id: string;
  batchName: string;
}

interface CourseItem {
  _id: string;
  course_name: string;
  batch?: BatchItem[];
}

interface StudentRow {
  key: string;
  name: string;
  email: string;
  status: string;
  avatar?: string;
  courseName?: string;
  batchName?: string;
}

interface StudentsManagerViewProps {
  detailsPathPrefix: string; // e.g. "/students" or "/teacher/students"
  roleName?: string;
}

export const StudentsManagerView: React.FC<StudentsManagerViewProps> = ({
  detailsPathPrefix,
  roleName = "Instructor",
}) => {
  const router = useRouter();

  // State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Course and Batch Filters
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Courses for filtering dropdown
  useEffect(() => {
    getAllCoursesApi()
      .then((res) => {
        if (res?.status) {
          const courseList = (res.data?.course_list || []) as {
            course_id: string;
            course_name: string;
            batch?: BatchItem[];
          }[];
          setCourses(
            courseList.map((c) => ({
              _id: c.course_id,
              course_name: c.course_name,
              batch: c.batch,
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching courses for filter:", err));
  }, []);

  // When course filter changes, update batches
  const handleCourseFilterChange = (courseId: string) => {
    setSelectedCourseFilter(courseId);
    setSelectedBatchFilter("");
    setPage(1);
    if (courseId) {
      const c = courses.find((course) => course._id === courseId);
      setBatches(c?.batch || []);
    } else {
      setBatches([]);
    }
  };

  // Fetch students list
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedCourseFilter) params.append("courseId", selectedCourseFilter);
      if (selectedBatchFilter) params.append("batchId", selectedBatchFilter);

      const res = await getStudentsListApi(params);
      if (res && res.status) {
        const selectedCourseObj = courses.find((c) => c._id === selectedCourseFilter);
        const selectedBatchObj = batches.find((b) => b._id === selectedBatchFilter);

        const mapped = ((res.data || []) as {
          student_id: string;
          name: string;
          email: string;
          avatar?: string;
          status?: string;
        }[]).map((s) => ({
          key: s.student_id,
          name: s.name,
          email: s.email,
          status: s.status || "Active",
          avatar: s.avatar,
          courseName: selectedCourseObj?.course_name,
          batchName: selectedBatchObj?.batchName,
        }));
        setStudents(mapped);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students list:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCourseFilter, selectedBatchFilter, courses, batches]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Client-side status filter
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (statusFilter === "all") return true;
      const st = (student.status || "").toLowerCase();
      if (statusFilter === "active") {
        return st === "active" || st === "enrolled";
      }
      return st === "inactive" || st === "completed" || st === "dropped";
    });
  }, [students, statusFilter]);

  // Pagination calculations
  const total = filteredStudents.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredStudents.slice(start, start + limit);
  }, [filteredStudents, page, limit]);

  // Navigate to student details
  const handleStudentClick = (studentId: string) => {
    router.push(`${detailsPathPrefix}/student-details?id=${studentId}`);
  };

  // KPI statistics
  const activeLearnersCount = useMemo(() => {
    return students.filter((s) => (s.status || "").toLowerCase() === "active").length;
  }, [students]);

  const kpis = [
    {
      title: "Total Students",
      value: students.length,
      delta: "+18%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <TeamOutlined className="text-lg" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
    },
    {
      title: "Active Learners",
      value: activeLearnersCount,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <CheckCircleFilled className="text-lg" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Active Batches",
      value: batches.length > 0 ? batches.length : 8,
      delta: "+4%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <ApartmentOutlined className="text-lg" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Avg. Completion",
      value: "84%",
      delta: "+5%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <RiseOutlined className="text-lg" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* 1. Header Row: Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-col gap-1">
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Monitor student enrollment, course progress, batch assignments, and performance across all classes.
          </p>
        </div>
      </div>

      {/* 2. 4 KPI Statistics Cards */}
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

      {/* 3. Main Students Container */}
      <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-[#F2F4F7] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Section Title & Count Badge */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
              All Students
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475467] border border-[#E4E7EC]">
              {total} {total === 1 ? "student" : "students"}
            </span>
          </div>

          {/* Right: Search, Filter Dropdowns, and View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex items-center min-w-[190px] sm:min-w-[220px]">
              <SearchOutlined className="absolute left-3 text-[#98A2B3] text-sm pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#315CFF] transition-all shadow-xs"
              />
            </div>

            {/* Course Filter Dropdown */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className="h-9 px-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#475467] font-medium focus:outline-none focus:border-[#315CFF] transition-all shadow-xs cursor-pointer max-w-[170px] truncate"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.course_name}
                </option>
              ))}
            </select>

            {/* Batch Filter Dropdown */}
            <select
              value={selectedBatchFilter}
              onChange={(e) => {
                setSelectedBatchFilter(e.target.value);
                setPage(1);
              }}
              disabled={!selectedCourseFilter || batches.length === 0}
              className="h-9 px-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#475467] font-medium focus:outline-none focus:border-[#315CFF] transition-all shadow-xs cursor-pointer max-w-[150px] truncate disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.batchName}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-9 px-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#475467] font-medium focus:outline-none focus:border-[#315CFF] transition-all shadow-xs cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* View Mode Switcher */}
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

        {/* Content Body */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#315CFF] border-t-transparent animate-spin" />
            <p className="text-xs sm:text-sm text-[#667085]">Loading students...</p>
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#315CFF]">
              <TeamOutlined className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">No students found</h3>
            <p className="text-xs sm:text-sm text-[#667085] max-w-sm">
              {search || selectedCourseFilter || selectedBatchFilter
                ? "Try clearing your search query or selecting a different course/batch."
                : "No student enrollment records were found in this cohort."}
            </p>
          </div>
        ) : (
          <>
            {/* 3A. Large-Screen Modern Table View */}
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
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Cohort / Course</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {paginatedStudents.map((record, index) => {
                    const sNo = (page - 1) * limit + index + 1;
                    const isActive = (record.status || "").toLowerCase() === "active";

                    return (
                      <tr
                        key={record.key || index}
                        className="hover:bg-[#F8FAFC] transition-colors group"
                      >
                        {/* S.NO */}
                        <td className="py-3.5 px-5 text-xs text-[#667085] font-medium">
                          {sNo}
                        </td>

                        {/* Student Name & Avatar */}
                        <td className="py-3.5 px-5">
                          <div
                            onClick={() => handleStudentClick(record.key)}
                            className="flex items-center gap-3 cursor-pointer min-w-[200px]"
                          >
                            <UserAvatarDisplay
                              showNameNextToAvatar={false}
                              user={{
                                name: record.name,
                                image: record.avatar,
                              }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                                {record.name || "Student"}
                              </span>
                              <span className="text-[11px] text-[#667085] truncate">
                                {record.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MailOutlined className="text-xs text-[#98A2B3]" />
                            <span>{record.email || "—"}</span>
                          </div>
                        </td>

                        {/* Cohort / Course */}
                        <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {record.batchName || record.courseName || "General Cohort"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            <span className="capitalize">{record.status}</span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleStudentClick(record.key)}
                            className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:border-blue-200 text-[#315CFF] hover:bg-blue-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <EyeOutlined className="text-xs" />
                            <span>View Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3B. Responsive Mobile / Small Screen Cards View */}
            <div
              className={`p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 ${
                viewMode === "table"
                  ? "hidden"
                  : viewMode === "cards"
                  ? "grid"
                  : "grid lg:hidden"
              }`}
            >
              {paginatedStudents.map((record, index) => {
                const isActive = (record.status || "").toLowerCase() === "active";

                return (
                  <div
                    key={record.key || index}
                    className="p-4 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#315CFF]/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                  >
                    {/* Top: Avatar, Name, Email, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => handleStudentClick(record.key)}
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                      >
                        <UserAvatarDisplay
                          showNameNextToAvatar={false}
                          user={{
                            name: record.name,
                            image: record.avatar,
                          }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                            {record.name || "Student"}
                          </span>
                          <span className="text-xs text-[#667085] truncate">
                            {record.email}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        <span className="capitalize">{record.status}</span>
                      </span>
                    </div>

                    {/* Middle: Details */}
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F2F4F7] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#667085]">Enrolled In</span>
                      <span className="font-semibold text-[#101828] truncate">
                        {record.batchName || record.courseName || "General Cohort"}
                      </span>
                    </div>

                    {/* Bottom: View Profile CTA */}
                    <div className="pt-2 border-t border-[#F2F4F7] flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleStudentClick(record.key)}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-blue-50 border border-[#E4E7EC] hover:border-blue-200 text-[#315CFF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <EyeOutlined className="text-xs" />
                        <span>View Profile</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3C. Centered Modern Pagination (< 1 2 3 >) */}
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
  );
};

export default StudentsManagerView;
