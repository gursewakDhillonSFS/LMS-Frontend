"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
import CommonButton from "@/components/CommonButton";
import MarkCompletedModal from "@/components/modal/MarkCompletedModal";
import TabSwitcher from "@/components/TabSwitcher";
import StudentAssignment from "@/modules/instructorStudentTab/StudentAssignment";
import StudentEvaluation from "@/modules/instructorStudentTab/StudentEvaluation";
import StudentInfo from "@/modules/instructorStudentTab/StudentInfo";
import StudentQuizes from "@/modules/instructorStudentTab/StudentQuizes";
import { RootState } from "@/redux/store";
import { setInstructorStudentTab } from "@/redux/tabslice/InstructorStudentTabSlice";
import { studentTabOption } from "@/utils/constant";
import { RoutePaths, StudentTabEnum } from "@/utils/enums";
import { Breadcrumb } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const StudentDetails = () => {
  const studentActiveTab = useSelector(
    (state: RootState) => state.instructorStudenttab.InstructorActiveTab
  );
  const [activeTab, setActiveTab] = useState<string>(studentActiveTab);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const items = [
    {
      title: "Students",
      href: RoutePaths?.Students,
    },
    {
      title: "Theresa Webb",
    },
  ];
  useEffect(() => {
    dispatch(setInstructorStudentTab(activeTab));
  }, [activeTab]);
  return (
    <div className="flex flex-col gap-[24px]">
      <MarkCompletedModal open={open} onClose={() => setOpen(false)} />
      <Breadcrumb
        separator={<span className="text-[#002333] font-[700]">{">"}</span>}
        items={items}
        itemRender={(item) => <BreadcrumbItemRender item={item} />}
      />

      <div className="flex items-center justify-between">
        <TabSwitcher
          activeKey={activeTab}
          onChange={setActiveTab}
          tabs={studentTabOption}
        />
        <CommonButton text="Mark Completed" onClick={() => setOpen(true)} />
      </div>

      {activeTab === StudentTabEnum.STUDENT_INFO && <StudentInfo />}
      {activeTab === StudentTabEnum.ASSIGNMENTS && <StudentAssignment />}
      {activeTab === StudentTabEnum.QUIZZES && <StudentQuizes />}
      {activeTab === StudentTabEnum.EVALUATIONS && <StudentEvaluation />}
    </div>
  );
};

export default StudentDetails;
