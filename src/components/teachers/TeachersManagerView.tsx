"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  TeamOutlined,
  CheckCircleFilled,
  BookOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DeleteFilled,
  DeleteOutlined,
  MessageOutlined,
  StopOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  MailOutlined,
} from "@ant-design/icons";

import { setInstructorData } from "@/redux/slices/TeacherDataSlice";
import { deleteInstructor, getAllInstructor } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { InstructorRecord } from "@/utils/interface";
import { toast } from "@/utils/toast";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import { InviteTeacherModal } from "@/components/modal/InviteTeacherModal";
import UserAvatarDisplay from "@/components/UserAvatarDisplay";

export const TeachersManagerView: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState<InstructorRecord[]>([]);

  // Modals
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteInstructorId, setDeleteInstructorId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch teachers
  const fetchAllTeacher = useCallback(async () => {
    setLoading(true);
    const param = new URLSearchParams();
    param.append("limit", String(limit));
    param.append("page", String(page));
    if (debouncedSearch) {
      param.append("search", debouncedSearch);
    }
    try {
      const res = await getAllInstructor(param);
      if (res?.status) {
        setTeacherData(res?.data?.instructors || []);
        setTotal(res?.data?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchAllTeacher();
  }, [fetchAllTeacher]);

  // Filter teachers by status client-side if statusFilter is active
  const filteredTeachers = useMemo(() => {
    return teacherData.filter((teacher) => {
      if (statusFilter === "all") return true;
      const st = (teacher.status || "").toLowerCase();
      if (statusFilter === "active") {
        return st === "active" || st === "publish" || st === "accepted";
      }
      return st === "inactive" || st === "cancelled" || st === "disabled";
    });
  }, [teacherData, statusFilter]);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteInstructorId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteInstructor(deleteInstructorId);
      if (res?.status) {
        toast.success(res.message || "Teacher deleted successfully");
        setDeleteModalVisible(false);
        setDeleteInstructorId(null);
        fetchAllTeacher();
      } else {
        toast.warning(res?.message || "Failed to delete teacher");
      }
    } catch (error) {
      console.error("Delete teacher error:", error);
      toast.error("Failed to delete teacher");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Navigate to teacher details
  const handleTeacherClick = (record: InstructorRecord) => {
    dispatch(setInstructorData(record));
    router.push(`${RoutePaths.Teachers}/teacher-details`);
  };

  // Dynamic KPI Stats
  const activeCount = useMemo(() => {
    return teacherData.filter((t) => (t.status || "").toLowerCase() === "active").length;
  }, [teacherData]);

  const totalAssignedCourses = useMemo(() => {
    return teacherData.reduce((acc, t: any) => acc + (Number(t.no_of_courses) || 0), 0);
  }, [teacherData]);

  const kpis = [
    {
      title: "Total Faculty",
      value: total || teacherData.length,
      delta: "+8%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <TeamOutlined className="text-lg" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
    },
    {
      title: "Active Teachers",
      value: activeCount,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <CheckCircleFilled className="text-lg" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Assigned Courses",
      value: totalAssignedCourses,
      delta: "+15%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <BookOutlined className="text-lg" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Pending / Invited",
      value: Math.max(0, (total || teacherData.length) - activeCount),
      delta: "0%",
      deltaType: "neutral" as const,
      period: "vs. last 30 days",
      icon: <ClockCircleOutlined className="text-lg" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <ConfirmationModal
          open={deleteModalVisible}
          onCancel={() => {
            setDeleteModalVisible(false);
            setDeleteInstructorId(null);
          }}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete Teacher"
          description="Are you sure you want to remove this teacher from the faculty? This action cannot be undone."
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-3xl text-white" />}
        />
      )}

      {/* Invite Teacher Modal */}
      <InviteTeacherModal
        open={openInviteModal}
        fetchAllTeacher={fetchAllTeacher}
        onCancel={() => setOpenInviteModal(false)}
      />

      <div className="w-full flex flex-col gap-6 pb-12 animate-fadeIn">
        {/* 1. Header Row: Subtitle + Primary CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="flex flex-col gap-1">
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Manage faculty members, track course assignments, view qualifications, and invite new instructors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpenInviteModal(true)}
            className="self-start sm:self-auto px-4 sm:px-5 py-2.5 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_2px_8px_rgba(49,92,255,0.25)] transition-all cursor-pointer shrink-0"
          >
            <PlusOutlined className="text-xs" />
            <span>Invite Teacher</span>
          </button>
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
                  {card.value.toLocaleString()}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      card.deltaType === "positive"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {card.deltaType === "positive" && (
                      <ArrowUpOutlined className="text-[9px]" />
                    )}
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

        {/* 3. Main Data Container */}
        <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden flex flex-col">
          {/* Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-[#F2F4F7] flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Section Title & Count Badge */}
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-[#101828] tracking-tight">
                All Teachers
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475467] border border-[#E4E7EC]">
                {total} {total === 1 ? "teacher" : "teachers"}
              </span>
            </div>

            {/* Right: Search, Filter Dropdown, and View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Instant Search Bar */}
              <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
                <SearchOutlined className="absolute left-3 text-[#98A2B3] text-sm pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teachers by name..."
                  className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#315CFF] transition-all shadow-xs"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#475467] font-medium focus:outline-none focus:border-[#315CFF] transition-all shadow-xs cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

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

          {/* Loading State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#315CFF] border-t-transparent animate-spin" />
              <p className="text-xs sm:text-sm text-[#667085]">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            /* Empty State */
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#315CFF]">
                <TeamOutlined className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-[#101828]">No teachers found</h3>
              <p className="text-xs sm:text-sm text-[#667085] max-w-sm">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search criteria or clearing active filters."
                  : "Start growing your teaching staff by inviting your first teacher."}
              </p>
              {(!search && statusFilter === "all") && (
                <button
                  type="button"
                  onClick={() => setOpenInviteModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs sm:text-sm font-semibold hover:bg-[#254BD1] transition-all cursor-pointer"
                >
                  Invite Teacher
                </button>
              )}
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
                      <th className="py-3 px-5">Teacher</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Qualification</th>
                      <th className="py-3 px-4 text-center">No. of Courses</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {filteredTeachers.map((record, index) => {
                      const sNo = (page - 1) * limit + index + 1;
                      const isActive = (record.status || "").toLowerCase() === "active";

                      return (
                        <tr
                          key={record.instructor_id || record.email || index}
                          className="hover:bg-[#F8FAFC] transition-colors group"
                        >
                          {/* S.NO */}
                          <td className="py-3.5 px-5 text-xs text-[#667085] font-medium">
                            {sNo}
                          </td>

                          {/* Teacher Name & Avatar */}
                          <td className="py-3.5 px-5">
                            <div
                              onClick={() => handleTeacherClick(record)}
                              className="flex items-center gap-3 cursor-pointer min-w-[200px]"
                            >
                              <UserAvatarDisplay
                                showNameNextToAvatar={false}
                                user={{
                                  name: record.name,
                                  image: record.image_url,
                                }}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                                  {record.name || "Unnamed Teacher"}
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

                          {/* Qualification */}
                          <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {record.qualification || "Not Specified"}
                            </span>
                          </td>

                          {/* No. of Courses */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#315CFF] border border-blue-100">
                              <BookOutlined className="text-xs" />
                              <span>{(record as any).no_of_courses ?? 0}</span>
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
                              <span className="capitalize">{record.status || "Inactive"}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleTeacherClick(record)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#315CFF] hover:bg-blue-50 border border-[#E4E7EC] hover:border-blue-200 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <EyeOutlined className="text-sm" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  toast.info(`Starting conversation with ${record.name || "teacher"}`);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-[#E4E7EC] transition-colors cursor-pointer"
                                title="Send Message"
                              >
                                <MessageOutlined className="text-sm" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteInstructorId(record.instructor_id);
                                  setDeleteModalVisible(true);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 border border-[#E4E7EC] hover:border-rose-200 transition-colors cursor-pointer"
                                title="Delete Teacher"
                              >
                                <DeleteOutlined className="text-sm" />
                              </button>
                            </div>
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
                {filteredTeachers.map((record, index) => {
                  const isActive = (record.status || "").toLowerCase() === "active";

                  return (
                    <div
                      key={record.instructor_id || record.email || index}
                      className="p-4 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#315CFF]/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                    >
                      {/* Top: Avatar, Name, Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => handleTeacherClick(record)}
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                        >
                          <UserAvatarDisplay
                            showNameNextToAvatar={false}
                            user={{
                              name: record.name,
                              image: record.image_url,
                            }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                              {record.name || "Unnamed Teacher"}
                            </span>
                            <span className="text-xs text-[#667085] truncate">
                              {record.email}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
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
                          <span className="capitalize">{record.status || "Inactive"}</span>
                        </span>
                      </div>

                      {/* Middle: 2-column details */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F2F4F7] text-xs">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#667085]">Qualification</span>
                          <span className="font-semibold text-[#101828] truncate mt-0.5">
                            {record.qualification || "Not Specified"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#667085]">Assigned Courses</span>
                          <span className="font-semibold text-[#315CFF] truncate mt-0.5">
                            {(record as any).no_of_courses ?? 0} courses
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#F2F4F7]">
                        <button
                          type="button"
                          onClick={() => handleTeacherClick(record)}
                          className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-blue-50 border border-[#E4E7EC] hover:border-blue-200 text-[#315CFF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <EyeOutlined className="text-xs" />
                          <span>View Details</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              toast.info(`Starting conversation with ${record.name || "teacher"}`);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 border border-[#E4E7EC] transition-colors cursor-pointer"
                            title="Chat"
                          >
                            <MessageOutlined className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteInstructorId(record.instructor_id);
                              setDeleteModalVisible(true);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <DeleteOutlined className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3C. Centered Pagination Bar (< 1 2 3 >) */}
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

export default TeachersManagerView;
