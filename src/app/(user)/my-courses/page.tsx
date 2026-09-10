"use client";
import CommonButton from "@/components/CommonButton";
import { MyCoursesCard } from "@/components/MyCourseCard";
import NoDataFound from "@/components/NoDataFound";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import SkeletonCard from "@/components/SkeletonCard";
import SortButton from "@/components/SortButton";
import TabSwitcher from "@/components/TabSwitcher";
import { RootState } from "@/redux/store";
import { setCourseTab } from "@/redux/tabslice/UserCourseTabSlice";
import { userCourseList } from "@/services/collections";
import { sortOptions } from "@/utils/comman";
import { UserTab } from "@/utils/constant";
import { ClockWheelIcon, FilterIcon } from "@/utils/icons";
import { DataNotFound, Live } from "@/utils/images";
import { EnrolledCourseProp } from "@/utils/interface";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/utils/toast";

const liveLessons = [
  {
    title: "UPSC Science Class Live Lesson",
    date: "2 May, 2025",
    time: "6:00 PM - 6:45 PM",
    startAt: "17:50",
    isLiveNow: true,
  },
  {
    title: "UPSC Science Class Live Lesson",
    date: "5 May, 2025",
    time: "6:00 PM - 6:45 PM",
    isLiveNow: false,
  },
  {
    title: "UPSC Science Class Live Lesson",
    date: "8 May, 2025",
    time: "6:00 PM - 6:45 PM",
    isLiveNow: false,
  },
];

const MyCourses = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string | null>("");
  const activeKey = useSelector(
    (state: RootState) => state.coursetab.activeCourseTab
  );
  const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourseProp[]>(
    []
  );
  const [activeTab, setActiveTab] = useState(activeKey);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [sortOrder, setSortOrder] = useState<string | null>("");
  const dispatch = useDispatch();
  const [courseLoading, setCourseLoading] = useState(false);

  const getUserCourseData = async () => {
    setCourseLoading(true);
    const param = new URLSearchParams();
    param.append("page", page + "");
    param.append("limit", limit + "");
    try {
      const response = await userCourseList(param);
      if (response.status) {
        if (response?.data?.courses?.length > 0) {
          setEnrolledCourse(response?.data?.courses);
          setTotal(response?.data?.total_count);
        }
      } else {
        toast.warning(response.message || "Failed to load courses");
      }
    } catch (error) {
      console.log(error);
      toast.warning("Could not load your courses");
    } finally {
      setCourseLoading(false);
    }
  };

  useEffect(() => {
    getUserCourseData();
  }, [page, limit]);

  useEffect(() => {
    dispatch(setCourseTab(activeTab));
  }, [activeTab, dispatch]);

  return (
    <div className="w-full h-full flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          My Learning
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            suffix={false}
            borderRadius="8px"
            className="!border !border-[var(--border)] !h-9"
          />
          <SortButton
            sortField={sortField}
            sortOptions={sortOptions}
            setSortOrder={setSortOrder}
            sortOrder={sortOrder}
            setSortField={setSortField}
            allowClear={true}
            className="!border !border-[var(--border)] !h-9"
          />
          <CommonButton
            text="Filter"
            icon={<FilterIcon />}
            className="!bg-white !border !border-[var(--border)] !text-[var(--text-primary)] hover:!border-[var(--primary)] hover:!text-[var(--primary)] !flex-row-reverse !h-9 !text-xs !px-3 shadow-2xs"
          />
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 flex flex-col gap-4">
          <TabSwitcher
            activeKey={activeTab}
            onChange={setActiveTab}
            tabs={UserTab}
          />
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
          {total > limit && (
            <div className="pt-2 flex justify-center">
              <Pagination
                page={page}
                setPage={setPage}
                limit={limit}
                total={total}
              />
            </div>
          )}
        </div>

        <div className="lg:w-1/3 p-5 rounded-[10px] bg-white border border-[var(--border)] shadow-xs h-fit flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 flex items-center gap-2 tracking-tight">
            <Image alt="live" src={Live} width={20} height={20} className="shrink-0" />
            Live Classes
          </h2>

          <div className="flex flex-col divide-y divide-[var(--border)]">
            {liveLessons.map((lesson, index) => (
              <div
                key={index}
                className="py-3 flex justify-between items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {lesson.title}
                  </h3>
                  {lesson.isLiveNow ? (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                      Starts at {lesson.startAt}
                    </p>
                  ) : (
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1">
                        <ClockWheelIcon />
                        <span>{lesson.date}</span>
                      </div>
                      <span>•</span>
                      <span>{lesson.time}</span>
                    </div>
                  )}
                </div>
                {lesson.isLiveNow && (
                  <CommonButton
                    text="Join"
                    className="!bg-[var(--error)] hover:!bg-red-700 !text-white !h-7 !text-xs !px-3 !rounded-[6px] shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
