"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CheckOut from "@/components/Checkout";
import { RootState } from "@/redux/store";
import { RoutePaths } from "@/utils/enums";
import { Breadcrumb } from "antd";
import React from "react";
import { useSelector } from "react-redux";

const CheckoutWrapper = () => {
  const selectedCourseData = useSelector(
    (state: RootState) => state.courseData.course
  );

  const items = [
    {
      title: "Dashboard",
      href: RoutePaths?.Dashboard,
    },
    {
      title: selectedCourseData?.course_name,
    },
    {
      title: "Checkout",
    },
  ];

  return (
    <div className=" flex flex-col gap-3">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
        className=""
      />
      <CheckOut />
    </div>
  );
};

export default CheckoutWrapper;
