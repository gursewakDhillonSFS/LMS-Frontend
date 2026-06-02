"use client";
import AssignmentDetailDisplayCollapse from "@/components/AssignmentDetailDisplayCollapse";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import AddResultModal from "@/components/modal/AddResultModal";
import TabSwitcher from "@/components/TabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { InstructorAssignmentDetailTabs } from "@/utils/constant";
import { InstructorAssignmentDetailTabEnum, RoutePaths } from "@/utils/enums";
import { EditIcon } from "@/utils/icons";
import { Breadcrumb } from "antd";
import React, { useState } from "react";

const StudentAssignmentDetails = () => {
  const [activeTab, setActiveTab] = useState<string>(
    InstructorAssignmentDetailTabEnum.ASSIGNMENT_DETAILS
  );
  const [open, setOpen] = useState(false);
  const items = [
    {
      title: "Students",
      href: RoutePaths?.Students,
    },
    {
      title: "Theresa Webb",
      href: `${RoutePaths?.Students}/student-details`,
    },
    {
      title: "Physics Assignment",
    },
  ];

  return (
    <div className="flex flex-col gap-[24px]">
      <AddResultModal open={open} onClose={() => setOpen(false)} />
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex items-center justify-between">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={InstructorAssignmentDetailTabs}
        />
        <CommonButton text="+ Add Result" onClick={() => setOpen(true)} />
      </div>

      {activeTab === InstructorAssignmentDetailTabEnum?.ASSIGNMENT_DETAILS && (
        <div className="w-full flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[12px]">
            <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Overview</h1>
            <p className="font-[400] text-[16px] text-[#002333]">
              Pellentesque nibh porta facilisis nunc. Amet vulputate ornare
              varius ultricies tellus duis fringilla interdum. Dolor cursus
              suspendisse eget parturient blandit volutpat nulla duis elit. Ut
              varius malesuada velit lacus fringilla posuere aliquam. Sed eu
              nunc urna sagittis lacinia. Eget ac amet purus ultrices faucibus
              tellus commodo. Nec aliquam et sed elit tortor et commodo non
              facilisi. Et risus sit quisque vel porttitor eu augue nibh
              sagittis. Condimentum egestas leo viverra iaculis arcu amet
            </p>
          </div>
          <div className="w-full flex flex-col gap-[12px]">
            <h1 className="font-[700] text-[20px] text-[#0E0E0E]">Project</h1>
            <AssignmentDetailDisplayCollapse />
          </div>
        </div>
      )}
      {activeTab === InstructorAssignmentDetailTabEnum?.SCORE && (
        <div className="flex gap-3">
          <div className="bg-white rounded-[12px] flex items-center justify-center font-semibold w-1/3">
            <TextFormatComponent text="A+" className="!text-[150px]" />
          </div>
          <div className="flex flex-col gap-[16px] bg-white rounded-[12px] py-4 px-6 w-2/3">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-lg">Score Remark</h1>
              <div>
                <EditIcon />
              </div>
            </div>
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

export default StudentAssignmentDetails;
