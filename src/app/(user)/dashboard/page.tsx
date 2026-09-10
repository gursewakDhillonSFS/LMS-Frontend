"use client";
import CommonButton from "@/components/CommonButton";
import CommonLink from "@/components/CommonLink";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import DashboardCourseCard from "@/components/DashboardCourseCard";
import { MyCoursesCard } from "@/components/MyCourseCard";
import NoDataFound from "@/components/NoDataFound";
import Pagination from "@/components/Pagination";
import SkeletonCard from "@/components/SkeletonCard";
import { setCartCount, setCourseData } from "@/redux/slices/CourseDataSlice";
import {
  addToCart,
  addToFavorite,
  getAllCoursesApi,
  removeFromCart,
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
  const [allCourses, setAllCourses] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [limit] = useState(12);
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

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", limit + "");
      params.append("page", String(page));
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }

      const response = await getAllCoursesApi(params);

      if (response?.status === true) {
        setCourses(response?.data?.course_list);
        setTotal(response?.data?.total_courses);
      }
    } catch (err) {
      console.log(err || "Failed to fetch courses");
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
    param.append("page", "1");
    param.append("limit", "3");
    try {
      const response = await userCourseList(param);
      if (response.status) {
        if (response?.data?.courses?.length > 0) {
          setEnrolledCourse(response?.data?.courses);
          setAllCourses(false);
          
          const coursesPayload = response?.data?.courses.map((c: any) => ({
            courseId: c.course_id,
            batchId: c.batch_id
          }));
          
          const annRes = await getAnnouncementsByCoursesApi({ courses: coursesPayload });
          if (annRes?.status && annRes?.data?.announcements) {
             setAnnouncements(annRes.data.announcements);
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.warning("Could not load your courses");
    } finally {
      setCourseLoading(false);
    }
  };

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

  const handleAddCart = async (id: string) => {
    if (id) {
      const payload = {
        course_ids: id,
      };
      try {
        const res = await addToCart(payload);
        if (res.status) {
          toast.success(res.message);
          setCourses((prev) =>
            prev.map((item) =>
              item.course_id === id ? { ...item, cart_status: true } : item
            )
          );
          dispatch(setCartCount(res?.data?.total_courses));
        } else {
          toast.warning(res.message);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemoveCart = async (id: string) => {
    if (id) {
      try {
        const res = await removeFromCart(id);
        if (res.status) {
          toast.success(res.message);
          setCourses((prev) =>
            prev.map((item) =>
              item.course_id === id ? { ...item, cart_status: false } : item
            )
          );
          dispatch(setCartCount(res?.data?.total_courses));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchCourseData]);

  return courseLoading ? (
    <div className="flex items-center justify-center w-full h-96">
      <LoadingOutlined spin className="!text-2xl text-[var(--primary)]" />
    </div>
  ) : (
    <div className="flex flex-col gap-8 pb-12">
      {!allCourses && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full p-4 rounded-[10px] bg-red-50/70 border border-red-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <Image alt="live" src={Live} className="w-8 h-8 shrink-0" />
                <div>
                  <h3 className="text-[15px] font-semibold text-red-950">
                    Create Machine Learning Models in Microsoft Azure (Live Class)
                  </h3>
                  <span className="text-xs font-medium text-red-700">
                    Starts at 17:50 Today
                  </span>
                </div>
              </div>
              <CommonButton
                text="Join Live Class"
                className="!bg-[var(--error)] hover:!bg-red-700 !text-white !h-9 !text-xs !px-4 !rounded-[6px] shrink-0 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight">
                    My Courses
                  </h2>
                  <CommonLink
                    text="See All"
                    className="text-xs font-medium text-[var(--primary)] hover:underline"
                    onClick={() => router.push(RoutePaths?.MyCourses)}
                  />
                </div>
                {courseLoading || enrolledCourse?.length > 0 ? (
                  courseLoading ? (
                    <div className="flex flex-col gap-3">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {enrolledCourse?.map((item) => (
                        <MyCoursesCard {...item} key={item?.course_id} />
                      ))}
                    </div>
                  )
                ) : (
                  <NoDataFound icon={DataNotFound} />
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight">
                  Schedule
                </h2>

                <div className="flex flex-col md:flex-row border border-[var(--border)] rounded-[10px] bg-white overflow-hidden shadow-xs">
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
                  <div className="w-full md:w-1/2 p-5 flex flex-col gap-4 bg-[var(--surface-subtle)]">
                    <div className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                      {selectedDate
                        ? dayjs(selectedDate).format("dddd, DD MMMM YYYY")
                        : "Events"}
                    </div>
                    <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[260px]">
                      {filtered?.length ? (
                        filtered?.map((group, index) => (
                          <div
                            key={index}
                            className="bg-white border border-[var(--border)] rounded-[8px] p-3 flex justify-between items-center shadow-2xs hover:border-[var(--primary)] transition-colors cursor-pointer"
                          >
                            <div className="flex flex-col gap-0.5">
                              <p className="font-semibold text-sm text-[var(--text-primary)]">
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

            <div className="xl:col-span-1 bg-white border border-[var(--border)] rounded-[10px] p-5 shadow-xs flex flex-col gap-4 h-fit">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h2 className="text-[16px] font-bold text-[var(--text-primary)] tracking-tight">
                  Announcements
                </h2>
                {announcements.length > 0 && (
                  <span className="text-xs bg-blue-50 text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
                    {announcements.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto">
                {announcements.length > 0 ? (
                  announcements.map((note, index) => (
                    <div
                      key={note._id || index}
                      className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-[8px] p-3 flex flex-col gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
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
                        <span className="text-[11px] text-[var(--text-muted)] shrink-0">
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
                    No announcements yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {allCourses ? "Recommended Courses" : "Explore More Courses"}
          </h2>
          <CommonLink
            text={allCourses ? "Browse All" : "View More"}
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
            onClick={
              allCourses ? () => router.push(RoutePaths?.Browse) : () => router.push(RoutePaths?.MyExplore)
            }
          />
        </div>

        {loading || courses?.length > 0 ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              {(allCourses ? courses : courses.slice(0, 4)).map((course) => (
                <DashboardCourseCard
                  key={course.course_id}
                  handleAddFavorite={handleAddFavorite}
                  handleRemoveFavorite={handleRemoveFavorite}
                  handleAddCart={handleAddCart}
                  handleRemoveCart={handleRemoveCart}
                  courseData={course}
                  veiwDetail={veiwDetail}
                />
              ))}
            </div>
          )
        ) : (
          <NoDataFound icon={DataNotFound} />
        )}

        {allCourses && total > limit && (
          <div className="pt-4 flex justify-center">
            <Pagination
              page={page}
              limit={limit}
              setPage={setPage}
              total={total}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
