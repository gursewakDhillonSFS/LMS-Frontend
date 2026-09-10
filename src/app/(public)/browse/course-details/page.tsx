"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CourseInfo from "@/modules/courseDetails/CourseInfo";
import { RootState } from "@/redux/store";
import { getCategoryName } from "@/utils/comman";
import { RoutePaths } from "@/utils/enums";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import React from "react";
import { useSelector } from "react-redux";

const CourseDetails = () => {
  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const categories = useSelector(
    (state: RootState) => state?.categories?.categories
  );
  const categoryTitle = getCategoryName(categories, selectedCourseData?.category_id);
  const items = [
    {
      title: <HomeOutlined className="text-slate-500 hover:text-[#4F46E5]" />,
      href: "/",
    },
    {
      title: categoryTitle || "All Courses",
      href: RoutePaths?.Browse,
    },
    {
      title: selectedCourseData?.course_name || "Course Details",
    },
  ];
  return (
    <div className="bg-[#FAFBFD]">
      <div className="bg-[#EEF4FF]/70 px-4 sm:px-6 lg:px-12 xl:px-20 pt-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            separator={<span className="text-slate-400 font-medium">{">"}</span>}
            items={items}
            itemRender={(item) => <BreadcrumbItemRender item={item} />}
            className="text-xs sm:text-sm font-medium"
          />
        </div>
      </div>
      <CourseInfo />
    </div>
  );
};

export default CourseDetails;
