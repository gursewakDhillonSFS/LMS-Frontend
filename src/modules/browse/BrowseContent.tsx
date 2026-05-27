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
    <div className="flex flex-col gap-[40px] w-[80%]">
      <div className="flex flex-col gap-[32px]">
        {activeCategory === CategoryEnum?.ALL_Classes && (
          <div className="relative">
            <Image
              alt="Online classes"
              src={OnlineClasses}
              unoptimized
              className="rounded-[12px] w-full"
            />
            <div className="text-white absolute top-[19px] left-[30px] flex flex-col items-start gap-[35px]">
              <div className="flex flex-col gap-[17px]">
                <span className="text-[30px] lg:text-[40px] font-[700] leading-[120%]">
                  Online Classes
                </span>
                <span className="text-[14px] lg:text-[18px] leading-[120%]">
                  Find what fascinates you as you explore these online classes.
                </span>
              </div>
              <div className="flex gap-3">
                <CommonButton
                  text={"Sign Up for Free"}
                  onClick={handleSignup}
                />

                <CommonButton
                  text={"Start 7-day Free Trial"}
                  className="!bg-secondary !text-white"
                  onClick={() => router.push(RoutePaths?.Subscription)}
                />
              </div>
            </div>
          </div>
        )}

        {activeCategory === CategoryEnum?.ALL_Classes && (
          <div className="flex flex-col gap-[12px]">
            <h1 className="!text-[24px] !font-[700] leading-[120%]">
              Feature Classes
            </h1>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
                {[1, 2, 3].map((index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
            ) : courses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
                {courses.map((course) => (
                  <CourseCard
                    key={course?.course_id}
                    data={course}
                    bgColor="#ffffff"
                    instructorColor="#0E0E0E"
                    titleColor="#000"
                    footerColor="var(--secondary)"
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
      <div className="flex flex-col gap-[26px]">
        <h1 className="!text-[24px] !font-[700] !leading-[120%]">
          Explore Your Creativity
        </h1>
        <p className="text-[#002333] text-[16px] leading-[150%]">
          Unlock your potential with Learning+ classes designed to inspire and
          empower. Whether you&apos;re just starting out or refining your craft,
          explore a wide range of creative topics—from photography and graphic
          design to drawing, animation, and more.
        </p>
        <p className="text-[#002333] text-[16px] leading-[150%]">
          Learn industry-leading tools like Photoshop, Procreate, and After
          Effects, or dive into hands-on techniques in painting, hand lettering,
          and illustration. Whether you&apos;re making a film, redesigning your
          space, or launching a freelance business, Learning+ offers the
          guidance and community to help you grow.
        </p>
        <p className="text-[#002333] text-[16px] leading-[150%]">
          With every class, you’ll gain practical experience by creating and
          sharing your own projects—because creativity is best learned by doing.
          Start exploring today
        </p>
      </div>
    </div>
  );
};

export default BrowseContent;


