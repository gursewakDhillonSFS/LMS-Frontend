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
import { Breadcrumb, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { getStudentDetailsApi, getStudentSubmissionsApi } from "@/services/collections";

const StudentDetails = () => {
  const studentActiveTab = useSelector(
    (state: RootState) => state.instructorStudenttab.InstructorActiveTab
  );
  const [activeTab, setActiveTab] = useState<string>(studentActiveTab);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id") || searchParams.get("student_id");

  const [loading, setLoading] = useState(true);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    dispatch(setInstructorStudentTab(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      Promise.all([
        getStudentDetailsApi(studentId),
        getStudentSubmissionsApi(studentId),
      ])
        .then(([detailsRes, submissionsRes]) => {
          if (detailsRes?.status) {
            setStudentDetails(detailsRes.data);
          }
          if (submissionsRes?.status) {
            setAssignments(submissionsRes.data?.assignments || []);
            setQuizzes(submissionsRes.data?.quizzes || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  const items = [
    {
      title: "Students",
      href: RoutePaths?.Students,
    },
    {
      title: studentDetails?.name || "Student Details",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

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

      {activeTab === StudentTabEnum.STUDENT_INFO && (
        <StudentInfo
          details={studentDetails}
          assignments={assignments}
          quizzes={quizzes}
        />
      )}
      {activeTab === StudentTabEnum.ASSIGNMENTS && (
        <StudentAssignment assignments={assignments} />
      )}
      {activeTab === StudentTabEnum.QUIZZES && (
        <StudentQuizes quizzes={quizzes} />
      )}
      {activeTab === StudentTabEnum.EVALUATIONS && (
        <StudentEvaluation details={studentDetails} />
      )}
    </div>
  );
};

export default StudentDetails;
