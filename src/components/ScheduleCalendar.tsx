"use client";
import React, { useState, useEffect } from "react";
import { Calendar, CalendarProps, Select, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";
import enUS from "antd/es/calendar/locale/en_US";
import { LeftOutlined, RightOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { CalendarIcon, ClockWheelIcon } from "@/utils/icons";
import { getSchedulesApi, deleteScheduleApi, getAllCoursesApi } from "@/services/collections";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationModal from "./modal/ConfirmationModal";
import ScheduleModalForm from "./modal/ScheduleModalForm";

const { Option } = Select;

interface CourseItem {
  _id: string;
  course_name: string;
  batch?: BatchItem[];
}

interface BatchItem {
  _id: string;
  batchName: string;
}

interface ScheduleEvent {
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

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ refreshKey = 0 }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(Date.now()));
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);

  // Filter States
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | undefined>(undefined);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string | undefined>(undefined);

  // Edit / Delete Modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editEventData, setEditEventData] = useState<ScheduleEvent | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  // Redux Auth
  const userData = useSelector((state: { userdata?: { role_name?: string } }) => state.userdata);
  const isInstructorOrTeacher =
    userData?.role_name === "instructor" || userData?.role_name === "teacher";

  // Fetch Courses list for filters
  useEffect(() => {
    getAllCoursesApi()
      .then((res) => {
        if (res?.status) {
          const courseList = (res.data?.course_list || []) as { course_id: string; course_name: string; batch?: BatchItem[] }[];
          setCourses(courseList.map((c) => ({
            _id: c.course_id,
            course_name: c.course_name,
            batch: c.batch,
          })));
        }
      })
      .catch(console.error);
  }, []);

  const handleCourseFilterChange = (val: string | undefined) => {
    setSelectedCourseFilter(val);
    setSelectedBatchFilter(undefined);
    if (val) {
      const c = courses.find((course) => course._id === val);
      setBatches(c?.batch || []);
    } else {
      setBatches([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const month = selectedDate.month() + 1; // dayjs is 0-indexed, backend is 1-indexed
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
    }
  };

  const monthCellRender = (value: Dayjs) => {
    const list = schedules.filter((event) => dayjs(event.date).isSame(value, "month"));
    return list.length > 0 ? (
      <div className="notes-month text-center">
        <section className="text-[10px] text-gray-500 font-medium">
          {list.length} Events this month
        </section>
      </div>
    ) : null;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="flex flex-col mt-1 gap-1 pl-0 list-none scrollbar-hide max-h-[75px] overflow-y-auto">
        {listData.map((item, index) => (
          <li key={index} className="m-0 p-0">
            <Tooltip title={item.content}>
              <div className="single-line-ellipsis text-[9px] text-[#5B21B6] font-medium bg-[#ECE9FE] py-0.5 px-1.5 rounded-[100px] border border-[#DDD6FE] text-center">
                {item.content}
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  const getListData = (value: Dayjs) => {
    return schedules
      .filter((event) => dayjs(event.date).isSame(value, "day"))
      .map((event) => ({
        content: event.title,
      }));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Filters flex bar */}
      <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="text-sm font-semibold text-gray-700">Filters:</div>
        <Select
          placeholder="Filter by Course"
          className="w-[200px] h-[40px]"
          onChange={handleCourseFilterChange}
          value={selectedCourseFilter}
          allowClear
        >
          {courses.map((course) => (
            <Option key={course._id} value={course._id}>
              {course.course_name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by Batch"
          className="w-[180px] h-[40px]"
          onChange={(val) => setSelectedBatchFilter(val)}
          value={selectedBatchFilter}
          disabled={!selectedCourseFilter || batches.length === 0}
          allowClear
        >
          {batches.map((batch) => (
            <Option key={batch._id} value={batch._id}>
              {batch.batchName}
            </Option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col-reverse lg:flex-row w-full gap-4 items-start">
        {/* Left Side: Calendar */}
        <div className="lg:w-2/3 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <Calendar
            prefixCls="schedule-calendar"
            value={selectedDate}
            rootClassName="!bg-transparent !p-0 !m-0"
            onSelect={(date) => setSelectedDate(date)}
            headerRender={({ value, onChange }) => {
              return (
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <button
                    onClick={() => onChange(value.clone().subtract(1, "month"))}
                    className="cursor-pointer flex items-center justify-center w-[32px] h-[32px] rounded-full bg-gray-100 hover:bg-secondary text-gray-700 hover:text-white transition-all border-none"
                  >
                    <LeftOutlined />
                  </button>
                  <div className="text-xl font-bold text-gray-800">
                    {value.format("MMMM YYYY")}
                  </div>
                  <button
                    onClick={() => onChange(value.clone().add(1, "month"))}
                    className="cursor-pointer flex items-center justify-center w-[32px] h-[32px] rounded-full bg-gray-100 hover:bg-secondary text-gray-700 hover:text-white transition-all border-none"
                  >
                    <RightOutlined />
                  </button>
                </div>
              );
            }}
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

        {/* Right Side: Sidebar details card */}
        <div className="lg:w-1/3 w-full bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-lg text-gray-800">
              {selectedDate.format("DD MMM, YYYY")}
            </h2>
            <span className="text-xs bg-[#F3E8FF] text-[#7C3AED] py-1 px-2.5 rounded-full font-medium">
              {schedules.filter((event) => dayjs(event.date).isSame(selectedDate, "day")).length} Events
            </span>
          </div>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
            {schedules.filter((event) => dayjs(event.date).isSame(selectedDate, "day")).length === 0 ? (
              <div className="flex flex-col gap-2 py-4">
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-gray-400">
                  <CalendarIcon />
                  <p className="text-sm font-medium">No events scheduled for this day.</p>
                </div>
                
                {schedules.filter((event) => dayjs(event.date).isAfter(selectedDate, "day")).length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-gray-600 mb-3">Upcoming this month:</h3>
                    <div className="flex flex-col gap-3">
                      {schedules
                        .filter((event) => dayjs(event.date).isAfter(selectedDate, "day"))
                        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
                        .slice(0, 5)
                        .map((event) => (
                          <div
                            key={event._id}
                            className="flex flex-col gap-1 border-l-2 border-secondary pl-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-800 leading-snug truncate">
                                {event.title}
                              </h4>
                              <span className="text-[10px] whitespace-nowrap bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {dayjs(event.date).format("MMM DD")}
                              </span>
                            </div>
                            <div className="flex items-center text-[11px] text-gray-500 gap-2">
                              <ClockWheelIcon color="#6B7280" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              schedules
                .filter((event) => dayjs(event.date).isSame(selectedDate, "day"))
                .map((event, index, filteredArray) => (
                  <div
                    key={event._id}
                    className={`${
                      index < filteredArray.length - 1 ? "border-b border-gray-100 pb-4" : ""
                    } flex flex-col gap-2 w-full group relative`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-base text-gray-800 leading-snug group-hover:text-secondary transition-colors pr-8">
                          {event.title}
                        </h3>
                        {event.courseId && (
                          <span className="text-[11px] font-semibold text-secondary bg-[#EDE9FE] py-0.5 px-2 rounded-md w-fit">
                            {event.courseId.course_name} {event.batchId ? `(${event.batchId})` : ""}
                          </span>
                        )}
                      </div>

                    </div>

                    <div className="flex items-center text-xs text-gray-500 gap-3">
                      <div className="flex items-center gap-1 font-medium">
                        <ClockWheelIcon color="#6B7280" />
                        {event.startTime} - {event.endTime}
                      </div>
                      {event.createdBy && (
                        <div className="text-[11px] text-gray-400">
                          by {event.createdBy.firstName} {event.createdBy.lastName}
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150 leading-relaxed mt-1">
                        {event.description}
                      </p>
                    )}

                    {event.meetingLink && (
                      <a
                        href={event.meetingLink.startsWith("http") ? event.meetingLink : `https://${event.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] hover:text-[#0369A1] font-bold text-xs py-2 px-3 rounded-lg transition-colors border border-[#BAE6FD] w-fit"
                      >
                        <VideoCameraOutlined />
                        Join Live Class / Call
                      </a>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

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
        title="Delete Schedule Event"
        description="Are you sure you want to permanently delete this schedule event? This action is irreversible."
      />
    </div>
  );
};

export default ScheduleCalendar;
