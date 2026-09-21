"use client";
import { BreadcrumbItemRender } from "@/components/BreadcrumbItemRender";
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

const TeacherStudentDetails = () => {
  const studentActiveTab = useSelector(
    (state: RootState) => state.instructorStudenttab.InstructorActiveTab
  );
  const [activeTab, setActiveTab] = useState<string>(studentActiveTab);
  const [open, setOpen] = useState(false);
  interface StudentDetailsData {
  name?: string;
  email?: string;
  courseName?: string;
  batchName?: string;
  courseProgress?: string;
  headTeacherName?: string;
  headTeacherAvatar?: string | null;
  joinedDate?: string;
  avatar?: string;
}

interface StudentSubmissionsData {
  assignments?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    submittedDate?: string;
    score?: string;
    dueDate?: string;
  }[];
  quizzes?: {
    id: string;
    title: string;
    submittedOn?: string;
    tags?: string[];
    description?: string;
    score?: string;
    status?: string;
    dueDate?: string;
  }[];
}

  const [studentDetails, setStudentDetails] = useState<StudentDetailsData | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmissionsData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInstructorStudentTab(activeTab));
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (!studentId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const detailsRes = await getStudentDetailsApi(studentId);
        if (detailsRes && detailsRes.status) {
          setStudentDetails(detailsRes.data);
        }
        const subRes = await getStudentSubmissionsApi(studentId);
        if (subRes && subRes.status) {
          setSubmissions(subRes.data);
        }
      } catch (err) {
        console.error("Error loading student details/submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  const items = [
    {
      title: "Students",
      href: RoutePaths?.TeacherStudents,
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
    <div className="flex flex-col gap-6 pb-12">
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
      </div>

      {activeTab === StudentTabEnum.STUDENT_INFO && (
        <StudentInfo
          details={studentDetails ?? undefined}
          assignments={submissions?.assignments || []}
          quizzes={submissions?.quizzes || []}
        />
      )}
      {activeTab === StudentTabEnum.ASSIGNMENTS && (
        <StudentAssignment assignments={submissions?.assignments || []} />
      )}
      {activeTab === StudentTabEnum.QUIZZES && (
        <StudentQuizes quizzes={submissions?.quizzes || []} />
      )}
      {activeTab === StudentTabEnum.EVALUATIONS && (
        <StudentEvaluation details={studentDetails ?? undefined} />
      )}
    </div>
  );
};

export default TeacherStudentDetails;
