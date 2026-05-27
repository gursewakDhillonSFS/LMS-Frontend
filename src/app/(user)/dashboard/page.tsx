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
} from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { ClockWheelIcon, EarPhoneIcon } from "@/utils/icons";
import { DataNotFound, Live } from "@/utils/images";
import { courseData, EnrolledCourseProp } from "@/utils/interface";
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
import { toast } from "react-toastify";

const notificationData = [
  {
    time: "13 May, 2025",
    notifications: [
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
    ],
  },
  {
    time: "10 May, 2025",
    notifications: [
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
      {
        title: "Organization name",
        subtitle: "Finance & Quantitative Modeling for Analysts",
        message: "Hello Students Today Live class has been canceled",
        timestamp: "17:50",
      },
    ],
  },
];

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
  console.log(courseLoading);

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
      console.log(err || "Failed to fetch Project Condition");
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
    param.append("page", 1 + "");
    param.append("limit", 3 + "");
    try {
      const response = await userCourseList(param);
      if (response.status) {
        console.log(response);
        if (response?.data?.courses?.length > 0) {
          setEnrolledCourse(response?.data?.courses);
          setAllCourses(false);
        }
      } else {
        setCourseLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.warning("Something went wrong");
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
    <div className="flex items-center justify-center w-full h-screen">
      <LoadingOutlined spin className="!text-2xl" />
    </div>
  ) : (
    <div className="flex flex-col gap-[24px]">
      {!allCourses && (
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[32px] font-[700] leading-[120%]">Dashboard</h1>
            <div className="flex items-center justify-between w-full p-[12px] rounded-[12px] bg-[#FFDEE6]">
              <div className="flex items-center gap-[12px]">
                <Image alt="live" src={Live} />
                <div>
                  <h1 className="text-[18px] font-[600] leading-[120%]">
                    Create Machine Learning Models in Microsoft Azure (Live
                    Class)
                  </h1>
                  <span className="text-[14px] font-[500] text-[#9A9A9A] leading-[150%]">
                    Start at: 17:50
                  </span>
                </div>
              </div>
              <CommonButton
                text={"Join Live Class"}
                className="!bg-[#FB4A49] text-white"
              />
            </div>
          </div>
          <div className="flex flex-col xl:flex-row w-full gap-[20px] h-full">
            <div className="w-full xl:w-2/3 h-full">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <p className="text-[24px] font-[700] leading-[120%]">
                    My Courses
                  </p>
                  <CommonLink
                    text="See All"
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

                <div className="flex flex-col gap-[12px]">
                  <p className="text-[24px] font-[700] leading-[120%]">
                    Schedule
                  </p>

                  <div className="flex shadow-sm rounded-[20px]">
                    <div className="w-1/2 p-6 bg-white rounded-l-[20px]">
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
                            <div className="flex justify-between items-center pb-2">
                              <div className="text-[16px] font-[500] font-poppins leading-[150%]">
                                {current.format("MMMM YYYY")}
                              </div>
                              <div className="flex gap-2">
                                <div
                                  onClick={prevMonth}
                                  className="cursor-pointer text-center w-[22px] h-[22px] rounded-full bg-[#D9D9D9]"
                                >
                                  <LeftOutlined className="!text-white" />
                                </div>
                                <div
                                  onClick={nextMonth}
                                  className="cursor-pointer text-center w-[22px] h-[22px] rounded-full bg-secondary"
                                >
                                  <RightOutlined className="!text-white" />
                                </div>
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
                                <div className="absolute -bottom-6 -left-[10px] w-1 h-1 rounded-full bg-secondary" />
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                    <div className="w-1/2 max-h-screen px-5 py-[24px] flex flex-col gap-[20px] bg-[#F7F7FC] rounded-r-[20px]">
                      <div className="text-[18px] font-[700] leading-[120%]">
                        {selectedDate
                          ? dayjs(selectedDate).format("DD MMM, YYYY")
                          : ""}
                      </div>
                      <div className="h-full">
                        {filtered?.length ? (
                          filtered?.map((group, index) => (
                            <div key={index}>
                              <div className="bg-white cursor-pointer rounded-lg px-4 py-3 flex justify-between items-center mb-2">
                                <div className="flex flex-col gap-1">
                                  <p className="font-[700] text-[16px] leading-[150%]">
                                    {group.title}
                                  </p>
                                  <div className="flex items-center text-sm text-[#7B7B7B]  gap-1">
                                    <ClockWheelIcon />
                                    {group.time}
                                  </div>
                                </div>
                                <RightOutlined className="text-[#7B7B7B] w-5 h-5" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <NoDataFound icon={DataNotFound} />
                        )}
                        <CommonLink
                          text={"See All"}
                          className="text-right w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-1/3 h-full p-6 bg-navcolor rounded-[12px]">
              <h1 className="text-[20px] text-white font-[700] leading-[120%] pb-[12px] border-b border-[#4C4C4C]">
                Announcement
              </h1>

              <div className="flex flex-col gap-[12px] my-[12px]">
                {notificationData.map((group) => (
                  <div key={group.time} className="flex flex-col gap-[12px]">
                    <p className="text-white text-[16px] font-[500] leading-[150%]">
                      {group.time}
                    </p>
                    {group.notifications.map((note, index) => (
                      <div
                        key={index}
                        className="flex gap-[10px] p-[6px] rounded-[6px]"
                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <div className="bg-primary min-w-[44px] h-[44px] rounded-full flex items-center justify-center">
                          <EarPhoneIcon />
                        </div>
                        <div className="flex flex-col gap-[6px]">
                          <div className="flex justify-between">
                            <div className="flex flex-col">
                              <p className="font-[600] text-[16px] leading-[150%] text-white">
                                {note.title}
                              </p>
                              <p className="text-[12px] leading-[140%] text-[#255BFF]">
                                {note.subtitle}
                              </p>
                            </div>
                            <p className="text-[14px] text-[#A9A9A9] leading-[150%]">
                              {note.timestamp}
                            </p>
                          </div>
                          <div className="text-[14px] font-poppins leading-[150%] text-white">
                            {note.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-[12px]">
        <div className="flex items-center justify-between w-full">
          <h1
            className={`${
              allCourses ? "text-[32px]" : "text-[24px]"
            } font-[700] leading-[120%]`}
          >
            {allCourses ? "Course for You" : "Explore More Courses"}
          </h1>
          <CommonLink
            text={allCourses ? "Change Selected Topic" : "Explore More"}
            onClick={
              allCourses ? () => {} : () => router.push(RoutePaths?.MyExplore)
            }
          />
        </div>
        {loading || courses?.length > 0 ? (
          loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
              {[1, 2, 3, 4].map((index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] w-full">
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
          <Pagination
            page={page}
            limit={limit}
            setPage={setPage}
            total={total}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
