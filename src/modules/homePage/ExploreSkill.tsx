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
    <section className="bg-[var(--background)] py-16 px-6 md:px-12 xl:px-24 flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-3 text-center max-w-3xl">
        <h2 className="text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
          Explore Inspiring Online Courses
        </h2>
        <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed">
          Choose from thousands of curated courses across technology, design, business, and creative disciplines.
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {data?.map((category) => {
            const isSelected = category?.category_id === selectedTag;
            return (
              <button
                key={category?.category_id}
                onClick={() => setSelectedTag(category?.category_id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                    : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {category?.category_name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-7xl">
        {loading || courses?.length > 0 ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <NoDataFound height="240px" />
        )}
      </div>

      <CommonButton
        onClick={() => router.push(`${RoutePaths?.Browse}`)}
        text="View All Courses"
        className="!bg-white !text-[var(--text-primary)] !border !border-[var(--border)] hover:!border-[var(--primary)] hover:!text-[var(--primary)] px-8 py-2.5 font-medium shadow-xs"
      />
    </section>
  );
}


