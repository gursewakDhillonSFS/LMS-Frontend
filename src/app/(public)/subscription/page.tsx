"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import OnboardingSubscription from "@/modules/onboard/OnboardingSubscription";
import { HomeIcon } from "@/utils/icons";
import { Breadcrumb } from "antd";
import React from "react";

const page = () => {
  const items = [
    {
      title: <HomeIcon />,
      href: "/",
    },
    {
      title: "Learning + Pro",
    },
  ];
  return (
    <div>
      <div className="px-[20px] xl:px-[120px]">
        <Breadcrumb
          separator={<span className="text-[#002333] font-[700]">{">"}</span>}
          items={items}
          itemRender={(item) => <BreadcrumbItemRender item={item} />}
          className=" !pt-[20px]"
        />
        <div className="my-10">
          <OnboardingSubscription isHome={true} />
        </div>
      </div>
    </div>
  );
};

export default page;
