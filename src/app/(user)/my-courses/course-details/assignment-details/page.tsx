"use client";
import AssignmentDetailsFormCollapse from "@/components/AssignmentDetailsFormCollapse";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import TabSwitcher from "@/components/TabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { AssignmentDetailTabs } from "@/utils/constant";
import { AssignmentDetailTabEnum, RoutePaths } from "@/utils/enums";
import { Breadcrumb } from "antd";
import React, { useState } from "react";
import QuillEditor from "@/components/QuillEditor";

const AssignmentDetails = () => {
  const [activeTab, setActiveTab] = useState<string>(
    AssignmentDetailTabEnum?.ASSIGNMENT_DETAILS
  );
  const items = [
    {
      title: "My Courses",
      href: RoutePaths?.MyCourses,
    },
    {
      title: "Finance & Quantitative Modeling for Analysts",
      href: `${RoutePaths?.MyCourses}/course-details`,
    },
    {
      title: "Physics Assignment",
    },
  ];
  return (
    <div className="flex flex-col gap-[24px]">
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />
      <div className="flex items-center justify-between">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={AssignmentDetailTabs}
        />
        <p className="text-[20px] text-[#5EB85C] font-bold">
          Due on: 5Day : 15Hrs : 50Min
        </p>
      </div>

      {activeTab === AssignmentDetailTabEnum?.ASSIGNMENT_DETAILS && (
        <div className="w-full flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[12px]">
            <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Overview</h1>
            <div className="text-[16px] text-[#002333]">
              <QuillEditor
                readOnly
                value={`<p>Pellentesque nibh porta facilisis nunc. Amet vulputate ornare varius ultricies tellus duis fringilla interdum. Dolor cursus suspendisse eget parturient blandit volutpat nulla duis elit. Ut varius malesuada velit lacus fringilla posuere aliquam. Sed eu nunc urna sagittis lacinia. Eget ac amet purus ultrices faucibus tellus commodo. Nec aliquam et sed elit tortor et commodo non facilisi. Et risus sit quisque vel porttitor eu augue nibh sagittis. Condimentum egestas leo viverra iaculis arcu amet</p>`}
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-[12px]">
            <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Project</h1>
            <AssignmentDetailsFormCollapse />
          </div>

          <p className="plus-jakarta-sans text-sm font-[500] text-[#7B7B7B]">
            <strong>Note: </strong>Please complete the assignment first. Your
            score will be based on your performance.
          </p>
        </div>
      )}
      {activeTab === AssignmentDetailTabEnum?.SCORE && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[12px] flex items-center justify-center font-semibold w-full">
            <TextFormatComponent text="A+" className="!text-[150px]" />
          </div>
          <div className="flex flex-col gap-[16px] bg-white rounded-[12px] py-4 px-6">
            <h1 className="font-bold text-lg">Score Remark</h1>
            <p className="text-base text-[#002333]">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              Obcaecati eum perspiciatis accusamus nostrum et voluptate cumque,
              delectus molestias necessitatibus aperiam, id placeat quam
              possimus harum eaque in, quae magnam soluta aliquid pariatur error
              dolores qui nobis? Magni ullam, hic quas similique sapiente magnam
              porro aliquam iure corrupti sint nobis nam.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
