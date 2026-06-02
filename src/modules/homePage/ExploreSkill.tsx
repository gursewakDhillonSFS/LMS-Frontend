"use client";
import CommonButton from "@/components/CommonButton";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import NoDataFound from "@/components/NoDataFound";
import { setActiveCategory } from "@/redux/slices/CategoriesSlice";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { RootState } from "@/redux/store";
import { getAllCoursesApi } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { courseData } from "@/utils/interface";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ExploreSkill() {
  const router = useRouter();
  const data = useSelector((state: RootState) => state?.categories?.categories);
  const dispatch = useDispatch();
  const [selectedTag, setSelectedTag] = useState<string>();
  const [courses, setCourses] = useState<courseData[]>([]);
  const [loading, setLoading] = useState(false);

  const courseRedirect = (value: courseData | undefined) => {
    dispatch(setActiveCategory(selectedTag));
    router.push(`${RoutePaths?.Homepage}/course-details`);
    dispatch(setCourseData(value));
  };

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", "8");
      params.append("page", "1");
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }
      if (selectedTag) params.append("category_id", selectedTag);
      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [selectedTag, organization_id]);

  useEffect(() => {
    if (selectedTag) fetchCourseData();
  }, [fetchCourseData, selectedTag]);

  useEffect(() => {
    if (data?.length && !selectedTag) {
      setSelectedTag(data[0].category_id);
    }
  }, [selectedTag, data]);
  return (
    <div className="bg-black text-white flex flex-col items-center px-[40px] xl:px-[120px] pb-[25px] xl:pb-[80px] gap-[25px] xl:gap-[40px]">
      <div className="flex flex-col items-center xl:px-[135px] gap-[25px] xl:gap-[40px]">
        <h1
          className={`text-[36px] lg:text-[56px] text-center fjalla-one-regular `}
        >
          Explore Inspiring Online Courses
        </h1>
        <div className="flex flex-wrap justify-center gap-3">
          {data.map((category, i) => (
            <button
              key={i}
              onClick={() => setSelectedTag(category?.category_id)}
              className={`px-[24px] h-[40px] cursor-pointer rounded-[24px] transition-all duration-300 ease-in-out border ${
                category?.category_id === selectedTag
                  ? "bg-green-500 text-black"
                  : "border-gray-600 hover:bg-gray-200 hover:!text-black"
              }`}
            >
              {category?.category_name}
            </button>
          ))}
        </div>
      </div>
      {loading || courses?.length > 0 ? (
        loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
            {[1, 2, 3].map((index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
            {courses.map((course) => (
              <CourseCard
                key={course?.course_id}
                data={course}
                onClick={courseRedirect}
              />
            ))}
          </div>
        )
      ) : (
        <NoDataFound height={"200px"} />
      )}

      <CommonButton
        onClick={() => router.push(`${RoutePaths?.Browse}`)}
        text={"See More"}
        bgColor="black"
        className="border-1 border-[#FFFFFF] text-white px-[32px] py-[10px]"
      />
    </div>
  );
}


