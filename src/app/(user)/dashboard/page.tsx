"use client";
import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import DashboardCourseCard from "@/components/DashboardCourseCard";
import { MyCoursesCard } from "@/components/MyCourseCard";
import NoDataFound from "@/components/NoDataFound";
import Pagination from "@/components/Pagination";
import SkeletonCard from "@/components/SkeletonCard";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  addToFavorite,
  getAllCoursesApi,
  removeFromFavorite,
  userCourseList,
  getAnnouncementsByCoursesApi,
} from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { ClockWheelIcon, EarPhoneIcon } from "@/utils/icons";
import { DataNotFound, Live } from "@/utils/images";
import { courseData, EnrolledCourseProp } from "@/utils/interface";
import { AnnouncementPayload } from "@/hooks/useAnnouncementSocket";
import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
} from "@ant-design/icons";
import { Calendar } from "antd";
import dayjs, { Dayjs } from "dayjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/utils/toast";

interface EventProp {
  date: Dayjs;
  formatDate: string;
  title: string;
  time: string;
}
const events: EventProp[] = [
  {
    date: dayjs("2025-06-05"),
    formatDate: "5 June, 2025",
    title: "Site Inspection",
    time: "6:00 PM - 6:45 PM",
  },
  {
    date: dayjs("2025-06-06"),
    formatDate: "6 June, 2025",
    title: "Concrete Pouring",
    time: "6:00 PM - 6:45 PM",
  },
  {
    date: dayjs("2025-06-10"),
    formatDate: "10 June, 2025",
    title: "Concrete Pouring",
    time: "6:00 PM - 6:45 PM",
  },
  {
    date: dayjs("2025-06-20"),
    formatDate: "20 June, 2025",
    title: "Formwork Removal",
    time: "6:00 PM - 6:45 PM",
  },
];

const UserDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [limit] = useState(8);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();

  const [courses, setCourses] = useState<courseData[]>([]);
  const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourseProp[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementPayload[]>([]);

  const userName = useSelector((state: RootState) => state.userdata?.full_name);
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

      const response = await getAllCoursesApi(params);

      if (response?.status === true) {
        setCourses(response?.data?.course_list || []);
        setTotal(response?.data?.total_courses || 0);
      } else {
        setCourses([]);
        setTotal(0);
      }
    } catch (err) {
      console.log(err || "Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [limit, page, organization_id]);

  const veiwDetail = (data: courseData) => {
    dispatch(setCourseData(data));
    router.push(`${RoutePaths.Dashboard}/course-detail`);
  };

  const getUserCourseData = async () => {
    setCourseLoading(true);
    const param = new URLSearchParams();
    try {
      const response = await userCourseList(param);
      if (response?.status && response?.data?.courses) {
        setEnrolledCourse(response.data.courses);

        if (response.data.courses.length > 0) {
          const coursesPayload = response.data.courses.map((c: any) => ({
            courseId: c.course_id,
            batchId: c.batch_id,
          }));

          try {
            const annRes = await getAnnouncementsByCoursesApi({
              courses: coursesPayload,
            });
            if (annRes?.status && annRes?.data?.announcements) {
              setAnnouncements(annRes.data.announcements);
            }
          } catch (e) {
            console.log("Could not load announcements", e);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCourseLoading(false);
    }
  };

  const activeEnrolledCount = useMemo(
    () => enrolledCourse.filter((c) => (c.progress || 0) < 100).length,
    [enrolledCourse]
  );
  const completedEnrolledCount = useMemo(
    () => enrolledCourse.filter((c) => (c.progress || 0) >= 100).length,
    [enrolledCourse]
  );

  const filtered = useMemo(() => {
    return events.filter((item) =>
      dayjs(item?.formatDate).isSame(selectedDate, "day")
    );
  }, [selectedDate]);

  const handleAddFavorite = async (id: string) => {
    if (id) {
      const payload = {
        course_id: id,
        favorite: true,
      };
      try {
        const res = await addToFavorite(payload);
        if (res.status) {
          toast.success(res.message);
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
        console.log(error);
      }
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (id) {
      const param = new URLSearchParams();
      param.append("course_id", id);
      try {
        const res = await removeFromFavorite(param);
        if (res.status) {
          toast.success(res.message);
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
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getUserCourseData();
  }, []);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const exploreSection = document.getElementById("recommended-courses-section");
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return courseLoading ? (
    <div className="flex items-center justify-center w-full h-96">
      <LoadingOutlined spin className="!text-2xl text-[var(--primary)]" />
    </div>
  ) : (
    <div className="flex flex-col gap-6 pb-16">
      {/* 1. Dashboard Overview */}
      <div className="flex flex-col gap-6">
        {/* Overview Metric Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center text-lg shrink-0">
              <BookOutlined />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Enrolled</p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {enrolledCourse.length}
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
                {activeEnrolledCount}
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
                {completedEnrolledCount}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
              <CompassOutlined />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Available</p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {total}
              </h3>
            </div>
          </div>
        </div>

        {/* Live Class Notice Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full p-4 rounded-2xl bg-red-50/70 border border-red-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <Image alt="live" src={Live} className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-950">
                Live Interactive Mentorship Session
              </h3>
              <span className="text-xs font-medium text-red-700">
                Scheduled for today at 17:50 IST
              </span>
            </div>
          </div>
          <CommonButton
            text="Join Session"
            className="!bg-[var(--error)] hover:!bg-red-700 !text-white !h-8 !text-xs !px-4 !rounded-lg shrink-0 shadow-xs"
          />
        </div>
      </div>

      {/* 2. Main Dashboard Section: Continue Learning, Schedule & Announcements */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Enrolled Courses & Schedule */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Continue Learning */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  Continue Learning
                </h2>
                {enrolledCourse.length > 0 && (
                  <span className="text-xs bg-[var(--surface-subtle)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full font-medium">
                    {enrolledCourse.length}
                  </span>
                )}
              </div>
              {enrolledCourse.length > 0 && (
                <CommonLink
                  text="See All Courses →"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  onClick={() => router.push(RoutePaths?.MyCourses)}
                />
              )}
            </div>

            {enrolledCourse.length > 0 ? (
              <div className="flex flex-col gap-3">
                {enrolledCourse.slice(0, 3).map((item) => (
                  <MyCoursesCard {...item} key={item?.course_id} />
                ))}
                {enrolledCourse.length > 3 && (
                  <button
                    onClick={() => router.push(RoutePaths?.MyCourses)}
                    className="w-full py-2.5 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--primary)] transition-all cursor-pointer text-center"
                  >
                    View All {enrolledCourse.length} Enrolled Courses
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-[var(--border)] text-center shadow-2xs flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center text-xl">
                  <BookOutlined />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  No Enrolled Courses Yet
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                  Enroll in a course from our catalog below to start tracking your learning progress.
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById("recommended-courses-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-1 px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Browse Catalog Below
                </button>
              </div>
            )}
          </div>

          {/* Schedule Calendar */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Study Schedule & Deadlines
            </h2>

            <div className="flex flex-col md:flex-row border border-[var(--border)] rounded-2xl bg-white overflow-hidden shadow-2xs">
              <div className="w-full md:w-1/2 p-5 border-b md:border-b-0 md:border-r border-[var(--border)]">
                <Calendar
                  onChange={(value) => {
                    setSelectedDate(value);
                  }}
                  prefixCls="custom-calendar"
                  fullscreen={false}
                  headerRender={({ value, onChange }) => {
                    const current = value.clone();

                    const prevMonth = () => {
                      const newValue = current.subtract(1, "month");
                      onChange(newValue);
                    };

                    const nextMonth = () => {
                      const newValue = current.add(1, "month");
                      onChange(newValue);
                    };

                    return (
                      <div className="flex justify-between items-center pb-3">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {current.format("MMMM YYYY")}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={prevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer text-xs"
                            aria-label="Previous month"
                          >
                            <LeftOutlined className="text-xs text-[var(--text-secondary)]" />
                          </button>
                          <button
                            onClick={nextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer text-xs"
                            aria-label="Next month"
                          >
                            <RightOutlined className="text-xs text-[var(--text-secondary)]" />
                          </button>
                        </div>
                      </div>
                    );
                  }}
                  cellRender={(date) => {
                    const isEvent = events.find((event) =>
                      event.date.isSame(date, "day")
                    );
                    return (
                      <div className="relative h-full w-full">
                        {isEvent && (
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              <div className="w-full md:w-1/2 p-5 flex flex-col gap-3 bg-[var(--surface-subtle)]">
                <div className="text-xs font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 uppercase tracking-wider">
                  {selectedDate
                    ? dayjs(selectedDate).format("dddd, DD MMMM YYYY")
                    : "Scheduled Events"}
                </div>
                <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[260px]">
                  {filtered?.length ? (
                    filtered?.map((group, index) => (
                      <div
                        key={index}
                        className="bg-white border border-[var(--border)] rounded-xl p-3 flex justify-between items-center shadow-2xs hover:border-[var(--primary)] transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold text-xs text-[var(--text-primary)]">
                            {group.title}
                          </p>
                          <div className="flex items-center text-xs text-[var(--text-secondary)] gap-1">
                            <ClockWheelIcon />
                            <span>{group.time}</span>
                          </div>
                        </div>
                        <RightOutlined className="text-[var(--text-muted)] text-xs" />
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                      No scheduled events for this date
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Announcements Panel */}
        <div className="xl:col-span-1 bg-white border border-[var(--border)] rounded-2xl p-5 shadow-2xs flex flex-col gap-4 h-fit">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                Course Announcements
              </h2>
              {announcements.length > 0 && (
                <span className="text-xs bg-blue-50 text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
                  {announcements.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto">
            {announcements.length > 0 ? (
              announcements.map((note, index) => (
                <div
                  key={note._id || index}
                  className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <EarPhoneIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                        {note.courseName}
                      </p>
                      <p className="text-xs text-[var(--primary)] font-medium truncate">
                        {note.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                      {dayjs(note.publishedAt).format("DD MMM")}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    <span
                      dangerouslySetInnerHTML={{
                        __html:
                          note.message.slice(0, 70) +
                          (note.message.length > 70 ? "..." : ""),
                      }}
                    ></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                No course announcements yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recommended & Explore Courses Section with PROPER PAGINATED DATA */}
      <div id="recommended-courses-section" className="flex flex-col gap-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Recommended Courses For You
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Curated accredited courses to help you master new industry skills
            </p>
          </div>
          <CommonLink
            text="Explore All Courses →"
            className="text-xs font-semibold text-[var(--primary)] hover:underline self-start sm:self-auto"
            onClick={() => router.push(RoutePaths?.MyExplore)}
          />
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
            {courses.map((course) => (
              <DashboardCourseCard
                key={course.course_id}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
                courseData={course}
                veiwDetail={veiwDetail}
              />
            ))}
          </div>
        ) : (
          <NoDataFound icon={DataNotFound} />
        )}

        {/* Proper Paginated Data Controls */}
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
                  setPage={handlePageChange}
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
    </div>
  );
};

export default UserDashboard;
