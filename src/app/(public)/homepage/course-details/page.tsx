"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CourseInfo from "@/modules/courseDetails/CourseInfo";
import { RootState } from "@/redux/store";
import { HomeIcon } from "@/utils/icons";
import { Breadcrumb } from "antd";
import React from "react";
import { useSelector } from "react-redux";

const CourseDetails = () => {
  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const items = [
    {
      title: <HomeIcon />,
      href: "/",
    },
    {
      title: selectedCourseData?.course_name,
    },
  ];
  return (
    <div>
      <div className="bg-[#F2F6FD] px-[20px] xl:px-[120px]">
        <Breadcrumb
          separator={<span className="text-[#002333] font-[700]">{">"}</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
          className="!bg-[#F2F6FD] !pt-[20px]"
        />
      </div>
      <CourseInfo />
    </div>
  );
};

export default CourseDetails;
