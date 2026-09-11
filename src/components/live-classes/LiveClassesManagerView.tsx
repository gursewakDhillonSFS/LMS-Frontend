"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  VideoCameraOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  RiseOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DeleteFilled,
  DeleteOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import {
  createScheduleApi,
  getSchedulesApi,
  deleteScheduleApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import CustomDropdown from "@/components/CustomDropdown";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import ScheduleLiveClassModal from "@/components/modal/ScheduleLiveClassModal";

export interface LiveClassItem {
  id: string;
  topic: string;
  courseName?: string;
  batchName?: string;
  date?: string;
  startTime: string;
  endTime?: string;
  isLive: boolean;
  meetingLink?: string;
  duration?: string;
  streamedDate?: string;
}

interface LiveClassesManagerViewProps {
  rolePrefix?: string;
}

export const LiveClassesManagerView: React.FC<LiveClassesManagerViewProps> = ({
  rolePrefix = "",
}) => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");
  const [loading, setLoading] = useState(false);

  // Data lists
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClassItem[]>([]);
  const [pastClasses, setPastClasses] = useState<LiveClassItem[]>([]);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 8;

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const params = new URLSearchParams();
      params.append("month", String(now.getMonth() + 1));
      params.append("year", String(now.getFullYear()));

      const res = await getSchedulesApi(params);
      const events = res?.data?.schedules || res?.data || [];
      const list = Array.isArray(events) ? events : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming: LiveClassItem[] = [];
      const past: LiveClassItem[] = [];

      list.forEach((e: any) => {
        const eventDate = e.date ? new Date(e.date) : null;
        const id = e._id || e.schedule_id || String(Math.random());
        const startTime = e.startTime || "00:00";
        const meetingLink = e.meetingLink || "";
        const isPast = eventDate ? eventDate < today : false;

        const classItem: LiveClassItem = {
          id,
          topic: e.title || "Live Interactive Session",
          courseName: e.courseId?.course_name || e.courseName || "General Course",
          batchName: e.batchId?.batchName || e.batchName,
          date: eventDate ? eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined,
          startTime,
          endTime: e.endTime,
          isLive: !isPast && meetingLink ? true : false,
          meetingLink,
          duration: `${startTime}${e.endTime ? ` - ${e.endTime}` : ""}`,
          streamedDate: eventDate ? eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Past session",
        };

        if (isPast) {
          past.push(classItem);
        } else {
          upcoming.push(classItem);
        }
      });

      setUpcomingClasses(upcoming);
      setPastClasses(past);
    } catch (err) {
      console.error("Failed to load live classes:", err);
      toast.warning("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteScheduleApi(deleteId);
      if (res?.status || res?.success) {
        toast.success("Live class removed successfully");
        setDeleteModalOpen(false);
        setDeleteId(null);
        fetchClasses();
      } else {
        toast.warning(res?.message || "Failed to remove live class");
      }
    } catch (err) {
      toast.error("Failed to remove live class");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered dataset based on tab, search, and status
  const currentList = activeTab === "upcoming" ? upcomingClasses : pastClasses;

  const filteredList = useMemo(() => {
    return currentList.filter((item) => {
      const matchesSearch =
        !search ||
        item.topic.toLowerCase().includes(search.toLowerCase()) ||
        item.courseName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "live"
          ? item.isLive
          : !item.isLive;

      return matchesSearch && matchesStatus;
    });
  }, [currentList, search, statusFilter]);

  const total = filteredList.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredList.slice(start, start + limit);
  }, [filteredList, page, limit]);

  // Dynamic KPI Stats
  const kpis = [
    {
      title: "Total Classes",
      value: upcomingClasses.length + pastClasses.length,
      delta: "+15%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <VideoCameraOutlined className="text-lg" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingClasses.length,
      delta: "+8%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <ClockCircleOutlined className="text-lg" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Completed Classes",
      value: pastClasses.length,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <CheckCircleFilled className="text-lg" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Avg. Attendance",
      value: "94%",
      delta: "+3%",
      deltaType: "positive" as const,
      period: "vs. last 30 days",
      icon: <RiseOutlined className="text-lg" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          open={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeleteId(null);
          }}
          onSubmit={handleConfirmDelete}
          loading={deleteLoading}
          title="Delete Live Class"
          description="Are you sure you want to delete this live class session? Any attendees will be notified."
          iconBG="#FB4A49"
          icon={<DeleteFilled className="text-3xl text-white" />}
        />
      )}

      {/* Schedule Live Class Modal */}
      <ScheduleLiveClassModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSubmit={async (payload) => {
          try {
            const res = await createScheduleApi(payload);
            if (res?.status || res?.success) {
              toast.success("Live class scheduled successfully!");
              setScheduleModalOpen(false);
              fetchClasses();
            } else {
              toast.warning(res?.message || "Failed to schedule class");
            }
          } catch (err) {
            toast.error("Failed to schedule live class");
          }
        }}
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

        {/* 2. Main Live Classes Container */}
        <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden flex flex-col">
          {/* Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-[#F2F4F7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Tab Switcher & Count Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upcoming");
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "upcoming"
                      ? "bg-[#315CFF] text-white shadow-xs"
                      : "text-[#475467] hover:text-[#101828]"
                  }`}
                >
                  Upcoming Classes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("past");
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "past"
                      ? "bg-[#315CFF] text-white shadow-xs"
                      : "text-[#475467] hover:text-[#101828]"
                  }`}
                >
                  Past Sessions
                </button>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475467] border border-[#E4E7EC]">
                {total} {total === 1 ? "session" : "sessions"}
              </span>
            </div>

            {/* Right: Search, Filter Dropdown, View Switcher, and + Schedule Live Class CTA */}
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
                  placeholder="Search by topic, course..."
                  className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[#E4E7EC] bg-white text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#315CFF] transition-all shadow-xs"
                />
              </div>

              {/* Status Filter */}
              {activeTab === "upcoming" && (
                <CustomDropdown
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Live Now", value: "live" },
                    { label: "Scheduled", value: "scheduled" },
                  ]}
                />
              )}

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

              {/* Action Button: + Schedule Live Class */}
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_2px_8px_rgba(49,92,255,0.25)] transition-all cursor-pointer shrink-0"
              >
                <PlusOutlined className="text-xs" />
                <span>Schedule Live Class</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#315CFF] border-t-transparent animate-spin" />
              <p className="text-xs sm:text-sm text-[#667085]">Loading live classes...</p>
            </div>
          ) : paginatedList.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#315CFF]">
                <VideoCameraOutlined className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-[#101828]">
                {activeTab === "upcoming" ? "No upcoming live classes" : "No past recorded sessions"}
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] max-w-sm">
                {activeTab === "upcoming"
                  ? "Schedule a live interactive session with your students to engage in real-time learning."
                  : "Recorded sessions will appear here automatically once live classes finish streaming."}
              </p>
              {activeTab === "upcoming" && (
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#315CFF] text-white text-xs sm:text-sm font-semibold hover:bg-[#254BD1] transition-all cursor-pointer"
                >
                  Schedule Live Class
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table View (Desktop lg+ or when viewMode === 'table') */}
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
                      <th className="py-3 px-5">Session Topic</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {paginatedList.map((item, index) => {
                      const sNo = (page - 1) * limit + index + 1;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#F8FAFC] transition-colors group"
                        >
                          {/* S.NO */}
                          <td className="py-3.5 px-5 text-xs text-[#667085] font-medium">
                            {sNo}
                          </td>

                          {/* Session Topic & Course */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                  item.isLive
                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                    : "bg-blue-50 text-[#315CFF] border-blue-100"
                                }`}
                              >
                                <VideoCameraOutlined className="text-base" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                                  {item.topic}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] text-[#667085] truncate">
                                    {item.courseName}
                                  </span>
                                  {item.batchName && (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                      {item.batchName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <CalendarOutlined className="text-xs text-[#98A2B3]" />
                              <span>{item.date || item.streamedDate || "Today"}</span>
                            </div>
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <ClockCircleOutlined className="text-xs text-[#98A2B3]" />
                              <span>{item.duration || item.startTime}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {activeTab === "upcoming" ? (
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                  item.isLive
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isLive ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                                  }`}
                                />
                                <span>{item.isLive ? "Live Now" : "Scheduled"}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                <CheckCircleFilled className="text-xs text-slate-500" />
                                <span>Completed</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {activeTab === "upcoming" ? (
                                <>
                                  {item.meetingLink ? (
                                    <button
                                      type="button"
                                      onClick={() => window.open(item.meetingLink, "_blank")}
                                      className="px-3.5 py-1.5 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                    >
                                      <PlayCircleOutlined className="text-xs" />
                                      <span>Start Class</span>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">No link</span>
                                  )}

                                  {item.meetingLink && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.meetingLink || "");
                                        toast.success("Meeting link copied to clipboard!");
                                      }}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-[#E4E7EC] transition-colors cursor-pointer"
                                      title="Copy Link"
                                    >
                                      <LinkOutlined className="text-xs" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteId(item.id);
                                      setDeleteModalOpen(true);
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 border border-[#E4E7EC] hover:border-rose-200 transition-colors cursor-pointer"
                                    title="Delete Session"
                                  >
                                    <DeleteOutlined className="text-xs" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {item.meetingLink && (
                                    <button
                                      type="button"
                                      onClick={() => window.open(item.meetingLink, "_blank")}
                                      className="px-3 py-1.5 rounded-lg border border-[#E4E7EC] hover:border-blue-200 text-[#315CFF] hover:bg-blue-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <PlayCircleOutlined className="text-xs" />
                                      <span>Watch Recording</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards View (Mobile < lg or when viewMode === 'cards') */}
              <div
                className={`p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                  viewMode === "table"
                    ? "hidden"
                    : viewMode === "cards"
                    ? "grid"
                    : "grid lg:hidden"
                }`}
              >
                {paginatedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#315CFF]/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                  >
                    {/* Top: Topic and Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.isLive
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "bg-blue-50 text-[#315CFF] border-blue-100"
                          }`}
                        >
                          <VideoCameraOutlined className="text-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors truncate">
                            {item.topic}
                          </span>
                          <span className="text-xs text-[#667085] truncate">
                            {item.courseName}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                          item.isLive
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isLive ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                          }`}
                        />
                        <span>{item.isLive ? "Live" : "Scheduled"}</span>
                      </span>
                    </div>

                    {/* Middle: Details */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#F2F4F7] text-xs">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#667085]">Date</span>
                        <span className="font-semibold text-[#101828] truncate mt-0.5">
                          {item.date || item.streamedDate || "Today"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#667085]">Time Slot</span>
                        <span className="font-semibold text-[#315CFF] truncate mt-0.5">
                          {item.duration || item.startTime}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Action */}
                    <div className="pt-2 border-t border-[#F2F4F7] flex items-center justify-between">
                      {item.meetingLink ? (
                        <button
                          type="button"
                          onClick={() => window.open(item.meetingLink, "_blank")}
                          className="px-3 py-1.5 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PlayCircleOutlined className="text-xs" />
                          <span>{activeTab === "upcoming" ? "Start Class" : "Watch Recording"}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No meeting link</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {item.meetingLink && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.meetingLink || "");
                              toast.success("Meeting link copied!");
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 border border-[#E4E7EC] transition-colors cursor-pointer"
                            title="Copy Link"
                          >
                            <LinkOutlined className="text-xs" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          title="Delete Session"
                        >
                          <DeleteOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

export default LiveClassesManagerView;
