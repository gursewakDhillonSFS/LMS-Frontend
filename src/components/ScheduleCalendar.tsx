"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, CalendarProps, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";
import enUS from "antd/es/calendar/locale/en_US";
import {
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PlusOutlined,
  TableOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  CheckCircleFilled,
  DeleteFilled,
  LinkOutlined,
} from "@ant-design/icons";

import {
  getSchedulesApi,
  deleteScheduleApi,
  getAllCoursesApi,
} from "@/services/collections";
import { useSelector } from "react-redux";
import { toast } from "@/utils/toast";
import CustomDropdown from "@/components/CustomDropdown";
import ConfirmationModal from "./modal/ConfirmationModal";
import ScheduleModalForm from "./modal/ScheduleModalForm";

interface CourseItem {
  _id: string;
  course_name: string;
  batch?: BatchItem[];
}

interface BatchItem {
  _id: string;
  batchName: string;
}

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  courseId?: {
    _id: string;
    course_name: string;
  };
  batchId?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ScheduleCalendarProps {
  refreshKey?: number;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  refreshKey = 0,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Filter States
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEventData, setEditEventData] = useState<ScheduleEvent | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Redux Auth
  const userData = useSelector(
    (state: { userdata?: { role_name?: string } }) => state.userdata
  );
  const isInstructorOrTeacher =
    userData?.role_name === "instructor" || userData?.role_name === "teacher";

  // Fetch Courses list for filters
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
      .catch(console.error);
  }, []);

  const handleCourseFilterChange = (val: string) => {
    setSelectedCourseFilter(val);
    setSelectedBatchFilter("");
    if (val) {
      const c = courses.find((course) => course._id === val);
      setBatches(c?.batch || []);
    } else {
      setBatches([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();

      const params = new URLSearchParams();
      params.append("month", month.toString());
      params.append("year", year.toString());

      if (selectedCourseFilter) {
        params.append("courseId", selectedCourseFilter);
      }
      if (selectedBatchFilter) {
        params.append("batchId", selectedBatchFilter);
      }

      const res = await getSchedulesApi(params);
      if (res?.success || res?.status) {
        setSchedules(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate, selectedCourseFilter, selectedBatchFilter, refreshKey]);

  const handleDelete = async () => {
    if (!deleteEventId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteScheduleApi(deleteEventId);
      if (res?.success || res?.status) {
        toast.success(res.message || "Event deleted successfully!");
        setDeleteOpen(false);
        setDeleteEventId(null);
        fetchSchedules();
      } else {
        toast.error(res?.message || "Failed to delete event");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting event");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calendar renderers
  const monthCellRender = (value: Dayjs) => {
    const list = schedules.filter((event) =>
      dayjs(event.date).isSame(value, "month")
    );
    return list.length > 0 ? (
      <div className="text-center mt-1">
        <span className="text-[11px] text-[#315CFF] font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          {list.length} Events
        </span>
      </div>
    ) : null;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = schedules.filter((event) =>
      dayjs(event.date).isSame(value, "day")
    );

    return (
      <ul className="flex flex-col mt-1 gap-1 pl-0 list-none scrollbar-hide max-h-[75px] overflow-y-auto">
        {listData.map((item, index) => {
          const isLive = Boolean(item.meetingLink);
          return (
            <li key={item._id || index} className="m-0 p-0">
              <Tooltip title={`${item.title} (${item.startTime} - ${item.endTime})`}>
                <div
                  className={`text-[10px] font-semibold py-0.5 px-1.5 rounded-md truncate text-left flex items-center gap-1 border ${
                    isLive
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-blue-50 text-[#315CFF] border-blue-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isLive ? "bg-rose-500" : "bg-[#315CFF]"
                    }`}
                  />
                  <span className="truncate">{item.title}</span>
                </div>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  // KPI Calculations
  const todayCount = useMemo(() => {
    return schedules.filter((e) => dayjs(e.date).isSame(dayjs(), "day")).length;
  }, [schedules]);

  const liveCount = useMemo(() => {
    return schedules.filter((e) => Boolean(e.meetingLink)).length;
  }, [schedules]);

  const uniqueCoursesCount = useMemo(() => {
    const set = new Set(
      schedules.map((e) => e.courseId?.course_name).filter(Boolean)
    );
    return set.size;
  }, [schedules]);

  const kpis = [
    {
      title: "Monthly Events",
      value: schedules.length,
      delta: "+12%",
      deltaType: "positive" as const,
      period: "vs. last month",
      icon: <CalendarOutlined className="text-lg" />,
      colorClass: "text-[#315CFF] bg-blue-50 border-blue-100",
    },
    {
      title: "Today's Events",
      value: todayCount,
      delta: "+5%",
      deltaType: "positive" as const,
      period: "vs. yesterday",
      icon: <ClockCircleOutlined className="text-lg" />,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Live Classes",
      value: liveCount,
      delta: "+18%",
      deltaType: "positive" as const,
      period: "vs. last month",
      icon: <VideoCameraOutlined className="text-lg" />,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Active Courses",
      value: uniqueCoursesCount || courses.length,
      delta: "0%",
      deltaType: "neutral" as const,
      period: "current cohort",
      icon: <TeamOutlined className="text-lg" />,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const selectedDayEvents = useMemo(() => {
    return schedules.filter((event) =>
      dayjs(event.date).isSame(selectedDate, "day")
    );
  }, [schedules, selectedDate]);

  const upcomingThisMonth = useMemo(() => {
    return schedules
      .filter((event) => dayjs(event.date).isAfter(selectedDate, "day"))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
      .slice(0, 4);
  }, [schedules, selectedDate]);

  return (
    <>
      {/* Create / Add Event Modal */}
      <ScheduleModalForm
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchSchedules}
        centered
      />

      {/* Edit Event Modal */}
      <ScheduleModalForm
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditEventData(null);
        }}
        onSuccess={fetchSchedules}
        editData={editEventData}
        centered
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteEventId(null);
        }}
        onSubmit={handleDelete}
        loading={deleteLoading}
        title="Delete Schedule Event"
        description="Are you sure you want to permanently delete this schedule event? This action is irreversible."
        iconBG="#FB4A49"
        icon={<DeleteFilled className="text-3xl text-white" />}
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

        {/* 2. Main Schedule Container */}
        <div className="w-full bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden flex flex-col">
          {/* Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-[#F2F4F7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Month Navigation & Event Count Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setSelectedDate((d) => d.subtract(1, "month"))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                  title="Previous Month"
                >
                  <LeftOutlined className="text-xs" />
                </button>

                <span className="px-3 text-xs sm:text-sm font-bold text-[#101828]">
                  {selectedDate.format("MMMM YYYY")}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedDate((d) => d.add(1, "month"))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                  title="Next Month"
                >
                  <RightOutlined className="text-xs" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate(dayjs())}
                className="px-3 py-1.5 rounded-xl border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#475467] transition-colors cursor-pointer"
              >
                Today
              </button>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475467] border border-[#E4E7EC]">
                {schedules.length} {schedules.length === 1 ? "event" : "events"}
              </span>
            </div>

            {/* Right: Custom Dropdowns, View Switcher & + Add Event CTA */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Course Filter */}
              <CustomDropdown
                value={selectedCourseFilter}
                onChange={handleCourseFilterChange}
                placeholder="All Courses"
                options={[
                  { label: "All Courses", value: "" },
                  ...courses.map((c) => ({ label: c.course_name, value: c._id })),
                ]}
              />

              {/* Batch Filter */}
              <CustomDropdown
                value={selectedBatchFilter}
                onChange={(val) => setSelectedBatchFilter(val)}
                disabled={!selectedCourseFilter || batches.length === 0}
                placeholder="All Batches"
                options={[
                  { label: "All Batches", value: "" },
                  ...batches.map((b) => ({ label: b.batchName, value: b._id })),
                ]}
              />

              {/* View Mode Toggle: Calendar vs List */}
              <div className="flex items-center bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "calendar"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                  title="Calendar View"
                >
                  <AppstoreOutlined className="text-xs" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-[#315CFF] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                  title="List / Agenda View"
                >
                  <TableOutlined className="text-xs" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Primary Action Button: + Add Event */}
              {isInstructorOrTeacher && (
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="h-9 px-4 rounded-xl bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_2px_8px_rgba(49,92,255,0.25)] transition-all cursor-pointer shrink-0"
                >
                  <PlusOutlined className="text-xs" />
                  <span>Add Event</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Calendar Body Content */}
          {viewMode === "calendar" ? (
            <div className="flex flex-col-reverse lg:flex-row w-full divide-y lg:divide-y-0 lg:divide-x divide-[#F2F4F7]">
              {/* Left Column: Calendar Grid */}
              <div className="lg:w-2/3 w-full p-4 sm:p-5">
                <Calendar
                  prefixCls="schedule-calendar"
                  value={selectedDate}
                  rootClassName="!bg-transparent !p-0 !m-0"
                  onSelect={(date) => setSelectedDate(date)}
                  headerRender={() => null} // Handled in top toolbar
                  locale={{
                    ...enUS,
                    lang: {
                      ...enUS.lang,
                      shortWeekDays: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
                    },
                  }}
                  cellRender={cellRender}
                  className="scrollbar-hide"
                />
              </div>

              {/* Right Column: Selected Day Agenda */}
              <div className="lg:w-1/3 w-full p-5 flex flex-col gap-4 bg-[#FAFBFD]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#667085] font-medium">Selected Date</span>
                    <h3 className="font-bold text-base text-[#101828] mt-0.5">
                      {selectedDate.format("DD MMMM, YYYY")}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#315CFF] border border-blue-100">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "Event" : "Events"}
                  </span>
                </div>

                {/* Day Events List */}
                <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
                  {selectedDayEvents.length === 0 ? (
                    <div className="flex flex-col gap-4 py-6 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
                        <CalendarOutlined />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-[#101828]">
                          No events scheduled
                        </p>
                        <p className="text-xs text-[#667085]">
                          There are no classes or events set for this date.
                        </p>
                      </div>

                      {/* Preview of upcoming events this month */}
                      {upcomingThisMonth.length > 0 && (
                        <div className="mt-2 text-left pt-3 border-t border-[#E4E7EC] flex flex-col gap-2">
                          <span className="text-xs font-bold text-[#475467] uppercase tracking-wider">
                            Upcoming this month:
                          </span>
                          {upcomingThisMonth.map((item) => (
                            <div
                              key={item._id}
                              onClick={() => setSelectedDate(dayjs(item.date))}
                              className="p-2.5 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#315CFF]/50 transition-all cursor-pointer flex items-center justify-between gap-2"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-[#101828] truncate">
                                  {item.title}
                                </span>
                                <span className="text-[11px] text-[#667085]">
                                  {item.startTime} - {item.endTime}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                                {dayjs(item.date).format("MMM DD")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    selectedDayEvents.map((event) => {
                      const isLive = Boolean(event.meetingLink);

                      return (
                        <div
                          key={event._id}
                          className="p-3.5 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#315CFF]/50 transition-all flex flex-col gap-2.5 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="font-bold text-sm text-[#101828] truncate">
                                {event.title}
                              </span>
                              {event.courseId && (
                                <span className="text-[11px] font-medium text-[#315CFF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 w-fit truncate">
                                  {event.courseId.course_name}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditEventData(event);
                                  setEditOpen(true);
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 border border-[#E4E7EC] transition-colors cursor-pointer"
                                title="Edit Event"
                              >
                                <EditOutlined className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteEventId(event._id);
                                  setDeleteOpen(true);
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 border border-[#E4E7EC] transition-colors cursor-pointer"
                                title="Delete Event"
                              >
                                <DeleteOutlined className="text-xs" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#667085]">
                            <ClockCircleOutlined className="text-xs text-[#98A2B3]" />
                            <span>
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>

                          {event.description && (
                            <p className="text-xs text-[#475467] bg-slate-50 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                              {event.description}
                            </p>
                          )}

                          {isLive && (
                            <div className="pt-1 flex items-center gap-2">
                              <a
                                href={
                                  event.meetingLink?.startsWith("http")
                                    ? event.meetingLink
                                    : `https://${event.meetingLink}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#315CFF] hover:bg-[#254BD1] text-white text-xs font-semibold shadow-xs transition-colors"
                              >
                                <VideoCameraOutlined className="text-xs" />
                                <span>Join Live Session</span>
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* List / Agenda View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                    <th className="py-3 px-5 w-16">S.NO</th>
                    <th className="py-3 px-5">Event Title</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Course / Batch</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-[#667085]">
                        No schedule events found for this month.
                      </td>
                    </tr>
                  ) : (
                    schedules.map((event, index) => (
                      <tr
                        key={event._id || index}
                        className="hover:bg-[#F8FAFC] transition-colors group"
                      >
                        <td className="py-3.5 px-5 text-xs text-[#667085] font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                event.meetingLink
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : "bg-blue-50 text-[#315CFF] border-blue-100"
                              }`}
                            >
                              {event.meetingLink ? (
                                <VideoCameraOutlined className="text-xs" />
                              ) : (
                                <CalendarOutlined className="text-xs" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#315CFF] transition-colors">
                              {event.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                          {dayjs(event.date).format("MMM DD, YYYY")}
                        </td>
                        <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                          {event.startTime} - {event.endTime}
                        </td>
                        <td className="py-3.5 px-4 text-xs sm:text-sm text-[#475467] whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {event.courseId?.course_name || "General Event"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {event.meetingLink && (
                              <a
                                href={
                                  event.meetingLink.startsWith("http")
                                    ? event.meetingLink
                                    : `https://${event.meetingLink}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-[#315CFF] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#254BD1] transition-colors"
                              >
                                <VideoCameraOutlined className="text-xs" />
                                <span>Join</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditEventData(event);
                                setEditOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 border border-[#E4E7EC] transition-colors cursor-pointer"
                              title="Edit Event"
                            >
                              <EditOutlined className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteEventId(event._id);
                                setDeleteOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 border border-[#E4E7EC] transition-colors cursor-pointer"
                              title="Delete Event"
                            >
                              <DeleteOutlined className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ScheduleCalendar;
