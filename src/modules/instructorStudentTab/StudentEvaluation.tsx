"use client";
import CertificateCard from "@/components/CertificateCard";
import CustomTabSwitcher from "@/components/CustomTabSwitcher";
import TextFormatComponent from "@/components/TextFormatComponent";
import { InstructorEvaluationTab } from "@/utils/constant";
import { InstructorEvaluationTabEnum } from "@/utils/enums";
import { TrophyOutlined, CheckCircleFilled, LockOutlined } from "@ant-design/icons";
import React, { useState } from "react";

interface StudentEvaluationProps {
  details?: any;
}

const StudentEvaluation: React.FC<StudentEvaluationProps> = ({ details }) => {
  const [activeTab, setActiveTab] = useState<string>(
    InstructorEvaluationTabEnum.OVERALL_RESULT
  );

  const enrolledCourses = details?.enrolledCourses || [];
  const completedCourses = enrolledCourses.filter(
    (c: any) => parseInt(c.courseProgress || "0") >= 100
  );

  return (
    <div className="flex flex-col gap-5">
      <CustomTabSwitcher
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={InstructorEvaluationTab}
        className="rounded-xl px-1 pt-2 shadow-xs bg-white border border-slate-100"
      />

      {activeTab === InstructorEvaluationTabEnum?.OVERALL_RESULT && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white md:w-1/3 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100 shadow-2xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-3">
              <CheckCircleFilled />
            </div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Overall Status
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {completedCourses.length > 0 ? "PASSED" : "IN PROGRESS"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {completedCourses.length} of {enrolledCourses.length} courses completed
            </p>
          </div>

          <div className="flex md:w-2/3 flex-col gap-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
            <h3 className="font-bold text-base text-slate-800">
              Academic Performance & Remarks
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {completedCourses.length > 0
                ? `Student has successfully completed ${completedCourses.length} enrolled courses with passing marks across modules. Academic standing is in good health.`
                : enrolledCourses.length > 0
                ? `Student is currently progressing through ${enrolledCourses.length} enrolled courses. Coursework and assessments are actively underway.`
                : "No active course enrollments found for this student."}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enrolled Courses Progress
              </span>
              {enrolledCourses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No courses enrolled</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {enrolledCourses.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 truncate mr-2">
                        {c.courseName}
                      </span>
                      <span className="font-bold text-[#315CFF] shrink-0">
                        {c.courseProgress || "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === InstructorEvaluationTabEnum?.CERTIFICATE && (
        <div className="flex flex-col gap-4">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCourses.map((c: any, idx: number) => (
                <CertificateCard
                  key={idx}
                  title={`Certificate - ${c.courseName}`}
                  code={`SKILLBUILD-${c.courseId ? c.courseId.slice(-6).toUpperCase() : "CERT"}`}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
                <LockOutlined />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Certificates Earned Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Certificates are issued automatically once the student reaches 100% completion in their enrolled courses.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentEvaluation;
