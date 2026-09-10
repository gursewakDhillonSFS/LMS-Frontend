"use client";
import CommonButton from "@/components/CommonButton";
import CourseCard from "@/components/CourseCard";
import { DataNotFound, OnlineClasses } from "@/utils/images";
import { courseData } from "@/utils/interface";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import CategoryCourses from "./CategoryCourses";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { CategoryEnum, RoutePaths } from "@/utils/enums";
import { getAllCoursesApi } from "@/services/collections";
import { useRouter } from "next/navigation";
import { setCourseData } from "@/redux/slices/CourseDataSlice";
import { setSignup } from "@/redux/slices/AuthModalSlice";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import NoDataFound from "@/components/NoDataFound";

const BrowseContent = () => {
  const activeCategory = useSelector(
    (state: RootState) => state?.categories?.activeCategory
  );
  const [courses, setCourses] = useState<courseData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const courseRedirect = (value: courseData | undefined) => {
    router.push("/browse/course-details");
    dispatch(setCourseData(value));
  };

  const organization_id = useSelector(
    (state: RootState) => state.userdata?.organization_id
  );

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", "6");
      params.append("page", "1");
      if (organization_id) {
        params.append("organisation_id", organization_id);
      }
      if (activeCategory !== CategoryEnum?.ALL_Classes && activeCategory)
        params.append("category_id", activeCategory);
      const response = await getAllCoursesApi(params);
      if (response?.status === true) {
        setCourses(response?.data?.course_list);
      }
    } catch (err) {
      console.log(err || "Failed to fetch Project Condition");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, organization_id]);

  const handleSignup = () => {
    dispatch(setSignup(true));
  };

  useEffect(() => {
    if (activeCategory === CategoryEnum?.ALL_Classes) fetchCourseData();
  }, [activeCategory, fetchCourseData]);

  return (
    <div className="flex flex-col gap-10 flex-1 min-w-0">
      <div className="flex flex-col gap-8">
        {activeCategory === CategoryEnum?.ALL_Classes && (
          <div className="relative rounded-[12px] overflow-hidden shadow-xs">
            <Image
              alt="Online classes"
              src={OnlineClasses}
              unoptimized
              className="w-full h-[220px] md:h-[260px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex flex-col justify-center px-6 md:px-12 gap-5">
              <div className="flex flex-col gap-2 max-w-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Online Classes
                </h1>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                  Find what fascinates you as you explore world-class online courses led by industry experts.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <CommonButton
                  text="Sign Up for Free"
                  onClick={handleSignup}
                  className="!h-9 !text-sm !px-5"
                />

                <CommonButton
                  text="Start Free Trial"
                  className="!bg-white !text-[var(--primary)] hover:!bg-slate-100 !border-none !h-9 !text-sm !px-5 shadow-xs"
                  onClick={() => router.push(RoutePaths?.Subscription)}
                />
              </div>
            </div>
          </div>
        )}

        {activeCategory === CategoryEnum?.ALL_Classes && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">
              Featured Classes
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
            ) : courses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard
                    key={course?.course_id}
                    data={course}
                    onClick={courseRedirect}
                  />
                ))}
              </div>
            ) : (
              <NoDataFound icon={DataNotFound} />
            )}
          </div>
        )}

        <CategoryCourses />
      </div>

      <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-8">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">
          Explore Your Creativity
        </h2>
        <div className="flex flex-col gap-3 text-sm md:text-[15px] text-[var(--text-secondary)] leading-relaxed">
          <p>
            Unlock your potential with courses designed to inspire and empower. Whether you&apos;re just starting out or refining your craft, explore a wide range of creative topics—from photography and design to engineering, artificial intelligence, and leadership.
          </p>
          <p>
            Learn industry-standard tools and techniques with practical, project-based coursework. Build real-world portfolio artifacts that demonstrate your skills to employers and collaborators.
          </p>
          <p>
            With every course, gain actionable experience by creating and sharing your own projects—because true mastery is achieved through hands-on practice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowseContent;


