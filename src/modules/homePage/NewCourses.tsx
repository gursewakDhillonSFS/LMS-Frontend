"use client";
import CourseCard from "@/components/CourseCard";
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
    <div className="flex flex-col bg-[#ffffff] pt-[40px] px-[40px] xl:px-[120px] lg:pt-[80px] gap-[70px]">
      <div className="flex flex-col items-center gap-[20px]">
        <div className={`text-[36px] lg:text-[56px] fjalla-one-regular `}>
          New Courses
        </div>
        <div className="text-[12px] lg:text-[16px] text-center leading-[150%]">
          Whether it&apos;s a first brush on canvas or the last frame in an
          animation, Learning+ is here to support
          <br /> you on every step of your creative journey.
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {course?.map((course) => (
          <div key={course?.course_id} className="pl-3">
            <CourseCard
              data={course}
              bgColor="#ffffff"
              instructorColor="#0E0E0E"
              titleColor="#000"
              footerColor="var(--secondary)"
              onClick={courseRedirect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCourses;


