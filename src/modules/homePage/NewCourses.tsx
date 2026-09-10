"use client";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import NoDataFound from "@/components/NoDataFound";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { getAllCoursesApi } from "@/services/collections";
import { RoutePaths } from "@/utils/enums";
import { DataNotFound } from "@/utils/images";
import { courseData } from "@/utils/interface";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const NewCourses = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<courseData[]>([]);

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

      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list || []);
      }
    } catch (err) {
      console.log(err || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [organization_id]);

  const courseRedirect = (value: courseData | undefined) => {
    router.push(`${RoutePaths?.Browse}/course-details`);
    dispatch(setCourseData(value));
  };

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return (
    <section className="py-12 md:py-16 px-6 md:px-12 xl:px-20 2xl:px-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[var(--primary)] text-[11px] font-bold tracking-[0.14em] uppercase flex items-center gap-1.5">
              <span>✦</span>
              <span>FEATURED COURSES</span>
            </span>
            <h2 className="text-[26px] md:text-[32px] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Most Popular Courses
            </h2>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)]">
              Handpicked courses by our experts, loved by thousands.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(RoutePaths?.Browse)}
            className="text-[13px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Courses</span>
            <span>→</span>
          </button>
        </div>

        {/* 4x2 Course Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : courses?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((item) => (
                <CourseCard
                  key={item?.course_id}
                  data={item}
                  onClick={courseRedirect}
                />
              ))}
            </div>
          ) : (
            <NoDataFound icon={DataNotFound} />
          )}
        </div>
      </div>
    </section>
  );
};

export default NewCourses;
