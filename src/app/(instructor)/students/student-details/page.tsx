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
import { Breadcrumb, Skeleton } from "antd";
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
  const [loading, setLoading] = useState(true);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");
  const courseId = searchParams.get("course_id");
  const batchId = searchParams.get("batch_id");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInstructorStudentTab(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentDetailsApi(studentId)
      .then((res: any) => {
        if (res?.data) {
          setStudentDetails(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Also fetch submissions
    getStudentSubmissionsApi(studentId)
      .then((res: any) => {
        if (res?.data) {
          setSubmissions(res.data.submissions || res.data || []);
        }
      })
      .catch(() => {});
  }, [studentId]);

  const assignments = (submissions as any)?.assignments || (Array.isArray(submissions) ? submissions : []);
  const quizzes = (submissions as any)?.quizzes || [];

  const items = [
    {
      title: "Students",
      href: RoutePaths.Students,
    },
    {
      title: studentDetails?.name || "Student Details",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex gap-6 items-center">
          <Skeleton.Avatar active size={80} shape="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton.Input active size="large" style={{ width: 240 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
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
