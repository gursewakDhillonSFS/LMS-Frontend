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
import { toast } from "react-toastify";

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
  const [limit] = useState(3);
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
        console.log(response);
        if (response?.data?.courses?.length > 0) {
          setEnrolledCourse(response?.data?.courses);
          setTotal(response?.data?.total_count);
        }
      } else {
        toast.warning(response.message || "Something Went Wrong");
      }
    } catch (error) {
      console.log(error);
      toast.warning("Something went wrong");
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
    <div className="w-full h-full flex flex-col gap-[12px]">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-[32px] font-[700] text-[#0E0E0E]">My Courses</h1>
        <div className="flex items-center gap-[12px]">
          <SearchInput
            search={search}
            onChange={(e) => setSearch(e.target.value)}
            suffix={false}
            borderRadius="6px"
            className="!border !border-[#E2E1E4]"
          />
          <SortButton
            sortField={sortField}
            sortOptions={sortOptions}
            setSortOrder={setSortOrder}
            sortOrder={sortOrder}
            setSortField={setSortField}
            allowClear={true}
            className="!border !border-[#E2E1E4]"
          />
          <CommonButton
            text={"Filter"}
            icon={<FilterIcon />}
            className="!bg-transparent border border-[#E2E1E4] !flex-row-reverse"
          />
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-[20px]">
        <div className="lg:w-2/3 flex flex-col gap-[12px]">
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
                {(enrolledCourse.length > 3
                  ? enrolledCourse?.slice(0, 3)
                  : enrolledCourse
                )?.map((item) => (
                  <MyCoursesCard {...item} key={item?.course_id} />
                ))}
              </div>
            )
          ) : (
            <NoDataFound icon={DataNotFound} />
          )}
          {total > limit && (
            <Pagination
              page={page}
              setPage={setPage}
              limit={limit}
              total={total}
            />
          )}
        </div>
        <div className="lg:w-1/3 p-4 rounded-[12px] bg-white">
          <h1 className="py-[6px] text-[20px] font-[700] border-b border-[#E7E7E7] flex items-center gap-[10px]">
            <Image alt="live" src={Live} width={32} height={32} />
            Live Class
          </h1>

          <div className="flex flex-col">
            {liveLessons.map((lesson, index) => (
              <div
                key={index}
                className="flex border-b border-[#E7E7E7] py-[12px]"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="w-[80%]">
                    <h3 className="text-[14px] font-[600] text-[#0E0E0E]">
                      {lesson.title}
                    </h3>
                    {lesson.isLiveNow && (
                      <p className="text-[12px] text-[#7B7B7B] flex items-center gap-1">
                        <Image alt="live" src={Live} width={16} height={16} />
                        Start at: {lesson.startAt}
                      </p>
                    )}

                    {!lesson.isLiveNow && (
                      <div className="flex items-center justify-between">
                        <div className="mt-2 flex items-center justify-center gap-1 text-[12px] text-[#7B7B7B]">
                          <ClockWheelIcon />
                          <span>{lesson.date}</span>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-[12px] text-[#7B7B7B]">
                          <ClockWheelIcon />
                          <span>{lesson.time}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {lesson.isLiveNow && (
                    <CommonButton
                      text="Join"
                      className="!bg-red-500 !text-white w-[20%] "
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
