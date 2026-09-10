"use client";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { getAllCoursesApi } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { courseData } from "@/utils/interface";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const NewCourses = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  console.log(loading);
  const [course, setCourses] = useState<courseData[]>();

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", "4");
      params.append("page", "1");
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }

      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [organization_id]);
  const courseRedirect = (value: courseData | undefined) => {
    router.push(`${RoutePaths?.Dashboard}/course-details`);
    dispatch(setCourseData(value));
  };
  useEffect(() => {
    fetchCourseData();
  }, []);
  return (
    <section className="flex flex-col bg-[var(--surface-subtle)] py-[60px] px-6 md:px-12 xl:px-24 gap-10">
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <h2 className="text-[28px] md:text-[36px] font-bold text-[var(--text-primary)] tracking-tight">
          New Courses
        </h2>
        <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-relaxed">
          Explore the latest additions taught by industry experts to help you master modern skills and accelerate your career.
        </p>
      </div>
      <div className="max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {course?.map((item) => (
              <CourseCard
                key={item?.course_id}
                data={item}
                onClick={courseRedirect}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewCourses;


