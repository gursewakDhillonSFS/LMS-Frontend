"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CourseInfo from "@/modules/courseDetails/CourseInfo";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

const CourseDetails = () => {
  const selectedCourseData = useSelector(
    (state: RootState) => state?.courseData?.course
  );
  const router = useRouter();
  const items = [
    {
      title: "Dashboard",
      href: RoutePaths?.Dashboard,
    },
    {
      title: selectedCourseData?.course_name,
    },
  ];
  const handleCheckoutRedirect = () => {
    router.push(`${RoutePaths.Dashboard}/checkout`);
  };
  return (
    <div>
      <div className="px-[20px]">
        <Breadcrumb
          separator={<span className="text-[#002333] font-[700]">{">"}</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
          className="!pt-[20px]"
        />
      </div>
      <CourseInfo isExplore={true} handleCheckoutRedirect={handleCheckoutRedirect}/>
    </div>
  );
};

export default CourseDetails;
